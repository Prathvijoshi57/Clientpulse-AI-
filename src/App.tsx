import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClientSwitcher } from './components/ClientSwitcher';
import { DashboardView } from './components/DashboardView';
import { ClientProfilesView } from './components/ClientProfilesView';
import { RecordInteractionView } from './components/RecordInteractionView';
import { MemoryBankView } from './components/MemoryBankView';
import { AiAssistantView } from './components/AiAssistantView';
import { RecommendationsView } from './components/RecommendationsView';
import { LearningHistoryView } from './components/LearningHistoryView';
import { HindsightDrawer } from './components/HindsightDrawer';
import { Client, MemoryBank, LearningOutcome, HindsightStatus } from './types/client';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [memoryBank, setMemoryBank] = useState<MemoryBank | null>(null);
  const [learningHistory, setLearningHistory] = useState<LearningOutcome[]>([]);
  const [hindsightStatus, setHindsightStatus] = useState<HindsightStatus | null>(null);
  const [isHindsightDrawerOpen, setIsHindsightDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Clients and Stats
  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, learningRes, statusRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/learning-history'),
          fetch('/api/hindsight/status'),
        ]);

        const clientsData = await clientsRes.json();
        const learningData = await learningRes.json();
        const statusData = await statusRes.json();

        setClients(clientsData);
        setLearningHistory(learningData);
        setHindsightStatus(statusData);

        if (clientsData && clientsData.length > 0) {
          setSelectedClientId(clientsData[0].id);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Fetch memory bank whenever selected client changes
  useEffect(() => {
    if (!selectedClientId) return;

    fetch(`/api/clients/${selectedClientId}/memory`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load client memory bank');
      })
      .then((data) => setMemoryBank(data))
      .catch((err) => console.error('Error fetching memory bank:', err));
  }, [selectedClientId]);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;

  // Refresh Helpers
  const handleRefreshMemory = async () => {
    if (!selectedClientId) return;
    try {
      const res = await fetch(`/api/clients/${selectedClientId}/memory`);
      if (res.ok) {
        const data = await res.json();
        setMemoryBank(data);
      }
      // Also refresh Hindsight status counts
      const statusRes = await fetch('/api/hindsight/status');
      if (statusRes.ok) {
        setHindsightStatus(await statusRes.json());
      }
    } catch (err) {
      console.error('Failed to refresh memory:', err);
    }
  };

  const handleRefreshLearning = async () => {
    try {
      const res = await fetch('/api/learning-history');
      if (res.ok) {
        const data = await res.json();
        setLearningHistory(data);
      }
    } catch (err) {
      console.error('Failed to refresh learning history:', err);
    }
  };

  // Client CRUD Handlers
  const handleAddClient = async (clientData: Partial<Client>) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    if (!res.ok) throw new Error('Failed to add client');
    const newClient = await res.json();
    setClients((prev) => [...prev, newClient]);
    setSelectedClientId(newClient.id);
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update client');
    const updated = await res.json();
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const handleDeleteClient = async (id: string) => {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client');
    const remaining = clients.filter((c) => c.id !== id);
    setClients(remaining);
    if (selectedClientId === id && remaining.length > 0) {
      setSelectedClientId(remaining[0].id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-xs text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="font-semibold text-slate-800">Initializing CLIENTPULSE AI & Hindsight Memory Banks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* 3-Zone Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hindsightStatus={hindsightStatus}
        onOpenHindsightDrawer={() => setIsHindsightDrawerOpen(true)}
      />

      {/* Sticky Active Client Context Switcher */}
      <ClientSwitcher
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        onAddClientClick={() => setActiveTab('profiles')}
        onQuickRecord={() => setActiveTab('record')}
        onQuickChat={() => setActiveTab('assistant')}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            clients={clients}
            activeClient={activeClient}
            onSelectClient={setSelectedClientId}
            onNavigateTab={setActiveTab}
            learningHistory={learningHistory}
            memoryBank={memoryBank}
          />
        )}

        {activeTab === 'profiles' && (
          <ClientProfilesView
            clients={clients}
            activeClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onNavigateTab={setActiveTab}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {activeTab === 'record' && (
          <RecordInteractionView
            activeClient={activeClient}
            onNavigateTab={setActiveTab}
            onRefreshMemory={handleRefreshMemory}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryBankView
            activeClient={activeClient}
            memoryBank={memoryBank}
            onRefreshMemory={handleRefreshMemory}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistantView
            activeClient={activeClient}
            memoryBank={memoryBank}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            activeClient={activeClient}
            memoryBank={memoryBank}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'learning' && (
          <LearningHistoryView
            learningHistory={learningHistory}
            clients={clients}
            activeClient={activeClient}
            onRefreshLearning={handleRefreshLearning}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CLIENTPULSE AI</span>
            <span>·</span>
            <span>Vectorize Hindsight Memory Engine</span>
            <span>·</span>
            <span className="font-mono text-emerald-700">Gemini 3.8 Flash Active</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Decoupled Python & React Architecture</span>
            <span>·</span>
            <button
              onClick={() => setIsHindsightDrawerOpen(true)}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Inspect Source & Banks
            </button>
          </div>
        </div>
      </footer>

      {/* Hindsight Engine Architecture & Python Source Drawer */}
      <HindsightDrawer
        isOpen={isHindsightDrawerOpen}
        onClose={() => setIsHindsightDrawerOpen(false)}
        status={hindsightStatus}
      />
    </div>
  );
}
