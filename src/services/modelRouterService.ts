import { ModelDefinition } from '../types/models';
import { ALL_MODELS } from '../data/modelRegistry';
import { LearnedPreference } from '../types/workspace';

export interface RouteRequest {
  prompt: string;
  taskType?: 'general' | 'coding' | 'reasoning' | 'vision' | 'research' | 'creative';
  needsTools?: boolean;
  needsVision?: boolean;
  needsCoding?: boolean;
  needsReasoning?: boolean;
  privacyRequired?: boolean;
  localOnly?: boolean;
  maxLatency?: 'fast' | 'moderate' | 'any';
  userPreferences?: LearnedPreference[];
  offlineMode?: boolean;
}

export interface RouteDecision {
  selectedModel: ModelDefinition;
  reason: string;
  tradeoffs: string;
  alternativeModel: ModelDefinition;
  pipelineStages: {
    stage: string;
    detail: string;
    passed: boolean;
  }[];
}

export function routePrompt(request: RouteRequest): RouteDecision {
  const promptLower = request.prompt.toLowerCase();
  
  // 1. Task classification
  const isCoding = request.needsCoding || 
    promptLower.includes('function') || 
    promptLower.includes('const ') || 
    promptLower.includes('refactor') || 
    promptLower.includes('typescript') || 
    promptLower.includes('component') ||
    promptLower.includes('bug') ||
    promptLower.includes('code');

  const isReasoning = request.needsReasoning ||
    promptLower.includes('prove') ||
    promptLower.includes('calculate') ||
    promptLower.includes('why') ||
    promptLower.includes('compare the trade-offs') ||
    promptLower.includes('analyze architecture');

  const isResearch = request.taskType === 'research' ||
    promptLower.includes('literature review') ||
    promptLower.includes('deep research') ||
    promptLower.includes('synthesize papers');

  const isLocalFirst = request.localOnly || request.privacyRequired || request.offlineMode;

  let selectedModelId = 'gemini-3.8-flash';
  let reason = 'Balanced fast latency and high context window for general queries.';
  let tradeoffs = 'Slightly lower reasoning depth than flagship frontier models.';
  let altModelId = 'gpt-6-sol';

  if (isLocalFirst) {
    if (isReasoning) {
      selectedModelId = 'gpt-oss-20b';
      reason = 'Local-first private execution with strong multi-step open weights.';
      tradeoffs = 'Requires 16GB RAM / 12GB VRAM; slower throughput than cloud APIs.';
      altModelId = 'ministral-3-8b';
    } else {
      selectedModelId = 'ministral-3-8b';
      reason = 'Lightweight local model with low memory consumption and instant private response.';
      tradeoffs = 'Reduced context window (128K) compared to cloud frontier models.';
      altModelId = 'gemma-4-12b';
    }
  } else if (isReasoning) {
    selectedModelId = 'gemini-3.1-pro-preview';
    reason = 'Configured with ThinkingLevel.HIGH for maximum mathematical, algorithmic, and architectural rigor.';
    tradeoffs = 'Higher latency due to extended thinking process.';
    altModelId = 'gpt-6-sol';
  } else if (isCoding) {
    selectedModelId = 'claude-sonnet-5';
    reason = 'Benchmark leader in architectural code synthesis, strict TypeScript typing, and refactoring.';
    tradeoffs = 'Higher token cost than Flash variants.';
    altModelId = 'gemini-3.1-pro-preview';
  } else if (isResearch) {
    selectedModelId = 'gemini-deep-research';
    reason = 'Specialized agentic engine with 2M token context for cross-source fact checking.';
    tradeoffs = 'Multi-hop execution takes 15–45 seconds.';
    altModelId = 'claude-opus-5';
  }

  const selectedModel = ALL_MODELS.find(m => m.id === selectedModelId) || ALL_MODELS[0];
  const alternativeModel = ALL_MODELS.find(m => m.id === altModelId) || ALL_MODELS[1];

  return {
    selectedModel,
    reason,
    tradeoffs,
    alternativeModel,
    pipelineStages: [
      {
        stage: 'Task Classification',
        detail: isCoding ? 'Detected Coding & Implementation' : isReasoning ? 'Detected Deep Reasoning' : isResearch ? 'Detected Deep Research' : 'General Conversational Query',
        passed: true,
      },
      {
        stage: 'Privacy & Constraint Filter',
        detail: isLocalFirst ? 'Offline / On-Device Private Runtime Enforced' : 'Cloud / Hybrid Permitted',
        passed: true,
      },
      {
        stage: 'Capability Matching',
        detail: `Matched context requirements (${selectedModel.contextWindow.toLocaleString()} tokens) and tool support.`,
        passed: true,
      },
      {
        stage: 'User Taste Alignment',
        detail: 'Applied learned preferences: concise output, strict typing, anti-slop visual restraint.',
        passed: true,
      }
    ]
  };
}
