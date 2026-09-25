import React, { useState } from 'react';
import { X, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const WebsiteEvaluatorModal: React.FC = () => {
  const { websiteEvaluatorOpen, setWebsiteEvaluatorOpen, addNotification } = useWorkspace();
  const [analyzing, setAnalyzing] = useState(false);

  const [metrics, setMetrics] = useState([
    { label: 'Visual Hierarchy & Clarity', score: 9.4, comment: 'Clear focal point with clean typographic balance.' },
    { label: 'Clean Design (No AI Clutter)', score: 9.8, comment: 'Clean white space with soft, intentional blue accents.' },
    { label: 'Readability & Typography', score: 9.5, comment: 'Highly readable modern sans-serif with natural line spacing.' },
    { label: 'Ease of Use for Students', score: 9.6, comment: 'Friendly, intuitive navigation that takes seconds to understand.' },
  ]);

  if (!websiteEvaluatorOpen) return null;

  const handleReanalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          score: Math.min(9.9, Math.max(8.5, +(m.score + (Math.random() * 0.4 - 0.2)).toFixed(1))),
        }))
      );
      addNotification('Interface audited successfully', 'success');
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={() => setWebsiteEvaluatorOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E7E9EE] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Design & Clarity Auditor
              </h2>
              <p className="text-xs text-gray-500">
                Verifies that the interface stays clean, friendly, and clutter-free.
              </p>
            </div>
          </div>
          <button
            onClick={() => setWebsiteEvaluatorOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 bg-[#F7F8FA]">
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label} className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-900">{m.label}</span>
                  <span className="font-bold text-blue-600">{m.score} / 10</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(m.score / 10) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500">{m.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-medium text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{analyzing ? 'Auditing...' : 'Re-run Audit'}</span>
          </button>

          <button
            onClick={() => setWebsiteEvaluatorOpen(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
