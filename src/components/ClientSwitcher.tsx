import React from 'react';
import { UserCheck, Plus, Building2, TrendingUp, ShieldCheck, MessageSquarePlus, Bot } from 'lucide-react';
import { Client } from '../types/client';

interface ClientSwitcherProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onAddClientClick: () => void;
  onQuickRecord?: () => void;
  onQuickChat?: () => void;
}

export const ClientSwitcher: React.FC<ClientSwitcherProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onAddClientClick,
  onQuickRecord,
  onQuickChat,
}) => {
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const getHealthTag = (score: number) => {
    if (score >= 90) return { label: 'High Retention', color: 'text-emerald-700 bg-emerald-50' };
    if (score >= 75) return { label: 'Good Standing', color: 'text-blue-700 bg-blue-50' };
    return { label: 'Attention Needed', color: 'text-amber-700 bg-amber-50' };
  };

  const healthTag = activeClient ? getHealthTag(activeClient.health_score) : { label: 'Active', color: 'text-slate-600 bg-slate-50' };

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active Client Summary */}
        <div className="flex items-center gap-3">
          {activeClient?.avatar_url ? (
            <img
              src={activeClient.avatar_url}
              alt={activeClient.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
              {activeClient?.name?.[0] || 'C'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                {activeClient?.name || 'No Client Selected'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-700 font-medium">
                {activeClient?.company}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {activeClient?.monthly_value}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${healthTag.color}`}>
                {healthTag.label} ({activeClient?.health_score}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{activeClient?.role}</span>
              <span className="text-slate-300">/</span>
              <span>{activeClient?.industry}</span>
              <span className="text-slate-300">/</span>
              <span className="font-mono text-slate-400">Bank: {activeClient?.id}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Switcher pills / buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-0.5 shrink-0">
              Switch Client:
            </span>
            {clients.map((c) => {
              const isSelected = c.id === selectedClientId;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectClient(c.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75 font-mono">({c.monthly_value.replace('/mo', '')})</span>
                </button>
              );
            })}

            <button
              onClick={onAddClientClick}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-dashed border-slate-300 hover:border-slate-500 rounded-md whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
              title="Add a new client profile"
            >
              <Plus className="w-3 h-3" />
              <span>New Client</span>
            </button>
          </div>

          {(onQuickRecord || onQuickChat) && (
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              {onQuickRecord && (
                <button
                  onClick={onQuickRecord}
                  className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 shrink-0"
                  title="Quickly record notes for this client"
                >
                  <MessageSquarePlus className="w-3 h-3 text-slate-600" />
                  <span>Log Note</span>
                </button>
              )}
              {onQuickChat && (
                <button
                  onClick={onQuickChat}
                  className="px-2 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1 shrink-0"
                  title="Ask AI assistant about this client"
                >
                  <Bot className="w-3 h-3 text-emerald-400" />
                  <span>Ask AI</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
