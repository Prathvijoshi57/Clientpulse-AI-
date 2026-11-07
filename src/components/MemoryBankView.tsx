import React, { useState } from 'react';
import {
  Brain,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Quote,
  Target,
  Shield,
  MessageSquarePlus,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { Client, MemoryBank } from '../types/client';

interface MemoryBankViewProps {
  activeClient: Client | null;
  memoryBank: MemoryBank | null;
  onRefreshMemory: () => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export const MemoryBankView: React.FC<MemoryBankViewProps> = ({
  activeClient,
  memoryBank,
  onRefreshMemory,
  onNavigateTab,
}) => {
  const [activeMemoryTab, setActiveMemoryTab] = useState<'facts' | 'observations' | 'experiences' | 'mental_model'>('facts');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!activeClient) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">Please select a client to view their Hindsight memory bank.</p>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshMemory();
    } finally {
      setIsRefreshing(false);
    }
  };

  const facts = memoryBank?.world_facts || [];
  const observations = memoryBank?.observations || [];
  const experiences = memoryBank?.experiences || [];
  const mentalModel = memoryBank?.mental_model;

  const filteredFacts = facts.filter((f) => {
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesQuery = searchQuery === '' || f.fact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredObservations = observations.filter((o) => {
    return searchQuery === '' || o.belief.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header & Memory Bank Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">
            <span>Vectorize Hindsight Memory Bank · INR (₹)</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-slate-500">bank_clientpulse_{activeClient.id}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Client Long-Term Memory Vault · {activeClient.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified budgets, interaction transcripts, and synthesized behavioral models. Powering predictive follow-ups with zero context loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Bank</span>
          </button>
          <button
            onClick={() => onNavigateTab('assistant')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ask AI About {activeClient.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* 10-Second Executive Memory Snapshot (Easy Experience for Agency Team) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>10-Second Client Dossier Snapshot</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Retainer & Budget</span>
            <span className="text-sm font-bold font-mono text-emerald-400 block mt-0.5">
              {activeClient.monthly_value}
            </span>
            <span className="text-[11px] text-slate-300">
              Health score: {activeClient.health_score}%
            </span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Inferred Persona</span>
            <span className="text-sm font-bold text-white block mt-0.5 truncate">
              {mentalModel?.persona || 'High-Velocity Growth Leader'}
            </span>
            <span className="text-[11px] text-slate-300 capitalize">
              Pace: {mentalModel?.decision_velocity || 'rapid'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Top Buying Driver</span>
            <span className="text-xs font-semibold text-white block mt-0.5 line-clamp-2">
              {mentalModel?.core_motivations?.[0] || 'Predictable pipeline ARR & CAC payback'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Preferred Channel</span>
            <span className="text-xs font-semibold text-white block mt-0.5 truncate">
              {mentalModel?.preferred_communication || 'Concise bullet points with metrics'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Supports WhatsApp & Email
            </span>
          </div>
        </div>
      </div>

      {/* 4 Memory Types Navigation Bar + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
          {[
            { id: 'facts', label: `1. Verified Facts (${facts.length})` },
            { id: 'observations', label: `2. Observed Behaviors (${observations.length})` },
            { id: 'experiences', label: `3. Past Conversations (${experiences.length})` },
            { id: 'mental_model', label: '4. Mindset & Personality' },
          ].map((tab) => {
            const isActive = activeMemoryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMemoryTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search memory bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Tab 1: World Facts */}
      {activeMemoryTab === 'facts' && (
        <div className="space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Category:</span>
              {['all', 'budget', 'stakeholder', 'tech_stack', 'contractual', 'preference'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="text-slate-500 font-mono text-[11px]">
              Showing {filteredFacts.length} of {facts.length} facts
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFacts.length === 0 ? (
              <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No facts found matching your filter or search query.
              </div>
            ) : (
              filteredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="font-mono uppercase font-semibold text-slate-600 tracking-wider">
                        {fact.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-emerald-700">
                        {Math.round(fact.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {fact.fact}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID: <code className="font-mono">{fact.id.slice(0, 14)}</code></span>
                    <span>Learned: {fact.created_at ? fact.created_at.slice(0, 10) : 'Active'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Consolidated Observations */}
      {activeMemoryTab === 'observations' && (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-500">
            Synthesized beliefs formed by analyzing multiple past interactions over time. Used by Gemini to anticipate objections and friction points.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredObservations.length === 0 ? (
              <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No observations matching search. Record new interactions to synthesize beliefs.
              </div>
            ) : (
              filteredObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="font-semibold text-slate-800 uppercase tracking-wide">
                      {obs.category.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-slate-600">
                      Impact: {obs.impact_level}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-900 leading-relaxed">
                    "{obs.belief}"
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Evidence linked: {obs.evidence_ids?.length || 1} interaction</span>
                    <span>Synthesized: {obs.synthesized_at ? obs.synthesized_at.slice(0, 10) : 'Active'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Raw Experiences */}
      {activeMemoryTab === 'experiences' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Chronological timeline of raw client interactions & calls</span>
            <button
              onClick={() => onNavigateTab('record')}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 inline-flex items-center gap-1"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Record new interaction</span>
            </button>
          </div>

          <div className="space-y-3">
            {experiences.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No experiences recorded yet.
              </div>
            ) : (
              experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 capitalize">
                        {exp.channel.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {exp.timestamp ? exp.timestamp.slice(0, 10) : 'Recent'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Sentiment: <span className="font-semibold capitalize text-slate-800">{exp.sentiment}</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-800">
                    {exp.summary}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 font-mono text-[11px] leading-relaxed">
                    {exp.raw_content}
                  </div>

                  {exp.key_quotes && exp.key_quotes.length > 0 && (
                    <div className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-2.5 py-0.5">
                      "{exp.key_quotes[0]}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Mental Model Profile */}
      {activeMemoryTab === 'mental_model' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Hindsight Cognitive Profile
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Client Psychological & Strategic Mental Model
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-level synthesized schema representing client motivations, anxieties, and decision behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                Inferred Persona
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {mentalModel?.persona || 'Strategic Executive'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                Decision Velocity
              </span>
              <span className="text-sm font-bold capitalize text-slate-900 block">
                {mentalModel?.decision_velocity || 'Deliberate'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                Preferred Format
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {mentalModel?.preferred_communication || 'Direct bullet-point memo'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">
                Core Motivations & Buying Drivers
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                {(mentalModel?.core_motivations || [
                  'Measurable pipeline ARR impact',
                  'Predictable CAC payback periods',
                  'Rigorous analytics transparency'
                ]).map((m, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-emerald-950">{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">
                Key Anxieties & Friction Points
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                {(mentalModel?.friction_points || [
                  'Unverified agency retainers without milestone checkpoints',
                  'Top-of-funnel vanity metrics disconnected from sales revenue',
                  'Slow response turnaround time during critical sprints'
                ]).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 bg-rose-50/50 rounded-lg border border-rose-100">
                    <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-rose-950">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
