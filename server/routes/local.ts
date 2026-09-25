import { Router, Request, Response } from 'express';
import { providerRegistry } from '../providers/registry.js';
import { OllamaProvider } from '../providers/ollama.js';

export const localRouter = Router();

// GET /api/local/runtimes
localRouter.get('/runtimes', async (req: Request, res: Response) => {
  const ollama = providerRegistry.get('ollama');
  const lmstudio = providerRegistry.get('lmstudio');

  const ollamaStatus = ollama ? await ollama.getStatus() : { connected: false, message: 'Not found', activeModelCount: 0 };
  const lmStudioStatus = lmstudio ? await lmstudio.getStatus() : { connected: false, message: 'Not found', activeModelCount: 0 };

  return res.json({
    runtimes: [
      {
        id: 'ollama',
        name: 'Ollama',
        endpoint: 'http://localhost:11434',
        status: ollamaStatus.connected ? 'connected' : 'disconnected',
        message: ollamaStatus.message,
        modelsCount: ollamaStatus.activeModelCount,
      },
      {
        id: 'lmstudio',
        name: 'LM Studio',
        endpoint: 'http://localhost:1234/v1',
        status: lmStudioStatus.connected ? 'connected' : 'disconnected',
        message: lmStudioStatus.message,
        modelsCount: lmStudioStatus.activeModelCount,
      },
    ],
  });
});

// POST /api/local/runtimes/test
localRouter.post('/runtimes/test', async (req: Request, res: Response) => {
  const { runtimeId } = req.body;
  const provider = providerRegistry.get(runtimeId || 'ollama');
  if (!provider) {
    return res.status(404).json({ error: `Runtime ${runtimeId} not found` });
  }
  const status = await provider.getStatus();
  return res.json(status);
});

// GET /api/local/models
localRouter.get('/models', async (req: Request, res: Response) => {
  const ollama = providerRegistry.get('ollama');
  if (!ollama) return res.json({ models: [] });
  const models = await ollama.listModels();
  return res.json({ models });
});

// POST /api/local/models/download
localRouter.post('/models/download', async (req: Request, res: Response) => {
  const { modelName } = req.body;
  if (!modelName) {
    return res.status(400).json({ error: 'modelName is required' });
  }

  const ollama = providerRegistry.get('ollama') as OllamaProvider;
  if (!ollama) {
    return res.status(500).json({ error: 'Ollama provider not initialized' });
  }

  // Setup streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await ollama.pullModel(modelName);
    if (!stream) {
      res.write(`data: ${JSON.stringify({ status: 'completed' })}\n\n`);
      res.end();
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      res.write(`data: ${text}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ status: 'success', message: `Model ${modelName} downloaded successfully.` })}\n\n`);
    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ status: 'error', error: error.message })}\n\n`);
    res.end();
  }
});
