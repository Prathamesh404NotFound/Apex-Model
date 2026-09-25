import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Plus, 
  Files, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    addProject, 
    createNewChat,
    addNotification 
  } = useWorkspace();

  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [ruleInput, setRuleInput] = useState('');
  const [ruleList, setRuleList] = useState<string[]>([
    'Keep responses direct and structured',
    'Write clean, typed TypeScript and React code'
  ]);

  const handleAddRule = () => {
    if (!ruleInput.trim()) return;
    setRuleList([...ruleList, ruleInput.trim()]);
    setRuleInput('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    addProject(newProjectName.trim(), newProjectDesc.trim(), ruleList);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
    addNotification(`Project "${newProjectName.trim()}" created`);
  };

  const handleStartChatInProject = (projId: string) => {
    setActiveProjectId(projId);
    const chatId = createNewChat(projId);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Projects
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize chats, reference files, and custom instructions in dedicated project spaces.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* 2. Projects Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          return (
            <div
              key={proj.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isActive ? 'border-blue-500 ring-2 ring-blue-50' : 'border-[#E7E9EE] hover:border-gray-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  {isActive && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'General project workspace and documents'}
                  </p>
                </div>

                {/* Rules preview chips */}
                {proj.rules && proj.rules.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] text-gray-400">Rules applied:</span>
                    <div className="mt-1 space-y-1">
                      {proj.rules.slice(0, 2).map((r, i) => (
                        <div key={i} className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">{r.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meta info & Action */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Files className="w-3.5 h-3.5" />
                    {proj.fileIds?.length || 3} files
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                  </span>
                </div>

                <button
                  onClick={() => handleStartChatInProject(proj.id)}
                  className="w-full py-2 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Project Chat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Computer Science Thesis or Mobile App"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="What is the goal of this project?"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project Instructions & Rules
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    placeholder="e.g., Always use Python 3.12 syntax"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-700"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-2 space-y-1">
                  {ruleList.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-gray-50 text-xs text-gray-600">
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() => setRuleList(ruleList.filter((_, idx) => idx !== i))}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
