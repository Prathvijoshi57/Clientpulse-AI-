import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { LearningOutcome, Client } from '../types/client';

interface LearningHistoryViewProps {
  learningHistory: LearningOutcome[];
  clients: Client[];
  activeClient: Client | null;
  onRefreshLearning: () => Promise<void>;
}

export const LearningHistoryView: React.FC<LearningHistoryViewProps> = ({
  learningHistory,
  clients,
  activeClient,
  onRefreshLearning,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || clients[0]?.id || '');
  const [actionTaken, setActionTaken] = useState('');
  const [outcomeResult, setOutcomeResult] = useState('Success - Accepted');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenModal = () => {
    setSelectedClientId(activeClient?.id || clients[0]?.id || '');
    setActionTaken('');
    setOutcomeResult('Success - Accepted');
    setNotes('');
    setErrorMessage('');
    setShowLogModal(true);
  };

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTaken.trim() || !selectedClientId) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/clients/${selectedClientId}/outcomes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_taken: actionTaken,
          outcome_result: outcomeResult,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record outcome learning.');
      }

      await onRefreshLearning();
      setShowLogModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving outcome.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">
            <span>Adaptive Reinforcement Intelligence</span>
            <span className="text-slate-300">/</span>
            <span>Self-Tuning Agency Brain</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Learning History & Outcome Reinforcement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every client conversation outcome—accepted proposals, ghosted emails, negotiated discounts—feeds into this continuous feedback loop to make future recommendations sharper.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Real Outcome</span>
        </button>
      </div>

      {/* Mechanism Explainer Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          How Previous Outcomes Influence Future Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="font-bold text-slate-800 block">1. Action & Response Logged</span>
            <p className="text-slate-600 leading-relaxed">
              When an account manager sends a pitch or negotiates terms, the real-world outcome is recorded.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="font-bold text-slate-800 block">2. Rule Formulation</span>
            <p className="text-slate-600 leading-relaxed">
              Gemini analyzes the causal trigger behind the result and abstracts a transferable behavioral rule.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="font-bold text-slate-800 block">3. Injected into Next Pitch</span>
            <p className="text-slate-600 leading-relaxed">
              When generating sales follow-ups, the strategy engine loads this rule history to avoid past mistakes.
            </p>
          </div>
        </div>
      </div>

      {/* History Stream */}
      <div className="space-y-3.5">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Agency-Wide Learning Registry ({learningHistory.length} Recorded Rules)
        </h2>

        {learningHistory.map((item) => {
          const isSuccess = item.outcome_result.toLowerCase().includes('success') || item.outcome_result.toLowerCase().includes('accepted');
          const isNegative = item.outcome_result.toLowerCase().includes('rejected') || item.outcome_result.toLowerCase().includes('delayed');

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {item.client_name}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {item.timestamp ? item.timestamp.slice(0, 10) : 'Recent'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isSuccess ? 'text-emerald-700' : isNegative ? 'text-rose-700' : 'text-slate-700'
                    }`}
                  >
                    Outcome: {item.outcome_result}
                  </span>
                </div>
              </div>

              {/* Action Taken */}
              <div className="text-xs">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                  Action Taken:
                </span>
                <p className="text-slate-700 font-medium">
                  {item.action_taken}
                </p>
              </div>

              {/* Rule Learned */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Durable Principle Learned:</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  "{item.rule_learned}"
                </p>
                <div className="mt-1.5 text-[11px] text-slate-500">
                  Adaptive impact: {item.impact}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Real Outcome Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Log Real Interaction Outcome
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Client Account
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Action Taken *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Offered ₹1,20,000 pilot with 60-day milestone guarantee instead of 6-month lock-in"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Outcome Result *
                </label>
                <select
                  value={outcomeResult}
                  onChange={(e) => setOutcomeResult(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 bg-white"
                >
                  <option value="Success - Accepted">Success - Accepted</option>
                  <option value="Positive - Follow-up Requested">Positive - Follow-up Requested</option>
                  <option value="Hesitant - Asked for Discounts">Hesitant - Asked for Discounts</option>
                  <option value="Delayed - No Reply / Ghosted">Delayed - No Reply / Ghosted</option>
                  <option value="Rejected - Chose Competitor">Rejected - Chose Competitor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Why did they react this way? Context Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific feedback the client shared, reasons for acceptance, or objections raised..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !actionTaken.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Reinforcing Learning...' : 'Save & Update Learning Engine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
