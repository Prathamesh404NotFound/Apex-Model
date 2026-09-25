import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  PenTool, 
  Code2, 
  Search, 
  BarChart2, 
  Palette, 
  MessageSquare, 
  FolderGit2, 
  Send,
  Zap,
  HardDrive
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState('');
  const { 
    projects, 
    chats, 
    createNewChat, 
    setActiveChatId, 
    setActiveModelId,
    activeModel
  } = useWorkspace();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = promptInput.trim();
    const chatId = createNewChat();
    if (query) {
      // Find the chat and add the user message
      const stored = localStorage.getItem('apex_chats');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const current = list.find((c: any) => c.id === chatId);
          if (current) {
            current.messages.push({
              id: 'msg-' + Date.now(),
              role: 'user',
              content: query,
              timestamp: Date.now()
            });
            current.title = query.slice(0, 32) + (query.length > 32 ? '...' : '');
            localStorage.setItem('apex_chats', JSON.stringify(list));
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    navigate(`/chat/${chatId}`);
  };

  const quickActions = [
    { label: 'Write', icon: PenTool, prompt: 'Draft a clear, well-structured essay or article about ' },
    { label: 'Code', icon: Code2, prompt: 'Help me design and write code for ' },
    { label: 'Research', icon: Search, prompt: 'Conduct a thorough literature and technical review of ' },
    { label: 'Analyze', icon: BarChart2, prompt: 'Analyze and break down this dataset or concept: ' },
    { label: 'Create', icon: Palette, prompt: 'Brainstorm creative concepts and ideas for ' },
  ];

  const handleQuickAction = (actionPrompt: string) => {
    setPromptInput(actionPrompt);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
      {/* 1. Welcoming Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
          {getGreeting()}, Prathamesh
        </h1>
        <p className="text-base text-gray-500 font-normal">
          What would you like to work on today?
        </p>
      </div>

      {/* 2. Large Central Input Box */}
      <div className="space-y-4">
        <form
          onSubmit={handleStartPrompt}
          className="relative bg-white border border-[#E7E9EE] hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 rounded-2xl shadow-sm transition-all p-3"
        >
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleStartPrompt();
              }
            }}
            placeholder="Ask anything or describe what you want to build..."
            rows={3}
            className="w-full bg-transparent resize-none border-0 focus:outline-hidden text-sm md:text-base text-gray-900 placeholder:text-gray-400 p-2"
          />

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">
                Using <strong className="text-gray-700 font-medium">{activeModel.displayName}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-[#E7E9EE] text-xs font-medium text-gray-700 shadow-2xs hover:border-gray-300 transition-all cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-blue-600" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Three Clean Sections: Recent Chats, Recent Projects, Recommended Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Section A: Recent Chats */}
        <div className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">Recent Chats</h2>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {chats.slice(0, 3).map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  navigate(`/chat/${chat.id}`);
                }}
                className="py-2.5 px-2 rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="space-y-0.5 overflow-hidden pr-3">
                  <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate transition-colors">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{chat.messages.length} messages</span>
                    <span>·</span>
                    <span>{new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 shrink-0 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Recent Projects */}
        <div className="bg-white border border-[#E7E9EE] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-900">Projects</h2>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 2).map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate('/projects')}
                className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {proj.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {proj.fileIds?.length || 4} files
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section C: Recommended Model */}
      <div className="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Recommended Model For You</h2>
          </div>
          <button
            onClick={() => navigate('/models')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore all models</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Frontier Cloud Card */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Gemini 3.1 Pro</div>
                  <div className="text-[11px] text-gray-500">Google DeepMind</div>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                Deep Thinking
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Best for complex problem solving, research analysis, and large multi-file coding projects.
            </p>
            <button
              onClick={() => {
                setActiveModelId('gemini-3.1-pro-preview');
                const id = createNewChat();
                navigate(`/chat/${id}`);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              Start Chat with Gemini
            </button>
          </div>

          {/* Local Offline Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">gpt-oss-20b</div>
                  <div className="text-[11px] text-gray-500">Local via Ollama</div>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                100% Offline
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Runs directly on your computer. Private, instant responses with zero data leaving your device.
            </p>
            <button
              onClick={() => {
                setActiveModelId('gpt-oss-20b');
                const id = createNewChat();
                navigate(`/chat/${id}`);
              }}
              className="w-full py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              Start Local Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
