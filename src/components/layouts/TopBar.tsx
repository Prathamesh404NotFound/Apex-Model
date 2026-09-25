import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Plus, 
  Menu
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface TopBarProps {
  onToggleSidebarMobile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebarMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    activeModel, 
    activeProject, 
    isOffline, 
    setIsOffline, 
    setCommandPaletteOpen,
    createNewChat
  } = useWorkspace();

  // Friendly human page title / breadcrumbs
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/chat')) {
      return activeProject ? activeProject.name : 'Chat';
    }
    if (path.startsWith('/compare')) return 'Compare Models';
    if (path.startsWith('/local')) return 'Local AI & Hardware';
    if (path.startsWith('/code')) return 'Code Lab';
    if (path.startsWith('/models')) return 'AI Models';
    if (path.startsWith('/preferences') || path.startsWith('/taste')) return 'Taste Profile';
    if (path.startsWith('/router')) return 'Model Router';
    if (path.startsWith('/memory')) return 'AI Memory';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/learning') || path.startsWith('/feedback')) return 'Learning & Feedback';
    if (path.startsWith('/providers')) return 'Settings & Providers';
    if (path.startsWith('/admin')) return 'Pilot Analytics';
    if (path.startsWith('/prompts')) return 'Prompt Library';
    return 'Home';
  };

  const handleNewChat = () => {
    const id = createNewChat();
    navigate(`/chat/${id}`);
  };

  return (
    <header className="h-14 border-b border-[#E7E9EE] bg-white px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Zone 1: Mobile menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {getPageTitle()}
          </span>
          {activeProject && location.pathname.startsWith('/chat') && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              Project
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Search Affordance */}
      <div className="hidden sm:flex items-center">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 bg-[#F7F8FA] hover:bg-[#F1F3F7] border border-[#E7E9EE] rounded-lg text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer w-64 md:w-72 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs">Search or type a command...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-[#E7E9EE] rounded text-gray-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Status */}
      <div className="flex items-center gap-2">
        {/* Offline / Cloud Status Badge */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          title={isOffline ? 'Offline mode enabled' : 'Connected to cloud frontier models'}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
            isOffline
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {isOffline ? <WifiOff className="w-3 h-3 text-amber-600" /> : <Wifi className="w-3 h-3 text-emerald-600" />}
          <span className="hidden md:inline font-medium">{isOffline ? 'Offline Mode' : 'Cloud Online'}</span>
        </button>

        {/* Active Model Indicator */}
        <button
          onClick={() => navigate('/models')}
          title="Change active model"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-[#E7E9EE] bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[120px] font-medium">{activeModel.displayName}</span>
        </button>

        {/* Primary Action: New Chat */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
