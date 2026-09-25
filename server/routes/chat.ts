import { Router, Request, Response } from 'express';
import { providerRegistry } from '../providers/registry.js';
import { serverStore } from '../data/store.js';
import { ChatRequest, StreamChunk } from '../types.js';
import { adaptiveAIService } from '../adaptive-ai/AdaptiveAIService.js';

export const chatRouter = Router();

// POST /api/chat (Non-streaming)
chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      projectId,
      modelId,
      provider: providerHint,
      messages,
      systemInstruction,
      temperature,
      maxOutputTokens,
      enableHighThinking,
      memoryEnabled = true,
      preferencesEnabled = true,
    } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: 'modelId is required' });
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const provider = providerRegistry.findProviderForModel(modelId, providerHint);
    if (!provider) {
      return res.status(400).json({
        error: `No provider adapter registered for model: ${modelId}`,
      });
    }

    // Build personalized context with real RAG vector search & active adapter
    let fullSystemPrompt = systemInstruction || '';
    let appliedPreferences: any[] = [];
    let retrievedMemories: any[] = [];
    let activeAdapter: any = undefined;

    if (preferencesEnabled) {
      const userPrompt = messages[messages.length - 1]?.content || '';
      const context = adaptiveAIService.buildPersonalizedContext({
        projectId,
        modelId,
        currentPrompt: userPrompt,
        baseSystemInstruction: systemInstruction,
      });
      fullSystemPrompt = context.systemPromptAdditions;
      appliedPreferences = context.appliedPreferences;
      retrievedMemories = context.retrievedMemories;
      activeAdapter = context.activeAdapter;
    }

    const chatReq: ChatRequest = {
      conversationId,
      projectId,
      modelId,
      messages,
      systemInstruction: fullSystemPrompt || undefined,
      temperature,
      maxOutputTokens,
      enableHighThinking,
    };

    const result = await provider.chat(chatReq);

    // Save to real server conversation store
    if (conversationId) {
      let conv = serverStore.conversations.get(conversationId);
      if (!conv) {
        conv = {
          id: conversationId,
          title: messages[0]?.content?.slice(0, 32) || 'Conversation',
          projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modelId,
          messages: [],
        };
        serverStore.conversations.set(conversationId, conv);
      }
      conv.updatedAt = new Date().toISOString();
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'user') {
        conv.messages.push({
          id: 'msg-' + Date.now() + '-user',
          role: 'user',
          content: lastMsg.content,
          modelId: 'user',
          provider: 'user',
          timestamp: new Date().toISOString(),
        });
      }
      conv.messages.push({
        id: 'msg-' + Date.now() + '-ai',
        role: 'assistant',
        content: result.text,
        modelId: result.modelId,
        provider: result.provider,
        timestamp: new Date().toISOString(),
        latencyMs: result.latencyMs,
        usage: result.usage,
      });
    }

    // Record server usage
    serverStore.usageRecords.push({
      timestamp: new Date().toISOString(),
      modelId: result.modelId,
      provider: result.provider,
      tokens: result.usage?.totalTokens || Math.round(result.text.length / 4),
      latencyMs: result.latencyMs,
    });

    return res.json({
      ...result,
      personalization: {
        appliedPreferences,
        retrievedMemories,
        activeAdapter,
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    const statusCode = error.message?.includes('not connected') ? 503 : 500;
    return res.status(statusCode).json({
      error: error.message || 'Error processing model chat request',
      providerError: true,
    });
  }
});

// POST /api/chat/stream (SSE streaming)
chatRouter.post('/stream', async (req: Request, res: Response) => {
  const {
    conversationId,
    projectId,
    modelId,
    provider: providerHint,
    messages,
    systemInstruction,
    temperature,
    maxOutputTokens,
    enableHighThinking,
    preferencesEnabled = true,
  } = req.body;

  if (!modelId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'modelId and messages are required' });
  }

  const provider = providerRegistry.findProviderForModel(modelId, providerHint);
  if (!provider) {
    return res.status(400).json({ error: `Provider not found for ${modelId}` });
  }

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Build personalized context with real RAG vector search & active adapter
  let fullSystemPrompt = systemInstruction || '';
  let appliedPreferences: any[] = [];
  let retrievedMemories: any[] = [];
  let activeAdapter: any = undefined;

  if (preferencesEnabled) {
    const userPrompt = messages[messages.length - 1]?.content || '';
    const context = adaptiveAIService.buildPersonalizedContext({
      projectId,
      modelId,
      currentPrompt: userPrompt,
      baseSystemInstruction: systemInstruction,
    });
    fullSystemPrompt = context.systemPromptAdditions;
    appliedPreferences = context.appliedPreferences;
    retrievedMemories = context.retrievedMemories;
    activeAdapter = context.activeAdapter;
  }

  const chatReq: ChatRequest = {
    conversationId,
    projectId,
    modelId,
    messages,
    systemInstruction: fullSystemPrompt || undefined,
    temperature,
    maxOutputTokens,
    enableHighThinking,
  };

  const sendEvent = (data: StreamChunk) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent({
      type: 'meta',
      meta: {
        appliedPreferences,
        retrievedMemories,
        activeAdapter: activeAdapter ? { name: activeAdapter.name, version: activeAdapter.version } : undefined,
      },
    });

    const result = await provider.streamChat(chatReq, (chunk) => {
      sendEvent(chunk);
    });

    // Record server usage
    serverStore.usageRecords.push({
      timestamp: new Date().toISOString(),
      modelId: result.modelId,
      provider: result.provider,
      tokens: Math.round(result.text.length / 4),
      latencyMs: result.latencyMs,
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat stream error:', error);
    sendEvent({
      type: 'error',
      error: error.message || 'Stream generation failed',
    });
    res.write('data: [DONE]\n\n');
    res.end();
  }
});
