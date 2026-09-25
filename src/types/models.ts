export type ModelProvider = 
  | 'OpenAI'
  | 'Google Gemini'
  | 'Anthropic'
  | 'xAI'
  | 'DeepSeek'
  | 'Mistral'
  | 'OpenRouter'
  | 'Meta'
  | 'Qwen'
  | 'Ollama (Local)'
  | 'LM Studio (Local)'
  | 'Custom Local';

export type ModelCategory = 
  | 'General'
  | 'Reasoning'
  | 'Coding'
  | 'Vision'
  | 'Multimodal'
  | 'Audio'
  | 'Research'
  | 'Embedding'
  | 'Agent'
  | 'Specialized';

export type QuantizationType = 'BF16' | 'FP8' | 'INT8' | 'Q8' | 'Q6' | 'Q5' | 'Q4' | 'Q4_K_M' | 'NVFP4';

export interface ModelDefinition {
  id: string;
  provider: ModelProvider;
  displayName: string;
  description: string;
  modelType: ModelCategory;
  modalities: ('Text' | 'Code' | 'Vision' | 'Audio' | 'Image' | 'Video')[];
  contextWindow: number; // in tokens, e.g. 128000, 1000000
  maxOutput?: number;
  reasoningScore: number; // 1 - 100
  codingScore: number; // 1 - 100
  visionScore?: number;
  speedRating: 'Fast' | 'Moderate' | 'Heavy' | 'Extreme';
  tools: boolean;
  online: boolean;
  local: boolean;
  downloadable?: boolean;
  license: string;
  runtime?: 'Ollama' | 'LM Studio' | 'llama.cpp' | 'Cloud API' | 'Any';
  quantizations?: QuantizationType[];
  parameterCount?: string; // e.g. "21B", "117B", "35B / 3B active"
  activeParameters?: string;
  estimatedStorage?: string; // e.g. "12 GB"
  recommendedRam: number; // GB
  recommendedVram: number; // GB
  minimumRam: number; // GB
  minimumVram: number; // GB
  recommendedGpu?: string;
  difficulty: 'Beginner' | 'Medium' | 'High' | 'Extreme' | 'Server Only';
  pricing?: {
    inputPerMillion: number;
    outputPerMillion: number;
  };
  status: 'Available' | 'Downloaded' | 'Loaded' | 'Connecting' | 'Deprecated';
  releaseDate: string;
  deprecationDate?: string;
  lastVerified?: string;
  documentationUrl?: string;
  modelCardUrl?: string;
  supportsHighThinking?: boolean;
  isHighEndServerOnly?: boolean;
}

export interface HardwareSpec {
  cpu: string;
  ramGb: number;
  gpu: string;
  vramGb: number;
  os: 'Windows' | 'macOS' | 'Linux';
  freeStorageGb: number;
}

export interface CompatibilityResult {
  tier: 'Good' | 'Limited' | 'Not recommended';
  summary: string;
  ramVerdict: {
    provided: number;
    minimum: number;
    recommended: number;
    passed: boolean;
  };
  vramVerdict: {
    provided: number;
    minimum: number;
    recommended: number;
    passed: boolean;
  };
  storageVerdict: {
    provided: number;
    required: number;
    passed: boolean;
  };
  suggestedQuantization: QuantizationType;
  expectedExperience: string;
  alternatives: {
    id: string;
    name: string;
    reason: string;
  }[];
}
