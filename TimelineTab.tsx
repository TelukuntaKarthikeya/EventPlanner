import React, { useState } from 'react';
import {
  Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  GitBranch, RefreshCw, Zap, ShieldAlert, User, Check
} from 'lucide-react';
import { FullEventPlan, TaskItem } from '../types';
import { updateTaskStatus, shiftTaskTimeline } from '../api';

interface TimelineTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ plan, onRefreshPlan }) => {
  const { event, tasks, timeline_analysis } = plan;
  const currency = event.currency;

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [newDeadline, setNewDeadline] = useState<string>('2026-10-25');
  const [shifting, setShifting] = useState(false);
  const [shiftResult, setShiftResult] = useState<any>(null);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(event.id, taskId, newStatus);
      onRefreshPlan();
    } catch (err: any) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  const handleExecuteShift = async () => {
    setShifting(true);
    try {
      const res = await shiftTaskTimeline(event.id, selectedTaskId, newDeadline);
      setShiftResult(res);
      onRefreshPlan();
    } catch (err: any) {
      alert(`Failed to shift timeline: ${err.message}`);
    } finally {
      setShifting(false);
    }
  };

  const isCritical = (id: string) => timeline_analysis.critical_path_ids.includes(id);

  return (
    <div className="space-y-6">
      {/* Top Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 mb-1">Total Scheduled Tasks</div>
          <div className="text-2xl font-bold text-slate-100">{timeline_analysis.total_tasks}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">
            {timeline_analysis.completed_count} completed • {timeline_analysis.in_progress_count} in progress
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 mb-1">Critical Path Length</div>
          <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-amber-400" />
            {timeline_analysis.critical_path_ids.length} Tasks
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero slack dependency chain</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 mb-1">Overdue Action Items</div>
          <div
            className={`text-2xl font-bold ${
              timeline_analysis.overdue_tasks.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {timeline_analysis.overdue_tasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {timeline_analysis.overdue_tasks.length > 0 ? 'Requires date realignment' : 'All deadlines current'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">Dependency Status</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DAG Verified</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">No circular locks</div>
          </div>
          <button
            onClick={() => {
              setSelectedTaskId(tasks[0]?.id || '');
              setNewDeadline(tasks[0]?.deadline?.slice(0, 10) || '2026-10-25');
              setShiftResult(null);
              setShiftModalOpen(true);
            }}
            className="px-3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            Cascade Reschedule
          </button>
        </div>
      </div>

      {/* Dependency Conflicts Banner (if any) */}
      {timeline_analysis.conflict_tasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Dependency Chronology Conflicts Detected ({timeline_analysis.conflict_tasks.length})</span>
          </div>
          {timeline_analysis.conflict_tasks.map((c, idx) => (
            <div key={idx} className="text-xs bg-rose-900/30 p-2.5 rounded-lg border border-rose-800/60">
              {c.issue}
            </div>
          ))}
        </div>
      )}

      {/* Critical Path Flow View */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">Critical Path Sequence</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Delays in these tasks directly postpone the event execution
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {timeline_analysis.critical_tasks.map((ct, idx) => (
            <React.Fragment key={ct.id}>
              <div className="shrink-0 p-3 rounded-xl bg-slate-800 border border-amber-500/40 w-56 shadow-sm">
                <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
                  <span>STEP {idx + 1}</span>
                  <span className="font-mono text-slate-300">{ct.deadline.slice(0, 10)}</span>
                </div>
                <div className="font-bold text-slate-100 text-xs truncate" title={ct.name}>
                  {ct.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>👤 {ct.owner}</span>
                  <span className="text-emerald-400 font-medium">{ct.status}</span>
                </div>
              </div>
              {idx < timeline_analysis.critical_tasks.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Complete Task Run-of-Show List */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-800/60 border-b border-slate-750 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-200">
            Logistics Dependency Run-of-Show
          </h4>
          <span className="text-xs text-slate-400">
            Click status button to update progress in real time
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {tasks.map((task) => {
            const onCritical = isCritical(task.id);
            return (
              <div
                key={task.id}
                className={`p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  onCritical ? 'bg-amber-950/10 hover:bg-amber-950/20' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {task.id}
                    </span>
                    <h5 className="font-bold text-sm text-slate-100">{task.name}</h5>
                    {onCritical && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ Critical Path
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                      {task.category}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>📅 Deadline: <b className="text-slate-200 font-mono">{task.deadline.slice(0, 10)}</b></span>
                    <span>👤 Lead: <b className="text-slate-300">{task.owner}</b></span>
                    {task.dependencies && task.dependencies.length > 0 && (
                      <span>Prerequisites: <b className="text-indigo-400">{task.dependencies.join(', ')}</b></span>
                    )}
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <select
                    aria-label={`Status for task ${task.name}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition ${
                      task.status === 'Completed'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : task.status === 'In Progress'
                        ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                        : task.status === 'Blocked'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">✓ Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cascade Reschedule Modal */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Cascade Reschedule Engine
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Section 6: When an upstream task deadline shifts, downstream dependent deadlines are recalculated automatically.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Delayed / Postponed Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    const t = tasks.find((tk) => tk.id === e.target.value);
                    if (t) setNewDeadline(t.deadline.slice(0, 10));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.id}] {t.name} ({t.deadline.slice(0, 10)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Shifted Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShiftModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={handleExecuteShift}
                  disabled={shifting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow"
                >
                  {shifting ? 'Recalculating Cascade...' : 'Shift & Recalculate'}
                </button>
              </div>

              {shiftResult && (
                <div className="mt-4 p-3 rounded-xl bg-slate-850 border border-indigo-500/40 text-xs space-y-2">
                  <div className="font-bold text-indigo-300">{shiftResult.recommendation}</div>
                  <div className="text-slate-300">
                    Affected Downstream Tasks: <b>{shiftResult.affected_count}</b>
                  </div>
                  {shiftResult.cascade_updates?.map((u: any) => (
                    <div key={u.id} className="text-[11px] text-slate-400">
                      • {u.name}: shifted from {u.old_deadline} → <b className="text-amber-400">{u.new_deadline}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
