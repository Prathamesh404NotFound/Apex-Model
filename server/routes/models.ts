import { Router, Request, Response } from 'express';
import { providerRegistry } from '../providers/registry.js';

export const modelsRouter = Router();

// GET /api/models
modelsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const refresh = req.query.refresh === 'true';
    const models = await providerRegistry.getAllModels(refresh);
    return res.json({
      models,
      totalCount: models.length,
      lastVerifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/models/:id
modelsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const modelId = decodeURIComponent(req.params.id);
    const models = await providerRegistry.getAllModels(false);
    const found = models.find((m) => m.id === modelId || m.providerModelId === modelId);
    if (!found) {
      return res.status(404).json({ error: `Model "${modelId}" not found in registry.` });
    }
    return res.json(found);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/models/refresh
modelsRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const models = await providerRegistry.getAllModels(true);
    return res.json({
      success: true,
      models,
      count: models.length,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/models/provider/:provider
modelsRouter.get('/provider/:provider', async (req: Request, res: Response) => {
  try {
    const providerId = req.params.provider.toLowerCase();
    const provider = providerRegistry.get(providerId);
    if (!provider) {
      return res.status(404).json({ error: `Provider "${providerId}" not found.` });
    }
    const models = await provider.listModels();
    return res.json({
      provider: provider.name,
      models,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
