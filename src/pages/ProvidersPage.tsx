import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Trash2, 
  Edit3,
  X,
  Server,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface ProviderCard {
  id: string;
  name: string;
  connected: boolean;
  isLocal: boolean;
  maskedKey?: string;
  baseUrl?: string;
  statusMessage?: string;
  modelCount: number;
  lastTestedAt?: string;
}

export const ProvidersPage: React.FC = () => {
  const { addNotification } = useWorkspace();
  const [providers, setProviders] = useState<ProviderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Modal / drawer state for setting API key
  const [activeConfigureProvider, setActiveConfigureProvider] = useState<ProviderCard | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [inputBaseUrl, setInputBaseUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/providers/${id}/test`, { method: 'POST' });
      const data = await res.json();
      if (data.connected) {
        addNotification(`Connected to ${id}: ${data.message}`, 'success');
      } else {
        addNotification(`Connection failed for ${id}: ${data.message || data.error}`, 'warn');
      }
      await fetchProviders();
    } catch (err: any) {
      addNotification(`Network error testing ${id}`, 'warn');
    } finally {
      setTestingId(null);
    }
  };

  const handleOpenConfigure = (p: ProviderCard) => {
    setActiveConfigureProvider(p);
    setInputKey('');
    setInputBaseUrl(p.baseUrl || '');
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfigureProvider) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/providers/${activeConfigureProvider.id}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputKey || undefined,
          baseUrl: inputBaseUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.connected) {
        addNotification(`Connected to ${activeConfigureProvider.name}`, 'success');
      } else {
        addNotification(`Saved, but connection check returned: ${data.message}`, 'warn');
      }
      setActiveConfigureProvider(null);
      await fetchProviders();
    } catch (err: any) {
      addNotification(`Error saving config: ${err.message}`, 'warn');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/providers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addNotification(`Disconnected ${id}`);
        await fetchProviders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="space-y-1.5 pb-6 border-b border-[#E7E9EE]">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Settings & Provider Connections
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
          Connect your real OpenAI, Gemini, Claude, Grok, DeepSeek, Mistral, and local runtimes. API keys are safely managed server-side and never exposed to client browsers.
        </p>
      </div>

      {/* 2. Provider Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading provider statuses...</div>
        ) : (
          providers.map((p) => (
            <div
              key={p.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                p.connected ? 'border-emerald-200' : 'border-[#E7E9EE]'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-gray-900">{p.name}</span>
                  {p.connected ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Not Connected
                    </span>
                  )}
                  {p.isLocal && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      Local Machine
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {p.statusMessage}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 font-mono">
                  {p.maskedKey ? (
                    <span>Key: <strong className="text-gray-700">{p.maskedKey}</strong></span>
                  ) : (
                    <span>Key: None configured</span>
                  )}
                  {p.baseUrl && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-xs">{p.baseUrl}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{p.modelCount} models</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  onClick={() => handleTest(p.id)}
                  disabled={testingId === p.id}
                  className="px-3 py-1.5 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-xs font-medium text-gray-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Test real connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === p.id ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{testingId === p.id ? 'Testing...' : 'Test'}</span>
                </button>

                <button
                  onClick={() => handleOpenConfigure(p)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  {p.connected ? 'Update' : 'Connect'}
                </button>

                {p.connected && !p.isLocal && (
                  <button
                    onClick={() => handleDisconnect(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Architecture Guarantee */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-700">Security Architecture:</strong> API keys are held strictly in memory and server-side environment variables. Browser requests never receive raw API keys. All model calls are authenticated securely by the server gateway.
        </div>
      </div>

      {/* Configuration Modal */}
      {activeConfigureProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Connect {activeConfigureProvider.name}
              </h3>
              <button
                onClick={() => setActiveConfigureProvider(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {!activeConfigureProvider.isLocal && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter your provider API key..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Will be stored safely server-side.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  API Endpoint / Base URL {activeConfigureProvider.isLocal ? '(Required)' : '(Optional)'}
                </label>
                <input
                  type="text"
                  value={inputBaseUrl}
                  onChange={(e) => setInputBaseUrl(e.target.value)}
                  placeholder={activeConfigureProvider.isLocal ? 'http://localhost:11434' : 'Default provider URL'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveConfigureProvider(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {isSaving ? 'Verifying...' : 'Save & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
