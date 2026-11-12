import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, devLogin, loading } = useAuth();
  const [devEmail, setDevEmail] = useState('alex.pilot@lifepilot.local');
  const [devName, setDevName] = useState('Alex Pilot');
  const [showDevOptions, setShowDevOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          LifePilot
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Your personal life management agent. Never let a bill, appointment, subscription, or commitment fall through the cracks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 text-center">
              Sign in to your account
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Connect your account securely to manage your responsibilities.
            </p>
          </div>

          {/* Google Sign In Button */}
          <div>
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Dev Bypass Section for Instant Verification */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowDevOptions(!showDevOptions)}
              className="w-full text-center text-xs text-sky-600 hover:text-sky-700 font-medium py-1"
            >
              {showDevOptions ? 'Hide Developer Test Login' : '🛠️ Need to test without Google Cloud keys? Click here'}
            </button>

            {showDevOptions && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-700">Developer Quick-Sign In</div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Test Name</label>
                  <input
                    type="text"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Test Email</label>
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <button
                  onClick={() => devLogin(devEmail, devName)}
                  disabled={loading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition"
                >
                  Sign In As Developer User
                </button>
              </div>
            )}
          </div>

          {/* Security & Architecture Guarantees */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center text-slate-800 font-semibold mb-1">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              Security & Privacy by Design
            </div>
            <div className="flex items-start space-x-2">
              <Lock className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              <span>Tokens encrypted at rest via AES-256-GCM.</span>
            </div>
            <div className="flex items-start space-x-2">
              <Mail className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              <span>Read-only Gmail permissions. Zero external actions taken without you.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              <span>Session tokens held in secure HTTP-only cookies.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
