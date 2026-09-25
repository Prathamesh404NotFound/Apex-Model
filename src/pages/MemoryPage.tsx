import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Sliders, 
  ShieldCheck, 
  X,
  MessageSquare
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface MemoryRule {
  id: string;
  tag: string;
  text: string;
  source: string;
  createdAt: string;
}

const INITIAL_MEMORIES: MemoryRule[] = [
  {
    id: 'm-1',
    tag: 'Coding Style',
    text: 'Prefers strict TypeScript with explicit interfaces instead of "any".',
    source: 'Feedback Learning',
    createdAt: 'Learned 2 days ago'
  },
  {
    id: 'm-2',
    tag: 'Tone & Style',
    text: 'Prefers direct, concise answers without conversational filler or apologies.',
    source: 'Direct Instruction',
    createdAt: 'Added yesterday'
  },
  {
    id: 'm-3',
    tag: 'Format',
    text: 'Likes structured bullet points and practical code examples before theoretical explanations.',
    source: 'Feedback Learning',
    createdAt: 'Learned last week'
  },
  {
    id: 'm-4',
    tag: 'Environment',
    text: 'Works on a laptop with 16GB RAM. Prioritizes efficient models and clean modular components.',
    source: 'Direct Instruction',
    createdAt: 'Added 3 days ago'
  }
];

export const MemoryPage: React.FC = () => {
  const { addNotification } = useWorkspace();
  const [memories, setMemories] = useState<MemoryRule[]>(INITIAL_MEMORIES);
  const [inputRule, setInputRule] = useState('');
  const [inputTag, setInputTag] = useState('Personal Preference');

  useEffect(() => {
    fetch('/api/adaptive/memories')
      .then((res) => res.json())
      .then((data) => {
        if (data.memories && Array.isArray(data.memories) && data.memories.length > 0) {
          const formatted: MemoryRule[] = data.memories.map((m: any) => ({
            id: m.id,
            tag: m.tags?.[0] || 'Guidelines',
            text: m.content || m.title,
            source: m.source || 'Project Specification',
            createdAt: new Date(m.createdAt).toLocaleDateString(),
          }));
          setMemories(formatted);
        }
      })
      .catch(console.error);
  }, []);

  // Quick preference chips
  const quickChips = [
    'Always use TypeScript',
    'Keep explanations concise',
    'Code examples first',
    'Avoid generic AI buzzwords',
    'Include test cases with code'
  ];

  const handleAddMemory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputRule.trim()) return;

    try {
      const res = await fetch('/api/adaptive/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: inputTag,
          content: inputRule.trim(),
          tags: [inputTag],
          importance: 8,
          scope: 'user',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setMemories((prev) => [
          {
            id: created.id,
            tag: inputTag,
            text: created.content,
            source: 'Direct Instruction',
            createdAt: 'Just now',
          },
          ...prev,
        ]);
        setInputRule('');
        addNotification('Added to AI Memory & Vector Index', 'success');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    const newMem: MemoryRule = {
      id: 'm-' + Date.now(),
      tag: inputTag,
      text: inputRule.trim(),
      source: 'Direct Instruction',
      createdAt: 'Just now'
    };
    setMemories([newMem, ...memories]);
    setInputRule('');
    addNotification('Added to AI Memory', 'success');
  };

  const handleQuickAdd = async (chipText: string) => {
    if (memories.some(m => m.text.toLowerCase() === chipText.toLowerCase())) {
      addNotification('This preference is already saved');
      return;
    }

    try {
      const res = await fetch('/api/adaptive/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Quick Preference',
          content: chipText,
          tags: ['Quick Preference'],
          importance: 8,
          scope: 'user',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setMemories((prev) => [
          {
            id: created.id,
            tag: 'Quick Preference',
            text: created.content,
            source: 'Direct Instruction',
            createdAt: 'Just now',
          },
          ...prev,
        ]);
        addNotification(`Added "${chipText}"`, 'success');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    const newMem: MemoryRule = {
      id: 'm-' + Date.now(),
      tag: 'Quick Preference',
      text: chipText,
      source: 'Direct Instruction',
      createdAt: 'Just now'
    };
    setMemories([newMem, ...memories]);
    addNotification(`Added "${chipText}"`);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/adaptive/memories/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setMemories(memories.filter((m) => m.id !== id));
    addNotification('Memory removed');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Transparent & Friendly Header */}
      <div className="space-y-1.5 pb-6 border-b border-[#E7E9EE]">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          What AI Remembers About You
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
          We learn from your feedback to tailor future responses to your style. You have complete control to add, edit, or delete any memories at any time.
        </p>
      </div>

      {/* 2. Add New Memory Box */}
      <div className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Teach AI a New Preference</h2>
        </div>

        <form onSubmit={handleAddMemory} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputRule}
              onChange={(e) => setInputRule(e.target.value)}
              placeholder="e.g. Always explain code line-by-line for students..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              Remember This
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="pt-2">
            <span className="text-xs text-gray-400 block mb-1.5">Common preferences:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickAdd(chip)}
                  className="px-2.5 py-1 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-600 transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* 3. List of Active Memories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Active Preferences & Memories ({memories.length})
          </h2>
          <span className="text-xs text-gray-400">
            Automatically included in your prompt context
          </span>
        </div>

        <div className="space-y-2.5">
          {memories.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E7E9EE] rounded-xl p-4 shadow-2xs flex items-start justify-between gap-4 hover:border-gray-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {m.tag}
                  </span>
                  <span className="text-[11px] text-gray-400">{m.createdAt}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed font-normal">
                  {m.text}
                </p>
              </div>

              <button
                onClick={() => handleDelete(m.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Remove memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Privacy Guarantee Note */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-700">Privacy & Control:</strong> These memories are stored locally in your workspace. We never train public models on your personal data without explicit consent.
        </div>
      </div>
    </div>
  );
};
