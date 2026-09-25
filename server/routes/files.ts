import { Router, Request, Response } from 'express';
import { serverStore, StoredFile } from '../data/store.js';

export const filesRouter = Router();

// GET /api/files
filesRouter.get('/', (req: Request, res: Response) => {
  return res.json({ files: Array.from(serverStore.files.values()) });
});

// POST /api/files
filesRouter.post('/', (req: Request, res: Response) => {
  const { name, content, size, extension } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'name and content are required' });
  }

  const file: StoredFile = {
    id: 'file-' + Date.now(),
    name,
    content,
    size: size || content.length,
    extension: extension || name.split('.').pop() || 'txt',
    uploadedAt: new Date().toISOString(),
    scope: 'workspace',
  };

  serverStore.files.set(file.id, file);
  return res.status(201).json(file);
});
