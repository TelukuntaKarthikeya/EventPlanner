import React from 'react';
import {
  Sparkles, ShieldCheck, AlertTriangle, Settings, Plus,
  Download, Calendar, MapPin, Users, Wallet, Activity
} from 'lucide-react';
import { EventData, ValidationReport } from '../types';

interface NavbarProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onSelectEvent: (event: EventData) => void;
  onOpenIntake: () => void;
  onOpenValidation: () => void;
  onOpenSettings: () => void;
  onExportPlan: () => void;
  validation: ValidationReport | null;
  hasActiveIncidents: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenIntake,
  onOpenValidation,
  onOpenSettings,
  onExportPlan,
  validation,
  hasActiveIncidents,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  Planora AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Adaptive
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Constraint-Aware Event Planning & Execution</p>
            </div>
          </div>

          {/* Event Selector & Actions */}
          <div className="flex items-center gap-3">
            {/* Event Dropdown */}
            <div className="relative">
              <select
                aria-label="Select active event"
                value={selectedEvent?.id || ''}
                onChange={(e) => {
                  const ev = events.find((ev) => ev.id === e.target.value);
                  if (ev) onSelectEvent(ev);
                }}
                className="bg-slate-800/90 text-sm font-medium text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-slate-750 transition cursor-pointer max-w-[220px] sm:max-w-xs truncate"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.currency} {ev.total_budget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* New Event Button */}
            <button
              onClick={onOpenIntake}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition"
              title="Create new event via conversational intake"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Event</span>
            </button>

            {/* Validation Gate Badge */}
            {validation && (
              <button
                onClick={onOpenValidation}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                  validation.is_valid
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/30 hover:bg-amber-900/60'
                }`}
                title="Click to view Section 15 Final Validation Gate"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gate: {validation.score}/100</span>
              </button>
            )}

            {/* Day-Of Live Mode status */}
            <div
              className={`hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
                hasActiveIncidents
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{hasActiveIncidents ? 'Incident Active' : 'Normal Planning'}</span>
            </div>

            {/* Export Summary */}
            <button
              onClick={onExportPlan}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Export Event Master Plan (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Settings Modal Toggle */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Planora & Gemini AI Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Event Quick Bar */}
        {selectedEvent && (
          <div className="py-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {selectedEvent.date_range}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {selectedEvent.location}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                {selectedEvent.guest_count} Guests
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                {selectedEvent.currency} {selectedEvent.total_budget.toLocaleString()} Ceiling
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 hidden sm:inline">Protected Priorities:</span>
              <div className="flex items-center gap-1">
                {selectedEvent.protected_priorities.slice(0, 2).map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700/60"
                  >
                    🔒 {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
