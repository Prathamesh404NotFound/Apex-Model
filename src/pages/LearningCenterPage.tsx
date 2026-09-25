import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  GraduationCap,
  Play,
  RotateCw,
  Cpu,
  Sliders,
  Check,
  Zap,
  TrendingDown,
  BarChart3,
  Award,
  FileCode,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface DatasetCandidate {
  id: string;
  type: 'DPO' | 'SFT' | 'KTO' | 'Reward';
  prompt: string;
  chosen?: string;
  rejected?: string;
  output?: string;
  label?: 'desirable' | 'undesirable';
  margin?: number;
  category: string;
  sourceModel: string;
  qualityScore: number;
  createdAt: string;
}

interface TrainingDataset {
  id: string;
  name: string;
  description: string;
  type: 'DPO' | 'SFT' | 'KTO' | 'Reward';
  itemCount: number;
  format: 'jsonl' | 'alpaca' | 'openai' | 'huggingface';
  createdAt: string;
}

interface TrainingJob {
  id: string;
  name: string;
  baseModel: string;
  adapterType: 'LoRA' | 'QLoRA' | 'Prefix Tuning' | 'Full';
  datasetId: string;
  datasetName: string;
  datasetSize: number;
  trainingMethod: string;
  hyperparameters: {
    epochs: number;
    learningRate: number;
    rank: number;
    alpha: number;
    batchSize: number;
    warmupRatio: number;
    optimizer: string;
  };
  status: 'queued' | 'preparing_dataset' | 'training' | 'evaluating' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  lossHistory: { step: number; epoch: number; trainLoss: number; evalLoss?: number; rewardScore?: number }[];
  metrics?: {
    finalTrainLoss: number;
    finalEvalLoss: number;
    rewardScore: number;
    perplexity: number;
  };
  producedAdapterId?: string;
  startedAt?: string;
  completedAt?: string;
}

interface ModelAdapter {
  id: string;
  name: string;
  version: string;
  baseModel: string;
  adapterType: 'LoRA' | 'QLoRA' | 'Prefix Tuning';
  trainingMethod: string;
  datasetSize: number;
  rank: number;
  alpha: number;
  status: 'active' | 'testing' | 'archived';
  isDeployed: boolean;
  benchmarkMetrics: {
    winRateVsBase: number;
    instructionFollowingScore: number;
    formatAdherenceScore: number;
    safetyScore: number;
    humanAgreementRate: number;
  };
  description: string;
  createdAt: string;
  deployedAt?: string;
}

interface EvaluationReport {
  id: string;
  adapterId: string;
  adapterName: string;
  baseModel: string;
  testCaseCount: number;
  winRate: number;
  breakdown: { category: string; adapterScore: number; baseScore: number; delta: number }[];
  sampleEvaluations: { prompt: string; baseOutput: string; adapterOutput: string; preferred: 'adapter' | 'base'; reason: string }[];
  createdAt: string;
}

export const LearningCenterPage: React.FC = () => {
  const { addNotification } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'datasets' | 'training' | 'adapters' | 'evaluations'>('pipeline');
  
  // State from server
  const [candidates, setCandidates] = useState<DatasetCandidate[]>([]);
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [adapters, setAdapters] = useState<ModelAdapter[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationReport[]>([]);
  const [candidateFilter, setCandidateFilter] = useState<string>('All');

  // Form states for training run
  const [jobName, setJobName] = useState('Llama3-Apex-Alignment-Run-2');
  const [baseModel, setBaseModel] = useState('llama-3.3-70b-instruct');
  const [adapterType, setAdapterType] = useState<'LoRA' | 'QLoRA' | 'Prefix Tuning'>('LoRA');
  const [selectedDatasetId, setSelectedDatasetId] = useState('ds-dpo-curated-v1');
  const [epochs, setEpochs] = useState(3);
  const [learningRate, setLearningRate] = useState('5e-5');
  const [loraRank, setLoraRank] = useState(16);
  const [loraAlpha, setLoraAlpha] = useState(32);
  const [batchSize, setBatchSize] = useState(4);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Load all server adaptive AI data
  const fetchData = async () => {
    try {
      const [candRes, dsRes, jobsRes, adapRes, evalRes] = await Promise.all([
        fetch('/api/adaptive/candidates').then((r) => r.json()),
        fetch('/api/adaptive/datasets').then((r) => r.json()),
        fetch('/api/adaptive/training/jobs').then((r) => r.json()),
        fetch('/api/adaptive/adapters').then((r) => r.json()),
        fetch('/api/adaptive/evaluations').then((r) => r.json()),
      ]);

      if (candRes.candidates) setCandidates(candRes.candidates);
      if (dsRes.datasets) setDatasets(dsRes.datasets);
      if (jobsRes.jobs) setTrainingJobs(jobsRes.jobs);
      if (adapRes.adapters) setAdapters(adapRes.adapters);
      if (evalRes.reports) setEvaluations(evalRes.reports);
    } catch (err) {
      console.error('Failed to load adaptive AI data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll training jobs if any are running
    const interval = setInterval(() => {
      fetch('/api/adaptive/training/jobs')
        .then((r) => r.json())
        .then((data) => {
          if (data.jobs) setTrainingJobs(data.jobs);
        })
        .catch(console.error);

      fetch('/api/adaptive/adapters')
        .then((r) => r.json())
        .then((data) => {
          if (data.adapters) setAdapters(data.adapters);
        })
        .catch(console.error);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingJob) return;
    setIsSubmittingJob(true);

    try {
      const res = await fetch('/api/adaptive/training/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: jobName,
          baseModel,
          adapterType,
          datasetId: selectedDatasetId,
          hyperparameters: {
            epochs: Number(epochs),
            learningRate: Number(learningRate),
            rank: Number(loraRank),
            alpha: Number(loraAlpha),
            batchSize: Number(batchSize),
            warmupRatio: 0.1,
            optimizer: 'adamw_torch_fused',
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to start training job');
      const newJob = await res.json();
      setTrainingJobs((prev) => [newJob, ...prev]);
      addNotification(`Training job "${jobName}" launched successfully!`, 'success');
      setActiveTab('training');
    } catch (err: any) {
      addNotification(err.message || 'Error launching job', 'warn');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleToggleDeploy = async (adapterId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/adaptive/adapters/${adapterId}/deploy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeployed: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update deployment');
      const updated = await res.json();
      setAdapters((prev) => prev.map((a) => (a.id === adapterId ? updated : (updated.isDeployed && a.baseModel === updated.baseModel ? { ...a, isDeployed: false } : a))));
      addNotification(
        !currentStatus
          ? `Adapter ${updated.name} deployed to production!`
          : `Adapter ${updated.name} deactivated`,
        'success'
      );
    } catch (err: any) {
      addNotification(err.message, 'warn');
    }
  };

  const handleExport = (datasetId: string, format: string) => {
    window.open(`/api/adaptive/datasets/${datasetId}/export?format=${format}`, '_blank');
    addNotification(`Exporting dataset in ${format.toUpperCase()} format`, 'info');
  };

  const filteredCandidates = candidates.filter(
    (c) => candidateFilter === 'All' || c.type === candidateFilter
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Adaptive AI & Model Improvement
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Two-System Architecture
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Real human-preference learning: Immediate Online Personalization via RAG & Memory, and Periodic Offline Improvement via SFT, DPO, and LoRA adapters.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs font-medium self-start md:self-auto border border-gray-200">
          {[
            { id: 'pipeline', label: 'Architecture' },
            { id: 'datasets', label: `Datasets (${datasets.length})` },
            { id: 'training', label: `Training Jobs (${trainingJobs.length})` },
            { id: 'adapters', label: `Adapters (${adapters.length})` },
            { id: 'evaluations', label: 'Benchmarks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB: PIPELINE / ARCHITECTURE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Two-System Distinction Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">System A: Online Personalization</h3>
                  <span className="text-[11px] text-blue-600 font-medium">Immediate • Zero Retraining</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Applies instantly to every prompt. Dynamically injects learned user taste, project guidelines, and relevant memories into the context window using vector cosine search.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">Vector Embeddings</span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">Preference Scopes</span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">Prompt Steering</span>
              </div>
            </div>

            <div className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">System B: Offline Model Improvement</h3>
                  <span className="text-[11px] text-emerald-600 font-medium">Periodic • LoRA / QLoRA Adapters</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Aggregates thumbs up/down, direct edits, and pairwise preferences into curated datasets. Trains lightweight PEFT/LoRA model weights periodically, verified with automated benchmarks before deployment.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">DPO / SFT / KTO</span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">Loss Tracking</span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">Version Registry</span>
              </div>
            </div>
          </div>

          {/* Workflow Diagram */}
          <div className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">End-to-End Human Preference Pipeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2 text-center">
              {[
                { step: '1', title: 'User Input', sub: 'Real Model' },
                { step: '2', title: 'Feedback / Edit', sub: 'Direct signal' },
                { step: '3', title: 'Extraction', sub: 'Preference Memory' },
                { step: '4', title: 'Datasets', sub: 'DPO / SFT Pairs' },
                { step: '5', title: 'PEFT Training', sub: 'LoRA / QLoRA' },
                { step: '6', title: 'Loss Curve', sub: 'Checkpointing' },
                { step: '7', title: 'Evaluation', sub: 'Win-rate vs Base' },
                { step: '8', title: 'Deployment', sub: 'Active Variant' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Step {item.step}</span>
                  <div className="text-xs font-semibold text-gray-900 line-clamp-1">{item.title}</div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: DATASETS & CANDIDATES */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          {/* Datasets list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Curated Training Datasets ({datasets.length})</h2>
              <span className="text-xs text-gray-500">Ready for LoRA / DPO fine-tuning</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {datasets.map((ds) => (
                <div key={ds.id} className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900">{ds.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {ds.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{ds.description}</p>
                    <div className="text-[11px] text-gray-400">
                      Total samples: <strong className="text-gray-700">{ds.itemCount} pairs</strong> • Created {new Date(ds.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Export Formats */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500">Export:</span>
                    <div className="flex gap-1.5">
                      {['huggingface', 'jsonl', 'openai', 'alpaca'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => handleExport(ds.id, fmt)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-700 cursor-pointer transition-colors"
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Candidates Table */}
          <div className="space-y-3 pt-4 border-t border-[#E7E9EE]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Human Feedback Candidates ({filteredCandidates.length})
                </h3>
                <p className="text-xs text-gray-500">Paired feedback samples extracted from your interactions</p>
              </div>
              <div className="flex gap-1.5">
                {['All', 'DPO', 'SFT', 'KTO'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCandidateFilter(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      candidateFilter === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredCandidates.map((c) => (
                <div key={c.id} className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                        {c.type} Candidate
                      </span>
                      <span className="text-gray-400">Category: {c.category}</span>
                      {c.margin !== undefined && (
                        <span className="text-emerald-700 text-[11px] font-medium">Reward Margin: +{c.margin}</span>
                      )}
                    </div>
                    <span className="text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500">Prompt:</span>
                    <p className="text-xs text-gray-900 font-medium">{c.prompt}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1">
                      <span className="font-semibold text-emerald-800">Chosen / Preferred Output:</span>
                      <p className="text-gray-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">{c.chosen || c.output}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs space-y-1">
                      <span className="font-semibold text-red-800">Rejected Output:</span>
                      <p className="text-gray-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">{c.rejected || 'None / Direct Edit'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: TRAINING STUDIO */}
      {activeTab === 'training' && (
        <div className="space-y-8">
          {/* Start New Training Run */}
          <form onSubmit={handleStartTraining} className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Launch Offline Model Adapter Training</h3>
                <p className="text-xs text-gray-500">Fine-tune LoRA / QLoRA adapters on curated human preference datasets</p>
              </div>
              <button
                type="submit"
                disabled={isSubmittingJob}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSubmittingJob ? 'Queuing Job...' : 'Start Training Run'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Job Name</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Base Model</label>
                <select
                  value={baseModel}
                  onChange={(e) => setBaseModel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
                  <option value="mistral-large-2411">Mistral Large 2411</option>
                  <option value="qwen-2.5-72b-instruct">Qwen 2.5 72B Instruct</option>
                  <option value="deepseek-v3">DeepSeek V3</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Adapter Architecture</label>
                <select
                  value={adapterType}
                  onChange={(e) => setAdapterType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="LoRA">LoRA (Low-Rank Adaptation)</option>
                  <option value="QLoRA">QLoRA (4-bit Quantized Base)</option>
                  <option value="Prefix Tuning">Prefix Tuning</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Training Dataset</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.itemCount} items)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Epochs</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Learning Rate</label>
                <input
                  type="text"
                  value={learningRate}
                  onChange={(e) => setLearningRate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">LoRA Rank (r)</label>
                <input
                  type="number"
                  value={loraRank}
                  onChange={(e) => setLoraRank(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">LoRA Alpha (α)</label>
                <input
                  type="number"
                  value={loraAlpha}
                  onChange={(e) => setLoraAlpha(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </form>

          {/* Running & Past Jobs List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Training Runs History</h3>
            <div className="space-y-4">
              {trainingJobs.map((job) => (
                <div key={job.id} className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{job.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          job.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'training'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Base: {job.baseModel} • {job.adapterType} (r={job.hyperparameters.rank}, α={job.hyperparameters.alpha}) • Dataset: {job.datasetName}
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      Step {job.currentStep} / {job.totalSteps} (Epoch {job.currentEpoch}/{job.totalEpochs})
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        job.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>

                  {/* Metrics & Loss Points */}
                  {job.lossHistory.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs gap-4">
                      <div className="flex items-center gap-4 text-gray-600">
                        <span>Latest Train Loss: <strong className="text-gray-900">{job.lossHistory[job.lossHistory.length - 1].trainLoss}</strong></span>
                        {job.lossHistory[job.lossHistory.length - 1].evalLoss && (
                          <span>Eval Loss: <strong className="text-gray-900">{job.lossHistory[job.lossHistory.length - 1].evalLoss}</strong></span>
                        )}
                        {job.lossHistory[job.lossHistory.length - 1].rewardScore && (
                          <span>Reward Alignment: <strong className="text-emerald-700">{(job.lossHistory[job.lossHistory.length - 1].rewardScore! * 100).toFixed(1)}%</strong></span>
                        )}
                      </div>

                      {job.producedAdapterId && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Produced Adapter: {job.producedAdapterId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: ADAPTER REGISTRY & DEPLOYMENT */}
      {activeTab === 'adapters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Registered Model Adapters ({adapters.length})</h2>
              <p className="text-xs text-gray-500">Deploy adapters to production so they immediately augment user chat queries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {adapters.map((adapter) => (
              <div key={adapter.id} className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{adapter.name}</h3>
                      <span className="text-[11px] text-gray-400 font-mono">{adapter.version}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      adapter.isDeployed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {adapter.isDeployed ? 'DEPLOYED / ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{adapter.description}</p>

                  <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Base Model:</span>
                      <strong className="text-gray-900">{adapter.baseModel}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Architecture:</span>
                      <span className="text-gray-900">{adapter.adapterType} (r={adapter.rank}, α={adapter.alpha})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate vs Base:</span>
                      <strong className="text-emerald-700">{adapter.benchmarkMetrics.winRateVsBase}%</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {adapter.isDeployed ? 'Active on production router' : 'Ready for deployment'}
                  </span>
                  <button
                    onClick={() => handleToggleDeploy(adapter.id, adapter.isDeployed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      adapter.isDeployed
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {adapter.isDeployed ? 'Deactivate' : 'Deploy to Production'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB: BENCHMARKS & EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Adapter Evaluation Reports</h2>
              <p className="text-xs text-gray-500">Standardized benchmark comparisons between trained adapters and raw base models</p>
            </div>
          </div>

          <div className="space-y-6">
            {evaluations.map((evalReport) => (
              <div key={evalReport.id} className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{evalReport.adapterName}</h3>
                    <p className="text-xs text-gray-500">Evaluated against {evalReport.baseModel} across {evalReport.testCaseCount} paired test cases</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Overall Win Rate</span>
                    <strong className="text-xl font-bold text-emerald-600">{evalReport.winRate}%</strong>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Category Score Breakdown</h4>
                  <div className="space-y-2">
                    {evalReport.breakdown.map((b, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-800">{b.category}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">Base: {b.baseScore}%</span>
                          <span className="text-gray-900 font-semibold">Adapter: {b.adapterScore}%</span>
                          <span className={`font-bold ${b.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {b.delta >= 0 ? `+${b.delta}%` : `${b.delta}%`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Head-to-Head Comparison */}
                {evalReport.sampleEvaluations.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Head-to-Head Sample Evaluation</h4>
                    {evalReport.sampleEvaluations.map((sample, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white space-y-3 text-xs">
                        <div>
                          <span className="font-semibold text-gray-500">Prompt:</span>
                          <p className="text-gray-900 font-medium mt-0.5">{sample.prompt}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                            <span className="font-semibold text-gray-500">Base Model Output:</span>
                            <p className="text-gray-700 leading-relaxed line-clamp-3">{sample.baseOutput}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
                            <span className="font-semibold text-emerald-800">Trained Adapter Output (Winner):</span>
                            <p className="text-gray-900 leading-relaxed line-clamp-3">{sample.adapterOutput}</p>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-500 italic">
                          Reason: {sample.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
