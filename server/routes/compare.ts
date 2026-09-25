import { Router, Request, Response } from 'express';
import { providerRegistry } from '../providers/registry.js';
import { serverStore } from '../data/store.js';

export const compareRouter = Router();

// POST /api/compare
compareRouter.post('/', async (req: Request, res: Response) => {
  const { prompt, modelIds = [] } = req.body;

  if (!prompt || !Array.isArray(modelIds) || modelIds.length === 0) {
    return res.status(400).json({ error: 'prompt and modelIds array are required' });
  }

  const results = await Promise.allSettled(
    modelIds.map(async (mId: string) => {
      const provider = providerRegistry.findProviderForModel(mId);
      const startTime = Date.now();
      try {
        const response = await provider.chat({
          modelId: mId,
          messages: [{ role: 'user', content: prompt }],
        });
        return {
          modelId: mId,
          modelName: mId,
          provider: provider.name,
          response: response.text,
          latencyMs: response.latencyMs || (Date.now() - startTime),
          usage: response.usage,
          success: true,
        };
      } catch (err: any) {
        return {
          modelId: mId,
          modelName: mId,
          provider: provider.name,
          response: `Error from ${provider.name}: ${err.message}`,
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        };
      }
    })
  );

  const candidates = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      modelId: modelIds[i],
      modelName: modelIds[i],
      provider: 'Unknown',
      response: `Failed to execute: ${r.reason}`,
      latencyMs: 0,
      success: false,
      error: String(r.reason),
    };
  });

  return res.json({
    prompt,
    candidates,
    timestamp: new Date().toISOString(),
  });
});
