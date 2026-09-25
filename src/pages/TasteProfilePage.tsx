import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  X,
  Edit2,
  Plus,
  HelpCircle,
  ThumbsUp,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Eye,
  Check,
  Pause,
  Play
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface Preference {
  id: string;
  scope: 'conversation' | 'project' | 'user' | 'global';
  category: string;
  preference: string;
  polarity: 'prefer' | 'avoid';
  confidence: number;
  evidenceCount: number;
  source: string;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
}

interface RAGPreviewResult {
  systemPromptAdditions: string;
  appliedPreferences: Preference[];
  retrievedMemories: any[];
  activeAdapter?: any;
}

export const TasteProfilePage: React.FC = () => {
  const { addNotification } = useWorkspace();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [activeTab, setActiveTab] = useState<'preferences' | 'rag_preview'>('preferences');

  // Filters
  const [scopeFilter, setScopeFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPreferenceText, setEditPreferenceText] = useState('');

  // Add preference modal/form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrefText, setNewPrefText] = useState('');
  const [newPrefCategory, setNewPrefCategory] = useState('communication');
  const [newPrefPolarity, setNewPrefPolarity] = useState<'prefer' | 'avoid'>('prefer');
  const [newPrefScope, setNewPrefScope] = useState<'user' | 'project' | 'conversation'>('user');

  // RAG Preview Tester
  const [ragTestPrompt, setRagTestPrompt] = useState('Create a React 19 component that displays user analytics cards');
  const [ragResult, setRagResult] = useState<RAGPreviewResult | null>(null);
  const [isTestingRag, setIsTestingRag] = useState(false);

  // Load preferences from backend API
  const loadPreferences = async () => {
    try {
      const res = await fetch('/api/adaptive/preferences');
      const data = await res.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefText.trim()) return;

    try {
      const res = await fetch('/api/adaptive/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preference: newPrefText.trim(),
          category: newPrefCategory,
          polarity: newPrefPolarity,
          scope: newPrefScope,
          confidence: 0.95,
          source: 'Direct User Entry',
        }),
      });

      if (!res.ok) throw new Error('Failed to create preference');
      const created = await res.json();
      setPreferences((prev) => [created, ...prev]);
      setNewPrefText('');
      setShowAddForm(false);
      addNotification('New preference added to your AI profile', 'success');
    } catch (err: any) {
      addNotification(err.message, 'warn');
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editPreferenceText.trim()) return;
    try {
      const res = await fetch(`/api/adaptive/preferences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference: editPreferenceText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update preference');
      const updated = await res.json();
      setPreferences((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      addNotification('Preference updated successfully', 'success');
    } catch (err: any) {
      addNotification(err.message, 'warn');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/adaptive/preferences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setPreferences((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addNotification(`Preference ${newStatus === 'active' ? 'resumed' : 'paused'}`, 'info');
    } catch (err: any) {
      addNotification(err.message, 'warn');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/adaptive/preferences/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete preference');
      setPreferences((prev) => prev.filter((p) => p.id !== id));
      addNotification('Preference forgotten', 'info');
    } catch (err: any) {
      addNotification(err.message, 'warn');
    }
  };

  const handleTestRag = async () => {
    if (!ragTestPrompt.trim() || isTestingRag) return;
    setIsTestingRag(true);
    try {
      const res = await fetch('/api/adaptive/retrieval/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: ragTestPrompt.trim() }),
      });
      const data = await res.json();
      setRagResult(data);
      addNotification('Vector search & preference ranking completed', 'success');
    } catch (err: any) {
      addNotification('Error testing RAG retrieval', 'warn');
    } finally {
      setIsTestingRag(false);
    }
  };

  const filteredPreferences = preferences.filter((p) => {
    const matchesScope = scopeFilter === 'All' || p.scope === scopeFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchQuery.trim() || p.preference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E7E9EE]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              My AI Preferences
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              System A: Online Personalization
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Your AI gradually learns how you like to work. These guidelines steer model requests immediately via vector search without waiting for model retraining.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="bg-gray-100 p-1 rounded-xl flex text-xs font-medium border border-gray-200">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'preferences' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-600'
              }`}
            >
              Preferences ({preferences.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('rag_preview');
                if (!ragResult) handleTestRag();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'rag_preview' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-600'
              }`}
            >
              Test RAG Matcher
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add rule</span>
          </button>
        </div>
      </div>

      {/* Add Preference Form */}
      {showAddForm && (
        <form onSubmit={handleAddPreference} className="p-5 bg-white border border-blue-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">Add a New Preference Rule</span>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={newPrefText}
            onChange={(e) => setNewPrefText(e.target.value)}
            placeholder="e.g. Provide strict TypeScript types with explicit return types and no any..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Polarity</label>
              <select
                value={newPrefPolarity}
                onChange={(e) => setNewPrefPolarity(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="prefer">PREFER (Positive Guide)</option>
                <option value="avoid">AVOID (Negative Constraint)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Scope</label>
              <select
                value={newPrefScope}
                onChange={(e) => setNewPrefScope(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="user">User (Global to you)</option>
                <option value="project">Project (Specific to this repository)</option>
                <option value="conversation">Conversation (Short-term)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Category</label>
              <select
                value={newPrefCategory}
                onChange={(e) => setNewPrefCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="coding">Coding & TypeScript</option>
                <option value="verbosity">Verbosity & Conciseness</option>
                <option value="tone">Tone & Communication</option>
                <option value="formatting">Formatting & Markdown</option>
                <option value="UI">UI & Visual Design</option>
                <option value="reasoning">Reasoning & Logic</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newPrefText.trim()}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors"
            >
              Save preference
            </button>
          </div>
        </form>
      )}

      {/* 2. TAB: PREFERENCES LIST */}
      {activeTab === 'preferences' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E7E9EE] shadow-2xs">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search preferences..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <span className="text-gray-400">Scope:</span>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              >
                <option value="All">All Scopes</option>
                <option value="user">User</option>
                <option value="project">Project</option>
                <option value="conversation">Conversation</option>
              </select>

              <span className="text-gray-400 ml-2">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              >
                <option value="All">All Categories</option>
                <option value="coding">Coding</option>
                <option value="verbosity">Verbosity</option>
                <option value="tone">Tone</option>
                <option value="formatting">Formatting</option>
                <option value="UI">UI Design</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPreferences.map((pref) => (
              <div
                key={pref.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4 transition-all ${
                  pref.status === 'paused' ? 'opacity-60 border-dashed border-gray-300' : 'border-[#E7E9EE] hover:border-gray-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        pref.polarity === 'avoid'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {pref.polarity === 'avoid' ? 'Avoid' : 'Prefer'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                        {pref.category}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase">
                        [{pref.scope}]
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{(pref.confidence * 100).toFixed(0)}% • {pref.evidenceCount}x</span>
                    </div>
                  </div>

                  {editingId === pref.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editPreferenceText}
                        onChange={(e) => setEditPreferenceText(e.target.value)}
                        className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                        rows={2}
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(pref.id)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 leading-snug pt-1">
                      "{pref.preference}"
                    </p>
                  )}

                  <div className="text-[11px] text-gray-400">
                    Source: {pref.source}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className={`inline-flex items-center gap-1 ${
                    pref.status === 'active' ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                    {pref.status === 'active' ? '● Active' : '○ Paused'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(pref.id, pref.status)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                      title={pref.status === 'active' ? 'Pause preference' : 'Resume preference'}
                    >
                      {pref.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(pref.id);
                        setEditPreferenceText(pref.preference);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                      title="Edit rule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pref.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Forget this rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB: VECTOR RAG TESTER */}
      {activeTab === 'rag_preview' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Vector Search & Preference Steering Simulator</h3>
              <p className="text-xs text-gray-500">
                Type any user prompt to test how our dense vector search scores and selects preferences to construct the system prompt.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={ragTestPrompt}
                onChange={(e) => setRagTestPrompt(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter sample prompt..."
              />
              <button
                onClick={handleTestRag}
                disabled={isTestingRag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors shrink-0"
              >
                {isTestingRag ? 'Vectorizing...' : 'Run RAG Matcher'}
              </button>
            </div>

            {ragResult && (
              <div className="space-y-5 pt-4 border-t border-gray-100">
                {/* Applied Preferences */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Matched Preferences ({ragResult.appliedPreferences?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ragResult.appliedPreferences?.map((p) => (
                      <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            p.polarity === 'avoid' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.polarity.toUpperCase()}
                          </span>
                          <span className="text-gray-400 font-mono text-[10px]">Scope: {p.scope}</span>
                        </div>
                        <p className="text-gray-900 font-medium">{p.preference}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulated System Prompt Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Dynamically Constructed Personalization Block
                  </h4>
                  <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {ragResult.systemPromptAdditions}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
