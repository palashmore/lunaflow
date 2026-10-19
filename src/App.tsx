import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TodayTab from './components/TodayTab';
import CalendarTab from './components/CalendarTab';
import DiaryTab from './components/DiaryTab';
import SanitaryTab from './components/SanitaryTab';
import DoctorReportTab from './components/DoctorReportTab';
import SosCrampModal from './components/SosCrampModal';
import AuthModal from './components/AuthModal';
import PeriodDateModal from './components/PeriodDateModal';
import CamouflageView from './components/CamouflageView';
import PinLockScreen from './components/PinLockScreen';
import InsightsTab from './features/insights/InsightsTab';
import RemindersTab from './features/reminders/RemindersTab';
import WellnessTab from './features/wellness/WellnessTab';
import AuthPage from './features/auth/AuthPage';
import OAuthCallback from './features/auth/OAuthCallback';

import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  BookHeart, 
  Package, 
  BarChart3,
  FileText,
  BookOpen
} from 'lucide-react';

import { StorageAdapter, INITIAL_PROFILE, INITIAL_INVENTORY } from './services/storageAdapter';
import { clearCentralAuthMeta } from './services/centralAuthService';
import { calculateCycleStatus, formatDate } from './services/cycleEngine';
import { supabase } from './services/supabase';
import { UserProfile, DailyLog, SanitaryItem } from './types';
import { getTranslations, SupportedLanguage } from './i18n';

type ActiveTab = 'today' | 'calendar' | 'diary' | 'sanitary' | 'insights' | 'report' | 'wellness';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [inventory, setInventory] = useState<SanitaryItem[]>(INITIAL_INVENTORY);
  const [user, setUser] = useState<any>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');

  // Modals & Privacy screens
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isCamouflaged, setIsCamouflaged] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean>(() => Boolean(profile.privacyPin));

  const t = getTranslations(profile.language || 'en');

  // Compute live cycle calculations
  const cycleStatus = calculateCycleStatus(
    profile.lastPeriodDate,
    profile.avgCycleLength || 28,
    profile.avgPeriodLength || 5,
    profile.isCycleRegular
  );

  // Hydrate user-isolated data when session changes
  async function syncUserData(currentUser: any) {
    if (currentUser) {
      const data = await StorageAdapter.loadUserDataFromSupabase(currentUser);
      setProfile(data.profile);
      setDailyLogs(data.dailyLogs);
      setInventory(data.inventory);
    } else {
      StorageAdapter.setUserId(null);
      setProfile(INITIAL_PROFILE);
      setDailyLogs({});
      setInventory(INITIAL_INVENTORY);
    }
  }

  // Supabase Auth listener & per-user session restore
  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await syncUserData(currentUser);
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      await syncUserData(currentUser);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update profile
  function handleSaveProfile(updatedProfile: UserProfile) {
    setProfile(updatedProfile);
    StorageAdapter.saveProfile(updatedProfile);
  }

  // Update daily log
  function handleSaveLog(dateStr: string, logData: Partial<DailyLog>) {
    const updated = StorageAdapter.saveDailyLog(dateStr, logData);
    setDailyLogs({ ...updated });
  }

  // Quick log updater from Today tab (e.g. water count)
  function handleQuickTodayLogUpdate(fields: Partial<DailyLog>) {
    const todayStr = formatDate(new Date());
    const existing = dailyLogs[todayStr] || {
      logDate: todayStr,
      flow: 'none',
      symptoms: [],
      moods: [],
      waterGlasses: 0,
      sleepHours: 7.5,
      notes: '',
    };
    const updated = StorageAdapter.saveDailyLog(todayStr, { ...existing, ...fields });
    setDailyLogs({ ...updated });
  }

  // Inventory count updater
  function handleUpdateInventoryCount(itemId: string, delta: number) {
    const updated = StorageAdapter.updateItemCount(itemId, delta);
    setInventory([...updated]);
  }

  // Add new inventory product
  function handleAddInventoryProduct(newProduct: SanitaryItem) {
    const updated = [...inventory, newProduct];
    setInventory(updated);
    StorageAdapter.saveInventory(updated);
  }

  // Language change
  function handleChangeLanguage(lang: SupportedLanguage) {
    const updated: UserProfile = { ...profile, language: lang };
    handleSaveProfile(updated);
  }

  // Theme toggle
  function handleToggleTheme() {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...profile, theme: nextTheme };
    handleSaveProfile(updated);
  }

  // If returning from CentralAuth OAuth 2.1 authorization
  const isOAuthCallback = window.location.search.includes('code=') && 
    (window.location.search.includes('state=') || window.location.pathname.includes('/oauth/callback'));

  if (isOAuthCallback) {
    return (
      <OAuthCallback
        onSuccess={async (authedUser) => {
          setUser(authedUser);
          setIsGuestMode(false);
          await syncUserData(authedUser);
          // Clean OAuth code from URL to prevent replay on page refresh
          window.history.replaceState(null, '', window.location.pathname.replace('/oauth/callback', '/'));
        }}
        onErrorRedirect={() => {
          window.history.replaceState(null, '', '/');
          window.location.reload();
        }}
      />
    );
  }

  // If loading auth state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFF8F9] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl animate-bounce shadow-md shadow-rose-200">
          🌸
        </div>
        <p className="text-xs font-semibold text-rose-600 animate-pulse">Loading your Sanctuary...</p>
      </div>
    );
  }

  // Gated Authentication: If not logged in and not explicitly in guest demo mode, show AuthPage!
  if (!user && !isGuestMode) {
    return (
      <AuthPage
        onLoginSuccess={async (authedUser) => {
          setUser(authedUser);
          setIsGuestMode(false);
          await syncUserData(authedUser);
        }}
        onEnterGuestMode={() => {
          StorageAdapter.setUserId(null);
          setProfile(StorageAdapter.getProfile('guest'));
          setDailyLogs(StorageAdapter.getDailyLogs('guest'));
          setInventory(StorageAdapter.getInventory('guest'));
          setIsGuestMode(true);
        }}
      />
    );
  }

  // Camouflage Mode as Calculator
  if (isCamouflaged) {
    return <CamouflageView onExitCamouflage={() => setIsCamouflaged(false)} secretCode="1234" />;
  }

  // PIN Locked Screen
  if (isLocked && profile.privacyPin) {
    return <PinLockScreen correctPin={profile.privacyPin} onUnlock={() => setIsLocked(false)} />;
  }

  const todayStr = formatDate(new Date());
  const todayLog = dailyLogs[todayStr] || {
    logDate: todayStr,
    flow: 'none',
    symptoms: [],
    moods: [],
    waterGlasses: 0,
    sleepHours: 7.5,
    notes: '',
  };

  // Complete logout & state cleanup
  async function handleSignOut() {
    clearCentralAuthMeta();
    StorageAdapter.setUserId(null);
    StorageAdapter.clearCurrentUserData();
    localStorage.removeItem('lunaflow_auth_email');
    setUser(null);
    setIsGuestMode(false);
    setProfile(INITIAL_PROFILE);
    setDailyLogs({});
    setInventory(INITIAL_INVENTORY);

    try {
      if (supabase) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    }

    // Clear any Supabase cached tokens from local storage
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    window.location.href = '/';
  }

  return (
    <div className={`min-h-screen text-slate-800 flex flex-col font-sans selection:bg-rose-200 ${
      profile.theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-[#FFF8F9]'
    }`}>
      {/* Header */}
      <Header
        profile={profile}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleSignOut}
        onToggleCamouflage={() => setIsCamouflaged(true)}
        onLockApp={() => setIsLocked(true)}
        onOpenReminders={() => setIsRemindersModalOpen(true)}
        onChangeLanguage={handleChangeLanguage}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 pt-5">
        {activeTab === 'today' && (
          <TodayTab
            status={cycleStatus}
            profile={profile}
            todayLog={todayLog}
            inventory={inventory}
            onOpenLogModal={() => {
              setSelectedDate(todayStr);
              setIsLogModalOpen(true);
            }}
            onOpenSosModal={() => setIsSosModalOpen(true)}
            onEditPeriodDate={() => setIsSettingsModalOpen(true)}
            onUpdateInventory={handleUpdateInventoryCount}
            onUpdateLog={handleQuickTodayLogUpdate}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            status={cycleStatus}
            profile={profile}
            dailyLogs={dailyLogs}
            onSelectDateToLog={(d) => setSelectedDate(d)}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}

        {activeTab === 'diary' && (
          <DiaryTab
            selectedDate={selectedDate}
            dailyLogs={dailyLogs}
            onSaveLog={handleSaveLog}
          />
        )}

        {activeTab === 'sanitary' && (
          <SanitaryTab
            inventory={inventory}
            onUpdateCount={handleUpdateInventoryCount}
            onAddProduct={handleAddInventoryProduct}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            profile={profile}
            dailyLogs={dailyLogs}
            status={cycleStatus}
          />
        )}

        {activeTab === 'report' && (
          <DoctorReportTab
            profile={profile}
            dailyLogs={dailyLogs}
            status={cycleStatus}
          />
        )}

        {activeTab === 'wellness' && (
          <WellnessTab />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-rose-100/80 px-2 py-2 backdrop-blur-lg">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'today'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.today}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'calendar'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.calendar}</span>
          </button>

          <button
            onClick={() => {
              setSelectedDate(todayStr);
              setActiveTab('diary');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'diary'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookHeart className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.diary}</span>
          </button>

          <button
            onClick={() => setActiveTab('sanitary')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'sanitary'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.sanitary}</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'insights'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.insights}</span>
          </button>

          <button
            onClick={() => setActiveTab('wellness')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'wellness'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.wellness}</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              activeTab === 'report'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.tabs.doctor}</span>
          </button>
        </div>
      </nav>

      {/* Diary Logging Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/80 shadow-2xl bg-white/95 my-6">
            <DiaryTab
              selectedDate={selectedDate}
              dailyLogs={dailyLogs}
              onSaveLog={handleSaveLog}
              onClose={() => setIsLogModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* SOS Cramp Relief Modal */}
      {isSosModalOpen && (
        <SosCrampModal onClose={() => setIsSosModalOpen(false)} />
      )}

      {/* Cycle Settings Modal */}
      {isSettingsModalOpen && (
        <PeriodDateModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* Reminders Modal */}
      {isRemindersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/80 shadow-2xl bg-white/95 my-6">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsRemindersModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Close
              </button>
            </div>
            <RemindersTab />
          </div>
        </div>
      )}

      {/* Supabase Auth & Cloud Database Modal */}
      {isAuthModalOpen && (
        <AuthModal
          user={user}
          onClose={() => setIsAuthModalOpen(false)}
          onLogout={handleSignOut}
          onAuthChange={async (u) => {
            setUser(u);
            if (!u) {
              setIsGuestMode(false);
            }
            await syncUserData(u);
          }}
        />
      )}
    </div>
  );
}
