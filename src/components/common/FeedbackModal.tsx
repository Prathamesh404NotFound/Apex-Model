import React, { useState } from 'react';
import { X, ShieldCheck, Check, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface FeedbackModalProps {
  messageId: string;
  isOpen: boolean;
  onClose: () => void;
  initialSentiment?: 'positive' | 'negative';
}

const IMPROVEMENT_OPTIONS = [
  'Too verbose',
  'Too generic',
  'Code was incorrect',
  'Poor reasoning',
  'Missed instructions',
  'Too formal',
  'Too casual',
  'Wrong assumptions',
  'Visual design could be better',
  'Needs more depth'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  messageId,
  isOpen,
  onClose,
  initialSentiment = 'negative',
}) => {
  const { submitFeedback } = useWorkspace();

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [alternative, setAlternative] = useState('');
  const [preferredVersion, setPreferredVersion] = useState('');
  const [privacyScope, setPrivacyScope] = useState<'private' | 'project' | 'anonymous_shared'>('anonymous_shared');
  const [sentiment, setSentiment] = useState<'positive' | 'negative'>(initialSentiment);

  if (!isOpen) return null;

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(messageId, {
      sentiment,
      reasons: selectedReasons,
      suggestedAlternative: alternative.trim() || undefined,
      preferredVersion: preferredVersion.trim() || undefined,
      privacyScope,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E7E9EE] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {sentiment === 'positive' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {sentiment === 'positive' ? 'What went well?' : 'How can the AI improve?'}
              </h2>
              <p className="text-xs text-gray-500">
                Helps calibrate future responses to match your preference.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Reasons Chips */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Select reasons (optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {IMPROVEMENT_OPTIONS.map((reason) => {
                const active = selectedReasons.includes(reason);
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => toggleReason(reason)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          {/* How should it have answered */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              How should the AI have answered instead?
            </label>
            <textarea
              rows={2}
              value={alternative}
              onChange={(e) => setAlternative(e.target.value)}
              placeholder="e.g. Provide a concise 3-line summary before the code..."
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Privacy Scope */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 font-medium text-gray-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy & Learning Scope</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Your feedback is used locally to refine your Personal Taste Profile.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs"
            >
              Save Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
