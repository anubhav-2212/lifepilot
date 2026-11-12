import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, RefreshCw, Shield, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  services: {
    database: string;
  };
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      if (res.data.success) {
        setHealth(res.data.data);
      } else {
        setError('Health check reported non-success status.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to reach API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">LifePilot</span>
              <span className="text-xs ml-2 font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Phase 1: Foundation
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 transition"
            >
              Docs & Architecture
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Personal Life Management Agent</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Never miss an important responsibility hidden in your digital life.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            LifePilot turns unstructured emails and notifications into structured, actionable life obligations—from electricity bills and doctor appointments to subscriptions and personal follow-ups.
          </p>
        </div>

        {/* Phase 1 Verification Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">System Foundation Status</h2>
              <p className="text-xs text-slate-500">Checking API server & PostgreSQL database health</p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {/* Backend API status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="text-sm font-medium text-slate-800">Express API Server</div>
                  <div className="text-xs text-slate-400">Node.js + TypeScript Modular Monolith</div>
                </div>
              </div>
              <div>
                {loading ? (
                  <span className="text-xs text-slate-400">Pinging...</span>
                ) : health?.status === 'healthy' ? (
                  <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Online (:4000)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Offline
                  </span>
                )}
              </div>
            </div>

            {/* PostgreSQL Database status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="text-sm font-medium text-slate-800">PostgreSQL Database (Prisma)</div>
                  <div className="text-xs text-slate-400">Docker container on port 5432</div>
                </div>
              </div>
              <div>
                {loading ? (
                  <span className="text-xs text-slate-400">Checking...</span>
                ) : health?.services?.database === 'connected' ? (
                  <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Disconnected
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-lg border border-rose-200">
                Connection Error: {error}
              </div>
            )}

            {health && (
              <div className="text-[11px] text-slate-400 font-mono text-center pt-2">
                Server timestamp: {health.timestamp} • Uptime: {Math.round(health.uptime)}s
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Ready for Phase 2: Google OAuth & Session Management</span>
            <span className="inline-flex items-center text-xs font-semibold text-sky-600">
              Next Up <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        LifePilot © 2026. Built with precision and privacy first.
      </footer>
    </div>
  );
};

export default App;
