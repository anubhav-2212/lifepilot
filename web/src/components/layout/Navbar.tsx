import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">LifePilot</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Phase 2: Auth
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Personal Life Management Agent</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center space-x-4">
            {/* Gmail connection indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border bg-slate-50">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {user.hasGmailConnected ? (
                <span className="text-emerald-700 flex items-center font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Gmail Active
                </span>
              ) : (
                <span className="text-amber-700 flex items-center font-medium">
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-600" /> Gmail Disconnected
                </span>
              )}
            </div>

            {/* User profile info */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden md:block text-left text-xs">
                <div className="font-semibold text-slate-800 leading-tight">{user.name || 'User'}</div>
                <div className="text-slate-400 text-[11px] truncate max-w-[140px]">{user.email}</div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
