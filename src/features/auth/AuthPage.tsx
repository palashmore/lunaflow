import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Heart, 
  CheckCircle2, 
  KeyRound, 
  HelpCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { startCentralAuthLogin } from '../../services/centralAuthService';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
  onEnterGuestMode?: () => void;
}

export default function AuthPage({ onLoginSuccess, onEnterGuestMode }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('lunaflow_auth_email') || '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthYear, setBirthYear] = useState('2002');
  const [loading, setLoading] = useState(false);
  const [centralAuthLoading, setCentralAuthLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Catch error parameters in URL hash from Supabase email link redirects (e.g., otp_expired)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');

      if (errorDescription || errorCode) {
        const decoded = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : '';
        if (errorCode === 'otp_expired' || decoded.toLowerCase().includes('expired')) {
          setErrorMsg('The email confirmation link has expired or was already used. Please request a new confirmation link below.');
        } else {
          setErrorMsg(decoded || `Authentication error: ${errorCode}`);
        }
        // Clean hash from URL so it doesn't linger on refresh
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  async function handleCentralAuthLogin() {
    try {
      setCentralAuthLoading(true);
      setErrorMsg('');
      await startCentralAuthLogin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate CentralAuth OAuth 2.1 flow.');
      setCentralAuthLoading(false);
    }
  }

  async function handleResendConfirmation() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address to receive a fresh confirmation link.');
      return;
    }
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setSuccessMsg(`A fresh confirmation email has been sent to ${trimmedEmail}! Please check your inbox and spam folder.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      localStorage.setItem('lunaflow_auth_email', trimmedEmail);
    }

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccessMsg('Password reset link sent! Check your inbox.');
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              display_name: displayName.trim() || 'Luna',
              birth_year: Number(birthYear),
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Account created successfully! Welcome to LunaFlow ✨');
          onLoginSuccess(data.user);
        } else {
          setSuccessMsg('Account registered! A confirmation email has been sent. Please verify it or sign in.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setSuccessMsg('Welcome back to your Sanctuary! ✨');
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF1F2] via-[#FAF5FF] to-[#FFF8F9] flex flex-col items-center justify-center p-4 selection:bg-rose-200">
      {/* Background ambient lighting */}
      <div className="fixed top-12 -left-20 w-72 h-72 rounded-full bg-rose-200/50 blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 -right-20 w-80 h-80 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-panel p-7 sm:p-8 rounded-3xl border border-rose-100/90 shadow-xl bg-white/90 space-y-6">
        {/* Brand Showcase */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 p-0.5 shadow-md shadow-rose-200 mb-1">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <span className="text-2xl">🌸</span>
            </div>
          </div>
          <h1 className="text-2xl font-serif font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            LunaFlow
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Your private cycle intelligence, hygiene stock & personal wellness sanctuary
          </p>

          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50/90 border border-purple-200 px-3 py-1 rounded-full max-w-fit mx-auto shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>CentralAuth OAuth 2.1 & Supabase Enabled</span>
          </div>
        </div>

        {/* CentralAuth OAuth 2.1 Single Sign-On Button */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleCentralAuthLogin}
            disabled={centralAuthLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white font-bold text-xs shadow-md shadow-purple-200/60 hover:shadow-lg hover:shadow-purple-300/80 hover:opacity-95 transition-all flex items-center justify-center gap-2 group active:scale-[0.99] border border-purple-500/30"
          >
            <ShieldCheck className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
            <span>{centralAuthLoading ? 'Connecting to CentralAuth...' : 'Sign In with CentralAuth SSO'}</span>
          </button>

          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-slate-200/80" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">or email & password</span>
            <div className="flex-1 h-px bg-slate-200/80" />
          </div>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        {!isResetPassword && (
          <div className="flex bg-slate-100/90 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                !isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
          {isResetPassword ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <KeyRound className="w-4 h-4 text-rose-500" />
                <span>Reset Your Password</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter your account email and we will send you a secure link to reset your password.
              </p>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Email Address</label>
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
            </div>
          ) : (
            <>
              {isSignUp && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-500 font-medium mb-1">Your Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Luna"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Birth Year</label>
                    <input
                      type="number"
                      min="1950"
                      max="2016"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 text-center font-semibold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-medium mb-1">Email Address</label>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 font-medium">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsResetPassword(true)}
                      className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    data-1p-ignore="true"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Resend confirmation button if required */}
          {(errorMsg.toLowerCase().includes('confirm') || errorMsg.toLowerCase().includes('expired')) && (
            <button
              type="button"
              disabled={resending}
              onClick={handleResendConfirmation}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-bold text-[11px] hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending fresh link...' : 'Resend Confirmation Email'}</span>
            </button>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Please wait...' : isResetPassword ? 'Send Reset Link' : isSignUp ? 'Create My Sanctuary Account' : 'Sign In to LunaFlow'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {isResetPassword && (
            <button
              type="button"
              onClick={() => {
                setIsResetPassword(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {/* Guest Demo Mode Option */}
        {onEnterGuestMode && (
          <div className="pt-2 border-t border-rose-100/60 text-center space-y-2">
            <button
              type="button"
              onClick={onEnterGuestMode}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-medium underline decoration-slate-200"
            >
              Explore in Guest Mode (Offline demo)
            </button>
          </div>
        )}

        {/* Security & Medical Privacy Guarantee */}
        <div className="pt-2 text-center text-[10px] text-slate-400 leading-relaxed">
          <p>🔒 Protected by PostgreSQL Row Level Security (RLS).</p>
          <p>Your intimate health records are only accessible by you.</p>
        </div>
      </div>
    </div>
  );
}
