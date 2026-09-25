import { BaseProvider } from './base.js';
import { ChatRequest, ChatResponse, StreamChunk, ModelMetadata, ProviderStatus } from '../types.js';

export interface OpenAICompatibleConfig {
  id: string;
  name: string;
  defaultBaseUrl: string;
  apiKeyEnvVar: string;
  defaultModels: ModelMetadata[];
}

export class OpenAICompatibleProvider extends BaseProvider {
  public id: string;
  public name: string;
  protected defaultBaseUrl: string;
  protected apiKeyEnvVar: string;
  protected staticModels: ModelMetadata[];

  constructor(config: OpenAICompatibleConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.defaultBaseUrl = config.defaultBaseUrl;
    this.apiKeyEnvVar = config.apiKeyEnvVar;
    this.staticModels = config.defaultModels;
  }

  protected getApiKey(): string {
    return process.env[this.apiKeyEnvVar] || '';
  }

  protected getBaseUrl(): string {
    return this.defaultBaseUrl;
  }

  public async getStatus(): Promise<ProviderStatus> {
    const key = this.getApiKey();
    if (!key) {
      return {
        connected: false,
        message: `${this.name} API key not configured`,
        activeModelCount: 0,
        error: `Missing ${this.apiKeyEnvVar}`,
      };
    }
    try {
      const res = await fetch(`${this.getBaseUrl()}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) {
        return {
          connected: false,
          message: `${this.name} authentication failed (HTTP ${res.status})`,
          activeModelCount: 0,
          error: `HTTP ${res.status}`,
        };
      }
      return {
        connected: true,
        message: `Connected to ${this.name}`,
        activeModelCount: this.staticModels.length,
        lastTestedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `Network error connecting to ${this.name}`,
        activeModelCount: 0,
        error: err?.message || String(err),
      };
    }
  }

  public async listModels(): Promise<ModelMetadata[]> {
    return this.staticModels;
  }

  public async getModel(modelId: string): Promise<ModelMetadata | null> {
    return this.staticModels.find((m) => m.id === modelId) || null;
  }

  public async chat(req: ChatRequest): Promise<ChatResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error(`${this.name} is not connected. Add your API key in Settings → Providers.`);
    }

    const startTime = Date.now();
    const model = req.modelId.includes('/') ? req.modelId.split('/').pop()! : req.modelId;

    const messages = [];
    if (req.systemInstruction) {
      messages.push({ role: 'system', content: req.systemInstruction });
    }
    for (const m of req.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    const res = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://apex.ai',
        'X-Title': 'Apex AI Workstation',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxOutputTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${this.name} API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - startTime;
    const usage = data.usage;

    this.recordUsage(usage?.total_tokens || this.countTokens(text), 0.0002);

    return {
      text,
      modelId: model,
      provider: this.name,
      latencyMs,
      finishReason: data.choices?.[0]?.finish_reason,
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      } : undefined,
    };
  }

  public async streamChat(req: ChatRequest, onChunk: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error(`${this.name} is not connected. Add your API key in Settings → Providers.`);
    }

    const startTime = Date.now();
    const model = req.modelId.includes('/') ? req.modelId.split('/').pop()! : req.modelId;

    const messages = [];
    if (req.systemInstruction) {
      messages.push({ role: 'system', content: req.systemInstruction });
    }
    for (const m of req.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    onChunk({ type: 'start' });

    const res = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://apex.ai',
        'X-Title': 'Apex AI Workstation',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: req.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${this.name} stream error (${res.status}): ${err}`);
    }

    if (!res.body) {
      throw new Error(`${this.name} returned empty stream`);
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
            // ignore partial json
          }
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    const tokens = this.countTokens(accumulatedText);
    this.recordUsage(tokens, 0.0002);

    onChunk({
      type: 'finish',
      finishReason: 'stop',
      usage: {
        promptTokens: this.countTokens(req.messages.map((m) => m.content).join(' ')),
        completionTokens: tokens,
        totalTokens: tokens + 80,
      },
    });

    return {
      text: accumulatedText,
      modelId: model,
      provider: this.name,
      latencyMs,
      finishReason: 'stop',
    };
  }
}
