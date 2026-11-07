import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Brain,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Client, MemoryBank } from '../types/client';

interface AiAssistantViewProps {
  activeClient: Client | null;
  memoryBank: MemoryBank | null;
  onNavigateTab: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  memoriesConsidered?: number;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  activeClient,
  memoryBank,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!activeClient) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">Please select a client to chat with the AI assistant.</p>
      </div>
    );
  }

  const sampleQuestions = [
    `What are ${activeClient.name}'s main objections and contract friction points?`,
    `What specific revenue targets and budget figures (in ₹) are on record for this client?`,
    `How does their CAC target (₹4,200) compare with their current ad spend?`,
    `How should our agency structure our next update memo to match their preferred format?`,
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/clients/${activeClient.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!response.ok) {
        throw new Error('Failed to query client assistant');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memoriesConsidered: data.memories_considered,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving memories from the Hindsight bank. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">
            <span>Hindsight Reflect Engine</span>
            <span className="text-slate-300">/</span>
            <span>Gemini 3.8 Flash Context Synthesis</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Client Intelligence Assistant · {activeClient.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask any question about {activeClient.company}. Answers are synthesized strictly from recalled facts, observations, and interaction histories.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('recommendations')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Generate Follow-up Strategy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Client Quick Memory Dossier */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block">
              Active Memory Context
            </span>

            <div className="text-xs space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Persona</span>
                <span className="font-semibold text-slate-800">
                  {memoryBank?.mental_model?.persona || 'Strategic Executive'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Retained Facts</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {memoryBank?.world_facts?.length || 0} objective facts
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Observations</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {memoryBank?.observations?.length || 0} consolidated
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('memory')}
              className="w-full text-xs text-slate-600 hover:text-slate-900 font-medium py-1 text-center block"
            >
              Browse entire memory bank →
            </button>
          </div>
        </div>

        {/* Right 3 Cols: Conversational Assistant View */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Recommended Memory Queries:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="p-2.5 text-xs text-left bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-slate-700 hover:text-slate-950 transition-colors shadow-xs flex items-center justify-between gap-2 group"
                >
                  <span className="line-clamp-1">{q}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[460px]">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="font-medium text-slate-700">
                    Ready to answer any question about {activeClient.name}.
                  </p>
                  <p className="max-w-md text-slate-400">
                    Click a recommended memory query above or type any specific question about pricing, contract terms, or past conversations.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}

                      <div
                        className={`max-w-xl rounded-xl p-3.5 space-y-1.5 shadow-xs ${
                          isUser
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 border border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                          <span>{isUser ? 'Account Lead' : 'ClientPulse AI'}</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                          {msg.text}
                        </div>

                        {!isUser && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-mono">
                              Hindsight memory grounded ({msg.memoriesConsidered || 15} entities)
                            </span>
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-1"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex gap-3 text-xs justify-start">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                    <span>Recalling memory bank and synthesizing answer...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-b-xl"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask anything about ${activeClient.name} or past interactions...`}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
