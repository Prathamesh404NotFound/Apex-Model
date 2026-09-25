import { FeedbackItem, DatasetCandidate } from './types.js';
import { preferenceService } from './PreferenceService.js';
import { rewardService } from './RewardService.js';

export class FeedbackService {
  private feedbackEvents: FeedbackItem[] = [];

  constructor() {
    this.seedInitialFeedback();
  }

  private seedInitialFeedback() {
    this.feedbackEvents.push(
      {
        id: 'fb-seed-1',
        conversationId: 'conv-101',
        messageId: 'msg-seed-1',
        modelId: 'gemini-3.1-pro-preview',
        provider: 'Google Gemini',
        userId: 'default-user',
        type: 'thumbs',
        rating: 'positive',
        reasons: ['Direct and concise', 'Followed instructions'],
        originalPrompt: 'How should I structure a React 19 component with TypeScript?',
        originalResponse: 'Here is a clean functional React 19 component with strict TypeScript props:\n\n```tsx\ninterface Props {\n  title: string;\n  onSave: () => void;\n}\n\nexport const Card: React.FC<Props> = ({ title, onSave }) => {\n  return <div onClick={onSave}>{title}</div>;\n};\n```',
        chosenResponse: 'Here is a clean functional React 19 component with strict TypeScript props:\n\n```tsx\ninterface Props {\n  title: string;\n  onSave: () => void;\n}\n\nexport const Card: React.FC<Props> = ({ title, onSave }) => {\n  return <div onClick={onSave}>{title}</div>;\n};\n```',
        preferenceScope: 'anonymous_shared',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'fb-seed-2',
        conversationId: 'conv-102',
        messageId: 'msg-seed-2',
        modelId: 'gpt-5-turbo',
        provider: 'OpenAI',
        userId: 'default-user',
        type: 'edit',
        rating: 'negative',
        reasons: ['Too verbose', 'Included conversational filler'],
        originalPrompt: 'Provide an API response model for user profile.',
        originalResponse: 'Sure thing! I would be glad to help you create a TypeScript model for user profiles. Here is some information...',
        chosenResponse: 'export interface UserProfile {\n  id: string;\n  username: string;\n  email: string;\n  avatarUrl?: string;\n  createdAt: string;\n}',
        rejectedResponse: 'Sure thing! I would be glad to help you create a TypeScript model for user profiles. Here is some information...',
        preferenceScope: 'anonymous_shared',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    );
  }

  public getAll(): FeedbackItem[] {
    return [...this.feedbackEvents];
  }

  public getById(id: string): FeedbackItem | undefined {
    return this.feedbackEvents.find((f) => f.id === id);
  }

  public recordFeedback(data: {
    conversationId?: string;
    messageId: string;
    modelId: string;
    provider: string;
    userId?: string;
    projectId?: string;
    type?: FeedbackItem['type'];
    rating?: 'positive' | 'negative';
    scores?: FeedbackItem['scores'];
    reasons?: string[];
    comment?: string;
    originalPrompt: string;
    originalResponse: string;
    chosenResponse?: string;
    rejectedResponse?: string;
    preferenceScope?: 'private' | 'project' | 'anonymous_shared';
  }): { feedback: FeedbackItem; extractedCandidates: DatasetCandidate[] } {
    const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const reasons = data.reasons || [];
    const type = data.type || (data.chosenResponse && data.rejectedResponse ? 'edit' : 'thumbs');
    const preferenceScope = data.preferenceScope || 'anonymous_shared';

    const feedback: FeedbackItem = {
      id,
      conversationId: data.conversationId || 'default-conv',
      messageId: data.messageId,
      modelId: data.modelId,
      provider: data.provider,
      userId: data.userId || 'default-user',
      projectId: data.projectId,
      type,
      rating: data.rating,
      scores: data.scores,
      reasons,
      comment: data.comment,
      originalPrompt: data.originalPrompt,
      originalResponse: data.originalResponse,
      chosenResponse: data.chosenResponse,
      rejectedResponse: data.rejectedResponse,
      preferenceScope,
      createdAt: new Date().toISOString(),
    };

    // 1. Online Personalization: Extract immediate user preferences
    const extractedPrefs = preferenceService.extractFromFeedback({
      userId: feedback.userId,
      projectId: feedback.projectId,
      rating: feedback.rating,
      reasons: feedback.reasons,
      comment: feedback.comment,
      suggestedAlternative: feedback.chosenResponse,
      sourceModel: feedback.modelId,
    });
    feedback.extractedPreferences = extractedPrefs.map((p) => p.preference);

    this.feedbackEvents.unshift(feedback);

    // 2. Offline Model Improvement: Generate Dataset Candidates
    const candidates: DatasetCandidate[] = [];

    // DPO Pair (Chosen vs Rejected)
    if (feedback.chosenResponse && feedback.rejectedResponse) {
      const activePrefs = preferenceService.getActive();
      const margin = rewardService.computePairMargin(
        feedback.chosenResponse,
        feedback.rejectedResponse,
        feedback.originalPrompt,
        activePrefs
      );

      candidates.push({
        id: `cand-dpo-${Date.now()}`,
        type: 'DPO',
        prompt: feedback.originalPrompt,
        chosen: feedback.chosenResponse,
        rejected: feedback.rejectedResponse,
        margin,
        category: reasons[0] || 'General Alignment',
        sourceFeedbackId: feedback.id,
        sourceModel: feedback.modelId,
        qualityScore: 0.94,
        verified: true,
        createdAt: new Date().toISOString(),
      });
    }

    // SFT Pair (Instruction & Chosen)
    if (feedback.chosenResponse || (feedback.rating === 'positive' && feedback.originalResponse)) {
      const targetOutput = feedback.chosenResponse || feedback.originalResponse;
      candidates.push({
        id: `cand-sft-${Date.now()}`,
        type: 'SFT',
        prompt: feedback.originalPrompt,
        output: targetOutput,
        category: reasons[0] || 'Instruction Following',
        sourceFeedbackId: feedback.id,
        sourceModel: feedback.modelId,
        qualityScore: 0.92,
        verified: true,
        createdAt: new Date().toISOString(),
      });
    }

    // KTO Item (Prompt, Output, Label: desirable / undesirable)
    if (feedback.rating) {
      candidates.push({
        id: `cand-kto-${Date.now()}`,
        type: 'KTO',
        prompt: feedback.originalPrompt,
        output: feedback.originalResponse,
        label: feedback.rating === 'positive' ? 'desirable' : 'undesirable',
        category: reasons[0] || 'Quality Assessment',
        sourceFeedbackId: feedback.id,
        sourceModel: feedback.modelId,
        qualityScore: 0.88,
        verified: true,
        createdAt: new Date().toISOString(),
      });
    }

    return { feedback, extractedCandidates: candidates };
  }
}

export const feedbackService = new FeedbackService();
