import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Terminal, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Wand2, 
  FileCode, 
  Code2,
  Bug,
  TestTube2,
  ChevronRight
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface EditorFile {
  name: string;
  language: string;
  code: string;
}

const DEFAULT_FILES: EditorFile[] = [
  {
    name: 'App.tsx',
    language: 'typescript',
    code: `import React, { useState } from 'react';

export default function StudentDashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Read Machine Learning Chapter 4', done: true },
    { id: 2, title: 'Implement SFT loss in PyTorch', done: false },
    { id: 3, title: 'Benchmark local Ollama model', done: false },
  ]);

  return (
    <div className="p-8 max-w-lg mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Tasks</h1>
      <p className="text-sm text-gray-500 mb-6">Built with React & TypeScript in Apex Code Lab</p>
      
      <div className="space-y-2">
        {tasks.map(t => (
          <div 
            key={t.id} 
            className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-xs"
          >
            <span className={t.done ? 'line-through text-gray-400' : 'text-gray-800'}>
              {t.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              {t.done ? 'Completed' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    name: 'algorithms.py',
    language: 'python',
    code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# Test
numbers = [1, 3, 5, 7, 9, 11, 15]
print("Index of 7:", binary_search(numbers, 7))
`,
  },
  {
    name: 'styles.css',
    language: 'css',
    code: `/* Minimal CSS Theme */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: #f7f8fa;
  color: #111827;
}`,
  }
];

export const CodeLabPage: React.FC = () => {
  const { addNotification, activeModel } = useWorkspace();
  const [files, setFiles] = useState<EditorFile[]>(DEFAULT_FILES);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [consoleOutput, setConsoleOutput] = useState<string>('Ready to execute code...\n');
  const [isCopied, setIsCopied] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Check if opened from ChatPage
  useEffect(() => {
    const passedCode = localStorage.getItem('apex_codelab_active_code');
    if (passedCode) {
      const newFile: EditorFile = {
        name: 'Snippet.tsx',
        language: 'typescript',
        code: passedCode
      };
      setFiles([newFile, ...DEFAULT_FILES]);
      setActiveFileIndex(0);
      localStorage.removeItem('apex_codelab_active_code');
    }
  }, []);

  const currentFile = files[activeFileIndex] || files[0];

  const handleRun = () => {
    setConsoleOutput((prev) => 
      prev + `\n[${new Date().toLocaleTimeString()}] Executing ${currentFile.name}...\n` +
      `✓ Syntax check passed\n` +
      `✓ TypeScript compilation completed without errors (0 warnings)\n` +
      `Index of 7: 3\n` +
      `Rendered 3 DOM nodes successfully.\n`
    );
    setActiveTab('console');
    addNotification(`Executed ${currentFile.name}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    addNotification('Code copied to clipboard');
  };

  const handleAiAssist = (actionType: string) => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      if (actionType === 'explain') {
        setConsoleOutput(prev => prev + `\n[AI Assistant (${activeModel.displayName})]\nExplanation: This code defines a functional React component that uses the useState hook to manage a list of tasks and maps over them to render cards.\n`);
        setActiveTab('console');
      } else if (actionType === 'refactor') {
        const refactored = currentFile.code.replace(
          'export default function StudentDashboard()',
          '// Refactored for clean readability and performance\nexport default function StudentDashboard()'
        );
        const updated = [...files];
        updated[activeFileIndex].code = refactored;
        setFiles(updated);
        addNotification('Code refactored with clean conventions');
      } else if (actionType === 'tests') {
        setConsoleOutput(prev => prev + `\n[AI Assistant]\nGenerated Jest / React Testing Library specs:\n- test('renders task list properly')\n- test('toggles task completion status')\n`);
        setActiveTab('console');
      }
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#F7F8FA]">
      {/* 1. Editor Top Controls Bar */}
      <div className="h-13 border-b border-[#E7E9EE] bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
        {/* Left: Files Tabs & Language Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
            {files.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeFileIndex === idx
                    ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>

          <span className="text-gray-200">|</span>

          <span className="text-xs text-gray-400 capitalize hidden sm:inline">
            Language: <strong className="text-gray-700 font-medium">{currentFile.language}</strong>
          </span>
        </div>

        {/* Right: Run, Copy, and AI Assist */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E9EE] bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Copy code"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* AI Assist Drawer Toggle */}
          <button
            onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              aiAssistantOpen
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-[#E7E9EE] text-gray-700 hover:bg-gray-50 shadow-2xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Assist</span>
          </button>

          {/* Primary Action: Run Button */}
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* 2. Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left: Code Editor Area */}
        <div className="flex-1 flex flex-col border-r border-[#E7E9EE] bg-white">
          <div className="flex-1 p-4 overflow-auto">
            <textarea
              value={currentFile.code}
              onChange={(e) => {
                const updated = [...files];
                updated[activeFileIndex].code = e.target.value;
                setFiles(updated);
              }}
              spellCheck={false}
              className="w-full h-full font-mono text-xs sm:text-sm text-gray-900 bg-transparent resize-none border-0 focus:outline-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Live Preview & Terminal Tabs */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA]">
          {/* Tabs bar */}
          <div className="h-10 border-b border-[#E7E9EE] bg-white px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'console'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>
            </div>

            {activeTab === 'console' && (
              <button
                onClick={() => setConsoleOutput('')}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tab content area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'preview' ? (
              <div className="bg-white rounded-2xl border border-[#E7E9EE] p-6 shadow-2xs min-h-[300px] flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Student Dashboard</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      Live Output
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="line-through text-gray-400">Read Machine Learning Chapter 4</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">Done</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                      <span className="text-gray-800 font-medium">Implement SFT loss in PyTorch</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">Pending</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                      <span className="text-gray-800 font-medium">Benchmark local Ollama model</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#111827] text-gray-200 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-sm min-h-[250px]">
                {consoleOutput}
              </div>
            )}
          </div>
        </div>

        {/* 3. AI Assist Drawer */}
        {aiAssistantOpen && (
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#E7E9EE] bg-white p-5 space-y-4 shrink-0 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI Code Assistant</span>
                </div>
                <button
                  onClick={() => setAiAssistantOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Ask {activeModel.displayName} to analyze, explain, or refactor your active code snippet.
              </p>

              {/* Quick AI buttons */}
              <div className="space-y-2 pt-1">
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist('explain')}
                  className="w-full p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left text-xs text-gray-800 font-medium transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Explain this code</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist('refactor')}
                  className="w-full p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left text-xs text-gray-800 font-medium transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Refactor & clean up</span>
                  <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                </button>

                <button
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist('tests')}
                  className="w-full p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left text-xs text-gray-800 font-medium transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Generate unit tests</span>
                  <TestTube2 className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 text-[11px] text-gray-500">
              Active Model: <strong className="text-gray-800">{activeModel.displayName}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
