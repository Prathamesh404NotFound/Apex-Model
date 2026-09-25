import { ModelMetadata } from '../types.js';

export interface StoredProviderConfig {
  id: string;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  connected: boolean;
  isLocal: boolean;
  lastTestedAt?: string;
  statusMessage?: string;
}

export interface StoredFeedback {
  id: string;
  conversationId: string;
  messageId: string;
  modelId: string;
  provider: string;
  rating: 'positive' | 'negative';
  reasons: string[];
  comment?: string;
  suggestedAlternative?: string;
  preferredVersion?: string;
  preferenceScope: 'private' | 'project' | 'anonymous_shared';
  createdAt: string;
}

export interface StoredPreference {
  id: string;
  category: 'Communication' | 'Code' | 'UI Design' | 'Tone' | 'Detail' | 'Creativity';
  title: string;
  description: string;
  score: number;
  confidence: 'High' | 'Medium' | 'Emerging';
  evidenceCount: number;
  sourceType: string;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface StoredConversation {
  id: string;
  title: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  modelId: string;
  messages: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    modelId: string;
    provider: string;
    timestamp: string;
    thinkingProcess?: string;
    latencyMs?: number;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }[];
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  extension: string;
  uploadedAt: string;
  content: string;
  scope: string;
}

class ServerStore {
  public providers: Map<string, StoredProviderConfig> = new Map();
  public models: Map<string, ModelMetadata> = new Map();
  public conversations: Map<string, StoredConversation> = new Map();
  public preferences: Map<string, StoredPreference> = new Map();
  public feedbackEvents: StoredFeedback[] = [];
  public files: Map<string, StoredFile> = new Map();
  public usageRecords: { timestamp: string; modelId: string; provider: string; tokens: number; latencyMs: number }[] = [];

  constructor() {
    this.initDefaultProviders();
    this.initSeedPreferences();
  }

  private initDefaultProviders() {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openAiKey = process.env.OPENAI_API_KEY || '';
    const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    const xAiKey = process.env.XAI_API_KEY || '';
    const deepSeekKey = process.env.DEEPSEEK_API_KEY || '';
    const mistralKey = process.env.MISTRAL_API_KEY || '';
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';

    this.providers.set('gemini', {
      id: 'gemini',
      name: 'Google Gemini',
      apiKey: geminiKey,
      connected: Boolean(geminiKey),
      isLocal: false,
      statusMessage: geminiKey ? 'Ready (API Key Configured)' : 'API Key Required',
    });

    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      apiKey: openAiKey,
      connected: Boolean(openAiKey),
      isLocal: false,
      statusMessage: openAiKey ? 'Ready' : 'API Key Required',
    });

    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic Claude',
      apiKey: anthropicKey,
      connected: Boolean(anthropicKey),
      isLocal: false,
      statusMessage: anthropicKey ? 'Ready' : 'API Key Required',
    });

    this.providers.set('xai', {
      id: 'xai',
      name: 'xAI Grok',
      apiKey: xAiKey,
      connected: Boolean(xAiKey),
      isLocal: false,
      statusMessage: xAiKey ? 'Ready' : 'API Key Required',
    });

    this.providers.set('deepseek', {
      id: 'deepseek',
      name: 'DeepSeek',
      apiKey: deepSeekKey,
      connected: Boolean(deepSeekKey),
      isLocal: false,
      statusMessage: deepSeekKey ? 'Ready' : 'API Key Required',
    });

    this.providers.set('mistral', {
      id: 'mistral',
      name: 'Mistral AI',
      apiKey: mistralKey,
      connected: Boolean(mistralKey),
      isLocal: false,
      statusMessage: mistralKey ? 'Ready' : 'API Key Required',
    });

    this.providers.set('openrouter', {
      id: 'openrouter',
      name: 'OpenRouter',
      apiKey: openRouterKey,
      connected: Boolean(openRouterKey),
      isLocal: false,
      statusMessage: openRouterKey ? 'Ready' : 'API Key Required',
    });

    this.providers.set('ollama', {
      id: 'ollama',
      name: 'Ollama Local Runtime',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      connected: false,
      isLocal: true,
      statusMessage: 'Ready to connect at http://localhost:11434',
    });

    this.providers.set('lmstudio', {
      id: 'lmstudio',
      name: 'LM Studio Local Server',
      baseUrl: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
      connected: false,
      isLocal: true,
      statusMessage: 'Ready to connect at http://localhost:1234/v1',
    });
  }

  private initSeedPreferences() {
    const p1: StoredPreference = {
      id: 'pref-1',
      category: 'Code',
      title: 'Strict TypeScript without "any"',
      description: 'Always declare complete TypeScript interfaces and types. Avoid shortcuts or placeholders.',
      score: 9,
      confidence: 'High',
      evidenceCount: 4,
      sourceType: 'Feedback Learning',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const p2: StoredPreference = {
      id: 'pref-2',
      category: 'Tone',
      title: 'Direct and Concise Communication',
      description: 'Cut filler apologies, robotic greetings, and self-evident disclaimers. Jump straight into the solution.',
      score: 9,
      confidence: 'High',
      evidenceCount: 5,
      sourceType: 'Direct Instruction',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.preferences.set(p1.id, p1);
    this.preferences.set(p2.id, p2);
  }

  public getMaskedKey(key?: string): string {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  }
}

export const serverStore = new ServerStore();
