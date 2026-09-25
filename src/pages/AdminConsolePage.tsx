import React from 'react';
import { 
  Users, 
  BarChart3, 
  Cpu, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  Layers, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const AdminConsolePage: React.FC = () => {
  const { models } = useWorkspace();

  const pilotStats = {
    totalSeats: 100,
    activeSeats: 87,
    feedbackEvents: 412,
    activeProjects: 64,
    onlineVsLocalRatio: '68% Online / 32% Local',
    avgLatency: '1.24s',
  };

  const topModels = [
    { name: 'Gemini 3.1 Pro (High Thinking)', share: '38%', tasks: 'Complex algorithms, STEM, UI Architecture' },
    { name: 'gpt-oss-20b (Ollama Local)', share: '24%', tasks: 'Private offline coding & homework' },
    { name: 'Claude Sonnet 5', share: '22%', tasks: 'Full-stack TypeScript refactoring' },
    { name: 'GPT-6 Sol', share: '16%', tasks: 'Literature synthesis and reasoning' },
  ];

  const commonComplaints = [
    { issue: 'AI slop / excessive gradients in starter templates', count: 94, category: 'Visual Design' },
    { issue: 'Overly verbose conversational introductions', count: 76, category: 'Communication' },
    { issue: 'Hallucinated hardware capacity for 70B+ weights', count: 52, category: 'Local AI' },
    { issue: 'Use of "any" type in TypeScript generated code', count: 48, category: 'Code Quality' },
  ];

  const commonPreferences = [
    { pref: 'Enforce strict 2+1 typographic discipline and zero pills', count: 112 },
    { pref: 'Provide explicit VRAM calculations separating weights from KV cache', count: 88 },
    { pref: 'Jump directly to code without greetings or apologies', count: 81 },
    { pref: 'Support offline inference fallback during campus Wi-Fi drops', count: 67 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#232730] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#3b82f6] uppercase tracking-wider mb-1">
            <span>Research & Institutional Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Pilot Audit Console</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white font-mono">
            100-Student Pilot Research Console
          </h1>
          <p className="text-xs text-[#8c96a8] mt-1 max-w-2xl leading-relaxed">
            Aggregated anonymized usage patterns, model distribution, common student complaints, and pairwise preference trajectories across the engineering cohort.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8c96a8]">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <span>FERPA / GDPR Anonymized</span>
        </div>
      </div>

      {/* Cohort Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 border border-[#232730] bg-[#12141a] space-y-1">
          <span className="text-[#8c96a8] text-[10px] uppercase">Allocated Pilot Seats</span>
          <div className="text-2xl font-bold text-white tabular-nums">
            {pilotStats.activeSeats} <span className="text-xs text-[#6b7280]">/ {pilotStats.totalSeats} active</span>
          </div>
          <span className="text-[10px] text-[#10b981]">87% Cohort Engagement</span>
        </div>

        <div className="p-4 border border-[#232730] bg-[#12141a] space-y-1">
          <span className="text-[#8c96a8] text-[10px] uppercase">Logged Feedback Events</span>
          <div className="text-2xl font-bold text-white tabular-nums">{pilotStats.feedbackEvents}</div>
          <span className="text-[10px] text-[#3b82f6]">18.4% with Gold Alternatives</span>
        </div>

        <div className="p-4 border border-[#232730] bg-[#12141a] space-y-1">
          <span className="text-[#8c96a8] text-[10px] uppercase">Active Projects</span>
          <div className="text-2xl font-bold text-white tabular-nums">{pilotStats.activeProjects}</div>
          <span className="text-[10px] text-[#8c96a8]">Custom constraint sets</span>
        </div>

        <div className="p-4 border border-[#232730] bg-[#12141a] space-y-1">
          <span className="text-[#8c96a8] text-[10px] uppercase">Online vs Local Ratio</span>
          <div className="text-base font-bold text-white pt-1">{pilotStats.onlineVsLocalRatio}</div>
          <span className="text-[10px] text-emerald-400">Growing Local Share</span>
        </div>
      </div>

      {/* Top Models Distribution Table */}
      <div className="p-6 border border-[#232730] bg-[#12141a] space-y-4">
        <h2 className="text-xs font-mono font-semibold tracking-wider text-white uppercase flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#3b82f6]" />
          <span>Most-Used Model Architectures in Cohort</span>
        </h2>

        <div className="divide-y divide-[#1e222c] border border-[#232730] bg-[#0c0d10] font-mono text-xs">
          {topModels.map((m) => (
            <div key={m.name} className="p-3.5 flex items-center justify-between hover:bg-[#141720] transition-colors">
              <div className="space-y-0.5">
                <div className="text-white font-medium">{m.name}</div>
                <div className="text-[11px] text-[#8c96a8] font-sans">Primary workload: {m.tasks}</div>
              </div>
              <div className="text-right">
                <span className="text-[#3b82f6] font-bold tabular-nums text-sm">{m.share}</span>
                <div className="text-[10px] text-[#6b7280]">tokens consumed</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Complaints vs Learned Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Complaints */}
        <div className="p-5 border border-[#232730] bg-[#12141a] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#232730]">
            <span className="text-red-400 font-semibold uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Common Student Complaints</span>
            </span>
            <span className="text-[10px] text-[#8c96a8]">Negative Feedback</span>
          </div>

          <div className="space-y-2">
            {commonComplaints.map((c) => (
              <div key={c.issue} className="p-2.5 bg-[#0c0d10] border border-[#1e222c] flex items-center justify-between">
                <div>
                  <div className="text-white font-sans text-xs">{c.issue}</div>
                  <span className="text-[10px] text-[#8c96a8]">{c.category}</span>
                </div>
                <span className="text-red-400 font-bold tabular-nums">{c.count} flags</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="p-5 border border-[#232730] bg-[#12141a] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#232730]">
            <span className="text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Emerging Invariants (Taste Engine)</span>
            </span>
            <span className="text-[10px] text-[#8c96a8]">Trained Rules</span>
          </div>

          <div className="space-y-2">
            {commonPreferences.map((p) => (
              <div key={p.pref} className="p-2.5 bg-[#0c0d10] border border-[#1e222c] flex items-center justify-between">
                <span className="text-white font-sans text-xs pr-4">{p.pref}</span>
                <span className="text-emerald-400 font-bold tabular-nums shrink-0">{p.count} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
