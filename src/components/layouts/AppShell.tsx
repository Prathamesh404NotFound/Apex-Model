import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Sparkles, 
  FolderGit2, 
  Code2, 
  Bookmark, 
  GitCompare, 
  Server, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { TopBar } from './TopBar';
import { CommandPalette } from '../common/CommandPalette';
import { QuantizationModal } from '../common/QuantizationModal';
import { WebsiteEvaluatorModal } from '../common/WebsiteEvaluatorModal';
import { ToastContainer } from '../common/ToastContainer';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const { localRuntime, isOffline, createNewChat } = useWorkspace();
  const navigate = useNavigate();

  // Primary navigation (6 simple essential items)
  const primaryNav = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
    { to: '/models', label: 'Models', icon: Sparkles },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/code', label: 'Code', icon: Code2 },
    { to: '/memory', label: 'Memory', icon: Bookmark },
  ];

  // Secondary items tucked neatly inside "More"
  const secondaryNav = [
    { to: '/compare', label: 'Compare', icon: GitCompare },
    { to: '/local', label: 'Local AI', icon: Server },
    { to: '/prompts', label: 'Prompts', icon: BookOpen },
    { to: '/learning', label: 'Learning', icon: GraduationCap },
    { to: '/preferences', label: 'My Preferences', icon: Sliders },
    { to: '/providers', label: 'Settings', icon: Settings },
  ];

  const handleNewChat = () => {
    const id = createNewChat();
    navigate(`/chat/${id}`);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F8FA] text-[#111827]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col border-r border-[#E7E9EE] bg-white transition-all duration-200 select-none ${
          collapsed ? 'w-16' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#E7E9EE] shrink-0">
          <div 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-blue-700 transition-colors">
              <span className="font-semibold text-xs text-white tracking-tight">AI</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-gray-900 leading-none">
                  Apex
                </span>
                <span className="text-[10px] text-gray-500 font-normal leading-tight mt-0.5">
                  AI Workspace
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex text-gray-400 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action: New Chat */}
        <div className="p-3 pb-1">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer ${
              collapsed ? 'px-0' : ''
            }`}
            title="Start new conversation"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-1">
          {/* Primary items */}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          {/* More Section (Collapsible) */}
          <div className="pt-2">
            {!collapsed ? (
              <div>
                <button
                  onClick={() => setMoreExpanded(!moreExpanded)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                >
                  <span>More tools</span>
                  {moreExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {moreExpanded && (
                  <div className="mt-1 space-y-0.5 pl-1 border-l-2 border-gray-100 ml-2">
                    {secondaryNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`
                          }
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1 pt-2 border-t border-gray-100">
                {secondaryNav.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-center p-2 rounded-lg text-xs transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Profile & Status */}
        <div className="p-3 border-t border-[#E7E9EE] bg-white shrink-0 space-y-2.5">
          {/* Subtle Local runtime status */}
          {!collapsed ? (
            <div className="px-2 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E7E9EE] text-[11px] flex items-center justify-between text-gray-600">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate text-gray-700 font-medium">{localRuntime.runtimeName}</span>
              </div>
              <span className="text-[10px] text-gray-500 shrink-0">
                {isOffline ? 'Offline' : 'Connected'}
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Runtime ready" />
            </div>
          )}

          {/* User Profile */}
          <div 
            onClick={() => navigate('/preferences')} 
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
              PJ
            </div>
            {!collapsed && (
              <div className="overflow-hidden leading-tight flex-1">
                <div className="text-xs font-semibold text-gray-900 truncate">Prathamesh</div>
                <div className="text-[11px] text-gray-500 truncate">Student & Researcher</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebarMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <QuantizationModal />
      <WebsiteEvaluatorModal />
      <ToastContainer />
    </div>
  );
};
