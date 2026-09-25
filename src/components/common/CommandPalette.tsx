import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  Sparkles, 
  Code2, 
  GitCompare, 
  Bookmark, 
  FolderGit2, 
  Server, 
  BookOpen, 
  Settings, 
  X,
  ArrowRight
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const CommandPalette: React.FC = () => {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    createNewChat, 
    models, 
    setActiveModelId,
    addNotification
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    {
      id: 'new-chat',
      title: 'Start New Chat',
      category: 'Workspace',
      icon: MessageSquare,
      run: () => {
        const id = createNewChat();
        navigate(`/chat/${id}`);
      },
    },
    {
      id: 'compare-arena',
      title: 'Compare Models Side-by-Side',
      category: 'Intelligence',
      icon: GitCompare,
      run: () => navigate('/compare'),
    },
    {
      id: 'models',
      title: 'Explore AI Models Catalog',
      category: 'Intelligence',
      icon: Sparkles,
      run: () => navigate('/models'),
    },
    {
      id: 'code-lab',
      title: 'Open Code Lab Workspace',
      category: 'Build',
      icon: Code2,
      run: () => navigate('/code'),
    },
    {
      id: 'local-ai',
      title: 'Local AI & Hardware Checker',
      category: 'Local',
      icon: Server,
      run: () => navigate('/local'),
    },
    {
      id: 'projects',
      title: 'View Projects',
      category: 'Workspace',
      icon: FolderGit2,
      run: () => navigate('/projects'),
    },
    {
      id: 'memory',
      title: 'AI Memory & Preferences',
      category: 'Learning',
      icon: Bookmark,
      run: () => navigate('/memory'),
    },
    {
      id: 'prompts',
      title: 'Prompt Library',
      category: 'Build',
      icon: BookOpen,
      run: () => navigate('/prompts'),
    },
    {
      id: 'settings',
      title: 'Settings & Providers',
      category: 'System',
      icon: Settings,
      run: () => navigate('/providers'),
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-xs"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E7E9EE] overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-white gap-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500">
            ESC
          </kbd>
        </div>

        {/* Action Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No matching commands found
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.run();
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-blue-50 text-gray-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium">{item.title}</span>
                  </div>

                  <span className="text-[11px] text-gray-400 group-hover:text-blue-500 flex items-center gap-1">
                    <span>{item.category}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
