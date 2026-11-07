import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Brain,
  Code2,
  CheckCircle2,
  Server,
  Layers,
  FileCode,
  Copy,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { HindsightStatus } from '../types/client';

interface HindsightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: HindsightStatus | null;
}

export const HindsightDrawer: React.FC<HindsightDrawerProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'source_code'>('architecture');
  const [sourceFiles, setSourceFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>('backend/hindsight_engine.py');
  const [copied, setCopied] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingFiles(true);
      fetch('/api/python-source')
        .then((res) => res.json())
        .then((data) => setSourceFiles(data))
        .catch((e) => console.error('Error loading python source:', e))
        .finally(() => setLoadingFiles(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (sourceFiles[selectedFile]) {
      navigator.clipboard.writeText(sourceFiles[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Hindsight Persistent Memory Engine
              </h2>
              <p className="text-[11px] text-slate-500">
                Vectorize Hindsight Architecture & Decoupled Python Backend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'architecture'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Engine Architecture & Storage
          </button>
          <button
            onClick={() => setActiveTab('source_code')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'source_code'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Python Backend & Streamlit Source
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Engine Status Grid */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Engine Operational Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Embedded File-Backed Persistent Store</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">ACTIVE BANKS</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {status?.active_banks || 3}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">WORLD FACTS</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {status?.total_world_facts || 8}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">OBSERVATIONS</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {status?.total_observations || 4}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">EXPERIENCES</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {status?.total_experiences || 3}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  Storage Directory: <span className="text-slate-800">./data/hindsight_banks/*.json</span>
                </div>
              </div>

              {/* 3 Core Operations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  The Three Core Operations (Hindsight API)
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-900 block mb-0.5">
                      retain(bank_id, content, metadata)
                    </span>
                    <p className="text-slate-600">
                      Ingests raw conversations and meeting minutes, extracts verifiable World Facts, identifies behavioral Observations, and updates the client's Mental Model.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-900 block mb-0.5">
                      recall(bank_id, query, limit)
                    </span>
                    <p className="text-slate-600">
                      Executes parallel multi-type memory matching across facts, observations, and interaction histories.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-900 block mb-0.5">
                      reflect(bank_id, focus_topic)
                    </span>
                    <p className="text-slate-600">
                      Synthesizes high-level reasoning and evidence bundles for LLM generation, eliminating hallucinations and grounding responses in real commitments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Four Memory Types */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  The 4 Hindsight Memory Types
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">1. World Facts</span>
                    <span className="text-[11px] text-slate-500">
                      Objective data points (budgets, contracts, decision-makers, tech stack).
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">2. Experiences</span>
                    <span className="text-[11px] text-slate-500">
                      Raw chronological interaction events, quotes, and channel logs.
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">3. Observations</span>
                    <span className="text-[11px] text-slate-500">
                      Synthesized beliefs formed by evaluating multiple past memories over time.
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">4. Mental Models</span>
                    <span className="text-[11px] text-slate-500">
                      Psychological schemas, risk tolerance, and decision pace.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'source_code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {Object.keys(sourceFiles).map((file) => (
                    <button
                      key={file}
                      onClick={() => setSelectedFile(file)}
                      className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                        selectedFile === file
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium ml-2 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800">
                <pre>{sourceFiles[selectedFile] || '// Loading source...'}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
