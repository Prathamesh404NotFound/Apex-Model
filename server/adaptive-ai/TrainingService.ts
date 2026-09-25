import {
  TrainingJob,
  TrainingHyperparameters,
  AdapterType,
  DatasetType,
  LossPoint,
} from './types.js';
import { datasetService } from './DatasetService.js';
import { modelVersionService } from './ModelVersionService.js';
import { evaluationService } from './EvaluationService.js';

export class TrainingService {
  private jobs: Map<string, TrainingJob> = new Map();

  constructor() {
    this.seedDefaultJob();
  }

  private seedDefaultJob() {
    const lossHistory: LossPoint[] = [
      { step: 10, epoch: 1, trainLoss: 2.34, evalLoss: 2.21, rewardScore: 0.52 },
      { step: 50, epoch: 1, trainLoss: 1.82, evalLoss: 1.74, rewardScore: 0.65 },
      { step: 100, epoch: 2, trainLoss: 1.25, evalLoss: 1.28, rewardScore: 0.76 },
      { step: 150, epoch: 2, trainLoss: 0.84, evalLoss: 0.92, rewardScore: 0.83 },
      { step: 200, epoch: 3, trainLoss: 0.52, evalLoss: 0.61, rewardScore: 0.89 },
      { step: 250, epoch: 3, trainLoss: 0.38, evalLoss: 0.44, rewardScore: 0.94 },
    ];

    const seedJob: TrainingJob = {
      id: 'job-seed-1',
      name: 'Llama-3-DPO-Adapter-Run-1',
      baseModel: 'llama-3.3-70b-instruct',
      adapterType: 'LoRA',
      datasetId: 'ds-dpo-curated-v1',
      datasetName: 'Human Preference Alignment (DPO-v1)',
      datasetSize: 420,
      trainingMethod: 'DPO',
      hyperparameters: {
        epochs: 3,
        learningRate: 5e-5,
        rank: 16,
        alpha: 32,
        batchSize: 4,
        warmupRatio: 0.1,
        optimizer: 'adamw_8bit',
      },
      status: 'completed',
      progress: 100,
      currentEpoch: 3,
      totalEpochs: 3,
      currentStep: 250,
      totalSteps: 250,
      lossHistory,
      metrics: {
        finalTrainLoss: 0.38,
        finalEvalLoss: 0.44,
        rewardScore: 0.94,
        perplexity: 1.55,
      },
      producedAdapterId: 'adapter-lora-v1',
      startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 4 + 3600000).toISOString(),
    };

    this.jobs.set(seedJob.id, seedJob);
  }

  public getAll(): TrainingJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
    );
  }

  public getById(id: string): TrainingJob | undefined {
    return this.jobs.get(id);
  }

  public createJob(params: {
    name: string;
    baseModel: string;
    adapterType: AdapterType;
    datasetId: string;
    trainingMethod?: DatasetType | 'GRPO';
    hyperparameters?: Partial<TrainingHyperparameters>;
  }): TrainingJob {
    const dataset = datasetService.getDatasetById(params.datasetId);
    const datasetName = dataset ? dataset.name : 'Curated Preference Dataset';
    const datasetSize = dataset ? dataset.itemCount : 50;

    const defaultHyper: TrainingHyperparameters = {
      epochs: 3,
      learningRate: 5e-5,
      rank: params.adapterType === 'LoRA' ? 16 : 8,
      alpha: params.adapterType === 'LoRA' ? 32 : 16,
      batchSize: 4,
      warmupRatio: 0.1,
      optimizer: 'adamw_torch_fused',
    };

    const id = `job-${Date.now().toString(36)}`;
    const job: TrainingJob = {
      id,
      name: params.name || `Training-Run-${Date.now().toString(36).slice(0, 4)}`,
      baseModel: params.baseModel,
      adapterType: params.adapterType,
      datasetId: params.datasetId,
      datasetName,
      datasetSize,
      trainingMethod: params.trainingMethod || (dataset?.type as any) || 'DPO',
      hyperparameters: { ...defaultHyper, ...params.hyperparameters },
      status: 'queued',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: params.hyperparameters?.epochs || 3,
      currentStep: 0,
      totalSteps: (params.hyperparameters?.epochs || 3) * 50,
      lossHistory: [],
      startedAt: new Date().toISOString(),
    };

    this.jobs.set(id, job);

    // Launch asynchronous step execution worker
    this.executeTrainingWorker(job);

    return job;
  }

  /**
   * Simulates/Executes training steps with realistic progression of loss, checkpoints, and adapter creation.
   */
  private executeTrainingWorker(job: TrainingJob) {
    job.status = 'preparing_dataset';
    job.progress = 5;

    setTimeout(() => {
      job.status = 'training';
      const totalSteps = job.totalSteps;
      let step = 0;
      let initialLoss = 2.45;

      const interval = setInterval(() => {
        step += 10;
        job.currentStep = Math.min(step, totalSteps);
        job.currentEpoch = Math.min(
          job.totalEpochs,
          Math.max(1, Math.ceil((step / totalSteps) * job.totalEpochs))
        );
        job.progress = Math.round((step / totalSteps) * 85) + 5;

        // Exponential decay of training loss with noise
        const decayFactor = Math.exp((-step / totalSteps) * 2.2);
        const noise = (Math.random() - 0.5) * 0.08;
        const currentLoss = Number(Math.max(0.25, initialLoss * decayFactor + noise).toFixed(3));
        const evalLoss = Number((currentLoss * 1.1 + Math.random() * 0.05).toFixed(3));
        const rewardScore = Number(Math.min(0.97, 0.45 + (1 - decayFactor) * 0.5).toFixed(3));

        job.lossHistory.push({
          step,
          epoch: job.currentEpoch,
          trainLoss: currentLoss,
          evalLoss,
          rewardScore,
        });

        if (step >= totalSteps) {
          clearInterval(interval);
          this.finalizeJob(job);
        }
      }, 700);
    }, 1500);
  }

  private finalizeJob(job: TrainingJob) {
    job.status = 'evaluating';
    job.progress = 92;

    setTimeout(() => {
      const finalLoss = job.lossHistory[job.lossHistory.length - 1]?.trainLoss || 0.36;
      const finalEvalLoss = job.lossHistory[job.lossHistory.length - 1]?.evalLoss || 0.42;

      job.metrics = {
        finalTrainLoss: finalLoss,
        finalEvalLoss,
        rewardScore: 0.94,
        perplexity: 1.48,
      };

      // Register newly created adapter
      const adapterId = `adapter-${job.id}`;
      const adapter = modelVersionService.registerAdapter({
        id: adapterId,
        name: `${job.name}-Adapter`,
        version: `v1.0.0-${job.adapterType.toLowerCase()}`,
        baseModel: job.baseModel,
        adapterType: job.adapterType,
        trainingMethod: job.trainingMethod,
        trainingJobId: job.id,
        datasetId: job.datasetId,
        datasetSize: job.datasetSize,
        rank: job.hyperparameters.rank,
        alpha: job.hyperparameters.alpha,
        status: 'testing',
        isDeployed: false,
        benchmarkMetrics: {
          winRateVsBase: Number((80 + Math.random() * 12).toFixed(1)),
          instructionFollowingScore: Number((92 + Math.random() * 6).toFixed(1)),
          formatAdherenceScore: Number((94 + Math.random() * 5).toFixed(1)),
          safetyScore: Number((98 + Math.random() * 1.5).toFixed(1)),
          humanAgreementRate: Number((89 + Math.random() * 7).toFixed(1)),
        },
        description: `Trained on ${job.datasetName} via ${job.trainingMethod} (${job.hyperparameters.epochs} epochs, lr=${job.hyperparameters.learningRate}).`,
      });

      // Run automated evaluation report
      evaluationService.runEvaluation(adapter);

      job.producedAdapterId = adapter.id;
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
    }, 2000);
  }

  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }
    job.status = 'failed';
    job.error = 'Cancelled by user';
    return true;
  }
}

export const trainingService = new TrainingService();
