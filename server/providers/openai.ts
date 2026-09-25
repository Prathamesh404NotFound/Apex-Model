import { BaseProvider } from './base.js';
import { ChatRequest, ChatResponse, StreamChunk, ModelMetadata, ProviderStatus } from '../types.js';
import { serverStore } from '../data/store.js';

export class OpenAIProvider extends BaseProvider {
  public id = 'openai';
  public name = 'OpenAI';

  private getApiKey(): string {
    return serverStore.providers.get('openai')?.apiKey || process.env.OPENAI_API_KEY || '';
  }

  private getBaseUrl(): string {
    return serverStore.providers.get('openai')?.baseUrl || 'https://api.openai.com/v1';
  }

  public async getStatus(): Promise<ProviderStatus> {
    const key = this.getApiKey();
    if (!key) {
      return {
        connected: false,
        message: 'OpenAI API key not configured',
        activeModelCount: 0,
        error: 'Missing OPENAI_API_KEY',
      };
    }
    try {
      const res = await fetch(`${this.getBaseUrl()}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        return {
          connected: false,
          message: 'OpenAI authentication error',
          activeModelCount: 0,
          error: `HTTP ${res.status}: ${errorText.slice(0, 100)}`,
        };
      }
      const data = await res.json();
      return {
        connected: true,
        message: 'Connected to official OpenAI API',
        activeModelCount: data.data?.length || 5,
        lastTestedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        connected: false,
        message: 'Network error reaching OpenAI endpoint',
        activeModelCount: 0,
        error: err?.message || String(err),
      };
    }
  }

  public async listModels(): Promise<ModelMetadata[]> {
    return [
      {
        id: 'gpt-4o',
        provider: 'OpenAI',
        providerModelId: 'gpt-4o',
        displayName: 'GPT-4o (Omni)',
        version: '4o',
        status: 'Available',
        modalities: ['Text', 'Code', 'Vision', 'Audio'],
        contextWindow: 128000,
        maxOutputTokens: 16384,
        reasoning: true,
        coding: true,
        vision: true,
        tools: true,
        structuredOutput: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://platform.openai.com/docs/models/gpt-4o',
        modelCardUrl: 'https://openai.com/index/hello-gpt-4o/',
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'gpt-4o-mini',
        provider: 'OpenAI',
        providerModelId: 'gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        version: '4o-mini',
        status: 'Available',
        modalities: ['Text', 'Code', 'Vision'],
        contextWindow: 128000,
        maxOutputTokens: 16384,
        reasoning: true,
        coding: true,
        vision: true,
        tools: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini',
        modelCardUrl: 'https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/',
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'o3-mini',
        provider: 'OpenAI',
        providerModelId: 'o3-mini',
        displayName: 'o3-mini (Reasoning)',
        version: 'o3',
        status: 'Available',
        modalities: ['Text', 'Code'],
        contextWindow: 200000,
        maxOutputTokens: 100000,
        reasoning: true,
        coding: true,
        vision: false,
        tools: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://platform.openai.com/docs/models/o3-mini',
        modelCardUrl: 'https://openai.com/index/openai-o3-mini/',
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'gpt-5.6',
        provider: 'OpenAI',
        providerModelId: 'gpt-5.6',
        displayName: 'GPT-5.6 (Design & Coding)',
        version: '5.6',
        status: 'Available',
        modalities: ['Text', 'Code', 'Vision'],
        contextWindow: 256000,
        maxOutputTokens: 32768,
        reasoning: true,
        coding: true,
        vision: true,
        tools: true,
        structuredOutput: true,
        localAvailable: false,
        license: 'Proprietary Cloud API',
        documentationUrl: 'https://platform.openai.com/docs/models',
        modelCardUrl: 'https://openai.com',
        lastVerifiedAt: new Date().toISOString(),
      }
    ];
  }

  public async getModel(modelId: string): Promise<ModelMetadata | null> {
    const list = await this.listModels();
    return list.find((m) => m.id === modelId) || null;
  }

  public async chat(req: ChatRequest): Promise<ChatResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('OpenAI is not connected. Add your API key in Settings → Providers.');
    }

    const startTime = Date.now();
    const model = req.modelId.replace('openai/', '') || 'gpt-4o';

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
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
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
      throw new Error('OpenAI is not connected. Add your API key in Settings → Providers.');
    }

    const startTime = Date.now();
    const model = req.modelId.replace('openai/', '') || 'gpt-4o';

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
      throw new Error(`OpenAI streaming error (${res.status}): ${err}`);
    }

    if (!res.body) {
      throw new Error('OpenAI returned empty response body');
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
