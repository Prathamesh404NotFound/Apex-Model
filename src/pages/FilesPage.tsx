import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Files, 
  Upload, 
  Trash2, 
  FileText, 
  Search, 
  MessageSquare, 
  Eye, 
  X,
  FileCode
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { INITIAL_FILES } from '../data/initialData';
import { WorkspaceFile } from '../types/workspace';

export const FilesPage: React.FC = () => {
  const navigate = useNavigate();
  const { createNewChat, sendMessage, addNotification } = useWorkspace();
  const [files, setFiles] = useState<WorkspaceFile[]>(INITIAL_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<WorkspaceFile | null>(null);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAskAboutFile = (file: WorkspaceFile) => {
    const chatId = createNewChat();
    // Save to storage
    const stored = localStorage.getItem('apex_chats');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        const current = list.find((c: any) => c.id === chatId);
        if (current) {
          current.messages.push({
            id: 'msg-' + Date.now(),
            role: 'user',
            content: `Please review and summarize the contents of "${file.name}":\n\n\`\`\`\n${file.content}\n\`\`\``,
            timestamp: Date.now()
          });
          current.title = `Review: ${file.name}`;
          localStorage.setItem('apex_chats', JSON.stringify(list));
        }
      } catch (err) {
        console.error(err);
      }
    }
    navigate(`/chat/${chatId}`);
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    addNotification('File removed from workspace');
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const uploaded = fileList[0];

    const newF: WorkspaceFile = {
      id: 'file-' + Date.now(),
      name: uploaded.name,
      size: uploaded.size,
      extension: uploaded.name.split('.').pop() || 'txt',
      uploadedAt: new Date().toISOString(),
      content: `[Content extracted from ${uploaded.name}]`,
      scope: 'project',
    };

    setFiles([newF, ...files]);
    addNotification(`Uploaded ${uploaded.name}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E9EE] gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Files & Knowledge Base
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload notes, research papers, and code snippets to give your AI models context.
          </p>
        </div>

        <label className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
          <input type="file" className="hidden" onChange={handleSimulateUpload} />
        </label>
      </div>

      {/* 2. Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E9EE] rounded-xl text-sm focus:border-blue-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* 3. Files List */}
      <div className="bg-white border border-[#E7E9EE] rounded-2xl shadow-2xs overflow-hidden divide-y divide-gray-100">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {file.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPreviewFile(file)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              <button
                onClick={() => handleAskAboutFile(file)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">{previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-4 bg-gray-50 rounded-xl text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200">
              {previewFile.content}
            </pre>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
