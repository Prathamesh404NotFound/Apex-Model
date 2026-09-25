import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Play, 
  Copy, 
  Check, 
  Sparkles, 
  X,
  ArrowRight
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { INITIAL_PROMPTS } from '../data/initialData';
import { PromptTemplate } from '../types/workspace';

export const PromptLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { createNewChat, addNotification } = useWorkspace();
  const [prompts, setPrompts] = useState<PromptTemplate[]>(INITIAL_PROMPTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [activePromptModal, setActivePromptModal] = useState<PromptTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const categories = ['All', 'Design', 'Coding', 'Research', 'Writing', 'Study'];

  const filteredPrompts = prompts.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    addNotification('Prompt copied to clipboard');
  };

  const handleOpenRunner = (p: PromptTemplate) => {
    setActivePromptModal(p);
    const initialVals: Record<string, string> = {};
    p.variables.forEach((v) => {
      initialVals[v] = v === 'technology' ? 'React + TypeScript' : v === 'style' ? 'Minimal Clean' : '';
    });
    setVariableValues(initialVals);
  };

  const handleExecutePrompt = () => {
    if (!activePromptModal) return;
    let finalPrompt = activePromptModal.prompt;
    Object.entries(variableValues).forEach(([k, v]) => {
      finalPrompt = finalPrompt.replace(new RegExp(`{{${k}}}`, 'g'), v || `[${k}]`);
    });

    const chatId = createNewChat();
    // Save to storage
    const stored = localStorage.getItem('apex_chats');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        const current = list.find((c: any) => c.id === chatId);
        if (current) {
          current.messages.push({
            id: 'msg-' + Date.now(),
            role: 'user',
            content: finalPrompt,
            timestamp: Date.now()
          });
          current.title = activePromptModal.title;
          localStorage.setItem('apex_chats', JSON.stringify(list));
        }
      } catch (err) {
        console.error(err);
      }
    }
    setActivePromptModal(null);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Prompt Library
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Curated high-performance prompts for writing, code analysis, research, and design.
          </p>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E9EE] rounded-xl text-sm focus:border-blue-500 focus:outline-hidden shadow-2xs"
          />
        </div>

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

      {/* 3. Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrompts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-[#E7E9EE] hover:border-gray-300 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                  {p.category}
                </span>
                <button
                  onClick={() => handleCopy(p.prompt, p.id)}
                  className="text-gray-400 hover:text-gray-700 p-1"
                  title="Copy prompt"
                >
                  {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <h3 className="text-base font-semibold text-gray-900">{p.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                {p.prompt}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {p.variables.length} parameters
              </span>
              <button
                onClick={() => handleOpenRunner(p)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Prompt</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Parameter modal */}
      {activePromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">{activePromptModal.title}</h3>
              <button onClick={() => setActivePromptModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {activePromptModal.variables.map((v) => (
                <div key={v}>
                  <label className="block text-xs font-medium text-gray-700 capitalize mb-1">
                    {v}
                  </label>
                  <input
                    type="text"
                    value={variableValues[v] || ''}
                    onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                    placeholder={`Enter value for ${v}`}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setActivePromptModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePrompt}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs"
              >
                Start Chat with Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
