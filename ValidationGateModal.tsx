import React from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { ValidationReport } from '../types';

interface ValidationGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: ValidationReport | null;
}

export const ValidationGateModal: React.FC<ValidationGateModalProps> = ({
  isOpen,
  onClose,
  validation,
}) => {
  if (!isOpen || !validation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              validation.is_valid
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Section 15: Final Validation Gate</h2>
            <p className="text-xs text-slate-400">
              The 10-point mathematical, financial, dependency, and resilience audit.
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Validation Health Score</div>
            <div
              className={`text-3xl font-extrabold ${
                validation.score >= 90
                  ? 'text-emerald-400'
                  : validation.score >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {validation.score} / 100
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                validation.is_valid
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              {validation.is_valid ? '✓ Ready for Execution' : '⚠️ Adjustments Recommended'}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              {validation.checks.filter((c) => c.status === 'PASS').length} of {validation.checks.length} checks passed
            </div>
          </div>
        </div>

        {/* 10 Validation Checks */}
        <div className="space-y-2.5">
          {validation.checks.map((chk, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3 text-xs"
            >
              <div className="shrink-0 mt-0.5">
                {chk.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {chk.status === 'WARN' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {chk.status === 'FAIL' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              </div>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{chk.check}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      chk.status === 'PASS'
                        ? 'text-emerald-400'
                        : chk.status === 'WARN'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{chk.description}</p>
                <p className="text-[11px] text-slate-300 font-mono mt-1 pt-1 border-t border-slate-800">
                  {chk.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-5 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
