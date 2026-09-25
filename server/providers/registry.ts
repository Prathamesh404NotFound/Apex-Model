import { AIProvider, ModelMetadata, ProviderStatus } from '../types.js';
import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { XAIProvider } from './xai.js';
import { DeepSeekProvider } from './deepseek.js';
import { MistralProvider } from './mistral.js';
import { OpenRouterProvider } from './openrouter.js';
import { OllamaProvider } from './ollama.js';
import { LMStudioProvider } from './lmstudio.js';
import { serverStore } from '../data/store.js';

export class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private cachedModels: ModelMetadata[] = [];
  private lastRefreshed: number = 0;

  constructor() {
    this.register(new GeminiProvider());
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new XAIProvider());
    this.register(new DeepSeekProvider());
    this.register(new MistralProvider());
    this.register(new OpenRouterProvider());
    this.register(new OllamaProvider());
    this.register(new LMStudioProvider());
  }

  public register(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  public get(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  public getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public findProviderForModel(modelId: string, providerHint?: string): AIProvider {
    if (providerHint && this.providers.has(providerHint.toLowerCase())) {
      return this.providers.get(providerHint.toLowerCase())!;
    }

    const lower = modelId.toLowerCase();

    if (lower.startsWith('ollama/') || lower.includes('gpt-oss') || lower.includes('ministral') || lower.includes('gemma') || lower.includes('deepseek-v4') || lower.includes('qwen3.5')) {
      return this.providers.get('ollama')!;
    }
    if (lower.startsWith('lmstudio/')) {
      return this.providers.get('lmstudio')!;
    }
    if (lower.includes('gemini')) {
      return this.providers.get('gemini')!;
    }
    if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3')) {
      return this.providers.get('openai')!;
    }
    if (lower.includes('claude')) {
      return this.providers.get('anthropic')!;
    }
    if (lower.includes('grok')) {
      return this.providers.get('xai')!;
    }
    if (lower.includes('deepseek')) {
      return this.providers.get('deepseek')!;
    }
    if (lower.includes('mistral') || lower.includes('codestral')) {
      return this.providers.get('mistral')!;
    }
    if (lower.startsWith('openrouter/')) {
      return this.providers.get('openrouter')!;
    }

    // Default fallback to Gemini
    return this.providers.get('gemini')!;
  }

  public async getAllModels(forceRefresh = false): Promise<ModelMetadata[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedModels.length > 0 && (now - this.lastRefreshed < 60000)) {
      return this.cachedModels;
    }

    const allModels: ModelMetadata[] = [];
    for (const p of this.providers.values()) {
      try {
        const models = await p.listModels();
        allModels.push(...models);
      } catch (err) {
        console.warn(`Error loading models from ${p.name}:`, err);
      }
    }

    this.cachedModels = allModels;
    this.lastRefreshed = now;
    return allModels;
  }

  public async testProvider(id: string): Promise<ProviderStatus> {
    const p = this.providers.get(id);
    if (!p) {
      return { connected: false, message: `Unknown provider ${id}`, activeModelCount: 0 };
    }
    const status = await p.getStatus();
    const stored = serverStore.providers.get(id);
    if (stored) {
      stored.connected = status.connected;
      stored.statusMessage = status.message;
      stored.lastTestedAt = new Date().toISOString();
    }
    return status;
  }
}

export const providerRegistry = new ProviderRegistry();
