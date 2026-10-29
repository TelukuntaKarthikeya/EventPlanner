import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { saveGeminiApiKey } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyConfigured: boolean;
  onKeySaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeyConfigured,
  onKeySaved,
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveGeminiApiKey(apiKey);
      setSavedSuccess(true);
      onKeySaved();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`Failed to save key: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Key className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-white">Planora & Gemini AI Settings</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Configure your Google Gemini API key. When an API key is provided, Planora routes prompts directly through Gemini 2.0 Flash with the Master System Prompt.
        </p>

        <div className="mb-4 p-3 rounded-xl bg-slate-850 border border-slate-850 flex items-center justify-between text-xs">
          <span className="text-slate-300">Live Gemini API Status:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded ${
              apiKeyConfigured
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {apiKeyConfigured ? '✓ Active & Connected' : 'Deterministic Core Active'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Saved securely to local backend <code className="text-emerald-400">.env</code>. Never exposed to clients.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg shadow"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : saving ? 'Saving...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
