import { Router, Request, Response } from 'express';
import { serverStore } from '../data/store.js';

export const usageRouter = Router();

// GET /api/usage
usageRouter.get('/', (req: Request, res: Response) => {
  const records = serverStore.usageRecords;
  const totalTokens = records.reduce((sum, r) => sum + r.tokens, 0);
  const totalRequests = records.length;

  const byModel: Record<string, { requests: number; tokens: number }> = {};
  for (const r of records) {
    if (!byModel[r.modelId]) {
      byModel[r.modelId] = { requests: 0, tokens: 0 };
    }
    byModel[r.modelId].requests += 1;
    byModel[r.modelId].tokens += r.tokens;
  }

  return res.json({
    totalRequests,
    totalTokens,
    estimatedCostUsd: Number((totalTokens * 0.000002).toFixed(4)),
    byModel,
    recentEvents: records.slice(-20),
  });
});
