import { Router, Request, Response } from 'express';
import { serverStore, StoredFeedback, StoredPreference } from '../data/store.js';
import { adaptiveAIService } from '../adaptive-ai/AdaptiveAIService.js';

export const feedbackRouter = Router();

// GET /api/feedback
feedbackRouter.get('/', (req: Request, res: Response) => {
  return res.json({ feedback: serverStore.feedbackEvents });
});

// POST /api/feedback
feedbackRouter.post('/', (req: Request, res: Response) => {
  const {
    conversationId,
    messageId,
    modelId,
    provider,
    sentiment,
    reasons = [],
    comment,
    suggestedAlternative,
    preferredVersion,
    preferenceScope = 'anonymous_shared',
  } = req.body;

  if (!messageId || !sentiment) {
    return res.status(400).json({ error: 'messageId and sentiment are required' });
  }

  const feedback: StoredFeedback = {
    id: 'fb-' + Date.now(),
    conversationId: conversationId || '',
    messageId,
    modelId: modelId || 'unknown',
    provider: provider || 'unknown',
    rating: sentiment,
    reasons,
    comment,
    suggestedAlternative,
    preferredVersion,
    preferenceScope,
    createdAt: new Date().toISOString(),
  };

  serverStore.feedbackEvents.push(feedback);

  // Sync with AdaptiveAIService for RAG learning & training dataset generation
  adaptiveAIService.recordFeedback({
    conversationId: conversationId || '',
    messageId,
    modelId: modelId || 'unknown',
    provider: provider || 'unknown',
    rating: sentiment,
    reasons,
    comment,
    originalPrompt: (req.body.originalPrompt as string) || (comment ? `Prompt for message ${messageId}` : `User request for ${messageId}`),
    originalResponse: (req.body.originalResponse as string) || '',
    chosenResponse: preferredVersion || suggestedAlternative,
    rejectedResponse: sentiment === 'negative' ? (req.body.originalResponse as string) : undefined,
    preferenceScope,
  });

  // Preference Extraction & Learning (Sections 16, 28, 33)
  // If user submitted negative reasons, extract and reinforce personal preference invariants
  if (sentiment === 'negative' && reasons.length > 0) {
    for (const r of reasons) {
      const existing = Array.from(serverStore.preferences.values()).find(
        (p) => p.title.toLowerCase().includes(r.toLowerCase())
      );
      if (existing) {
        existing.evidenceCount += 1;
        existing.confidence = 'High';
        existing.updatedAt = new Date().toISOString();
      } else {
        const newPref: StoredPreference = {
          id: 'pref-learned-' + Date.now(),
          category: r.includes('code') ? 'Code' : r.includes('visual') ? 'UI Design' : 'Tone',
          title: `Avoid: ${r}`,
          description: `User flagged response with reason "${r}". Adjust style accordingly.`,
          score: 8,
          confidence: 'Medium',
          evidenceCount: 1,
          sourceType: 'Feedback Learning',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        serverStore.preferences.set(newPref.id, newPref);
      }
    }
  }

  return res.status(201).json({
    success: true,
    feedbackId: feedback.id,
    preferencesUpdated: sentiment === 'negative' && reasons.length > 0,
  });
});
