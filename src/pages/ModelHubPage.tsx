import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  HardDrive, 
  Cpu, 
  ArrowRight, 
  Check, 
  Layers, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const ModelHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    models, 
    activeModelId, 
    setActiveModelId, 
    setQuantizationModalOpen,
    createNewChat 
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState(false);

  const categories = ['All', 'Cloud', 'Offline (Local)', 'Reasoning', 'Coding'];

  const filteredModels = models.filter((m) => {
    if (selectedCategory === 'Cloud' && !m.online) return false;
    if (selectedCategory === 'Offline (Local)' && !m.local) return false;
    if (selectedCategory === 'Reasoning' && m.modelType !== 'Reasoning') return false;
    if (selectedCategory === 'Coding' && m.modelType !== 'Coding') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.displayName.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchProvider = m.provider.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchProvider) return false;
    }
    return true;
  });

  const handleSelectModel = (id: string) => {
    setActiveModelId(id);
    const chatId = createNewChat();
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            AI Models Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose from top frontier cloud models and private offline models running on your machine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTechnicalSpecs(!showTechnicalSpecs)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E9EE] bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>{showTechnicalSpecs ? 'Hide Technical Specs' : 'Show Technical Specs'}</span>
          </button>
        </div>
      </div>

      {/* 2. Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models by name or capability..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E9EE] rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden shadow-2xs"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-[#E7E9EE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((m) => {
          const isSelected = activeModelId === m.id;
          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-50' : 'border-[#E7E9EE] hover:border-gray-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {m.displayName}
                    </h3>
                    <p className="text-xs text-gray-400">{m.provider}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {m.local ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        Offline
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        Cloud API
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {m.description}
                </p>

                {/* Friendly Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                    Speed: {m.speedRating || 'Fast'}
                  </span>
                  {m.supportsHighThinking && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      Thinking Mode
                    </span>
                  )}
                  {m.modalities?.includes('Vision') && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
                      Vision
                    </span>
                  )}
                </div>

                {/* Optional Technical Specs for Power Users */}
                {showTechnicalSpecs && (
                  <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-mono text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Context Window:</span>
                      <span className="font-semibold text-gray-800">{m.contextWindow?.toLocaleString()} tokens</span>
                    </div>
                    {m.local && (
                      <div className="flex justify-between">
                        <span>VRAM Required:</span>
                        <span className="font-semibold text-gray-800">{m.recommendedVram} GB</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Model Type:</span>
                      <span className="font-semibold text-gray-800">{m.modelType}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleSelectModel(m.id)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active Model</span>
                    </>
                  ) : (
                    <>
                      <span>Start Chat with {m.displayName.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
