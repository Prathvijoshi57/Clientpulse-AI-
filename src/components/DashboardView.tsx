import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Brain,
  MessageSquarePlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Client, LearningOutcome, MemoryBank } from '../types/client';

interface DashboardViewProps {
  clients: Client[];
  activeClient: Client | null;
  onSelectClient: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  learningHistory: LearningOutcome[];
  memoryBank: MemoryBank | null;
}

// Indian Rupee formatting helper
export const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatLakhs = (val: number) => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${formatINR(val)}`;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  activeClient,
  onSelectClient,
  onNavigateTab,
  learningHistory,
  memoryBank,
}) => {
  const [showQuickGuide, setShowQuickGuide] = useState(true);

  // Aggregate stats
  const totalClients = clients.length;
  const totalMonthly = clients.reduce((acc, c) => {
    const raw = parseInt(c.monthly_value.replace(/[^0-9]/g, '') || '0', 10);
    return acc + raw;
  }, 0);
  const avgHealth = Math.round(
    clients.reduce((acc, c) => acc + (c.health_score || 85), 0) / Math.max(totalClients, 1)
  );
  const totalFacts = (memoryBank?.world_facts?.length || 0) + 12;

  const getHealthBadge = (score: number) => {
    if (score >= 90) {
      return { label: 'Strong Retainer Health', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (score >= 75) {
      return { label: 'Active & Stable', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    return { label: 'Needs Follow-up', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  return (
    <div className="space-y-6">
      {/* Hero Executive Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span>Hindsight Memory Engine · INR (₹) Active</span>
              <span className="text-slate-300">/</span>
              <span>Gemini 3.8 Flash AI</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Agency Client Intelligence Center
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Easy, persistent client memory for Indian agencies and small businesses. Ingest call transcripts, track verified retainer budgets in Rupees (₹), and generate personalized follow-up pitches with zero guesswork.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('record')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Record Interaction</span>
            </button>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Sales Recommendations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Easy Experience Quick Action Hub */}
      {showQuickGuide && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-xs relative">
          <button
            onClick={() => setShowQuickGuide(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
          >
            Dismiss
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>3-Step Quick Guide for Your Agency Team</span>
          </div>
          <h2 className="text-base font-bold text-white mb-3">
            How ClientPulse Makes Client Management Effortless
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div
              onClick={() => onNavigateTab('record')}
              className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 cursor-pointer hover:bg-slate-700/80 transition-colors"
            >
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>1. Log Any Conversation</span>
                <ArrowRight className="w-3 h-3" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Paste meeting notes, emails, or WhatsApp call notes. Hindsight extracts key facts & numbers in ₹ automatically.
              </p>
            </div>

            <div
              onClick={() => onNavigateTab('assistant')}
              className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 cursor-pointer hover:bg-slate-700/80 transition-colors"
            >
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>2. Ask AI Anything</span>
                <ArrowRight className="w-3 h-3" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Query past pricing, decision makers, or objections. Answers are synthesized directly from client memory.
              </p>
            </div>

            <div
              onClick={() => onNavigateTab('recommendations')}
              className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 cursor-pointer hover:bg-slate-700/80 transition-colors"
            >
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>3. 1-Click Follow-up Pitch</span>
                <ArrowRight className="w-3 h-3" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Get ready-to-send WhatsApp messages and emails tailored to each client's psychological mental model.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Metric Cards in Rupees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Clients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalClients}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {new Set(clients.map((c) => c.industry)).size} high-value verticals
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tracked Monthly Retainers (₹)</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{formatINR(totalMonthly)}
            <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Annualized: {formatLakhs(totalMonthly * 12)} ARR
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Client Health Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {avgHealth}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Retention & satisfaction average
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Hindsight Memory Banks</span>
            <Brain className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalFacts}+
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Persistent facts & observations
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Client Intelligence Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Client Portfolio & Retainers
              </h2>
              <span className="text-xs text-slate-500">
                Click any client to set as active context
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('profiles')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              <span>Manage all profiles</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {clients.map((client) => {
              const isSelected = client.id === activeClient?.id;
              const healthBadge = getHealthBadge(client.health_score);

              return (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className={`bg-white rounded-xl border p-5 transition-all cursor-pointer hover:border-slate-400 shadow-xs ${
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {client.avatar_url ? (
                        <img
                          src={client.avatar_url}
                          alt={client.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                          {client.name[0]}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {client.name}
                          </h3>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-medium text-slate-600">
                            {client.company}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {client.role} · {client.industry}
                        </div>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-1">
                          {client.notes}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                      <div className="text-sm font-bold font-mono text-slate-900">
                        {client.monthly_value}
                      </div>
                      <div className="text-xs font-medium mt-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] border font-medium ${healthBadge.color}`}>
                          {healthBadge.label} ({client.health_score}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Bank: <span className="font-mono">{client.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Quick Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      Status: <span className="font-medium text-slate-700">{client.status}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(client.id);
                          onNavigateTab('record');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <MessageSquarePlus className="w-3 h-3 text-slate-500" />
                        <span>Log Note</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(client.id);
                          onNavigateTab('memory');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Memory Bank
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(client.id);
                          onNavigateTab('assistant');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Learning History & Memory Architecture */}
        <div className="space-y-6">
          {/* Historical Learning Rules Stream */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Reinforcement Learning History
              </h2>
              <button
                onClick={() => onNavigateTab('learning')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                View all
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              How past deal outcomes continuously refine agency pitch recommendations:
            </p>

            <div className="space-y-3">
              {learningHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">{item.client_name}</span>
                    <span className="text-[11px] font-mono">{item.outcome_result}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    "{item.rule_learned}"
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500">
                    Impact: {item.impact}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('learning')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <span>Log a new outcome</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Hindsight 4-Type Architecture Card */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Hindsight Memory Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Unlike ordinary chatbots that forget context, Hindsight structures memory into 4 evidence-backed layers:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/50">
                <span className="font-semibold text-slate-200">1. World Facts:</span>
                <span className="text-slate-400 ml-1">Verified retainer budgets in ₹, timelines, tech stack.</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/50">
                <span className="font-semibold text-slate-200">2. Experiences:</span>
                <span className="text-slate-400 ml-1">Verbatim calls, emails, WhatsApp notes & sentiment.</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/50">
                <span className="font-semibold text-slate-200">3. Observations:</span>
                <span className="text-slate-400 ml-1">Beliefs and behavior patterns formed over time.</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/50">
                <span className="font-semibold text-slate-200">4. Mental Models:</span>
                <span className="text-slate-400 ml-1">Psychological decision triggers & preferred tone.</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Operations: retain · recall · reflect</span>
              <button
                onClick={() => onNavigateTab('memory')}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Inspect bank →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
