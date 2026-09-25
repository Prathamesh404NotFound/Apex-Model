import React, { useState } from 'react';
import { 
  GitCompare, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Send, 
  Check, 
  Trophy, 
  Clock, 
  Copy, 
  HardDrive
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ComparisonCandidate } from '../types/workspace';
import { generateAIResponse } from '../services/aiProviderService';

export const CompareArenaPage: React.FC = () => {
  const { 
    comparisons, 
    recordComparisonWinner, 
    models, 
    preferences, 
    activeProject,
    addNotification 
  } = useWorkspace();

  const currentSession = comparisons[0];

  const [prompt, setPrompt] = useState(currentSession?.prompt || 'Design a clean, responsive landing page hero section in Tailwind CSS.');
  const [blindMode, setBlindMode] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(currentSession?.chosenModelId || null);
  const [whyReason, setWhyReason] = useState(currentSession?.choiceReason || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [candidates, setCandidates] = useState<ComparisonCandidate[]>(currentSession?.candidates || []);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [slotA, setSlotA] = useState('gemini-3.1-pro-preview');
  const [slotB, setSlotB] = useState('gpt-oss-20b');

  const handleRunComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setSelectedWinnerId(null);
    setWhyReason('');

    const targetModelIds = [slotA, slotB];
    const newCandidates: ComparisonCandidate[] = [];

    for (const mId of targetModelIds) {
      const model = models.find((m) => m.id === mId) || models[0];
      try {
        const result = await generateAIResponse({
          prompt,
          model,
          project: activeProject,
          preferences: preferences.filter((p) => p.status === 'active'),
          enableHighThinking: model.supportsHighThinking,
        });

        newCandidates.push({
          modelId: model.id,
          modelName: model.displayName,
          response: result.text,
          latencyMs: result.latencyMs,
          tokensUsed: result.tokensUsed,
          costEstimate: model.local ? 'Free (Local)' : 'Cloud API',
          thinkingDetails: result.thinkingProcess,
        });
      } catch (err: any) {
        newCandidates.push({
          modelId: model.id,
          modelName: model.displayName,
          response: `Notice: ${err?.message || 'Model returned default output.'}`,
          latencyMs: 450,
          tokensUsed: 120,
          costEstimate: 'N/A',
        });
      }
    }

    setCandidates(newCandidates);
    setIsEvaluating(false);
    addNotification('Comparison generation complete');
  };

  const handleSelectWinner = async (modelId: string) => {
    setSelectedWinnerId(modelId);
    const chosenCandidate = candidates.find((c) => c.modelId === modelId);
    const rejectedCandidate = candidates.find((c) => c.modelId !== modelId);
    recordComparisonWinner('comp-live', modelId, whyReason || 'Preferred output quality and clarity.');

    if (chosenCandidate && rejectedCandidate) {
      try {
        await fetch('/api/adaptive/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId: 'comp-' + Date.now(),
            modelId: chosenCandidate.modelId,
            type: 'comparison',
            rating: 'positive',
            originalPrompt: prompt,
            originalResponse: rejectedCandidate.response,
            chosenResponse: chosenCandidate.response,
            rejectedResponse: rejectedCandidate.response,
            reasons: [whyReason || 'Arena Comparison Winner'],
            preferenceScope: 'anonymous_shared',
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }

    addNotification('Arena choice saved as DPO preference pair!', 'success');
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
    addNotification('Response copied');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Compare Models Side-by-Side
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Send one prompt to multiple AI models simultaneously to see which one writes better answers.
          </p>
        </div>

        {/* Blind mode switch */}
        <button
          onClick={() => setBlindMode(!blindMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            blindMode 
              ? 'bg-purple-50 border-purple-200 text-purple-700' 
              : 'bg-white border-[#E7E9EE] text-gray-700 hover:bg-gray-50 shadow-2xs'
          }`}
        >
          {blindMode ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-gray-500" />}
          <span>{blindMode ? 'Blind Mode (Names Hidden)' : 'Show Model Names'}</span>
        </button>
      </div>

      {/* 2. Prompt & Model Selector Controls */}
      <form onSubmit={handleRunComparison} className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Model A</label>
            <select
              value={slotA}
              onChange={(e) => setSlotA(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E7E9EE] rounded-xl text-xs sm:text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.displayName} ({m.local ? 'Local' : 'Cloud'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Model B</label>
            <select
              value={slotB}
              onChange={(e) => setSlotB(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E7E9EE] rounded-xl text-xs sm:text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.displayName} ({m.local ? 'Local' : 'Cloud'})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Comparison Prompt</label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a prompt to test both models..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEvaluating ? 'Evaluating Models...' : 'Compare Responses'}</span>
          </button>
        </div>
      </form>

      {/* 3. Comparison Responses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates.map((cand, idx) => {
          const isWinner = selectedWinnerId === cand.modelId;
          const displayTitle = blindMode ? `Model ${idx === 0 ? 'Alpha' : 'Beta'}` : cand.modelName;

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 transition-all ${
                isWinner ? 'border-emerald-500 ring-2 ring-emerald-50' : 'border-[#E7E9EE]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {displayTitle}
                    </span>
                    {isWinner && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Chosen Winner
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cand.latencyMs}ms
                    </span>
                    <button
                      onClick={() => handleCopy(cand.response, idx)}
                      className="p-1 hover:text-gray-700"
                      title="Copy"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                  {cand.response}
                </div>
              </div>

              {/* Vote for this model button */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleSelectWinner(cand.modelId)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isWinner
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{isWinner ? 'Marked as Winner' : 'This response is better'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
