import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Code, 
  Layers
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { routePrompt, RouteDecision } from '../services/modelRouterService';

export const RouterPage: React.FC = () => {
  const { isOffline, preferences, setActiveModelId, createNewChat } = useWorkspace();
  const [testPrompt, setTestPrompt] = useState('Refactor the state management pipeline into strict TypeScript discriminated unions without any placeholders.');
  const [routerMode, setRouterMode] = useState<'auto' | 'privacy-first' | 'local-first' | 'deep-reasoning' | 'fastest'>('auto');
  const [decision, setDecision] = useState<RouteDecision | null>(() => {
    return routePrompt({
      prompt: 'Refactor the state management pipeline into strict TypeScript discriminated unions without any placeholders.',
      offlineMode: false,
    });
  });

  const handleRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;

    const result = routePrompt({
      prompt: testPrompt,
      privacyRequired: routerMode === 'privacy-first',
      localOnly: routerMode === 'local-first' || isOffline,
      needsReasoning: routerMode === 'deep-reasoning',
      offlineMode: isOffline,
      userPreferences: preferences,
    });
    setDecision(result);
  };

  const handleSelectRoutedModel = (modelId: string) => {
    setActiveModelId(modelId);
    createNewChat();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#232730] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#3b82f6] uppercase tracking-wider mb-1">
            <span>Intelligent Dispatch Matrix</span>
            <span aria-hidden="true">·</span>
            <span>Task-to-Model Synthesizer</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white font-mono">
            Model Router & Pipeline
          </h1>
          <p className="text-xs text-[#8c96a8] mt-1 max-w-2xl leading-relaxed">
            Dynamic execution routing that evaluates task complexity, privacy constraints, hardware capacity, and learned taste preferences before dispatching tokens.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8c96a8]">
          <span>Routing Engine:</span>
          <span className="text-white font-semibold">Active & Calibrated</span>
        </div>
      </div>

      {/* Visual Pipeline Stages */}
      <div className="p-6 border border-[#232730] bg-[#12141a] space-y-4">
        <h2 className="text-xs font-mono font-semibold tracking-wider text-white uppercase">
          Dynamic Dispatch Pipeline Architecture
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
          {[
            'User Prompt',
            'Task Classifier',
            'Capability Match',
            'Taste Constraints',
            'Hardware Filter',
            'Model Selection',
            'Token Dispatch',
            'Feedback Learning'
          ].map((stage, idx) => (
            <div
              key={stage}
              className="p-3 border border-[#20242e] bg-[#0c0d10] flex flex-col justify-between text-center space-y-1"
            >
              <span className="text-[10px] text-[#525a6b]">0{idx + 1}</span>
              <span className="text-white font-medium text-[11px] truncate">{stage}</span>
              <span className="text-[#10b981] text-[10px]">Pass</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Router Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <form onSubmit={handleRoute} className="lg:col-span-6 p-5 border border-[#232730] bg-[#12141a] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232730]">
            <span className="font-mono text-xs font-semibold text-white uppercase">Simulate Dispatch</span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="text-[#8c96a8]">Strategy:</span>
              <select
                value={routerMode}
                onChange={(e) => setRouterMode(e.target.value as any)}
                className="bg-[#181b24] border border-[#272b38] px-2 py-0.5 text-white focus:outline-hidden"
              >
                <option value="auto">Auto (Balanced)</option>
                <option value="privacy-first">Privacy-First (On-Device)</option>
                <option value="local-first">Local-First</option>
                <option value="deep-reasoning">Deep Reasoning (High Thinking)</option>
                <option value="fastest">Lowest Latency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8c96a8] mb-1.5">Prompt Payload</label>
            <textarea
              rows={4}
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a task to trace how the router classifies requirements..."
              className="w-full bg-[#0c0d10] border border-[#232730] p-3 text-xs sm:text-sm text-white placeholder-[#525a6b] font-sans focus:border-[#3b82f6] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-[#8c96a8]">
              {isOffline ? 'Offline mode active: Local routing prioritized' : 'Cloud and Local runtimes available'}
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              Trace Route
            </button>
          </div>
        </form>

        {/* Right: Decision Output */}
        <div className="lg:col-span-6 p-5 border border-[#232730] bg-[#12141a] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232730]">
            <span className="font-mono text-xs font-semibold text-white uppercase">Router Decision</span>
            <span className="text-[11px] font-mono text-[#10b981]">Deterministic Evaluation</span>
          </div>

          {decision ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 border border-[#2563eb] bg-[#0d121c] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                    <span className="text-white font-semibold text-sm">
                      {decision.selectedModel.displayName}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#3b82f6] border border-[#3b82f6]/30 px-1.5 py-0.5">
                    Recommended Model
                  </span>
                </div>
                <p className="text-[#d1d5db] font-sans text-xs leading-relaxed">
                  {decision.reason}
                </p>
                <div className="text-[11px] text-[#8c96a8] pt-1">
                  <strong>Trade-offs:</strong> {decision.tradeoffs}
                </div>
              </div>

              {/* Pipeline Step Traces */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-[#525a6b] uppercase">Pipeline Stage Evaluation</div>
                <div className="divide-y divide-[#1e222c] border border-[#232730] bg-[#0c0d10]">
                  {decision.pipelineStages.map((stage) => (
                    <div key={stage.stage} className="p-2.5 flex items-center justify-between text-[11px]">
                      <div className="space-y-0.5">
                        <div className="text-white font-medium">{stage.stage}</div>
                        <div className="text-[#8c96a8] font-sans text-[10px]">{stage.detail}</div>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#8c96a8]">
                  Fallback: {decision.alternativeModel.displayName}
                </span>
                <button
                  onClick={() => handleSelectRoutedModel(decision.selectedModel.id)}
                  className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors"
                >
                  Start Chat with {decision.selectedModel.displayName}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[#8c96a8] font-mono text-xs">
              Execute a route above to trace pipeline decisions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
