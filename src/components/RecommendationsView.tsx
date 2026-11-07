import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Target,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  MessageCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Client, SalesRecommendations, MemoryBank } from '../types/client';

interface RecommendationsViewProps {
  activeClient: Client | null;
  memoryBank: MemoryBank | null;
  onNavigateTab: (tab: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  activeClient,
  memoryBank,
  onNavigateTab,
}) => {
  const [recommendations, setRecommendations] = useState<SalesRecommendations | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedType, setCopiedType] = useState<'email' | 'whatsapp' | null>(null);
  const [formatTab, setFormatTab] = useState<'email' | 'whatsapp'>('email');
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');

  if (!activeClient) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">Please select a client to generate sales recommendations.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const response = await fetch(`/api/clients/${activeClient.id}/recommendations`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate sales recommendations.');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating recommendations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (!recommendations?.email_draft) return;
    const text = `Subject: ${recommendations.email_draft.subject}\n\n${recommendations.email_draft.body}`;
    navigator.clipboard.writeText(text);
    setCopiedType('email');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const generateWhatsAppMessage = () => {
    if (!recommendations) return '';
    const hook = recommendations.strategic_pitch_hook;
    const nextStep = recommendations.immediate_next_step;
    return `Hi ${activeClient.name.split(' ')[0]},\n\nQuick note following our discussion regarding ${activeClient.company}'s growth goals.\n\nKey Update: ${hook}\n\n${nextStep}\n\nWould a 10-minute sync this ${recommendations.optimal_timing.toLowerCase()} work for you? Let me know!`;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedType('whatsapp');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const toggleCheck = (index: number) => {
    setCheckedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">
            <span>Adaptive Sales Strategy Engine · INR (₹)</span>
            <span className="text-slate-300">/</span>
            <span>Reinforcement Loop Grounded</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Personalized Sales Follow-ups · {activeClient.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-crafted pitches, ready-to-send WhatsApp & Email drafts, and objection handling tailored to {activeClient.name}'s stated priorities ({activeClient.monthly_value}).
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs shrink-0"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Strategy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generate Follow-up Plan</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!recommendations && !isGenerating && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Generate Evidence-Backed Follow-up Gameplan for {activeClient.name}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ClientPulse combines {activeClient.name}'s Hindsight memory bank ({memoryBank?.world_facts?.length || 4} verified facts in ₹, {memoryBank?.observations?.length || 2} observations) with agency historical learnings to generate high-converting outreach.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs mt-2"
          >
            <span>Run Strategy Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-slate-900">
            Evaluating Hindsight Memory & Agency Learning History...
          </h2>
          <p className="text-xs text-slate-500">
            Synthesizing personalized objection rebuttals, WhatsApp & Email copy, and timing in Rupees (₹).
          </p>
        </div>
      )}

      {recommendations && (
        <div className="space-y-6">
          {/* Top Row: Immediate Action + Pitch Hook */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Immediate Next Step */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Immediate Recommended Action
                </span>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {recommendations.immediate_next_step}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">Channel</span>
                  <span className="font-semibold text-slate-800">{recommendations.recommended_channel}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Optimal Cadence</span>
                  <span className="font-medium text-slate-700">{recommendations.optimal_timing}</span>
                </div>
              </div>
            </div>

            {/* Strategic Pitch Hook */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Strategic Value Hook (Grounded in Verified Memory)
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  "{recommendations.strategic_pitch_hook}"
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tailored to: {activeClient.name}'s mental model</span>
                <button
                  onClick={() => onNavigateTab('learning')}
                  className="text-slate-700 hover:text-slate-900 font-medium"
                >
                  View historical outcome influence →
                </button>
              </div>
            </div>
          </div>

          {/* Easy Outreach Section: Dual Tabs (Email vs WhatsApp) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFormatTab('email')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    formatTab === 'email'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Email Outreach Draft</span>
                </button>
                <button
                  onClick={() => setFormatTab('whatsapp')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    formatTab === 'whatsapp'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Follow-up Note</span>
                </button>
              </div>

              {formatTab === 'email' ? (
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0"
                >
                  {copiedType === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied Email!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email Draft</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCopyWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shrink-0 shadow-xs"
                >
                  {copiedType === 'whatsapp' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied WhatsApp Note!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy WhatsApp Note</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {formatTab === 'email' ? (
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Subject Line</span>
                  <input
                    type="text"
                    readOnly
                    value={recommendations.email_draft.subject}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Message Body</span>
                  <textarea
                    readOnly
                    rows={7}
                    value={recommendations.email_draft.body}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed font-sans"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Optimized for WhatsApp / Slack (Short, polite, high conversion):
                </span>
                <textarea
                  readOnly
                  rows={6}
                  value={generateWhatsAppMessage()}
                  className="w-full p-3 text-xs bg-emerald-50/40 border border-emerald-200/80 rounded-lg text-slate-800 leading-relaxed font-sans"
                />
              </div>
            )}
          </div>

          {/* Quick Pre-Call Checklist */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">
              Pre-Call Action Checklist for {activeClient.name}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                `Confirm current monthly retainer value of ${activeClient.monthly_value}`,
                `Reference ${recommendations.optimal_timing} for the sync`,
                'Address their attribution and reporting priorities upfront'
              ].map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-left hover:border-slate-300 transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-[11px] ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Risk Radar & Objection Defense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Risk Radar */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Account Risk Radar</span>
              </div>
              <p className="text-xs text-slate-500">
                Proactive warnings derived from sentiment analysis and past friction points:
              </p>

              <div className="space-y-2">
                {recommendations.risk_radar.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs text-amber-950 font-medium">
                    {risk}
                  </div>
                ))}
              </div>
            </div>

            {/* Anticipated Objections */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Target className="w-4 h-4 text-slate-700" />
                <span>Anticipated Objections & Battle-Tested Rebuttals</span>
              </div>
              <p className="text-xs text-slate-500">
                Ground answers in their own stated metrics to disarm hesitation:
              </p>

              <div className="space-y-3">
                {recommendations.objection_handling.map((obj, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                    <div className="font-semibold text-rose-900">
                      Objection: "{obj.anticipated_objection}"
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900">Rebuttal:</span> {obj.proven_rebuttal}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
