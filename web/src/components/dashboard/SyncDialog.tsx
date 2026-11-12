import React from 'react';
import { SyncSummary } from '../../services/gmail';
import { CheckCircle2, X, Mail, ShieldAlert } from 'lucide-react';

interface SyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SyncSummary | null;
}

export const SyncDialog: React.FC<SyncDialogProps> = ({ isOpen, onClose, summary }) => {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Email Synchronization Summary</h3>
              <p className="text-xs text-slate-500">
                {summary.isSimulated
                  ? 'Processed via simulated development pipeline'
                  : 'Processed live via Gmail Read-Only API'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Pills */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-400 uppercase font-semibold">Fetched</div>
            <div className="text-xl font-bold text-slate-800">{summary.fetchedCount}</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-xs text-emerald-600 uppercase font-semibold">Newly Ingested</div>
            <div className="text-xl font-bold text-emerald-600">{summary.processedCount}</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-xs text-amber-600 uppercase font-semibold">Deduplicated</div>
            <div className="text-xl font-bold text-amber-600">{summary.skippedCount}</div>
          </div>
        </div>

        {/* Item List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="font-semibold text-slate-700 mb-1">Ingested Source Items</div>
          {summary.items.length === 0 ? (
            <div className="text-slate-400 text-center py-6">No email items were processed in this cycle.</div>
          ) : (
            summary.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-100 bg-white shadow-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{item.subject}</div>
                  <div className="text-slate-500 text-[11px] truncate">From: {item.sender}</div>
                  <div className="text-[10px] font-mono text-slate-400">ID: {item.externalId}</div>
                </div>
                <div className="shrink-0">
                  {item.alreadyExisted ? (
                    <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Already Ingested
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Ingested
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {summary.errors.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <div className="font-semibold text-rose-800 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Processing Warnings ({summary.errors.length})
              </div>
              {summary.errors.map((e, idx) => (
                <div key={idx} className="text-[11px] text-rose-700">
                  {e.messageId}: {e.error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
