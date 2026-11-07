import React from 'react';
import { Database, Sparkles } from 'lucide-react';
import { HindsightStatus } from '../types/client';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hindsightStatus: HindsightStatus | null;
  onOpenHindsightDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hindsightStatus,
  onOpenHindsightDrawer,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profiles', label: 'Client Profiles' },
    { id: 'record', label: 'Record Interaction' },
    { id: 'memory', label: 'Memory Bank' },
    { id: 'assistant', label: 'AI Assistant' },
    { id: 'recommendations', label: 'Sales Follow-ups' },
    { id: 'learning', label: 'Learning History' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
                CLIENTPULSE AI
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block -mt-0.5">
                Client Intelligence Platform
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenHindsightDrawer}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
            title="Inspect Hindsight persistent memory engine and Python backend architecture"
          >
            <Database className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">Hindsight Engine</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-[11px] text-emerald-700 font-semibold">₹ INR Active</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-100 bg-slate-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
