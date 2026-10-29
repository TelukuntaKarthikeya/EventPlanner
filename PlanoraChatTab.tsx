import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, Bot, User, ShieldCheck, AlertCircle,
  Lightbulb, ArrowRight, CornerDownLeft, RefreshCw
} from 'lucide-react';
import { FullEventPlan, ChatMessage } from '../types';
import { sendChatMessage } from '../api';

interface PlanoraChatTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const PlanoraChatTab: React.FC<PlanoraChatTabProps> = ({
  plan,
  onRefreshPlan,
  onNavigateTab,
}) => {
  const { event, reconciliation, validation } = plan;
  const currency = event.currency;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Planora AI**, your adaptive event planning agent for **${event.name}**.\n\nI operate under your strict budget ceiling of **${currency} ${event.total_budget.toLocaleString()}** and protect your priority commitments:\n${event.protected_priorities.map((p) => `- 🔒 **${p}**`).join('\n')}\n\nI'm ready to evaluate trade-offs, stress-test risks, draft vendor RFPs, or simulate day-of live incidents. How can I assist you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine_source: 'Planora Deterministic AI Core',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(event.id, text);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine_source: res.engine_source,
        payload: {
          validation_score: res.validation?.score,
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);
      onRefreshPlan();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Encountered an issue connecting to the planning engine: ${err.message}. Please verify the backend service is running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine_source: 'System Error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    `How does our budget compare against the ${currency} ${event.total_budget.toLocaleString()} ceiling?`,
    'What happens if severe weather strikes our venue on event day?',
    'Review Section 15 validation readiness and dependency risks',
    'How do we handle 25 unannounced additional guests?',
    'Draft a vendor RFP for catering with dietary requirements',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Context Top Bar */}
      <div className="p-3 bg-slate-850/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-slate-200">Active Event Context:</span>
          <span className="text-emerald-400 font-bold">{event.name}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="inline-flex items-center gap-1">
            Ceiling: <b className="text-slate-200">{currency} {event.total_budget.toLocaleString()}</b>
          </span>
          <span className="inline-flex items-center gap-1">
            Projected: <b className={reconciliation.is_over_budget ? 'text-rose-400' : 'text-emerald-400'}>
              {currency} {reconciliation.total_projected_cost.toLocaleString()}
            </b>
          </span>
          <span className="inline-flex items-center gap-1">
            Validation Gate: <b className="text-emerald-400">{validation.score}/100</b>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 max-w-3xl ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                m.role === 'user'
                  ? 'bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'bg-emerald-600 shadow-md shadow-emerald-600/30'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {m.content.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="font-bold text-sm text-emerald-400 mt-2 mb-1">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={idx} className="font-bold text-slate-100 my-1">{line.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={idx} className={line === '' ? 'h-2' : 'my-0.5'}>{line}</p>;
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>{m.timestamp}</span>
                {m.engine_source && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-750 font-mono">
                    {m.engine_source}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/50 flex items-center justify-center text-white animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Planora AI is checking financial constraints and dependency graphs...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-500 shrink-0 flex items-center gap-1 font-medium text-[11px]">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Quick Ask:
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 hover:border-emerald-500/40 border border-slate-700 text-slate-300 text-[11px] transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-slate-850 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Planora to adjust budget, negotiate trade-offs, test risks, or check tasks..."
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
