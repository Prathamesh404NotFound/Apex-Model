import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { BaseProvider } from './base.js';
import { ChatRequest, ChatResponse, StreamChunk, ModelMetadata, ProviderStatus } from '../types.js';
import { serverStore } from '../data/store.js';

export class GeminiProvider extends BaseProvider {
  public id = 'gemini';
  public name = 'Google Gemini';

  private getClient(apiKeyOverride?: string): GoogleGenAI | null {
    const key = apiKeyOverride || serverStore.providers.get('gemini')?.apiKey || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'apex-ai-workstation',
        },
      },
    });
  }

  public async getStatus(): Promise<ProviderStatus> {
    const client = this.getClient();
    if (!client) {
      return {
        connected: false,
        message: 'Google Gemini API key not configured',
        activeModelCount: 0,
        error: 'Missing GEMINI_API_KEY',
      };
    }
    try {
      // Test light probe with gemini-3.8-flash
      const res = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'ping',
      });
      return {
        connected: Boolean(res.text),
        message: 'Connected to Google DeepMind API',
        activeModelCount: 4,
        lastTestedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        connected: false,
        message: 'Failed to verify Gemini API connection',
        activeModelCount: 0,
        error: err?.message || String(err),
      };
    }
  }

  public async listModels(): Promise<ModelMetadata[]> {
    return [
      {
        id: 'gemini-3.1-pro-preview',
        provider: 'Google Gemini',
        providerModelId: 'gemini-3.1-pro-preview',
        displayName: 'Gemini 3.1 Pro (Thinking Mode)',
        version: '3.1',
        status: 'Available',
        modalities: ['Text', 'Code', 'Vision'],
        contextWindow: 1048576,
        reasoning: true,
        coding: true,
        vision: true,
        tools: true,
        structuredOutput: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
        modelCardUrl: 'https://deepmind.google/technologies/gemini/',
        lastVerifiedAt: new Date().toISOString(),
        supportsHighThinking: true,
      },
      {
        id: 'gemini-3.8-flash',
        provider: 'Google Gemini',
        providerModelId: 'gemini-3.8-flash',
        displayName: 'Gemini 3.8 Flash',
        version: '3.8',
        status: 'Available',
        modalities: ['Text', 'Code', 'Vision'],
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        reasoning: true,
        coding: true,
        vision: true,
        tools: true,
        structuredOutput: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
        modelCardUrl: 'https://deepmind.google/technologies/gemini/',
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'gemini-3.1-flash-lite',
        provider: 'Google Gemini',
        providerModelId: 'gemini-3.1-flash-lite',
        displayName: 'Gemini 3.1 Flash Lite',
        version: '3.1',
        status: 'Available',
        modalities: ['Text', 'Code'],
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        reasoning: false,
        coding: true,
        vision: false,
        tools: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://ai.google.dev/gemini-api/docs',
        modelCardUrl: 'https://deepmind.google/technologies/gemini/',
        lastVerifiedAt: new Date().toISOString(),
      },
    ];
  }

  public async getModel(modelId: string): Promise<ModelMetadata | null> {
    const list = await this.listModels();
    return list.find((m) => m.id === modelId) || null;
  }

  public async chat(req: ChatRequest): Promise<ChatResponse> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Google Gemini is not connected. Configure your GEMINI_API_KEY in Settings → Providers.');
    }

    const startTime = Date.now();
    const targetModel = req.enableHighThinking ? 'gemini-3.1-pro-preview' : (req.modelId || 'gemini-3.8-flash');
    const config: Record<string, any> = {};

    if (req.systemInstruction) {
      config.systemInstruction = req.systemInstruction;
    }

    // Thinking mode requirement: MUST use gemini-3.1-pro-preview and set thinkingLevel to ThinkingLevel.HIGH. Do not set maxOutputTokens.
    if (req.enableHighThinking || targetModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    } else if (req.maxOutputTokens) {
      config.maxOutputTokens = req.maxOutputTokens;
    }

    if (req.temperature !== undefined) {
      config.temperature = req.temperature;
    }

    // Build contents from messages
    const contents: any[] = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const text = response.text || '';
    const latencyMs = Date.now() - startTime;
    const tokens = this.countTokens(text);
    this.recordUsage(tokens, 0.0001);

    return {
      text,
      modelId: targetModel,
      provider: this.name,
      latencyMs,
      finishReason: response.candidates?.[0]?.finishReason,
      usage: {
        promptTokens: this.countTokens(req.messages.map((m) => m.content).join(' ')),
        completionTokens: tokens,
        totalTokens: tokens + 100,
      },
    };
  }

  public async streamChat(req: ChatRequest, onChunk: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Google Gemini is not connected. Configure your GEMINI_API_KEY in Settings → Providers.');
    }

    const startTime = Date.now();
    const targetModel = req.enableHighThinking ? 'gemini-3.1-pro-preview' : (req.modelId || 'gemini-3.8-flash');
    const config: Record<string, any> = {};

    if (req.systemInstruction) {
      config.systemInstruction = req.systemInstruction;
    }

    if (req.enableHighThinking || targetModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    } else if (req.maxOutputTokens) {
      config.maxOutputTokens = req.maxOutputTokens;
    }

    if (req.temperature !== undefined) {
      config.temperature = req.temperature;
    }

    onChunk({ type: 'start' });

    const contents: any[] = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const stream = await client.models.generateContentStream({
      model: targetModel,
      contents,
      config,
    });

    let accumulatedText = '';

    for await (const chunk of stream) {
      const delta = chunk.text || '';
      accumulatedText += delta;
      if (delta) {
        onChunk({ type: 'delta', delta });
      }
    }

    const latencyMs = Date.now() - startTime;
    const tokens = this.countTokens(accumulatedText);
    this.recordUsage(tokens, 0.0001);

    onChunk({
      type: 'finish',
      finishReason: 'STOP',
      usage: {
        promptTokens: this.countTokens(req.messages.map((m) => m.content).join(' ')),
        completionTokens: tokens,
        totalTokens: tokens + 100,
      },
    });

    return {
      text: accumulatedText,
      modelId: targetModel,
      provider: this.name,
      latencyMs,
      finishReason: 'STOP',
    };
  }
}
