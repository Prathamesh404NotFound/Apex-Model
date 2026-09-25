import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Check, 
  X, 
  Zap, 
  HardDrive, 
  Code2, 
  Brain, 
  FileText, 
  Compass, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface FriendlyModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FriendlyModelSelector: React.FC<FriendlyModelSelectorProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { activeModel, setActiveModelId, models } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Categories requested in Prompt #7:
  // Recommended, GPT, Gemini, Claude, Grok, Qwen, Mistral, Local Models
  const categories = [
    { id: 'all', label: 'All Models' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'gemini', label: 'Gemini' },
    { id: 'gpt', label: 'GPT' },
    { id: 'claude', label: 'Claude' },
    { id: 'grok', label: 'Grok' },
    { id: 'qwen', label: 'Qwen' },
    { id: 'mistral', label: 'Mistral' },
    { id: 'local', label: 'Local (Offline)' },
  ];

  // Friendly metadata mapping for models
  const getFriendlyDetails = (m: any) => {
    const id = m.id.toLowerCase();
    const provider = m.provider.toLowerCase();

    if (id.includes('gemini-3.1-pro')) {
      return {
        category: 'gemini',
        isRecommended: true,
        bestFor: 'Deep reasoning, complex research & mathematics',
        speed: 'Deep & Thorough',
        badgeColor: 'bg-blue-100 text-blue-700',
        simpleDesc: 'Google DeepMind flagship with ThinkingLevel.HIGH for tough problems.'
      };
    }
    if (id.includes('gemini')) {
      return {
        category: 'gemini',
        isRecommended: true,
        bestFor: 'Everyday assistance, multimodal analysis & speed',
        speed: 'Super Fast',
        badgeColor: 'bg-blue-100 text-blue-700',
        simpleDesc: 'Fast, intelligent, and versatile Google frontier model.'
      };
    }
    if (id.includes('gpt') && !m.local) {
      return {
        category: 'gpt',
        isRecommended: true,
        bestFor: 'General tasks, creative writing & structured data',
        speed: 'Fast',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        simpleDesc: 'Balanced general intelligence and dependable instruction following.'
      };
    }
    if (id.includes('claude')) {
      return {
        category: 'claude',
        isRecommended: true,
        bestFor: 'Writing, long document synthesis & nuanced analysis',
        speed: 'Fast',
        badgeColor: 'bg-amber-100 text-amber-800',
        simpleDesc: 'Exceptional for literary polish, tone consistency, and safety.'
      };
    }
    if (id.includes('grok')) {
      return {
        category: 'grok',
        isRecommended: false,
        bestFor: 'Fast reasoning & up-to-date knowledge',
        speed: 'Super Fast',
        badgeColor: 'bg-purple-100 text-purple-700',
        simpleDesc: 'Direct, witty reasoning with real-time perspective.'
      };
    }
    if (id.includes('qwen')) {
      return {
        category: 'qwen',
        isRecommended: true,
        bestFor: 'Coding, refactoring & technical logic',
        speed: 'Fast',
        badgeColor: 'bg-indigo-100 text-indigo-700',
        simpleDesc: 'Top-tier code generation and algorithmic reasoning.'
      };
    }
    if (id.includes('mistral')) {
      return {
        category: 'mistral',
        isRecommended: false,
        bestFor: 'Multilingual queries & concise answers',
        speed: 'Super Fast',
        badgeColor: 'bg-orange-100 text-orange-700',
        simpleDesc: 'Compact European powerhouse, excellent multilingual capability.'
      };
    }
    if (m.local) {
      return {
        category: 'local',
        isRecommended: true,
        bestFor: '100% private, offline use without internet',
        speed: 'Hardware Dependent',
        badgeColor: 'bg-green-100 text-green-800',
        simpleDesc: 'Runs completely on your computer via Ollama or LM Studio.'
      };
    }

    return {
      category: 'other',
      isRecommended: false,
      bestFor: 'General tasks',
      speed: 'Fast',
      badgeColor: 'bg-gray-100 text-gray-700',
      simpleDesc: m.description.slice(0, 80) + '...'
    };
  };

  const filteredModels = models.filter((m) => {
    const details = getFriendlyDetails(m);
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'recommended') return details.isRecommended;
    if (selectedCategory === 'local') return m.local;
    return details.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E7E9EE] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Select AI Model</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose the right model for your task. You can switch at any time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 border-b border-gray-100 bg-[#F7F8FA] overflow-x-auto flex gap-1.5 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-[#E7E9EE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Model Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 bg-[#F7F8FA]">
          {filteredModels.map((m) => {
            const details = getFriendlyDetails(m);
            const isSelected = activeModel.id === m.id;

            return (
              <div
                key={m.id}
                onClick={() => {
                  setActiveModelId(m.id);
                  onClose();
                }}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs'
                    : 'border-[#E7E9EE] hover:border-gray-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {m.displayName}
                      </span>
                      {m.supportsHighThinking && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                          Thinking Mode
                        </span>
                      )}
                      {m.local ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          Offline / Private
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                          Cloud
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {details.simpleDesc}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Sub info */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Best for:</span>
                    <span className="text-gray-700 font-medium">{details.bestFor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${details.badgeColor}`}>
                      {details.speed}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with "View all models" for advanced users */}
        <div className="p-3.5 px-5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">
            {filteredModels.length} models available
          </span>
          <button
            onClick={() => {
              onClose();
              navigate('/models');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View all technical specifications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
