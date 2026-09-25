import { BaseProvider } from './base.js';
import { ChatRequest, ChatResponse, StreamChunk, ModelMetadata, ProviderStatus } from '../types.js';
import { serverStore } from '../data/store.js';

export class LMStudioProvider extends BaseProvider {
  public id = 'lmstudio';
  public name = 'LM Studio Local Server';

  private getBaseUrl(): string {
    return serverStore.providers.get('lmstudio')?.baseUrl || process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1';
  }

  public async getStatus(): Promise<ProviderStatus> {
    const url = this.getBaseUrl();
    try {
      const res = await fetch(`${url}/models`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) {
        return {
          connected: false,
          message: `LM Studio returned HTTP ${res.status}`,
          activeModelCount: 0,
          error: `HTTP ${res.status}`,
        };
      }
      const data = await res.json();
      const models = data.data || [];
      return {
        connected: true,
        message: `LM Studio running with ${models.length} loaded model(s)`,
        activeModelCount: models.length,
        lastTestedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `LM Studio server not reachable at ${url}. Start local server inside LM Studio.`,
        activeModelCount: 0,
        error: err?.message || String(err),
      };
    }
  }

  public async listModels(): Promise<ModelMetadata[]> {
    const url = this.getBaseUrl();
    try {
      const res = await fetch(`${url}/models`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return (data.data || []).map((m: any) => ({
          id: `lmstudio/${m.id}`,
          provider: 'LM Studio (Local)',
          providerModelId: m.id,
          displayName: `${m.id} (LM Studio)`,
          status: 'Loaded',
          modalities: ['Text', 'Code'],
          contextWindow: 32768,
          reasoning: true,
          coding: true,
          vision: false,
          tools: true,
          localAvailable: true,
          license: 'Local Loaded Weight',
          documentationUrl: 'https://lmstudio.ai',
          modelCardUrl: 'https://lmstudio.ai',
          lastVerifiedAt: new Date().toISOString(),
        }));
      }
    } catch (e) {
      // offline
    }
    return [];
  }

  public async getModel(modelId: string): Promise<ModelMetadata | null> {
    const list = await this.listModels();
    return list.find((m) => m.id === modelId || m.providerModelId === modelId) || null;
  }

  public async chat(req: ChatRequest): Promise<ChatResponse> {
    const url = this.getBaseUrl();
    const model = req.modelId.replace('lmstudio/', '');
    const startTime = Date.now();

    const messages = [];
    if (req.systemInstruction) {
      messages.push({ role: 'system', content: req.systemInstruction });
    }
    for (const m of req.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    try {
      const res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          temperature: req.temperature ?? 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`LM Studio HTTP ${res.status}: ${err}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const latencyMs = Date.now() - startTime;
      const tokens = this.countTokens(text);
      this.recordUsage(tokens, 0);

      return {
        text,
        modelId: model,
        provider: this.name,
        latencyMs,
        finishReason: data.choices?.[0]?.finish_reason,
      };
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        throw new Error(`LM Studio is not running at ${url}. Start LM Studio local server.`);
      }
      throw err;
    }
  }

  public async streamChat(req: ChatRequest, onChunk: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    const url = this.getBaseUrl();
    const model = req.modelId.replace('lmstudio/', '');
    const startTime = Date.now();

    const messages = [];
    if (req.systemInstruction) {
      messages.push({ role: 'system', content: req.systemInstruction });
    }
    for (const m of req.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    onChunk({ type: 'start' });

    try {
      const res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: req.temperature ?? 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`LM Studio streaming error (${res.status}): ${err}`);
      }

      if (!res.body) {
        throw new Error('LM Studio returned empty stream');
      }

      let accumulatedText = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
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
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                accumulatedText += delta;
                onChunk({ type: 'delta', delta });
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }

      const latencyMs = Date.now() - startTime;
      const tokens = this.countTokens(accumulatedText);
      this.recordUsage(tokens, 0);

      onChunk({
        type: 'finish',
        finishReason: 'stop',
      });

      return {
        text: accumulatedText,
        modelId: model,
        provider: this.name,
        latencyMs,
        finishReason: 'stop',
      };
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        throw new Error(`LM Studio is not running at ${url}. Start LM Studio local server.`);
      }
      throw err;
    }
  }
}
