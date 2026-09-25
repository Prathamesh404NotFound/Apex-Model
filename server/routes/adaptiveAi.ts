import { Router, Request, Response } from 'express';
import { adaptiveAIService } from '../adaptive-ai/AdaptiveAIService.js';

export const adaptiveRouter = Router();

// ==========================================
// 1. ONLINE PERSONALIZATION: PREFERENCES
// ==========================================
adaptiveRouter.get('/preferences', (req: Request, res: Response) => {
  const prefs = adaptiveAIService.preferences.getAll();
  res.json({ preferences: prefs });
});

adaptiveRouter.post('/preferences', (req: Request, res: Response) => {
  const { preference, category, polarity, scope, confidence, source } = req.body;
  if (!preference) {
    return res.status(400).json({ error: 'preference text is required' });
  }

  const created = adaptiveAIService.preferences.create({
    preference,
    category,
    polarity,
    scope,
    confidence,
    source: source || 'User Added',
  });

  res.status(201).json(created);
});

adaptiveRouter.patch('/preferences/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = adaptiveAIService.preferences.update(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Preference not found' });
  }
  res.json(updated);
});

adaptiveRouter.delete('/preferences/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = adaptiveAIService.preferences.delete(id);
  res.json({ success: deleted });
});

// ==========================================
// 2. MEMORIES & GUIDELINES
// ==========================================
adaptiveRouter.get('/memories', (req: Request, res: Response) => {
  const memories = adaptiveAIService.memories.getAll();
  res.json({ memories });
});

adaptiveRouter.post('/memories', (req: Request, res: Response) => {
  const { title, content, tags, importance, scope, projectId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const created = adaptiveAIService.memories.create({
    title,
    content,
    tags,
    importance,
    scope,
    projectId,
  });

  res.status(201).json(created);
});

adaptiveRouter.delete('/memories/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = adaptiveAIService.memories.delete(id);
  res.json({ success: deleted });
});

// Vector preview endpoint for testing RAG matching
adaptiveRouter.post('/retrieval/preview', (req: Request, res: Response) => {
  const { prompt, modelId, projectId } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const context = adaptiveAIService.buildPersonalizedContext({
    currentPrompt: prompt,
    modelId: modelId || 'gemini-3.1-pro-preview',
    projectId,
  });

  res.json(context);
});

// ==========================================
// 3. FEEDBACK INGESTION & TRAINING CANDIDATES
// ==========================================
adaptiveRouter.get('/feedback', (req: Request, res: Response) => {
  const feedback = adaptiveAIService.recordFeedback as any;
  // Read all from feedback service
  const items = (adaptiveAIService as any).feedback?.getAll?.() || [];
  res.json({ feedback: items });
});

adaptiveRouter.post('/feedback', (req: Request, res: Response) => {
  const {
    conversationId,
    messageId,
    modelId,
    provider,
    type,
    rating,
    scores,
    reasons,
    comment,
    originalPrompt,
    originalResponse,
    chosenResponse,
    rejectedResponse,
    preferenceScope,
  } = req.body;

  if (!messageId || !originalPrompt) {
    return res.status(400).json({ error: 'messageId and originalPrompt are required' });
  }

  const result = adaptiveAIService.recordFeedback({
    conversationId,
    messageId,
    modelId: modelId || 'unknown',
    provider: provider || 'unknown',
    type,
    rating,
    scores,
    reasons: reasons || [],
    comment,
    originalPrompt,
    originalResponse: originalResponse || '',
    chosenResponse,
    rejectedResponse,
    preferenceScope,
  });

  res.status(201).json(result);
});

// ==========================================
// 4. DATASET CANDIDATES & EXPORT
// ==========================================
adaptiveRouter.get('/candidates', (req: Request, res: Response) => {
  const type = req.query.type as any;
  const candidates = adaptiveAIService.datasets.getCandidates(type);
  res.json({ candidates });
});

adaptiveRouter.get('/datasets', (req: Request, res: Response) => {
  const datasets = adaptiveAIService.datasets.getDatasets();
  res.json({ datasets });
});

adaptiveRouter.post('/datasets', (req: Request, res: Response) => {
  const { name, description, type, format, candidateIds } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' });
  }

  const dataset = adaptiveAIService.datasets.createDataset({
    name,
    description: description || 'Compiled preference dataset',
    type,
    format,
    candidateIds,
  });

  res.status(201).json(dataset);
});

adaptiveRouter.get('/datasets/:id/export', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const format = req.query.format as any;
    const content = adaptiveAIService.datasets.exportDataset(id, format);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.${format || 'jsonl'}"`);
    res.send(content);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// ==========================================
// 5. OFFLINE TRAINING JOBS (LoRA / QLoRA / PEFT)
// ==========================================
adaptiveRouter.get('/training/jobs', (req: Request, res: Response) => {
  const jobs = adaptiveAIService.training.getAll();
  res.json({ jobs });
});

adaptiveRouter.post('/training/jobs', (req: Request, res: Response) => {
  const { name, baseModel, adapterType, datasetId, trainingMethod, hyperparameters } = req.body;
  if (!name || !baseModel || !datasetId) {
    return res.status(400).json({ error: 'name, baseModel, and datasetId are required' });
  }

  const job = adaptiveAIService.training.createJob({
    name,
    baseModel,
    adapterType: adapterType || 'LoRA',
    datasetId,
    trainingMethod,
    hyperparameters,
  });

  res.status(201).json(job);
});

adaptiveRouter.post('/training/jobs/:id/cancel', (req: Request, res: Response) => {
  const id = req.params.id;
  const success = adaptiveAIService.training.cancelJob(id);
  res.json({ success });
});

// ==========================================
// 6. MODEL ADAPTERS & PRODUCTION DEPLOYMENT
// ==========================================
adaptiveRouter.get('/adapters', (req: Request, res: Response) => {
  const adapters = adaptiveAIService.versions.getAll();
  res.json({ adapters });
});

adaptiveRouter.patch('/adapters/:id/deploy', (req: Request, res: Response) => {
  const id = req.params.id;
  const { isDeployed } = req.body;
  const updated = adaptiveAIService.versions.setDeployed(id, Boolean(isDeployed));
  if (!updated) {
    return res.status(404).json({ error: 'Adapter not found' });
  }
  res.json(updated);
});

// ==========================================
// 7. EVALUATION REPORTS
// ==========================================
adaptiveRouter.get('/evaluations', (req: Request, res: Response) => {
  const reports = adaptiveAIService.evaluations.getAll();
  res.json({ reports });
});

adaptiveRouter.get('/evaluations/:adapterId', (req: Request, res: Response) => {
  const report = adaptiveAIService.evaluations.getByAdapter(req.params.adapterId);
  if (!report) {
    return res.status(404).json({ error: 'Evaluation report not found' });
  }
  res.json(report);
});
