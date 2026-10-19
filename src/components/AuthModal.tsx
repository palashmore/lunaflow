import React, { useState } from 'react';
import { X, Cloud, Lock, Mail, User, Check, Settings, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured, setSupabaseConfig, SUPABASE_URL } from '../services/supabase';
import { getCentralAuthMeta, clearCentralAuthMeta, startCentralAuthLogin, DEFAULT_CLIENT_ID } from '../services/centralAuthService';

interface AuthModalProps {
  user: any;
  onClose: () => void;
  onAuthChange: (user: any) => void;
  onLogout?: () => void;
}

export default function AuthModal({ onClose, user, onAuthChange, onLogout }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'config'>(isSupabaseConfigured ? 'login' : 'config');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [urlInput, setUrlInput] = useState(SUPABASE_URL || '');
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [centralAuthLoading, setCentralAuthLoading] = useState(false);

  const centralAuthMeta = getCentralAuthMeta();

  async function handleCentralAuthLogin() {
    try {
      setCentralAuthLoading(true);
      setErrorMsg('');
      await startCentralAuthLogin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate CentralAuth OAuth 2.1');
      setCentralAuthLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured yet. Please configure your Project URL and Key first.');
      }

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || 'Luna Goddess' },
          },
        });
        if (error) throw error;
        setSuccessMsg('Account created successfully! Check your email to confirm or sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Welcome back to your Sanctuary! ✨');
        if (onAuthChange) onAuthChange(data.user);
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (onLogout) {
      onLogout();
      onClose();
      return;
    }
    clearCentralAuthMeta();
    try {
      if (supabase) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    if (onAuthChange) onAuthChange(null);
    onClose();
    window.location.reload();
  }

  function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setErrorMsg('Please enter both Project URL and Anon API key.');
      return;
    }
    setSupabaseConfig(urlInput.trim(), keyInput.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/80 shadow-2xl bg-white/95 my-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-800">
                {user ? 'Cloud Account' : isSupabaseConfigured ? 'Sign In to LunaFlow' : 'Free Database Setup'}
              </h2>
              <p className="text-[11px] text-slate-400">100% Free Supabase PostgreSQL Cloud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Connected & Cloud Protected</span>
              </div>
              <p className="text-[11px] text-emerald-800/80">
                Logged in as <strong>{user.email}</strong>. Intimate records synchronized with PostgreSQL RLS.
              </p>

              {/* CentralAuth Identity Badge if authenticated via OAuth 2.1 */}
              {centralAuthMeta && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-purple-800 font-bold font-sans">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>CentralAuth Zero-Trust Identity</span>
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[9px]">
                      {centralAuthMeta.clientId}
                    </span>
                  </div>
                  {centralAuthMeta.roles.length > 0 && (
                    <div className="text-slate-700">
                      Roles: <strong className="text-purple-700">{centralAuthMeta.roles.join(', ')}</strong>
                    </div>
                  )}
                  {centralAuthMeta.permissions.length > 0 && (
                    <div className="text-slate-500 truncate">
                      Perms: {centralAuthMeta.permissions.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-slate-500 font-medium mb-1">Your Name / Nickname</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Luna"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-500 font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  data-1p-ignore="true"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 text-[11px]">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px]">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Create Free Account' : 'Sign In'}
            </button>

            <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setMode('config')}
                className="hover:text-rose-600 underline"
              >
                Change Supabase Project
              </button>
              <button
                type="button"
                onClick={onClose}
                className="hover:text-slate-600"
              >
                Use Offline Mode
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
