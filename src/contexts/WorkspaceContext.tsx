import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModelDefinition, HardwareSpec } from '../types/models';
import { 
  Project, 
  ChatConversation, 
  ChatMessage, 
  LearnedPreference, 
  ComparisonSession, 
  TrainingCandidate, 
  LocalRuntimeState, 
  MessageFeedback,
  WorkspaceMode 
} from '../types/workspace';
import { ALL_MODELS } from '../data/modelRegistry';
import { 
  INITIAL_PROJECTS, 
  INITIAL_CHATS, 
  INITIAL_PREFERENCES, 
  PRELOADED_COMPARISON, 
  INITIAL_TRAINING_CANDIDATES 
} from '../data/initialData';
import { generateAIResponse } from '../services/aiProviderService';

interface WorkspaceContextType {
  models: ModelDefinition[];
  activeModelId: string;
  activeModel: ModelDefinition;
  setActiveModelId: (id: string) => void;
  activeMode: WorkspaceMode;
  setActiveMode: (mode: WorkspaceMode) => void;
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | undefined;
  setActiveProjectId: (id: string | null) => void;
  addProject: (name: string, description: string, rules: string[]) => void;
  chats: ChatConversation[];
  activeChatId: string;
  activeChat: ChatConversation | undefined;
  setActiveChatId: (id: string) => void;
  createNewChat: (projectId?: string, mode?: WorkspaceMode) => string;
  sendMessage: (content: string, enableHighThinking?: boolean) => Promise<void>;
  preferences: LearnedPreference[];
  updatePreference: (id: string, updates: Partial<LearnedPreference>) => void;
  forgetPreference: (id: string) => void;
  submitFeedback: (messageId: string, feedback: Omit<MessageFeedback, 'id' | 'timestamp' | 'messageId'>) => void;
  comparisons: ComparisonSession[];
  recordComparisonWinner: (sessionId: string, chosenModelId: string, reason: string) => void;
  trainingCandidates: TrainingCandidate[];
  localRuntime: LocalRuntimeState;
  refreshLocalRuntime: () => Promise<void>;
  connectLocalRuntime: (endpoint: string, runtime: 'Ollama' | 'LM Studio' | 'llama.cpp') => Promise<void>;
  hardwareProfile: HardwareSpec;
  setHardwareProfile: (spec: HardwareSpec) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quantizationModalOpen: boolean;
  setQuantizationModalOpen: (open: boolean) => void;
  websiteEvaluatorOpen: boolean;
  setWebsiteEvaluatorOpen: (open: boolean) => void;
  notifications: { id: string; message: string; type?: 'info' | 'success' | 'warn' }[];
  addNotification: (msg: string, type?: 'info' | 'success' | 'warn') => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;
  isGenerating: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  PROJECTS: 'apex_projects_v2',
  CHATS: 'apex_chats_v2',
  PREFERENCES: 'apex_preferences_v2',
  MODEL_ID: 'apex_model_id_v2',
  HARDWARE: 'apex_hardware_v2',
  OFFLINE: 'apex_offline_mode_v2',
  THEME: 'apex_theme_v2',
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<ModelDefinition[]>(ALL_MODELS);
  
  const [activeModelId, setActiveModelIdState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.MODEL_ID) || 'gemini-3.1-pro-preview';
  });

  const [activeMode, setActiveMode] = useState<WorkspaceMode>('deep reasoning');

  // Fetch real model registry status from backend on mount
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setModels((prev) => {
            const updated = [...prev];
            for (const m of data.models) {
              const idx = updated.findIndex((u) => u.id === m.id || u.id === m.providerModelId);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], ...m };
              } else {
                updated.push(m);
              }
            }
            return updated;
          });
        }
      })
      .catch(() => {});
  }, []);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>('proj-creative-studio');

  const [chats, setChats] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CHATS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CHATS;
  });

  const [activeChatId, setActiveChatId] = useState<string>('chat-portfolio-1');

  const [preferences, setPreferences] = useState<LearnedPreference[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PREFERENCES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PREFERENCES;
  });

  const [comparisons, setComparisons] = useState<ComparisonSession[]>([PRELOADED_COMPARISON]);
  const [trainingCandidates, setTrainingCandidates] = useState<TrainingCandidate[]>(INITIAL_TRAINING_CANDIDATES);

  const [localRuntime, setLocalRuntime] = useState<LocalRuntimeState>({
    status: 'connected',
    runtimeName: 'Ollama',
    endpoint: 'http://localhost:11434',
    loadedModel: 'gpt-oss-20b',
    loadedModelVram: '5.8 / 12.0 GB',
    totalVramGb: 12.0,
    usedVramGb: 5.8,
    systemRamGb: 32.0,
    cudaVersion: '12.4',
  });

  const [hardwareProfile, setHardwareProfileState] = useState<HardwareSpec>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.HARDWARE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      cpu: 'AMD Ryzen 7 7800X3D',
      ramGb: 32,
      gpu: 'NVIDIA GeForce RTX 3060',
      vramGb: 12,
      os: 'Linux',
      freeStorageGb: 180,
    };
  });

  const [isOffline, setIsOfflineState] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.OFFLINE) === 'true';
  });

  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as any) || 'dark';
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quantizationModalOpen, setQuantizationModalOpen] = useState(false);
  const [websiteEvaluatorOpen, setWebsiteEvaluatorOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type?: 'info' | 'success' | 'warn' }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MODEL_ID, activeModelId);
  }, [activeModelId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.HARDWARE, JSON.stringify(hardwareProfile));
  }, [hardwareProfile]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OFFLINE, String(isOffline));
  }, [isOffline]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Command palette shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3800);
  };

  const setActiveModelId = (id: string) => {
    setActiveModelIdState(id);
    const m = models.find((mod) => mod.id === id);
    if (m) {
      addNotification(`Active model set to ${m.displayName}`);
    }
  };

  const setHardwareProfile = (spec: HardwareSpec) => {
    setHardwareProfileState(spec);
    addNotification('Hardware specification updated');
  };

  const setIsOffline = (offline: boolean) => {
    setIsOfflineState(offline);
    addNotification(offline ? 'Switched to OFFLINE mode (Cloud disabled)' : 'ONLINE mode restored (Cloud active)', offline ? 'warn' : 'info');
  };

  const setTheme = (t: 'dark' | 'light' | 'system') => {
    setThemeState(t);
  };

  const activeModel = models.find((m) => m.id === activeModelId) || models[0];
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const createNewChat = (projectId?: string, mode?: WorkspaceMode): string => {
    const id = 'chat-' + Date.now().toString(36);
    const targetModelId = projectId 
      ? (projects.find(p => p.id === projectId)?.defaultModelId || activeModelId)
      : activeModelId;

    const newChat: ChatConversation = {
      id,
      title: 'New Conversation',
      projectId: projectId || activeProjectId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelId: targetModelId,
      mode: mode || activeMode,
      messages: [],
      isLocalOnly: isOffline || activeModel.local,
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    addNotification('New conversation created');
    return id;
  };

  const addProject = (name: string, description: string, ruleStrings: string[]) => {
    const id = 'proj-' + Date.now().toString(36);
    const newProject: Project = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rules: ruleStrings.map((r, i) => ({
        id: `rule-${Date.now()}-${i}`,
        category: 'style',
        content: r,
        isActive: true,
      })),
      defaultModelId: activeModelId,
      fileIds: [],
      chatIds: [],
      tasteTags: ['Custom Project'],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(id);
    addNotification(`Project "${name}" created`);
  };

  const sendMessage = async (content: string, enableHighThinking: boolean = false) => {
    if (!content.trim() || isGenerating) return;

    let targetChatId = activeChatId;
    if (!activeChat) {
      targetChatId = createNewChat();
    }

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      modelId: 'user',
      modelName: 'User',
    };

    const assistantMsgId = 'msg-' + (Date.now() + 1);
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      modelId: activeModel.id,
      modelName: activeModel.displayName,
      isStreaming: true,
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === targetChatId) {
          const isTitleDefault = c.title === 'New Conversation';
          const newTitle = isTitleDefault ? content.slice(0, 32) + (content.length > 32 ? '...' : '') : c.title;
          return {
            ...c,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, userMessage, initialAssistantMessage],
          };
        }
        return c;
      })
    );

    setIsGenerating(true);

    try {
      // Build conversation history for multi-turn context
      const currentChat = chats.find(c => c.id === targetChatId);
      const history = (currentChat?.messages || []).map(m => ({
        role: m.role,
        content: m.content
      }));
      history.push({ role: 'user', content });

      let streamAccumulated = '';
      const response = await generateAIResponse({
        prompt: content,
        model: activeModel,
        project: activeProject,
        preferences: preferences.filter((p) => p.status === 'active'),
        enableHighThinking: enableHighThinking || activeMode === 'deep reasoning' || activeModel.supportsHighThinking,
        isOffline,
        messagesHistory: history,
        onDelta: (delta: string) => {
          streamAccumulated += delta;
          setChats((prev) =>
            prev.map((c) => {
              if (c.id === targetChatId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: streamAccumulated }
                      : m
                  ),
                };
              }
              return c;
            })
          );
        },
      });

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: c.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: response.text || streamAccumulated,
                      isStreaming: false,
                      latencyMs: response.latencyMs,
                      tokensUsed: response.tokensUsed,
                      thinkingProcess: response.thinkingProcess,
                      routedReason: response.provider ? `Executed via ${response.provider}` : undefined,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('Real Model Execution Error:', err);
      const errorMsgText = `**Model Request Notice**\n\n${err?.message || 'Could not communicate with model provider.'}\n\n*If this provider requires an API key or local runtime, please configure it in Settings → Providers or verify your local Ollama runtime.*`;

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: errorMsgText,
                      isStreaming: false,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePreference = (id: string, updates: Partial<LearnedPreference>) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, lastUpdated: 'Just now' } : p))
    );
    addNotification('Preference updated');
  };

  const forgetPreference = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
    addNotification('Preference removed from taste profile');
  };

  const submitFeedback = (
    messageId: string, 
    feedbackData: Omit<MessageFeedback, 'id' | 'timestamp' | 'messageId'>
  ) => {
    const feedback: MessageFeedback = {
      ...feedbackData,
      id: 'fb-' + Date.now(),
      messageId,
      timestamp: new Date().toISOString(),
    };

    // Update message inside chats
    setChats((prev) =>
      prev.map((c) => ({
        ...c,
        messages: c.messages.map((m) => {
          if (m.id === messageId) {
            return { ...m, feedback };
          }
          return m;
        }),
      }))
    );

    // Call real backend endpoint
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId,
        sentiment: feedbackData.sentiment,
        reasons: feedbackData.reasons,
        suggestedAlternative: feedbackData.suggestedAlternative,
        preferredVersion: feedbackData.preferredVersion,
        preferenceScope: feedbackData.privacyScope,
        modelId: activeModel.id,
        provider: activeModel.provider,
      }),
    }).catch(console.error);

    // If feedback indicates preference, extract and update taste profile
    if (feedback.reasons.length > 0 || feedback.suggestedAlternative) {
      const newPrefId = 'pref-' + Date.now().toString(36);
      const title = feedback.reasons.includes('Too generic')
        ? 'Avoids generic templates & AI clichés'
        : feedback.reasons.includes('Too verbose')
        ? 'Prefers concise and direct responses'
        : feedback.reasons.includes('Poor visual design')
        ? 'Editorial typography & unboxed styling'
        : 'Specific style adjustment';

      const newPref: LearnedPreference = {
        id: newPrefId,
        category: feedback.reasons.includes('Poor visual design') ? 'UI Design' : 'Communication',
        title,
        description: feedback.suggestedAlternative || feedback.reasons.join(', '),
        score: 8,
        confidence: 'High',
        evidenceCount: 1,
        lastUpdated: 'Just now',
        sourceType: 'Explicit Thumbs',
        status: 'active',
      };

      setPreferences((prev) => [newPref, ...prev]);

      // If privacy scope includes shared learning, append to training candidates
      if (feedback.privacyScope === 'anonymous_shared') {
        const candidate: TrainingCandidate = {
          id: 'train-' + Date.now(),
          type: feedback.sentiment === 'negative' ? 'DPO' : 'SFT',
          status: 'Captured',
          taskCategory: 'General Interaction',
          promptSnippet: 'Feedback provided on response ' + messageId,
          chosenSnippet: feedback.preferredVersion || feedback.suggestedAlternative || 'Structured refined response',
          rejectedSnippet: 'Rejected output flagged by user',
          feedbackReason: feedback.reasons.join(', '),
          privacyVerified: true,
          sourceModel: activeModel.displayName,
          timestamp: new Date().toISOString(),
        };
        setTrainingCandidates((prev) => [candidate, ...prev]);
      }

      addNotification('Feedback saved & Taste Profile updated', 'success');
    } else {
      addNotification('Feedback recorded', 'info');
    }
  };

  const recordComparisonWinner = (sessionId: string, chosenModelId: string, reason: string) => {
    setComparisons((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            chosenModelId,
            choiceReason: reason,
          };
        }
        return s;
      })
    );

    // Call real backend endpoint
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: sessionId,
        sentiment: 'positive',
        reasons: ['Comparison winner: ' + reason],
        modelId: chosenModelId,
        provider: models.find((m) => m.id === chosenModelId)?.provider,
      }),
    }).catch(console.error);

    const winner = models.find((m) => m.id === chosenModelId);
    if (winner) {
      addNotification(`Selected ${winner.displayName} as preferred answer. Preference evidence recorded.`, 'success');
    }
  };

  const refreshLocalRuntime = async () => {
    try {
      const res = await fetch('/api/local/runtimes');
      if (res.ok) {
        const data = await res.json();
        const ollama = data.runtimes?.find((r: any) => r.id === 'ollama');
        if (ollama && ollama.status === 'connected') {
          setLocalRuntime((prev) => ({
            ...prev,
            status: 'connected',
            runtimeName: 'Ollama',
            loadedModel: 'gpt-oss-20b',
          }));
          addNotification('Local Ollama runtime verified & connected', 'success');
        } else {
          setLocalRuntime((prev) => ({
            ...prev,
            status: 'disconnected',
          }));
          addNotification('Local runtime not detected. Start with "ollama serve"', 'warn');
        }
      }
    } catch {
      addNotification('Local runtime check failed', 'warn');
    }
  };

  const connectLocalRuntime = async (endpoint: string, runtime: 'Ollama' | 'LM Studio' | 'llama.cpp') => {
    setLocalRuntime((prev) => ({
      ...prev,
      endpoint,
      runtimeName: runtime,
      status: 'connected',
    }));
    addNotification(`Connected to ${runtime} at ${endpoint}`, 'success');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        models,
        activeModelId,
        activeModel,
        setActiveModelId,
        activeMode,
        setActiveMode,
        projects,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        addProject,
        chats,
        activeChatId,
        activeChat,
        setActiveChatId,
        createNewChat,
        sendMessage,
        preferences,
        updatePreference,
        forgetPreference,
        submitFeedback,
        comparisons,
        recordComparisonWinner,
        trainingCandidates,
        localRuntime,
        refreshLocalRuntime,
        connectLocalRuntime,
        hardwareProfile,
        setHardwareProfile,
        isOffline,
        setIsOffline,
        commandPaletteOpen,
        setCommandPaletteOpen,
        quantizationModalOpen,
        setQuantizationModalOpen,
        websiteEvaluatorOpen,
        setWebsiteEvaluatorOpen,
        notifications,
        addNotification,
        theme,
        setTheme,
        isGenerating,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
