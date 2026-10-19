import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { handleCentralAuthCallback, CentralAuthMeta } from '../../services/centralAuthService';

interface OAuthCallbackProps {
  onSuccess: (user: any, meta: CentralAuthMeta) => void;
  onErrorRedirect: () => void;
}

export default function OAuthCallback({ onSuccess, onErrorRedirect }: OAuthCallbackProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [metaInfo, setMetaInfo] = useState<CentralAuthMeta | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        const result = await handleCentralAuthCallback(window.location.search);
        setMetaInfo(result.meta);
        setStatus('success');
        
        // Brief pleasant pause to display zero-trust verification badge
        setTimeout(() => {
          onSuccess(result.user, result.meta);
        }, 800);
      } catch (err: any) {
        console.error('OAuth Callback processing failed', err);
        setErrorMsg(err.message || 'OAuth 2.1 authorization exchange failed.');
        setStatus('error');
      }
    }

    processCallback();
  }, [onSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF1F2] via-[#FAF5FF] to-[#FFF8F9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-rose-100 shadow-2xl bg-white/95 text-center space-y-6">
        
        {/* Verification in Progress */}
        {status === 'verifying' && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 animate-pulse" />
              <div className="absolute inset-0.5 rounded-[15px] bg-white flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-slate-800">
                Verifying CentralAuth Identity
              </h2>
              <p className="text-xs text-slate-500">
                Exchanging OAuth 2.1 PKCE code & validating asymmetric ES256 tokens...
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-[11px] text-purple-700 font-mono flex items-center justify-center gap-1.5 border border-purple-100">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Zero-Trust Token Hook Validation</span>
            </div>
          </div>
        )}

        {/* Verification Success */}
        {status === 'success' && (
          <div className="space-y-4 animate-scale-up">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-slate-800">
                Authentication Verified! 🛡️
              </h2>
              <p className="text-xs text-slate-500">
                Welcome to LunaFlow. Directing to your sanctuary...
              </p>
            </div>
            {metaInfo && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Client ID:</span>
                  <span className="font-mono">{metaInfo.clientId}</span>
                </div>
                {metaInfo.roles.length > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Assigned Roles:</span>
                    <span className="font-semibold">{metaInfo.roles.join(', ')}</span>
                  </div>
                )}
                {metaInfo.permissions.length > 0 && (
                  <div className="text-[10px] text-emerald-700 pt-1 border-t border-emerald-200/60 truncate">
                    Permissions: {metaInfo.permissions.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verification Error */}
        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-100">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-slate-800">
                CentralAuth Authorization Failed
              </h2>
              <p className="text-xs text-rose-600 font-medium">
                {errorMsg}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 text-[11px] text-slate-600 text-left space-y-1 border border-slate-200">
              <p className="font-bold">Next Steps:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li>Verify your application is registered in CentralAuth / Supabase OAuth Apps.</li>
                <li>Check that the redirect URI matches <code>http://localhost:5176/oauth/callback</code>.</li>
                <li>Ensure user has consented on <code>https://centralauth.vercel.app</code>.</li>
              </ul>
            </div>
            <button
              onClick={onErrorRedirect}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-rose-200 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Return to LunaFlow Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
