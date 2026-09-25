import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  ThumbsDown, 
  ThumbsUp, 
  FolderGit2, 
  Paperclip,
  Wrench,
  ChevronDown,
  Terminal,
  Settings2,
  HardDrive,
  Cpu,
  X,
  Edit2
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { FriendlyModelSelector } from '../components/common/FriendlyModelSelector';

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { 
    chats, 
    activeChat, 
    setActiveChatId, 
    sendMessage, 
    activeModel, 
    activeProject, 
    isGenerating, 
    addNotification 
  } = useWorkspace();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackModalTarget, setFeedbackModalTarget] = useState<string | null>(null);
  const [feedbackSentiment, setFeedbackSentiment] = useState<'positive' | 'negative'>('negative');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [customInstructions, setCustomInstructions] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync route param with active chat
  useEffect(() => {
    if (id && id !== activeChat?.id) {
      setActiveChatId(id);
    }
  }, [id, activeChat, setActiveChatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isGenerating]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, copyKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(copyKey);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification('Copied to clipboard');
  };

  const openInCodeLab = (code: string) => {
    localStorage.setItem('apex_codelab_active_code', code);
    navigate('/code');
    addNotification('Opened in Code Lab');
  };

  const handleSaveEditMessage = async (msgId: string, originalContent: string) => {
    if (!editContent.trim()) return;
    const currentChat = activeChat || chats[0];
    const msgIdx = currentChat?.messages.findIndex((m) => m.id === msgId) ?? -1;
    const prevUserMsg = msgIdx > 0 ? currentChat?.messages[msgIdx - 1] : undefined;

    if (currentChat) {
      currentChat.messages = currentChat.messages.map((m) =>
        m.id === msgId ? { ...m, content: editContent.trim() } : m
      );
    }

    try {
      await fetch('/api/adaptive/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentChat?.id,
          messageId: msgId,
          modelId: activeModel.id,
          provider: activeModel.provider,
          type: 'edit',
          rating: 'negative',
          originalPrompt: prevUserMsg?.content || 'User prompt',
          originalResponse: originalContent,
          chosenResponse: editContent.trim(),
          rejectedResponse: originalContent,
          reasons: ['Direct user edit and stylistic correction'],
        }),
      });
      addNotification('Correction saved & preference reinforced', 'success');
    } catch (e) {
      console.error(e);
    }
    setEditingMessageId(null);
  };

  const currentChat = activeChat || chats[0];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#F7F8FA]">
      {/* 1. Clean Top Bar */}
      <div className="h-13 px-4 sm:px-6 border-b border-[#E7E9EE] bg-white flex items-center justify-between shrink-0">
        {/* Left: Project & Model */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {activeProject?.name || 'General Workspace'}
            </span>
          </div>

          <span className="text-gray-200">|</span>

          {/* Model Selector Pill Button */}
          <button
            onClick={() => setModelSelectorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E7E9EE] bg-[#F7F8FA] hover:bg-gray-100 hover:border-gray-300 text-xs font-medium text-gray-800 transition-all cursor-pointer shadow-2xs"
          >
            {activeModel.local ? (
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{activeModel.displayName}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
          </button>

          {activeModel.supportsHighThinking && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
              Thinking Mode Active
            </span>
          )}
        </div>

        {/* Right: Small settings button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              moreOptionsOpen
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-[#E7E9EE] text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Chat Options & Controls"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden md:inline text-xs">Options</span>
          </button>
        </div>
      </div>

      {/* Advanced "More options" sliding panel */}
      {moreOptionsOpen && (
        <div className="border-b border-[#E7E9EE] bg-white p-4 px-6 text-xs text-gray-700 shadow-2xs space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Advanced Chat Options</span>
            <button
              onClick={() => setMoreOptionsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-gray-500 mb-1">Temperature ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Exact & Precise (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Reasoning Pipeline</label>
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800">
                {activeModel.supportsHighThinking ? 'Gemini 3.1 Pro (ThinkingLevel.HIGH)' : 'Standard Context Pass'}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Project Rules</label>
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 truncate">
                {activeProject?.rules.length || 0} active rules applied
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {(!currentChat?.messages || currentChat.messages.length === 0) ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">
                How can I help you today?
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Ask a question, analyze documents, write code, or brainstorm ideas with {activeModel.displayName}.
              </p>
            </div>
            <div className="pt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => sendMessage('Write a clean, responsive card component in React and Tailwind CSS.')}
                className="px-3.5 py-2 rounded-full text-xs bg-white hover:bg-gray-50 border border-[#E7E9EE] text-gray-700 shadow-2xs transition-colors cursor-pointer"
              >
                "Write a responsive card component in React"
              </button>
              <button
                onClick={() => sendMessage('Explain the core difference between SFT, DPO, and RLHF in simple terms for a student.')}
                className="px-3.5 py-2 rounded-full text-xs bg-white hover:bg-gray-50 border border-[#E7E9EE] text-gray-700 shadow-2xs transition-colors cursor-pointer"
              >
                "Explain SFT, DPO, and RLHF simply"
              </button>
            </div>
          </div>
        ) : (
          currentChat.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Author Label */}
                <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                  <span className={isUser ? 'text-gray-500 font-medium' : 'text-gray-900 font-medium'}>
                    {isUser ? 'You' : (msg.modelName || activeModel.displayName)}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Body */}
                <div
                  className={`w-full text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-2xl p-4 max-w-2xl shadow-xs'
                      : 'bg-white border border-[#E7E9EE] text-gray-900 rounded-2xl p-5 shadow-2xs'
                  }`}
                >
                  {/* Thinking details if available */}
                  {msg.thinkingProcess && (
                    <details className="mb-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-gray-600">
                      <summary className="cursor-pointer text-blue-700 font-medium select-none flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Reasoning & Thought Process</span>
                      </summary>
                      <p className="mt-2 text-gray-700 leading-relaxed pt-2 border-t border-blue-100/60 whitespace-pre-wrap">
                        {msg.thinkingProcess}
                      </p>
                    </details>
                  )}

                  {/* Render content or direct editor */}
                  {editingMessageId === msg.id ? (
                    <div className="space-y-3 pt-1">
                      <div className="text-[11px] font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center justify-between">
                        <span>Direct Response Alignment: Edit this output to teach the model your exact preference.</span>
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                        rows={7}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEditMessage(msg.id, msg.content)}
                          className="px-3.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer"
                        >
                          Save & Align AI
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 whitespace-pre-wrap">
                      {msg.content.split('```').map((part, idx) => {
                        if (idx % 2 === 1) {
                          const firstLineEnd = part.indexOf('\n');
                          const language = firstLineEnd !== -1 ? part.slice(0, firstLineEnd).trim() : 'code';
                          const codeBody = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1) : part;

                          return (
                            <div
                              key={idx}
                              className="my-3 rounded-xl border border-gray-200 bg-[#1E2430] text-white font-mono text-xs overflow-hidden shadow-xs"
                            >
                              <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700 bg-[#171B24] text-[11px] text-gray-400">
                                <span className="uppercase font-medium text-gray-300">{language || 'code'}</span>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => openInCodeLab(codeBody)}
                                    className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Terminal className="w-3 h-3 text-blue-400" />
                                    <span>Open in Code Lab</span>
                                  </button>
                                  <span>|</span>
                                  <button
                                    onClick={() => handleCopy(codeBody, `${msg.id}-${idx}`)}
                                    className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    {copiedId === `${msg.id}-${idx}` ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3.5 overflow-x-auto font-mono text-gray-100 leading-relaxed">
                                <code>{codeBody}</code>
                              </pre>
                            </div>
                          );
                        }
                        return <div key={idx}>{part}</div>;
                      })}
                    </div>
                  )}

                  {/* Assistant Feedback & Copy Controls */}
                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Copy answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditContent(msg.content);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Edit response to teach preference"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit & Teach</span>
                        </button>
                      </div>

                      {/* Feedback buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setFeedbackSentiment('positive');
                            setFeedbackModalTarget(msg.id);
                          }}
                          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${
                            msg.feedback?.sentiment === 'positive' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-700'
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackSentiment('negative');
                            setFeedbackModalTarget(msg.id);
                          }}
                          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${
                            msg.feedback?.sentiment === 'negative' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-700'
                          }`}
                          title="Not what I wanted / Teach taste engine"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Spinner */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E7E9EE] text-xs text-gray-600 shadow-2xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>{activeModel.displayName} is writing a response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Large Prompt Box */}
      <div className="p-4 sm:p-6 bg-white border-t border-[#E7E9EE] shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-2">
          <div className="relative border border-[#E7E9EE] hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 rounded-2xl bg-white shadow-xs transition-all">
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activeModel.displayName}...`}
              className="w-full bg-transparent p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden resize-none"
            />

            {/* Inside prompt box actions: Attach, Model, Tools, Send */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
              {/* Left controls: Attach, Model, Tools */}
              <div className="flex items-center gap-1.5">
                {/* Attach Button */}
                <button
                  type="button"
                  onClick={() => setAttachModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Attach file or project context"
                >
                  <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden sm:inline">Attach</span>
                </button>

                {/* Model Button */}
                <button
                  type="button"
                  onClick={() => setModelSelectorOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Change model"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">{activeModel.displayName}</span>
                </button>

                {/* Tools Button */}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/compare');
                    addNotification('Comparing active prompt across models');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Tools: Multi-model compare, web search, code executor"
                >
                  <Wrench className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden sm:inline">Tools</span>
                </button>
              </div>

              {/* Right: Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Attach Modal */}
      {attachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Attach to Conversation</h3>
              <button onClick={() => setAttachModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Attach files from your computer or link documents from your active project knowledge base.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setAttachModalOpen(false);
                  navigate('/files');
                }}
                className="w-full p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-gray-900">Project Knowledge Files</div>
                  <div className="text-gray-500 text-[11px]">Attach indexed documents from /files</div>
                </div>
                <FolderGit2 className="w-4 h-4 text-blue-600" />
              </button>

              <label className="w-full p-3 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 flex flex-col items-center justify-center cursor-pointer">
                <Paperclip className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs font-medium text-gray-700">Upload PDF, TXT, or Code</span>
                <span className="text-[10px] text-gray-400">Up to 25MB</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      addNotification(`Attached ${file.name}`);
                      setAttachModalOpen(false);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Friendly Model Selector Popover */}
      <FriendlyModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
      />

      {/* Multi-Dimensional Feedback Modal */}
      {feedbackModalTarget && (
        <FeedbackModal
          messageId={feedbackModalTarget}
          isOpen={true}
          initialSentiment={feedbackSentiment}
          onClose={() => setFeedbackModalTarget(null)}
        />
      )}
    </div>
  );
};
