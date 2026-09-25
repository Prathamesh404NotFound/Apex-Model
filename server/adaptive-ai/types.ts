export type PreferenceScope = 'conversation' | 'project' | 'user' | 'global';

export type PreferenceCategory =
  | 'communication'
  | 'writing'
  | 'coding'
  | 'UI'
  | 'visual'
  | 'formatting'
  | 'reasoning'
  | 'verbosity'
  | 'tone'
  | 'technical_depth'
  | 'creativity'
  | 'workflow';

export type PreferencePolarity = 'prefer' | 'avoid';

export type PreferenceStatus = 'active' | 'paused' | 'archived';

export interface Preference {
  id: string;
  userId: string;
  projectId?: string;
  conversationId?: string;
  scope: PreferenceScope;
  category: PreferenceCategory;
  preference: string;
  polarity: PreferencePolarity;
  confidence: number; // 0.0 to 1.0
  evidenceCount: number;
  source: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  status: PreferenceStatus;
  embedding?: number[];
}

export interface MemoryItem {
  id: string;
  userId: string;
  projectId?: string;
  scope: 'user' | 'project' | 'conversation';
  title: string;
  content: string;
  tags: string[];
  importance: number; // 1 - 10
  source: string;
  createdAt: string;
  updatedAt: string;
  embedding?: number[];
}

export type FeedbackType = 'thumbs' | 'comparison' | 'edit' | 'explicit' | 'detailed_rating';

export interface FeedbackItem {
  id: string;
  conversationId: string;
  messageId: string;
  modelId: string;
  provider: string;
  userId: string;
  projectId?: string;
  type: FeedbackType;
  rating?: 'positive' | 'negative';
  scores?: {
    accuracy?: number;
    style?: number;
    instructionFollowing?: number;
    tone?: number;
    conciseness?: number;
  };
  reasons: string[];
  comment?: string;
  originalPrompt: string;
  originalResponse: string;
  chosenResponse?: string;
  rejectedResponse?: string;
  preferenceScope: 'private' | 'project' | 'anonymous_shared';
  extractedPreferences?: string[];
  createdAt: string;
}

export type DatasetType = 'SFT' | 'DPO' | 'KTO' | 'Reward';

export interface DatasetCandidate {
  id: string;
  type: DatasetType;
  prompt: string;
  chosen?: string;
  rejected?: string;
  output?: string;
  label?: 'desirable' | 'undesirable';
  margin?: number;
  category: string;
  sourceFeedbackId?: string;
  sourceModel: string;
  qualityScore: number;
  verified: boolean;
  createdAt: string;
}

export interface TrainingDataset {
  id: string;
  name: string;
  description: string;
  type: DatasetType;
  itemCount: number;
  items: DatasetCandidate[];
  format: 'jsonl' | 'alpaca' | 'openai' | 'huggingface';
  createdAt: string;
  updatedAt: string;
}

export type AdapterType = 'LoRA' | 'QLoRA' | 'Prefix Tuning' | 'Full';
export type TrainingJobStatus =
  | 'queued'
  | 'preparing_dataset'
  | 'training'
  | 'evaluating'
  | 'completed'
  | 'failed';

export interface TrainingHyperparameters {
  epochs: number;
  learningRate: number;
  rank: number;
  alpha: number;
  batchSize: number;
  warmupRatio: number;
  optimizer: string;
}

export interface LossPoint {
  step: number;
  epoch: number;
  trainLoss: number;
  evalLoss?: number;
  rewardScore?: number;
}

export interface TrainingJob {
  id: string;
  name: string;
  baseModel: string;
  adapterType: AdapterType;
  datasetId: string;
  datasetName: string;
  datasetSize: number;
  trainingMethod: DatasetType | 'GRPO';
  hyperparameters: TrainingHyperparameters;
  status: TrainingJobStatus;
  progress: number; // 0 - 100
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  lossHistory: LossPoint[];
  metrics?: {
    finalTrainLoss: number;
    finalEvalLoss: number;
    rewardScore: number;
    perplexity: number;
  };
  producedAdapterId?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface BenchmarkMetrics {
  winRateVsBase: number; // 0 - 100
  instructionFollowingScore: number; // 0 - 100
  formatAdherenceScore: number; // 0 - 100
  safetyScore: number; // 0 - 100
  humanAgreementRate: number; // 0 - 100
}

export interface ModelAdapter {
  id: string;
  name: string;
  version: string;
  baseModel: string;
  adapterType: AdapterType;
  trainingMethod: string;
  trainingJobId: string;
  datasetId: string;
  datasetSize: number;
  rank: number;
  alpha: number;
  status: 'active' | 'testing' | 'archived';
  isDeployed: boolean;
  benchmarkMetrics: BenchmarkMetrics;
  description: string;
  createdAt: string;
  deployedAt?: string;
}

export interface EvaluationReport {
  id: string;
  adapterId: string;
  adapterName: string;
  baseModel: string;
  testCaseCount: number;
  winRate: number;
  breakdown: {
    category: string;
    adapterScore: number;
    baseScore: number;
    delta: number;
  }[];
  sampleEvaluations: {
    prompt: string;
    baseOutput: string;
    adapterOutput: string;
    preferred: 'adapter' | 'base';
    reason: string;
  }[];
  createdAt: string;
}

export interface PersonalizedContextResult {
  systemPromptAdditions: string;
  appliedPreferences: Preference[];
  retrievedMemories: MemoryItem[];
  activeAdapter?: ModelAdapter;
}
