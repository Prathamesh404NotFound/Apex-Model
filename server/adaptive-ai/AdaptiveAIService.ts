import {
  PersonalizedContextResult,
  Preference,
  MemoryItem,
  FeedbackItem,
  DatasetCandidate,
  TrainingJob,
  ModelAdapter,
  EvaluationReport,
} from './types.js';
import { preferenceService } from './PreferenceService.js';
import { memoryService } from './MemoryService.js';
import { retrievalService } from './RetrievalService.js';
import { feedbackService } from './FeedbackService.js';
import { datasetService } from './DatasetService.js';
import { trainingService } from './TrainingService.js';
import { modelVersionService } from './ModelVersionService.js';
import { evaluationService } from './EvaluationService.js';
import { rewardService } from './RewardService.js';

export class AdaptiveAIService {
  /**
   * ONLINE PERSONALIZATION:
   * Dynamically constructs the personalized context for a model request without retraining.
   * Retrieves relevant user preferences, project guidelines, and memories using vector similarity.
   */
  public buildPersonalizedContext(params: {
    userId?: string;
    projectId?: string;
    conversationId?: string;
    currentPrompt: string;
    modelId: string;
    baseSystemInstruction?: string;
    maxPreferences?: number;
    maxMemories?: number;
  }): PersonalizedContextResult {
    const {
      currentPrompt,
      projectId,
      modelId,
      baseSystemInstruction = '',
      maxPreferences = 5,
      maxMemories = 3,
    } = params;

    // 1. Vector search and rank preferences
    const allPrefs = preferenceService.getAll();
    const appliedPreferences = retrievalService.rankPreferences(currentPrompt, allPrefs, {
      topK: maxPreferences,
      threshold: 0.1,
    });

    // 2. Vector search relevant memories & project instructions
    const retrievedMemories = memoryService.search(currentPrompt, {
      topK: maxMemories,
      threshold: 0.12,
      projectId,
    });

    // 3. Check for actively deployed adapter for this model
    const activeAdapter = modelVersionService.getDeployedForBaseModel(modelId);

    // 4. Construct personalized system instruction block
    const sections: string[] = [];

    if (baseSystemInstruction.trim()) {
      sections.push(baseSystemInstruction.trim());
    }

    if (activeAdapter) {
      sections.push(
        `[Active Model Adapter: ${activeAdapter.name} (${activeAdapter.version}) | Trained via ${activeAdapter.trainingMethod}]`
      );
    }

    if (appliedPreferences.length > 0) {
      const prefLines = appliedPreferences.map((p) => {
        const marker = p.polarity === 'avoid' ? '[AVOID]' : '[PREFER]';
        return `• ${marker} (${p.category}): ${p.preference}`;
      });
      sections.push(
        `USER PERSONALIZATION & STYLE CONSTRAINTS (Learned from verified human feedback):\n${prefLines.join(
          '\n'
        )}`
      );
    }

    if (retrievedMemories.length > 0) {
      const memLines = retrievedMemories.map((m) => `• [${m.title}]: ${m.content}`);
      sections.push(`PROJECT CONTEXT & WORKSPACE GUIDELINES:\n${memLines.join('\n')}`);
    }

    const systemPromptAdditions = sections.join('\n\n');

    return {
      systemPromptAdditions,
      appliedPreferences,
      retrievedMemories,
      activeAdapter,
    };
  }

  /**
   * ONLINE FEEDBACK COLLECTION & CANDIDATE GENERATION:
   * Records user rating, edits, or comparisons. Extracts preferences immediately
   * and creates candidates for offline dataset compilation.
   */
  public recordFeedback(data: Parameters<typeof feedbackService.recordFeedback>[0]) {
    const result = feedbackService.recordFeedback(data);
    for (const cand of result.extractedCandidates) {
      datasetService.addCandidate(cand);
    }
    return result;
  }

  // Sub-service delegations
  public get preferences() {
    return preferenceService;
  }

  public get memories() {
    return memoryService;
  }

  public get datasets() {
    return datasetService;
  }

  public get training() {
    return trainingService;
  }

  public get versions() {
    return modelVersionService;
  }

  public get evaluations() {
    return evaluationService;
  }

  public get rewards() {
    return rewardService;
  }
}

export const adaptiveAIService = new AdaptiveAIService();
