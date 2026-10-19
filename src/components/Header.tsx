import React from 'react';
import { 
  Lock, 
  Calculator, 
  Cloud, 
  CloudOff, 
  Globe, 
  Sun, 
  Moon, 
  Bell 
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';
import { SupportedLanguage } from '../i18n';

interface HeaderProps {
  profile: UserProfile;
  user: any;
  onOpenAuth: () => void;
  onToggleCamouflage: () => void;
  onLockApp: () => void;
  onOpenReminders: () => void;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onToggleTheme: () => void;
}

export default function Header({ 
  profile, 
  user,
  onOpenAuth, 
  onToggleCamouflage, 
  onLockApp, 
  onOpenReminders,
  onChangeLanguage,
  onToggleTheme
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-rose-100/80 px-4 py-3 backdrop-blur-md">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-purple-400 p-0.5 shadow-sm shadow-rose-200">
            <div className="w-full h-full bg-white/95 rounded-[14px] flex items-center justify-center">
              <span className="text-xl">🌸</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-serif font-bold tracking-tight bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                LunaFlow
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              Hello, {profile.displayName || 'Goddess'} ✨
            </p>
          </div>
        </div>

        {/* Quick Privacy, Reminders, Language & Auth Actions */}
        <div className="flex items-center gap-1">
          {/* Reminders Button */}
          <button
            onClick={onOpenReminders}
            title="Reminders & Notifications"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="relative group">
            <button
              title="Change Language"
              className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-rose-50/80 transition-colors flex items-center gap-0.5 text-xs font-bold"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase text-[10px]">{profile.language || 'en'}</span>
            </button>
            <div className="absolute right-0 mt-1 w-28 glass-panel rounded-2xl shadow-lg border border-rose-100 p-1.5 hidden group-hover:block z-50 bg-white/95 text-xs">
              <button
                onClick={() => onChangeLanguage('en')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium hover:bg-rose-50 ${profile.language === 'en' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-700'}`}
              >
                English
              </button>
              <button
                onClick={() => onChangeLanguage('hi')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium hover:bg-rose-50 ${profile.language === 'hi' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-700'}`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => onChangeLanguage('mr')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium hover:bg-rose-50 ${profile.language === 'mr' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-700'}`}
              >
                मराठी (Marathi)
              </button>
            </div>
          </div>

          {/* Camouflage Mode */}
          <button
            onClick={onToggleCamouflage}
            title="Camouflage App (Disguise as Calculator)"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-rose-50/80 transition-colors"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* PIN Lock */}
          {profile.privacyPin && (
            <button
              onClick={onLockApp}
              title="Lock Screen"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Cloud Auth Status */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              user
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                : isSupabaseConfigured
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {user ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                <span>{isSupabaseConfigured ? 'Sign In' : 'Cloud'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
