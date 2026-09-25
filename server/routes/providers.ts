import { Router, Request, Response } from 'express';
import { providerRegistry } from '../providers/registry.js';
import { serverStore } from '../data/store.js';

export const providersRouter = Router();

// GET /api/providers
providersRouter.get('/', async (req: Request, res: Response) => {
  const result = [];
  for (const [id, config] of serverStore.providers.entries()) {
    const provider = providerRegistry.get(id);
    result.push({
      id,
      name: config.name,
      connected: config.connected,
      isLocal: config.isLocal,
      baseUrl: config.baseUrl,
      maskedKey: serverStore.getMaskedKey(config.apiKey),
      statusMessage: config.statusMessage || (config.connected ? 'Connected' : 'Not configured'),
      lastTestedAt: config.lastTestedAt,
      modelCount: provider ? (await provider.listModels()).length : 0,
    });
  }
  return res.json({ providers: result });
});

// POST /api/providers/:id/connect
providersRouter.post('/:id/connect', async (req: Request, res: Response) => {
  const providerId = req.params.id.toLowerCase();
  const { apiKey, baseUrl } = req.body;

  let stored = serverStore.providers.get(providerId);
  if (!stored) {
    stored = {
      id: providerId,
      name: providerId.toUpperCase(),
      connected: false,
      isLocal: providerId === 'ollama' || providerId === 'lmstudio',
    };
    serverStore.providers.set(providerId, stored);
  }

  if (apiKey !== undefined) stored.apiKey = apiKey.trim();
  if (baseUrl !== undefined) stored.baseUrl = baseUrl.trim();

  // Test connection
  const status = await providerRegistry.testProvider(providerId);
  stored.connected = status.connected;
  stored.statusMessage = status.message;
  stored.lastTestedAt = new Date().toISOString();

  return res.json({
    success: status.connected,
    providerId,
    connected: status.connected,
    message: status.message,
    maskedKey: serverStore.getMaskedKey(stored.apiKey),
  });
});

// POST /api/providers/:id/test
providersRouter.post('/:id/test', async (req: Request, res: Response) => {
  const providerId = req.params.id.toLowerCase();
  const status = await providerRegistry.testProvider(providerId);
  return res.json({
    providerId,
    ...status,
  });
});

// DELETE /api/providers/:id
providersRouter.delete('/:id', async (req: Request, res: Response) => {
  const providerId = req.params.id.toLowerCase();
  const stored = serverStore.providers.get(providerId);
  if (stored) {
    stored.apiKey = '';
    stored.connected = false;
    stored.statusMessage = 'Disconnected';
  }
  return res.json({
    success: true,
    message: `Provider ${providerId} disconnected.`,
  });
});
