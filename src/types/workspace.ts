export type WorkspaceMode = 'fast' | 'deep reasoning' | 'coding' | 'creative' | 'research' | 'local/offline' | 'auto';

export interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

export interface MessageFeedback {
  id: string;
  messageId: string;
  sentiment: 'positive' | 'negative';
  reasons: string[];
  suggestedAlternative?: string;
  preferredVersion?: string;
  privacyScope: 'private' | 'project' | 'anonymous_shared';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  thinkingProcess?: string;
  latencyMs?: number;
  tokensUsed?: number;
  isStreaming?: boolean;
  codeSnippets?: CodeSnippet[];
  feedback?: MessageFeedback;
  routedReason?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  modelId: string;
  mode: WorkspaceMode;
  messages: ChatMessage[];
  pinned?: boolean;
  isLocalOnly?: boolean;
}

export interface ProjectRule {
  id: string;
  category: 'style' | 'tech' | 'constraint' | 'brand';
  content: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rules: ProjectRule[];
  defaultModelId?: string;
  fileIds: string[];
  chatIds: string[];
  tasteTags: string[];
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  extension: string;
  uploadedAt: string;
  content: string;
  projectId?: string;
  scope: 'conversation' | 'project' | 'workspace';
}

export interface LearnedPreference {
  id: string;
  category: 'Communication' | 'Code' | 'UI Design' | 'Tone' | 'Detail' | 'Creativity';
  title: string;
  description: string;
  score: number; // 1 to 10
  confidence: 'High' | 'Medium' | 'Emerging';
  evidenceCount: number;
  lastUpdated: string;
  sourceType: 'Feedback Edit' | 'Explicit Thumbs' | 'Comparison Winner' | 'Direct Instruction';
  status: 'active' | 'paused';
}

export interface ComparisonCandidate {
  modelId: string;
  modelName: string;
  response: string;
  latencyMs: number;
  tokensUsed: number;
  costEstimate: string;
  thinkingDetails?: string;
}

export interface ComparisonSession {
  id: string;
  prompt: string;
  timestamp: string;
  candidates: ComparisonCandidate[];
  chosenModelId?: string;
  choiceReason?: string;
  blindMode: boolean;
}

export interface TrainingCandidate {
  id: string;
  type: 'SFT' | 'DPO' | 'KTO' | 'Reward Model';
  status: 'Captured' | 'Filtered' | 'Approved' | 'Training' | 'Evaluated' | 'Rejected';
  taskCategory: string;
  promptSnippet: string;
  chosenSnippet: string;
  rejectedSnippet?: string;
  feedbackReason: string;
  privacyVerified: boolean;
  sourceModel: string;
  timestamp: string;
}

export interface LocalRuntimeState {
  status: 'connected' | 'disconnected' | 'checking';
  runtimeName: 'Ollama' | 'LM Studio' | 'llama.cpp' | 'Custom';
  endpoint: string;
  loadedModel?: string;
  loadedModelVram?: string;
  totalVramGb: number;
  usedVramGb: number;
  systemRamGb: number;
  cudaVersion?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Coding' | 'Design' | 'Research' | 'Writing' | 'Study' | 'Business' | 'Debugging';
  prompt: string;
  variables: string[]; // e.g. ["project", "technology", "style"]
  favorite?: boolean;
}
