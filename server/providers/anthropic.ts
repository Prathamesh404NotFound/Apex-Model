import { BaseProvider } from './base.js';
import { ChatRequest, ChatResponse, StreamChunk, ModelMetadata, ProviderStatus } from '../types.js';
import { serverStore } from '../data/store.js';

export class AnthropicProvider extends BaseProvider {
  public id = 'anthropic';
  public name = 'Anthropic Claude';

  private getApiKey(): string {
    return serverStore.providers.get('anthropic')?.apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  public async getStatus(): Promise<ProviderStatus> {
    const key = this.getApiKey();
    if (!key) {
      return {
        connected: false,
        message: 'Anthropic API key not configured',
        activeModelCount: 0,
        error: 'Missing ANTHROPIC_API_KEY',
      };
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
      });
      if (!res.ok) {
        return {
          connected: false,
          message: 'Anthropic API authentication failed',
          activeModelCount: 0,
          error: `HTTP ${res.status}`,
        };
      }
      return {
        connected: true,
        message: 'Connected to official Anthropic API',
        activeModelCount: 3,
        lastTestedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        connected: false,
        message: 'Network error reaching Anthropic endpoint',
        activeModelCount: 0,
        error: err?.message || String(err),
      };
    }
  }

  public async listModels(): Promise<ModelMetadata[]> {
    return [
      {
        id: 'claude-3-7-sonnet-latest',
        provider: 'Anthropic Claude',
        providerModelId: 'claude-3-7-sonnet-latest',
        displayName: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
        version: '3.7',
        status: 'Available',
        modalities: ['Text', 'Code', 'Vision'],
        contextWindow: 200000,
        maxOutputTokens: 8192,
        reasoning: true,
        coding: true,
        vision: true,
        tools: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
        modelCardUrl: 'https://www.anthropic.com/news/claude-3-7-sonnet',
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'claude-3-5-haiku-latest',
        provider: 'Anthropic Claude',
        providerModelId: 'claude-3-5-haiku-latest',
        displayName: 'Claude 3.5 Haiku',
        version: '3.5',
        status: 'Available',
        modalities: ['Text', 'Code'],
        contextWindow: 200000,
        maxOutputTokens: 8192,
        reasoning: false,
        coding: true,
        vision: false,
        tools: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
        modelCardUrl: 'https://www.anthropic.com',
        lastVerifiedAt: new Date().toISOString(),
      },
    ];
  }

  public async getModel(modelId: string): Promise<ModelMetadata | null> {
    const list = await this.listModels();
    return list.find((m) => m.id === modelId) || null;
  }

  public async chat(req: ChatRequest): Promise<ChatResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('Anthropic Claude is not connected. Add your API key in Settings → Providers.');
    }

    const startTime = Date.now();
    const model = req.modelId.includes('haiku') ? 'claude-3-5-haiku-latest' : 'claude-3-7-sonnet-latest';

    const messages = req.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages,
        system: req.systemInstruction || undefined,
        max_tokens: req.maxOutputTokens || 4096,
        temperature: req.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const latencyMs = Date.now() - startTime;
    const tokens = this.countTokens(text);
    this.recordUsage(tokens, 0.0003);

    return {
      text,
      modelId: model,
      provider: this.name,
      latencyMs,
      finishReason: data.stop_reason,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    };
  }

  public async streamChat(req: ChatRequest, onChunk: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('Anthropic Claude is not connected. Add your API key in Settings → Providers.');
    }

    const startTime = Date.now();
    const model = req.modelId.includes('haiku') ? 'claude-3-5-haiku-latest' : 'claude-3-7-sonnet-latest';

    const messages = req.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    onChunk({ type: 'start' });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages,
        system: req.systemInstruction || undefined,
        max_tokens: req.maxOutputTokens || 4096,
        stream: true,
        temperature: req.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic stream error (${res.status}): ${err}`);
    }

    if (!res.body) {
      throw new Error('Anthropic returned empty stream');
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
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === 'content_block_delta') {
              const delta = parsed.delta?.text || '';
              if (delta) {
                accumulatedText += delta;
                onChunk({ type: 'delta', delta });
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    const tokens = this.countTokens(accumulatedText);
    this.recordUsage(tokens, 0.0003);

    onChunk({
      type: 'finish',
      finishReason: 'end_turn',
      usage: {
        promptTokens: this.countTokens(req.messages.map((m) => m.content).join(' ')),
        completionTokens: tokens,
        totalTokens: tokens + 90,
      },
    });

    return {
      text: accumulatedText,
      modelId: model,
      provider: this.name,
      latencyMs,
      finishReason: 'end_turn',
    };
  }
}
