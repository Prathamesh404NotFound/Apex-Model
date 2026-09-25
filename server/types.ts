export interface ModelMetadata {
  id: string;
  provider: string;
  providerModelId: string;
  displayName: string;
  version?: string;
  status: 'Available' | 'Unavailable' | 'Requires API Key' | 'Downloaded' | 'Not Downloaded' | 'Connecting' | 'Error';
  releaseDate?: string;
  deprecationDate?: string;
  modalities: string[];
  contextWindow: number;
  maxOutputTokens?: number;
  reasoning: boolean;
  coding: boolean;
  vision: boolean;
  audio?: boolean;
  tools: boolean;
  structuredOutput?: boolean;
  imageGeneration?: boolean;
  localAvailable: boolean;
  downloadable?: boolean;
  runtime?: string;
  license: string;
  parameterCount?: string;
  activeParameters?: string;
  modelSize?: string;
  quantizations?: string[];
  documentationUrl: string;
  modelCardUrl: string;
  downloadUrl?: string;
  ollamaModel?: string;
  lmStudioModel?: string;
  recommendedRam?: number;
  recommendedVram?: number;
  minimumRam?: number;
  minimumVram?: number;
  lastVerifiedAt: string;
  supportsHighThinking?: boolean;
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: {
    name: string;
    type: string;
    data: string; // base64 or text
  }[];
}

export interface ChatRequest {
  conversationId?: string;
  projectId?: string;
  modelId: string;
  provider?: string;
  messages: ChatMessagePayload[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  reasoningLevel?: 'low' | 'medium' | 'high';
  enableHighThinking?: boolean;
  memoryEnabled?: boolean;
  preferencesEnabled?: boolean;
  preferences?: string[];
}

export interface StreamChunk {
  type: 'start' | 'delta' | 'thinking' | 'tool_call' | 'finish' | 'usage' | 'error' | 'meta';
  delta?: string;
  thinking?: string;
  finishReason?: string;
  meta?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface ChatResponse {
  text: string;
  thinkingProcess?: string;
  modelId: string;
  provider: string;
  latencyMs: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface ProviderStatus {
  connected: boolean;
  message: string;
  activeModelCount: number;
  lastTestedAt?: string;
  error?: string;
}

export interface ProviderUsage {
  totalRequests: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AIProvider {
  id: string;
  name: string;
  listModels(): Promise<ModelMetadata[]>;
  getModel(modelId: string): Promise<ModelMetadata | null>;
  chat(req: ChatRequest): Promise<ChatResponse>;
  streamChat(req: ChatRequest, onChunk: (chunk: StreamChunk) => void): Promise<ChatResponse>;
  countTokens(text: string): number;
  supportsVision(): boolean;
  supportsTools(): boolean;
  supportsReasoning(): boolean;
  supportsFiles(): boolean;
  getUsage(): ProviderUsage;
  getStatus(): Promise<ProviderStatus>;
}
