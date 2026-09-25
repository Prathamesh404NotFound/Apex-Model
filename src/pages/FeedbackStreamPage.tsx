import React, { useState, useEffect } from 'react';
import { 
  ThumbsDown, 
  ThumbsUp, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface FeedbackRecord {
  id: string;
  chatTitle?: string;
  messageId: string;
  modelId: string;
  provider: string;
  rating?: 'positive' | 'negative';
  reasons: string[];
  comment?: string;
  originalPrompt?: string;
  originalResponse?: string;
  chosenResponse?: string;
  rejectedResponse?: string;
  preferenceScope: string;
  extractedPreferences?: string[];
  createdAt: string;
}

export const FeedbackStreamPage: React.FC = () => {
  const { chats } = useWorkspace();
  const [serverFeedback, setServerFeedback] = useState<FeedbackRecord[]>([]);
  const [filterRating, setFilterRating] = useState<'All' | 'positive' | 'negative'>('All');

  useEffect(() => {
    fetch('/api/adaptive/feedback')
      .then((res) => res.json())
      .then((data) => {
        if (data.feedback && Array.isArray(data.feedback)) {
          setServerFeedback(data.feedback);
        }
      })
      .catch(console.error);
  }, []);

  // Merge with local chat feedback if any
  const combinedFeedback: FeedbackRecord[] = [...serverFeedback];
  chats.forEach((chat) => {
    chat.messages.forEach((msg) => {
      if (msg.feedback && !combinedFeedback.some((f) => f.messageId === msg.id)) {
        combinedFeedback.push({
          id: msg.feedback.id,
          chatTitle: chat.title,
          messageId: msg.id,
          modelId: msg.modelName || 'Active Model',
          provider: 'Connected Provider',
          rating: msg.feedback.sentiment,
          reasons: msg.feedback.reasons,
          chosenResponse: msg.feedback.preferredVersion || msg.feedback.suggestedAlternative,
          rejectedResponse: msg.feedback.sentiment === 'negative' ? msg.content : undefined,
          preferenceScope: msg.feedback.privacyScope,
          createdAt: msg.feedback.timestamp,
        });
      }
    });
  });

  const filtered = combinedFeedback.filter(
    (item) => filterRating === 'All' || item.rating === filterRating
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Feedback Stream & Corrections
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            All critiques, ratings, and edits submitted across your interactions. Each feedback event immediately updates your online preferences and feeds offline training candidate pairs.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto border border-gray-200">
          {(['All', 'positive', 'negative'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterRating === r ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-600'
              }`}
            >
              {r === 'All' ? 'All Events' : r === 'positive' ? 'Positive Upvotes' : 'Critiques / Edits'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Feedback Items */}
      {filtered.length === 0 ? (
        <div className="p-12 border border-[#E7E9EE] bg-white rounded-2xl text-center space-y-3 text-xs text-gray-500 shadow-2xs">
          <ThumbsDown className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-gray-700 font-medium">No feedback events recorded yet.</p>
          <p className="text-gray-400 max-w-md mx-auto">
            Use the thumbs-up, thumbs-down, or "Edit & Teach" controls on assistant responses in Chat to calibrate model behavior.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isNegative = item.rating === 'negative';

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-3 transition-colors hover:border-gray-300"
              >
                {/* Header row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isNegative
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isNegative ? <ThumbsDown className="w-3 h-3" /> : <ThumbsUp className="w-3 h-3" />}
                      <span>{isNegative ? 'Critique & Edit' : 'Positive Exemplar'}</span>
                    </span>

                    <span className="text-gray-400">Model: {item.modelId}</span>
                  </div>

                  <span className="text-gray-400 text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Reasons badges */}
                {item.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.reasons.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-[11px] font-medium"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Original prompt */}
                {item.originalPrompt && (
                  <div className="text-xs space-y-1">
                    <span className="text-gray-400 font-medium">Prompt:</span>
                    <p className="text-gray-800 font-medium">{item.originalPrompt}</p>
                  </div>
                )}

                {/* Chosen vs Rejected */}
                {(item.chosenResponse || item.rejectedResponse) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {item.chosenResponse && (
                      <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                          Preferred Target Output (Pairwise Winner):
                        </span>
                        <p className="text-gray-800 line-clamp-3 leading-relaxed whitespace-pre-wrap">{item.chosenResponse}</p>
                      </div>
                    )}

                    {item.rejectedResponse && (
                      <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-red-800 block">
                          Flagged / Rejected Output:
                        </span>
                        <p className="text-gray-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">{item.rejectedResponse}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer status */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                  <span className="capitalize">Scope: {item.preferenceScope?.replace('_', ' ') || 'User'}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RAG Preference Ingested</span>
                    </span>
                    <span className="text-blue-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DPO Candidate Created</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
