import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const PrivacyPage: React.FC = () => {
  const { addNotification } = useWorkspace();
  const [optInShared, setOptInShared] = useState(true);
  const [scrubCodeComments, setScrubCodeComments] = useState(true);
  const [retainLocalLogs, setRetainLocalLogs] = useState(true);

  const handleDeleteHistory = () => {
    addNotification('Anonymized shared training contribution log cleared', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#232730] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#10b981] uppercase tracking-wider mb-1">
            <span>Data Boundary & Governance</span>
            <span aria-hidden="true">·</span>
            <span>Zero Unsolicited Telemetry</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white font-mono">
            Privacy & Scoped Learning Architecture
          </h1>
          <p className="text-xs text-[#8c96a8] mt-1 max-w-2xl font-sans leading-relaxed">
            Configure how your feedback and interaction data are isolated. Shared learning datasets are cryptographically separated from your private conversation memory.
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 bg-emerald-500/5">
          <ShieldCheck className="w-4 h-4" />
          <span>Client-Side Data Ownership</span>
        </div>
      </div>

      {/* Philosophy Card */}
      <div className="p-6 border border-[#232730] bg-[#12141a] space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#3b82f6]" />
          <span>The Four Memory Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0c0d10] border border-[#1e222c] space-y-1.5">
            <span className="text-white font-semibold">Tier A: Global Model Knowledge</span>
            <p className="text-[#8c96a8] font-sans text-xs leading-relaxed">
              Base pre-trained weights from providers. Remains unchanged across your interactions.
            </p>
          </div>

          <div className="p-4 bg-[#0c0d10] border border-[#1e222c] space-y-1.5">
            <span className="text-white font-semibold">Tier B: User Preference Memory (Taste Profile)</span>
            <p className="text-[#8c96a8] font-sans text-xs leading-relaxed">
              Private to your workstation. Stores your communication and coding style preferences.
            </p>
          </div>

          <div className="p-4 bg-[#0c0d10] border border-[#1e222c] space-y-1.5">
            <span className="text-white font-semibold">Tier C: Project Memory</span>
            <p className="text-[#8c96a8] font-sans text-xs leading-relaxed">
              Scoped strictly to a specific project (e.g. client brand rules, architectural invariants).
            </p>
          </div>

          <div className="p-4 bg-[#0c0d10] border border-[#1e222c] space-y-1.5">
            <span className="text-white font-semibold">Tier D: Shared Preference Learning</span>
            <p className="text-[#8c96a8] font-sans text-xs leading-relaxed">
              Only populated when you explicitly select "Shared Learning" in feedback. Completely anonymized and scrubbed of PII.
            </p>
          </div>
        </div>
      </div>

      {/* Control Toggles */}
      <div className="p-6 border border-[#232730] bg-[#12141a] space-y-6">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
          Learning Permissions & Scrubbing Policies
        </h2>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optInShared}
              onChange={(e) => setOptInShared(e.target.checked)}
              className="mt-1 accent-[#2563eb]"
            />
            <div className="space-y-0.5">
              <span className="text-white font-medium">Contribute to Open DPO / Preference Datasets</span>
              <p className="text-[#8c96a8] font-sans text-xs">
                When submitting response corrections, allow anonymized pairs to enter the open-source evaluation pool.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={scrubCodeComments}
              onChange={(e) => setScrubCodeComments(e.target.checked)}
              className="mt-1 accent-[#2563eb]"
            />
            <div className="space-y-0.5">
              <span className="text-white font-medium">Automatic Regex PII & Secret Redaction</span>
              <p className="text-[#8c96a8] font-sans text-xs">
                Automatically strips API keys, IP addresses, emails, and hostnames before any feedback leaves the client.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={retainLocalLogs}
              onChange={(e) => setRetainLocalLogs(e.target.checked)}
              className="mt-1 accent-[#2563eb]"
            />
            <div className="space-y-0.5">
              <span className="text-white font-medium">Offline Inference Airgap</span>
              <p className="text-[#8c96a8] font-sans text-xs">
                Ensure local Ollama and LM Studio queries never contact remote telemetry servers.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-[#1e222c] flex justify-between items-center">
          <span className="text-[#8c96a8]">Contribution Records: 12 Anonymized Pairs</span>
          <button
            onClick={handleDeleteHistory}
            className="px-3 py-1.5 border border-red-500/30 hover:bg-red-500/10 text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Contribution History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
