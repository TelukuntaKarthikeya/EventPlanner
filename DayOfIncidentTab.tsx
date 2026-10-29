import React, { useState } from 'react';
import {
  Activity, AlertCircle, Clock, Volume2, ShieldAlert,
  Send, CheckCircle2, MessageSquare, Copy, Check, Users, CloudRain, Camera
} from 'lucide-react';
import { FullEventPlan, Incident } from '../types';
import { triggerLiveDayOfIncident } from '../api';

interface DayOfIncidentTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const DayOfIncidentTab: React.FC<DayOfIncidentTabProps> = ({ plan, onRefreshPlan }) => {
  const { event, incidents, reconciliation } = plan;
  const currency = event.currency;

  const [customDescription, setCustomDescription] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeResponse, setActiveResponse] = useState<any>(null);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  const handleTriggerPreset = async (type: string, desc: string) => {
    setSubmitting(true);
    try {
      const res = await triggerLiveDayOfIncident(event.id, type, desc, customTime);
      setActiveResponse(res);
      onRefreshPlan();
    } catch (err: any) {
      alert(`Incident resolution failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDescription.trim()) return;
    await handleTriggerPreset('custom', customDescription);
    setCustomDescription('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Live Mode Emergency Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-600/50 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="font-extrabold uppercase tracking-widest text-xs text-rose-300">
              Section 11: Day-Of Incident Response Console
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Available Contingency: <b className="text-emerald-400">{currency} {reconciliation.available_contingency.toLocaleString()}</b>
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-white">Event Day Operational Incident Center</h3>
        <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
          When an unexpected event strikes during live execution, report it here immediately.
          Planora recalculates the run-of-show in real time, shields critical rituals, and drafts crew/guest broadcast messages.
        </p>
      </div>

      {/* Quick 1-Click Incident Triggers */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Fast Incident Simulation Triggers:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleTriggerPreset('photographer_late', 'Lead photographer delayed by 30 minutes in transit')}
            disabled={submitting}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-rose-500/50 text-left transition shadow group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Camera className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-100">Photographer Delayed</div>
            <div className="text-[11px] text-slate-400 mt-0.5">30 min late arrival</div>
          </button>

          <button
            onClick={() => handleTriggerPreset('extra_guests', 'Caterer reports 20 additional unannounced guests arrived')}
            disabled={submitting}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-rose-500/50 text-left transition shadow group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-100">+20 Guest Surge</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Buffet & seating shortage</div>
          </button>

          <button
            onClick={() => handleTriggerPreset('weather_rain', 'Sudden heavy rain starting over outdoor courtyard venue')}
            disabled={submitting}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-rose-500/50 text-left transition shadow group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <CloudRain className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-100">Monsoon Rain Starting</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Courtyard electrical hazard</div>
          </button>

          <button
            onClick={() => handleTriggerPreset('ceremony_delay', 'Family blessings running 45 minutes behind schedule')}
            disabled={submitting}
            className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-rose-500/50 text-left transition shadow group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-100">Ceremony Delay</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Curfew protection needed</div>
          </button>
        </div>
      </div>

      {/* Custom Incident Input */}
      <form onSubmit={handleCustomSubmit} className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex gap-2">
        <input
          type="text"
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="Report live incident (e.g. 'Sound amplifier blew a fuse on main stage', 'Shuttle bus broke down')..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />
        <button
          type="submit"
          disabled={submitting || !customDescription.trim()}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded-lg shadow transition cursor-pointer"
        >
          {submitting ? 'Resolving...' : 'Resolve Live Incident'}
        </button>
      </form>

      {/* Live Incident Mitigation Response Card */}
      {activeResponse && (
        <div className="p-5 rounded-2xl bg-slate-850 border border-rose-500/60 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-750">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <div>
                <h4 className="font-bold text-sm text-white">Live Mitigation Protocol Activated</h4>
                <p className="text-xs text-slate-400">{activeResponse.description}</p>
              </div>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
              Reported Time: {activeResponse.reported_time}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tactical Mitigation Steps */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h5 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Immediate Action Checklist
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {activeResponse.mitigation_steps?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">[{i + 1}]</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Waterfall Revised Run of Show */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h5 className="font-bold text-xs text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Revised Run of Show
              </h5>
              <div className="space-y-1.5 text-xs">
                {activeResponse.revised_run_of_show?.map((item: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-850 border border-slate-750 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-400 mr-2">{item.time}</span>
                      <span className="text-slate-200 font-medium">{item.activity}</span>
                      <div className="text-[10px] text-slate-400">{item.note}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Broadcast Announcement Draft */}
          {activeResponse.broadcast_message && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  Ready-to-Send Broadcast Announcement (Guests & Crew)
                </span>
                <button
                  onClick={() => copyToClipboard(activeResponse.broadcast_message)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  {copiedBroadcast ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBroadcast ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <p className="text-xs text-indigo-100 font-medium italic bg-indigo-900/30 p-2.5 rounded-lg border border-indigo-800/40">
                "{activeResponse.broadcast_message}"
              </p>
            </div>
          )}

          {/* Cost Authorization */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Financial Impact: <b className="text-amber-400 font-mono">{currency} {activeResponse.cost_impact.toLocaleString()}</b>
            </span>
            <span className="text-slate-400 text-[11px]">
              {activeResponse.approval_summary}
            </span>
          </div>
        </div>
      )}

      {/* Incident History Log */}
      {incidents.length > 0 && (
        <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-4 bg-slate-800/60 border-b border-slate-750">
            <h4 className="font-bold text-sm text-slate-200">Incident Event Log ({incidents.length})</h4>
          </div>
          <div className="divide-y divide-slate-800">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-amber-400 font-bold">{inc.reported_time}</span>
                    <span className="font-bold text-slate-100">{inc.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Resolved
                    </span>
                  </div>
                  {inc.broadcast_message && (
                    <p className="text-slate-400 italic text-[11px]">"{inc.broadcast_message}"</p>
                  )}
                </div>
                {inc.cost_impact > 0 && (
                  <span className="font-mono text-amber-400 font-bold shrink-0">
                    +{currency} {inc.cost_impact.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
