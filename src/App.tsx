import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { AppShell } from './components/layouts/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ModelHubPage } from './pages/ModelHubPage';
import { CompareArenaPage } from './pages/CompareArenaPage';
import { LocalAIPage } from './pages/LocalAIPage';
import { CodeLabPage } from './pages/CodeLabPage';
import { TasteProfilePage } from './pages/TasteProfilePage';
import { RouterPage } from './pages/RouterPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MemoryPage } from './pages/MemoryPage';
import { FilesPage } from './pages/FilesPage';
import { PromptLibraryPage } from './pages/PromptLibraryPage';
import { LearningCenterPage } from './pages/LearningCenterPage';
import { FeedbackStreamPage } from './pages/FeedbackStreamPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { AdminConsolePage } from './pages/AdminConsolePage';
import { PrivacyPage } from './pages/PrivacyPage';

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/models" element={<ModelHubPage />} />
            <Route path="/models/:id" element={<ModelHubPage />} />
            <Route path="/compare" element={<CompareArenaPage />} />
            <Route path="/local" element={<LocalAIPage />} />
            <Route path="/local/models" element={<LocalAIPage />} />
            <Route path="/code" element={<CodeLabPage />} />
            <Route path="/code/:projectId" element={<CodeLabPage />} />
            <Route path="/preferences" element={<TasteProfilePage />} />
            <Route path="/taste" element={<TasteProfilePage />} />
            <Route path="/router" element={<RouterPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectsPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/prompts" element={<PromptLibraryPage />} />
            <Route path="/learning" element={<LearningCenterPage />} />
            <Route path="/datasets" element={<LearningCenterPage />} />
            <Route path="/feedback" element={<FeedbackStreamPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/admin" element={<AdminConsolePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/evaluations" element={<CompareArenaPage />} />
            <Route path="/playground" element={<CodeLabPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
