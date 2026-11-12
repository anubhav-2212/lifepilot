import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  syncGmailEmails,
  fetchGmailStatus,
  fetchSourceItems,
  GmailStatus,
  SourceItem,
  SyncSummary,
} from '../services/gmail';
import { SyncDialog } from '../components/dashboard/SyncDialog';
import {
  CreditCard,
  Calendar,
  Repeat,
  CheckSquare,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Inbox,
  Clock,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, loginWithGoogle, disconnectGoogle } = useAuth();
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [sourceItems, setSourceItems] = useState<SourceItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, itemsRes] = await Promise.all([
        fetchGmailStatus(),
        fetchSourceItems(1, 10),
      ]);
      setGmailStatus(statusRes);
      setSourceItems(itemsRes.items);
    } catch (err) {
      console.error('Failed to load Gmail integration data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const summary = await syncGmailEmails(15);
      setSyncSummary(summary);
      setIsDialogOpen(true);
      await loadData();
    } catch (err: any) {
      alert(`Sync failed: ${err?.response?.data?.error?.message || err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Ingestion Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Phase 3: Ingestion Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Pilot'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            LifePilot is actively monitoring your connected accounts to catch important responsibilities before they become emergencies.
          </p>

          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronizing Ingestion...' : 'Sync Emails'}
            </button>
            <span className="text-xs text-slate-400">
              {gmailStatus?.lastSyncedAt
                ? `Last synchronized: ${new Date(gmailStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Not yet synchronized'}
            </span>
          </div>
        </div>

        {/* Integration Status Card */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Gmail Status
            </span>
            {gmailStatus?.isConnected || user?.hasGmailConnected ? (
              <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Not Connected
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 mb-2">
            Ingested Emails: <strong className="text-slate-800">{gmailStatus?.totalIngestedEmails || 0}</strong>
          </div>

          {user?.hasGmailConnected || gmailStatus?.isConnected ? (
            <button
              onClick={() => disconnectGoogle()}
              className="w-full text-xs font-medium text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 py-1.5 rounded-lg transition"
            >
              Disconnect Gmail
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 py-1.5 rounded-lg transition shadow-sm"
            >
              Connect Real Google Account
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

      {/* Ingested Source Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center">
              <Inbox className="w-4 h-4 mr-2 text-sky-600" />
              Ingested Source Items (Audit Trail)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Email headers retrieved and deduplicated from Gmail, ready for AI responsibility extraction.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sourceItems.length} items logged
          </span>
        </div>

        {sourceItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No emails ingested yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Sync Emails&quot; above to ingest recent messages.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {sourceItems.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3.5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {item.subject || '(No Subject)'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.sourceType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    From: {item.sender || 'Unknown'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 flex items-center justify-end">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {item.receivedAt ? new Date(item.receivedAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    ID: {item.externalId.slice(0, 16)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Ready for Phase 4: Gemini AI Structured Extraction</span>
          <span className="text-sky-600 font-semibold inline-flex items-center">
            Next: Gemini Extraction Pipeline <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>

      {/* Sync Dialog Modal */}
      <SyncDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        summary={syncSummary}
      />
    </div>
  );
};
