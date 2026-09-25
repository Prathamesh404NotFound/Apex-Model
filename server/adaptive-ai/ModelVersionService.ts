import { ModelAdapter, BenchmarkMetrics } from './types.js';

export class ModelVersionService {
  private adapters: Map<string, ModelAdapter> = new Map();

  constructor() {
    this.seedDefaultAdapters();
  }

  private seedDefaultAdapters() {
    const seed1: ModelAdapter = {
      id: 'adapter-lora-v1',
      name: 'Apex-Llama3-DPO-Alignment',
      version: 'v1.2.0-dpo',
      baseModel: 'llama-3.3-70b-instruct',
      adapterType: 'LoRA',
      trainingMethod: 'DPO',
      trainingJobId: 'job-seed-1',
      datasetId: 'ds-dpo-curated-v1',
      datasetSize: 420,
      rank: 16,
      alpha: 32,
      status: 'active',
      isDeployed: true,
      benchmarkMetrics: {
        winRateVsBase: 84.6,
        instructionFollowingScore: 95.8,
        formatAdherenceScore: 97.2,
        safetyScore: 99.4,
        humanAgreementRate: 91.2,
      },
      description: 'LoRA adapter trained via Direct Preference Optimization on curated human feedback pairs.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      deployedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    const seed2: ModelAdapter = {
      id: 'adapter-qlora-v2',
      name: 'Apex-Mistral-Code-Concise',
      version: 'v2.0.1-sft',
      baseModel: 'mistral-large-2411',
      adapterType: 'QLoRA',
      trainingMethod: 'SFT',
      trainingJobId: 'job-seed-2',
      datasetId: 'ds-sft-curated-v1',
      datasetSize: 310,
      rank: 8,
      alpha: 16,
      status: 'testing',
      isDeployed: false,
      benchmarkMetrics: {
        winRateVsBase: 79.2,
        instructionFollowingScore: 93.4,
        formatAdherenceScore: 95.0,
        safetyScore: 98.7,
        humanAgreementRate: 88.5,
      },
      description: 'QLoRA 4-bit adapter specialized for concise TypeScript generation and structured formatting.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    };

    this.adapters.set(seed1.id, seed1);
    this.adapters.set(seed2.id, seed2);
  }

  public getAll(): ModelAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getById(id: string): ModelAdapter | undefined {
    return this.adapters.get(id);
  }

  public getDeployed(): ModelAdapter[] {
    return this.getAll().filter((a) => a.isDeployed);
  }

  public getDeployedForBaseModel(baseModelId: string): ModelAdapter | undefined {
    return this.getAll().find(
      (a) => a.isDeployed && (a.baseModel === baseModelId || baseModelId.includes(a.baseModel))
    );
  }

  public registerAdapter(data: Omit<ModelAdapter, 'createdAt'>): ModelAdapter {
    const adapter: ModelAdapter = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.adapters.set(adapter.id, adapter);
    return adapter;
  }

  public setDeployed(adapterId: string, isDeployed: boolean): ModelAdapter | undefined {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) return undefined;

    // If activating, deactivate other adapters for the same base model to prevent collision
    if (isDeployed) {
      for (const [id, item] of this.adapters.entries()) {
        if (item.baseModel === adapter.baseModel && id !== adapterId) {
          item.isDeployed = false;
        }
      }
      adapter.deployedAt = new Date().toISOString();
      adapter.status = 'active';
    } else {
      adapter.status = 'testing';
    }

    adapter.isDeployed = isDeployed;
    return adapter;
  }

  public deleteAdapter(id: string): boolean {
    return this.adapters.delete(id);
  }
}

export const modelVersionService = new ModelVersionService();
