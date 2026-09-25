import { Router, Request, Response } from 'express';
import { serverStore, StoredPreference } from '../data/store.js';

export const preferencesRouter = Router();

// GET /api/preferences
preferencesRouter.get('/', (req: Request, res: Response) => {
  const list = Array.from(serverStore.preferences.values());
  return res.json({ preferences: list });
});

// POST /api/preferences
preferencesRouter.post('/', (req: Request, res: Response) => {
  const { title, description, category = 'Communication', score = 8 } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const pref: StoredPreference = {
    id: 'pref-' + Date.now(),
    category,
    title: title.trim(),
    description: (description || title).trim(),
    score: Number(score) || 8,
    confidence: 'High',
    evidenceCount: 1,
    sourceType: 'Direct Instruction',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  serverStore.preferences.set(pref.id, pref);
  return res.status(201).json(pref);
});

// PATCH /api/preferences/:id
preferencesRouter.patch('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const pref = serverStore.preferences.get(id);
  if (!pref) {
    return res.status(404).json({ error: 'Preference not found' });
  }

  const { title, description, score, status } = req.body;
  if (title !== undefined) pref.title = title;
  if (description !== undefined) pref.description = description;
  if (score !== undefined) pref.score = Number(score);
  if (status !== undefined) pref.status = status;
  pref.updatedAt = new Date().toISOString();

  return res.json(pref);
});

// DELETE /api/preferences/:id
preferencesRouter.delete('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  serverStore.preferences.delete(id);
  return res.json({ success: true, message: `Preference ${id} removed` });
});
