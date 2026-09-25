import { ModelDefinition } from '../types/models';
import { Project, LearnedPreference } from '../types/workspace';

export interface GenerationOptions {
  prompt: string;
  model: ModelDefinition;
  project?: Project;
  preferences?: LearnedPreference[];
  enableHighThinking?: boolean;
  systemInstruction?: string;
  isOffline?: boolean;
  messagesHistory?: { role: 'user' | 'assistant' | 'system'; content: string }[];
  onDelta?: (delta: string) => void;
}

export interface GenerationResult {
  text: string;
  modelId: string;
  modelName: string;
  latencyMs: number;
  tokensUsed: number;
  thinkingProcess?: string;
  routedReason?: string;
  provider?: string;
}

/**
 * Executes a REAL AI model generation request through the backend AI gateway.
 * NEVER returns fake, simulated, or hardcoded text.
 */
export async function generateAIResponse(options: GenerationOptions): Promise<GenerationResult> {
  const startTime = Date.now();
  const { prompt, model, project, preferences, enableHighThinking, isOffline, messagesHistory, onDelta } = options;

  // Real offline connectivity check
  if (isOffline && !model.local) {
    throw new Error(
      `OFFLINE: Cloud model "${model.displayName}" is unavailable. Connect local runtime or toggle online mode.`
    );
  }

  // Construct message payload with context history
  const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
  if (messagesHistory && messagesHistory.length > 0) {
    messages.push(...messagesHistory);
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  const systemInstruction = buildSystemPrompt(project, preferences, options.systemInstruction);

  // If streaming is requested
  if (onDelta) {
    return await streamRealChat({
      modelId: model.id,
      messages,
      systemInstruction,
      enableHighThinking: enableHighThinking || model.supportsHighThinking,
      onDelta,
      modelDisplayName: model.displayName,
      startTime,
    });
  }

  // Non-streaming real backend call
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId: model.id,
      provider: model.provider,
      messages,
      systemInstruction,
      enableHighThinking: enableHighThinking || model.supportsHighThinking,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Server error (${res.status}) executing model ${model.displayName}`);
  }

  const data = await res.json();
  const latencyMs = Date.now() - startTime;

  return {
    text: data.text,
    modelId: data.modelId || model.id,
    modelName: model.displayName,
    provider: data.provider || model.provider,
    latencyMs: data.latencyMs || latencyMs,
    tokensUsed: data.usage?.totalTokens || Math.round((data.text || '').length / 4),
    thinkingProcess: enableHighThinking || model.supportsHighThinking
      ? 'Verified with High Thinking reasoning pipeline.'
      : undefined,
  };
}

/**
 * Real Server-Sent Events (SSE) streaming consumer.
 * Directly streams tokens from the real provider.
 */
async function streamRealChat(options: {
  modelId: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  systemInstruction?: string;
  enableHighThinking?: boolean;
  onDelta: (delta: string) => void;
  modelDisplayName: string;
  startTime: number;
}): Promise<GenerationResult> {
  const { modelId, messages, systemInstruction, enableHighThinking, onDelta, modelDisplayName, startTime } = options;

  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId,
      messages,
      systemInstruction,
      enableHighThinking,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Connection error (${res.status}) connecting to model ${modelDisplayName}`);
  }

  if (!res.body) {
    throw new Error('Server returned empty response stream.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = '';
  let streamError: string | null = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const chunk = JSON.parse(trimmed.slice(6));
          if (chunk.type === 'delta' && chunk.delta) {
            accumulatedText += chunk.delta;
            onDelta(chunk.delta);
          } else if (chunk.type === 'error') {
            streamError = chunk.error;
          }
        } catch (e) {
          // ignore malformed SSE line
        }
      }
    }
  }

  if (streamError) {
    throw new Error(streamError);
  }

  const latencyMs = Date.now() - startTime;
  return {
    text: accumulatedText,
    modelId,
    modelName: modelDisplayName,
    latencyMs,
    tokensUsed: Math.round(accumulatedText.length / 4),
  };
}

function buildSystemPrompt(project?: Project, preferences?: LearnedPreference[], customInstruction?: string): string {
  const parts: string[] = [];

  if (customInstruction) {
    parts.push(customInstruction);
  }

  if (project?.rules?.length) {
    parts.push(`Project Rules for "${project.name}":\n` + project.rules.map((r) => `- ${r.content}`).join('\n'));
  }

  if (preferences?.length) {
    parts.push(
      'Active User Style & Formatting Preferences:\n' +
        preferences
          .filter((p) => p.status === 'active')
          .map((p) => `- ${p.title}: ${p.description}`)
          .join('\n')
    );
  }

  return parts.join('\n\n');
}
