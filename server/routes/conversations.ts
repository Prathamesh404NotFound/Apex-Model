import { Router, Request, Response } from 'express';
import { serverStore, StoredConversation } from '../data/store.js';

export const conversationsRouter = Router();

// GET /api/conversations
conversationsRouter.get('/', (req: Request, res: Response) => {
  const list = Array.from(serverStore.conversations.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return res.json({ conversations: list });
});

// GET /api/conversations/:id
conversationsRouter.get('/:id', (req: Request, res: Response) => {
  const conv = serverStore.conversations.get(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  return res.json(conv);
});

// POST /api/conversations
conversationsRouter.post('/', (req: Request, res: Response) => {
  const { id, title = 'New Conversation', modelId = 'gemini-3.1-pro-preview', projectId } = req.body;
  const newId = id || 'chat-' + Date.now();

  const conv: StoredConversation = {
    id: newId,
    title,
    projectId,
    modelId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };

  serverStore.conversations.set(newId, conv);
  return res.status(201).json(conv);
});

// DELETE /api/conversations/:id
conversationsRouter.delete('/:id', (req: Request, res: Response) => {
  serverStore.conversations.delete(req.params.id);
  return res.json({ success: true });
});
