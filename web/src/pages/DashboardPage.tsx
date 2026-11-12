import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Calendar,
  Repeat,
  CheckSquare,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, loginWithGoogle, disconnectGoogle } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Session Authenticated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Pilot'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            LifePilot is actively monitoring your connected accounts to catch important responsibilities.
          </p>
        </div>

        {/* Integration Status Card */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Gmail Integration
            </span>
            {user?.hasGmailConnected ? (
              <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Not Connected
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mb-3">
            {user?.hasGmailConnected
              ? 'Gmail read-only sync is enabled and encrypted.'
              : 'Connect your Google account to enable email responsibility extraction.'}
          </div>
          {user?.hasGmailConnected ? (
            <button
              onClick={() => disconnectGoogle()}
              className="w-full text-xs font-medium text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 py-1.5 rounded-lg transition"
            >
              Disconnect Google Account
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 py-1.5 rounded-lg transition shadow-sm"
            >
              Connect Gmail Account
            </button>
          )}
        </div>
      </div>

      {/* 4 Core LifePilot Category Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bills */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Bills & Utilities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
          <p className="text-xs text-slate-400 mt-1">Pending payments due</p>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
          <p className="text-xs text-slate-400 mt-1">Upcoming scheduled events</p>
        </div>

        {/* Subscriptions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
          <p className="text-xs text-slate-400 mt-1">Recurring renewal notices</p>
        </div>

        {/* Commitments */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Commitments</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
          <p className="text-xs text-slate-400 mt-1">Action items & follow-ups</p>
        </div>
      </div>

      {/* Security & Pipeline Readiness Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">Phase 2 Verification Complete</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">User ID: {user?.id}</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Authentication and secure session persistence have been verified. The system uses signed HTTP-only cookies, protected backend routes, and AES-256-GCM encrypted token storage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <span className="text-slate-600">Email Address:</span>
            <span className="font-medium text-slate-900">{user?.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <span className="text-slate-600">Timezone:</span>
            <span className="font-mono text-slate-900">{user?.timezone}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Ready for Phase 3: Gmail Ingestion Pipeline</span>
          <span className="text-sky-600 font-semibold inline-flex items-center">
            Next: Gmail Sync API <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>
    </div>
  );
};
