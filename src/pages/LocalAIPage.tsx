import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Download,
  Layers, 
  Laptop,
  Check
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { calculateCompatibility } from '../services/hardwareCalculator';
import { HardwareSpec, ModelDefinition } from '../types/models';

export const LocalAIPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    localRuntime, 
    refreshLocalRuntime, 
    models, 
    hardwareProfile, 
    setHardwareProfile,
    setQuantizationModalOpen,
    setActiveModelId,
    createNewChat,
    addNotification 
  } = useWorkspace();

  const [hwSpec, setHwSpec] = useState<HardwareSpec>(hardwareProfile);
  const [isCheckingPC, setIsCheckingPC] = useState(false);
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [localCatalog, setLocalCatalog] = useState<ModelDefinition[]>([]);

  // Load real local models from backend
  const fetchLocalModels = async () => {
    try {
      const res = await fetch('/api/local/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setLocalCatalog(data.models);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLocalModels();
  }, []);

  const displayedModels = localCatalog.length > 0 
    ? localCatalog 
    : models.filter((m) => m.local);

  const handleCheckPC = async () => {
    setIsCheckingPC(true);
    await refreshLocalRuntime();
    await fetchLocalModels();
    setIsCheckingPC(false);
  };

  const handleLaunchModel = (modelId: string) => {
    setActiveModelId(modelId);
    const id = createNewChat();
    navigate(`/chat/${id}`);
  };

  const handleDownloadModel = async (model: ModelDefinition) => {
    const modelTag = model.id;
    setDownloadingModelId(model.id);
    setDownloadProgress('Connecting to local Ollama runtime...');

    try {
      const res = await fetch('/api/local/models/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName: modelTag }),
      });

      if (!res.ok) {
        throw new Error(`Download failed: HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('No progress stream returned');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.status) {
                setDownloadProgress(data.status);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }

      addNotification(`Model ${model.displayName} download process completed`, 'success');
      await fetchLocalModels();
    } catch (err: any) {
      addNotification(`Download error: ${err.message}. Ensure Ollama is running ('ollama serve')`, 'warn');
    } finally {
      setDownloadingModelId(null);
      setDownloadProgress('');
    }
  };

  const handleUpdateRam = (ram: number, vram: number) => {
    const updated: HardwareSpec = { ...hwSpec, ramGb: ram, vramGb: vram };
    setHwSpec(updated);
    setHardwareProfile(updated);
    addNotification(`Updated specs: ${ram}GB RAM, ${vram}GB VRAM`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              100% Private & Free
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Local AI & Offline Models
          </h1>
          <p className="text-sm text-gray-500">
            Run AI models directly on your computer. Private, free, and works offline with zero internet needed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantizationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E9EE] bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>How Model Sizing Works</span>
          </button>

          <button
            onClick={handleCheckPC}
            disabled={isCheckingPC}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPC ? 'animate-spin' : ''}`} />
            <span>{isCheckingPC ? 'Checking Runtime...' : 'Check My PC'}</span>
          </button>
        </div>
      </div>

      {/* 2. PC Hardware Status Banner */}
      <div className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Your Computer Profile</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready for Local AI
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Profile: {hwSpec.ramGb} GB RAM · {hwSpec.vramGb} GB VRAM · {hwSpec.gpu}
            </p>
          </div>
        </div>

        {/* Quick Spec Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Test PC specs:</span>
          <button
            onClick={() => handleUpdateRam(8, 2)}
            className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
              hwSpec.ramGb === 8 ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            8GB (Laptop)
          </button>
          <button
            onClick={() => handleUpdateRam(16, 8)}
            className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
              hwSpec.ramGb === 16 ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            16GB (Desktop)
          </button>
          <button
            onClick={() => handleUpdateRam(32, 16)}
            className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
              hwSpec.ramGb === 32 ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            32GB (Workstation)
          </button>
        </div>
      </div>

      {/* 3. Local Models Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Supported Offline Models</h2>
          <p className="text-xs text-gray-500">
            Real open-weight models supported by Ollama and LM Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedModels.map((model) => {
            const comp = calculateCompatibility(model, hwSpec);
            const canRun = comp.tier === 'Good' || comp.ramVerdict.passed;
            const isDownloading = downloadingModelId === model.id;
            const isDownloaded = model.status === 'Downloaded';

            return (
              <div
                key={model.id}
                className="bg-white border border-[#E7E9EE] hover:border-gray-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{model.displayName}</h3>
                      <p className="text-[11px] text-gray-500">{model.parameterCount || 'Open-Weight'} parameters</p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                      <HardDrive className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="pt-1">
                    {canRun ? (
                      <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Your computer can run this model</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Needs more memory (requires {model.recommendedRam || 16}GB)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom stats and Actions */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Size: {model.estimatedStorage || '4.5 GB'}</span>
                    <span>Format: {model.quantizations?.[0] || 'Q4_K_M'}</span>
                  </div>

                  {isDownloading ? (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center text-xs text-blue-700 space-y-1">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Downloading model...</span>
                      </div>
                      <div className="text-[10px] text-blue-600 truncate">{downloadProgress}</div>
                    </div>
                  ) : isDownloaded ? (
                    <button
                      onClick={() => handleLaunchModel(model.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Chat with Model</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadModel(model)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleLaunchModel(model.id)}
                        className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium cursor-pointer"
                        title="Direct chat"
                      >
                        Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Runtime Connector Details */}
      <div className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Local Runtime Status</h3>
              <p className="text-xs text-gray-500">Checking Ollama on http://localhost:11434 and LM Studio on http://localhost:1234/v1</p>
            </div>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            localRuntime.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {localRuntime.status === 'connected' ? 'Ollama Connected' : 'Ready to Connect'}
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Apex connects directly to your local computer's Ollama or LM Studio service. When you select an offline model, prompts are processed entirely on your GPU/CPU with zero internet required.
        </p>
      </div>
    </div>
  );
};
