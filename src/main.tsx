// Placeholder entry point. Replace this folder with your real `src/` (main.tsx, App.tsx, components...).
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Placeholder() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-3xl font-bold text-emerald-400">Planora AI</h1>
        <p className="text-slate-300">
          The app's source files (<code>src/</code>) haven't been uploaded to the repository yet.
          Upload your <code>src</code> folder next to <code>index.html</code> to deploy the full app.
        </p>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Placeholder />
  </React.StrictMode>
);
