import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  MessageSquare,
  Phone,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Brain,
  ArrowRight
} from 'lucide-react';
import { Client, MemoryBank } from '../types/client';

interface RecordInteractionViewProps {
  activeClient: Client | null;
  onNavigateTab: (tab: string) => void;
  onRefreshMemory: () => Promise<void>;
}

export const RecordInteractionView: React.FC<RecordInteractionViewProps> = ({
  activeClient,
  onNavigateTab,
  onRefreshMemory,
}) => {
  const [channel, setChannel] = useState('email');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!activeClient) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">Please select a client from the top bar to record an interaction.</p>
      </div>
    );
  }

  const sampleScenarios = [
    {
      title: 'Q4 Budget & Channel Reallocation',
      channel: 'video_meeting',
      text: `${activeClient.name} mentioned in our bi-weekly strategy review that their executive board approved an increase of their monthly performance ad budget to ₹1,85,000. They want to cut Google Display and Facebook broad targeting by 60% due to spam lead complaints from sales SDRs, and concentrate 80% on LinkedIn InMail, Thought Leadership ads, and Salesforce CRM automation. Key quote: "Every single contact must match our tier-1 account list; we cannot afford tire-kickers."`,
    },
    {
      title: 'Attribution Anxiety & Contract Renewal',
      channel: 'email',
      text: `Received an email from ${activeClient.name}: "We are approaching the 90-day mark on our initial contract. While organic traffic is up 34%, our board is questioning the multi-touch pipeline attribution. If we can't present clear ROI data mapping directly to closed-won deals in our HubSpot instance by Friday next week, we may need to freeze the retainer before committing to the 12-month extension."`,
    },
    {
      title: 'CFO Meeting & Payment Term Requests',
      channel: 'phone_call',
      text: `Spoke with ${activeClient.name} and their newly hired VP of Finance, David Cole. David is closely auditing agency spend and requested either net-45 GST invoicing terms or a 7% discount if they prepay the entire 6-month retainer upfront (₹9,00,000). They also require SOC2 compliance documentation before connecting their internal data warehouse to our analytics stack.`,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsProcessing(true);
    setErrorMessage('');
    setExtractionResult(null);

    try {
      const response = await fetch(`/api/clients/${activeClient.id}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, channel }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to process interaction');
      }

      const data = await response.json();
      setExtractionResult(data);
      setContent('');
      await onRefreshMemory();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during Hindsight retention.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Record Client Interaction · {activeClient.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest call notes, emails, transcripts, or meeting minutes. Hindsight extracts objective facts and updates behavioral mental models.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Memory Bank: bank_clientpulse_{activeClient.id}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interaction Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            {/* Quick Scenario Fillers */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Quick-load realistic scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleScenarios.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setContent(s.text);
                      setChannel(s.channel);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-md transition-colors text-left"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Channel Selector */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Communication Channel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'email', label: 'Email', icon: MessageSquare },
                    { id: 'phone_call', label: 'Phone Call', icon: Phone },
                    { id: 'video_meeting', label: 'Video Call', icon: Video },
                    { id: 'notes', label: 'Meeting Memo', icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = channel === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setChannel(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversation Input */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Verbatim Conversation / Meeting Transcript / Notes
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Paste conversation details, raw transcript excerpts, client objections, or strategic commitments from ${activeClient.name}...`}
                  className="w-full px-3.5 py-3 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Calls Gemini 3.8 Flash to extract Hindsight memory entities
                </span>

                <button
                  type="submit"
                  disabled={isProcessing || !content.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Retaining into Hindsight...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Retain into Memory Bank</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Live Extraction Result Feedback */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-3">
              <Brain className="w-4 h-4 text-emerald-600" />
              <span>Hindsight Retention Pipeline</span>
            </div>

            {extractionResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Memory Retained Successfully</span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {extractionResult.extracted?.summary}
                  </p>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Sentiment: <span className="font-semibold capitalize text-slate-800">{extractionResult.extracted?.sentiment}</span>
                  </div>
                </div>

                {/* Extracted World Facts */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Extracted World Facts ({extractionResult.extracted?.world_facts?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {extractionResult.extracted?.world_facts?.map((f: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-mono uppercase mb-0.5">
                          {f.category} · {Math.round(f.confidence * 100)}% confidence
                        </div>
                        <div className="text-slate-800 font-medium">
                          {f.fact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consolidated Observations */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Consolidated Observations ({extractionResult.extracted?.observations?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {extractionResult.extracted?.observations?.map((o: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase mb-0.5">
                          {o.category} · {o.impact_level} impact
                        </div>
                        <div className="text-slate-800">
                          {o.belief}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onNavigateTab('memory')}
                    className="w-full py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Full Memory Bank</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-8 text-center space-y-2">
                <p>No interaction submitted in this session yet.</p>
                <p className="text-[11px] text-slate-400">
                  When you submit notes, Gemini extracts objective facts, assesses sentiment, links evidence, and persists into {activeClient.name}'s Hindsight bank.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
