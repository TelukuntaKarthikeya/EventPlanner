import React, { useState } from 'react';
import {
  ShieldAlert, AlertTriangle, CloudRain, UserX, Users,
  Clock, Zap, CheckCircle2, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import { FullEventPlan, StressTestScenario } from '../types';
import { runRedTeamStressTests } from '../api';

interface StressTestTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const StressTestTab: React.FC<StressTestTabProps> = ({ plan, onRefreshPlan }) => {
  const { event, stress_tests, reconciliation } = plan;
  const currency = event.currency;

  const [expandedId, setExpandedId] = useState<string | null>(stress_tests[0]?.id || null);
  const [runningSim, setRunningSim] = useState(false);

  const handleRunAllTests = async () => {
    setRunningSim(true);
    try {
      await runRedTeamStressTests(event.id);
      onRefreshPlan();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setRunningSim(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'High') {
      return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
    } else if (sev === 'Medium') {
      return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
    }
    return 'bg-sky-950/60 text-sky-300 border-sky-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Plan Stress-Tester: Red Team Your Event</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Section 7: Structured pre-mortem simulation. We pressure-test your plan against real-world chaos before the event starts,
            exposing vulnerabilities and pre-approving recovery protocols.
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          disabled={runningSim}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/30 transition shrink-0 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{runningSim ? 'Simulating Failure Modes...' : 'Run Full Red Team Suite'}</span>
        </button>
      </div>

      {/* Contingency Safety Check */}
      <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span>
          Available Contingency Buffer to absorb stress: <b className="text-emerald-400">{currency} {reconciliation.available_contingency.toLocaleString()}</b>
        </span>
        <span className="text-slate-400 text-[11px]">
          Rule: If financial impact exceeds buffer, user must authorize reallocation.
        </span>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-3">
        {stress_tests.map((sc) => {
          const isExpanded = expandedId === sc.id;
          return (
            <div
              key={sc.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-850 border-rose-500/40 shadow-lg'
                  : 'bg-slate-850/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : sc.id)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{sc.scenario_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{sc.first_failure}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(sc.severity)}`}>
                    {sc.severity} Severity
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline">
                    {sc.likelihood} Likelihood
                  </span>
                  {sc.financial_impact > 0 && (
                    <span className="text-xs font-mono font-bold text-amber-400 hidden sm:inline">
                      {currency} {sc.financial_impact.toLocaleString()}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Expanded 7-Step Red Team Analysis */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Q1: What fails first? */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                        1. What Fails First?
                      </div>
                      <p className="text-slate-200 leading-relaxed">{sc.first_failure}</p>
                    </div>

                    {/* Q2: Affected items & guests */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                        2. Affected Tasks & Guest Arrangements
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sc.affected_items.map((item, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                            • {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Q3: Invalidated assumptions */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                        3. Invalidated Planning Assumptions
                      </div>
                      <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                        {sc.invalidated_assumptions.map((assump, i) => (
                          <li key={i}>{assump}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Q4: Immediate tactical response */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        4. Immediate Response Protocol (First 5 Mins)
                      </div>
                      <p className="text-slate-200 leading-relaxed">{sc.immediate_response}</p>
                    </div>

                    {/* Q5: Backup plan */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                        5. Structured Recovery & Backup Plan
                      </div>
                      <p className="text-slate-200 leading-relaxed">{sc.backup_plan}</p>
                    </div>

                    {/* Q6 & Q7: Financial impact & Approvals */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          6. Financial Impact
                        </div>
                        <div className="font-mono text-base font-bold text-amber-400">
                          {currency} {sc.financial_impact.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400 ml-2">
                            ({sc.financial_impact <= reconciliation.available_contingency ? 'Absorbable by contingency' : 'Exceeds current contingency!'})
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          7. Required User Approvals
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sc.required_approvals.map((appr, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 text-[11px] border border-rose-800/60">
                              🔒 {appr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
