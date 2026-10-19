import { supabase } from './supabase';
import { formatDate } from './cycleEngine';
import { 
  UserProfile, 
  DailyLog, 
  SanitaryItem, 
  SanitaryUsageLog, 
  Reminder 
} from '../types';

export const INITIAL_PROFILE: UserProfile = {
  displayName: 'Luna',
  birthYear: 2002,
  avgCycleLength: 28,
  avgPeriodLength: 5,
  isCycleRegular: true,
  lastPeriodDate: '', // Clean default for new users
  privacyPin: '',
  isPinLocked: false,
  isCamouflaged: false,
  theme: 'light',
  language: 'en',
  notificationsEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export const INITIAL_INVENTORY: SanitaryItem[] = [
  { id: '1', type: 'Regular Pads', brand: 'Stayfree Ultra Thin', count: 14, threshold: 4, icon: 'Shield' },
  { id: '2', type: 'Overnight Pads', brand: 'Whisper Ultra Nights (XXL)', count: 6, threshold: 3, icon: 'Moon' },
  { id: '3', type: 'Tampons (Regular)', brand: 'Tampax Pearl', count: 8, threshold: 3, icon: 'Droplet' },
  { id: '4', type: 'Pantyliners', brand: 'Carefree Daily Fresh', count: 20, threshold: 5, icon: 'Feather' },
  { id: '5', type: 'Menstrual Cup', brand: 'DivaCup Model 1', count: 1, threshold: 1, icon: 'Sparkles' },
];

export function getInitialDailyLogs(): Record<string, DailyLog> {
  return {}; // Clean slate: do not fabricate logs for another user!
}

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 'rem-1', type: 'period_upcoming', title: 'Upcoming Period Notice', timeOfDay: '09:00', enabled: true },
  { id: 'rem-2', type: 'sanitary_change', title: 'Sanitary Product Change', timeOfDay: '13:00', enabled: true },
  { id: 'rem-3', type: 'hydration', title: 'Hydration Drink Water', timeOfDay: '15:00', enabled: true },
];

export interface PadTimerState {
  lastChangedAt: string;
  maxHours: number;
}

let activeUserId: string | null = null;

function getScopedKey(key: string, explicitUserId?: string | null): string {
  const uid = explicitUserId !== undefined ? explicitUserId : activeUserId;
  const namespace = uid ? `user_${uid}` : 'guest';
  return `lunaflow_${namespace}_${key}`;
}

export const StorageAdapter = {
  setUserId(userId: string | null) {
    activeUserId = userId;
  },

  getUserId(): string | null {
    return activeUserId;
  },

  getProfile(explicitUserId?: string | null): UserProfile {
    try {
      const key = getScopedKey('profile', explicitUserId);
      const data = localStorage.getItem(key);
      return data ? { ...INITIAL_PROFILE, ...JSON.parse(data) } : { ...INITIAL_PROFILE };
    } catch {
      return { ...INITIAL_PROFILE };
    }
  },

  saveProfile(profile: UserProfile, explicitUserId?: string | null): void {
    const key = getScopedKey('profile', explicitUserId);
    localStorage.setItem(key, JSON.stringify(profile));
    this.syncProfileToSupabase(profile, explicitUserId);
  },

  getDailyLogs(explicitUserId?: string | null): Record<string, DailyLog> {
    try {
      const key = getScopedKey('daily_logs', explicitUserId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveDailyLog(dateStr: string, logData: Partial<DailyLog>, explicitUserId?: string | null): Record<string, DailyLog> {
    const logs = this.getDailyLogs(explicitUserId);
    const existing = logs[dateStr] || {
      logDate: dateStr,
      flow: 'none',
      symptoms: [],
      moods: [],
      waterGlasses: 0,
      sleepHours: 7.5,
      notes: '',
    };
    logs[dateStr] = { ...existing, ...logData, logDate: dateStr, updatedAt: new Date().toISOString() };
    const key = getScopedKey('daily_logs', explicitUserId);
    localStorage.setItem(key, JSON.stringify(logs));
    this.syncLogToSupabase(dateStr, logs[dateStr], explicitUserId);
    return logs;
  },

  deleteDailyLog(dateStr: string, explicitUserId?: string | null): Record<string, DailyLog> {
    const logs = this.getDailyLogs(explicitUserId);
    delete logs[dateStr];
    const key = getScopedKey('daily_logs', explicitUserId);
    localStorage.setItem(key, JSON.stringify(logs));
    return logs;
  },

  getInventory(explicitUserId?: string | null): SanitaryItem[] {
    try {
      const key = getScopedKey('inventory', explicitUserId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [...INITIAL_INVENTORY];
    } catch {
      return [...INITIAL_INVENTORY];
    }
  },

  saveInventory(inventory: SanitaryItem[], explicitUserId?: string | null): void {
    const key = getScopedKey('inventory', explicitUserId);
    localStorage.setItem(key, JSON.stringify(inventory));
    this.syncInventoryToSupabase(inventory, explicitUserId);
  },

  updateItemCount(itemId: string, delta: number, explicitUserId?: string | null): SanitaryItem[] {
    const inv = this.getInventory(explicitUserId);
    const updated = inv.map(item => {
      if (item.id === itemId) {
        const newCount = Math.max(0, (item.count || 0) + delta);
        return { ...item, count: newCount };
      }
      return item;
    });
    this.saveInventory(updated, explicitUserId);

    if (delta < 0) {
      const item = inv.find(i => i.id === itemId);
      if (item) {
        this.addUsageLog({
          id: Date.now().toString(),
          itemId: item.id,
          itemType: item.type,
          usedAt: new Date().toISOString(),
          quantity: Math.abs(delta),
        }, explicitUserId);
      }
    }

    return updated;
  },

  getUsageLogs(explicitUserId?: string | null): SanitaryUsageLog[] {
    try {
      const key = getScopedKey('usage_logs', explicitUserId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addUsageLog(log: SanitaryUsageLog, explicitUserId?: string | null): void {
    const logs = this.getUsageLogs(explicitUserId);
    logs.unshift(log);
    const key = getScopedKey('usage_logs', explicitUserId);
    localStorage.setItem(key, JSON.stringify(logs.slice(0, 50)));
  },

  getReminders(explicitUserId?: string | null): Reminder[] {
    try {
      const key = getScopedKey('reminders', explicitUserId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [...INITIAL_REMINDERS];
    } catch {
      return [...INITIAL_REMINDERS];
    }
  },

  saveReminders(reminders: Reminder[], explicitUserId?: string | null): void {
    const key = getScopedKey('reminders', explicitUserId);
    localStorage.setItem(key, JSON.stringify(reminders));
  },

  toggleReminder(id: string, explicitUserId?: string | null): Reminder[] {
    const rems = this.getReminders(explicitUserId);
    const updated = rems.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    this.saveReminders(updated, explicitUserId);
    return updated;
  },

  getPadTimer(explicitUserId?: string | null): PadTimerState {
    try {
      const key = getScopedKey('pad_timer', explicitUserId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {
        lastChangedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        maxHours: 4,
      };
    } catch {
      return {
        lastChangedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        maxHours: 4,
      };
    }
  },

  resetPadTimer(explicitUserId?: string | null): PadTimerState {
    const timer: PadTimerState = {
      lastChangedAt: new Date().toISOString(),
      maxHours: 4,
    };
    const key = getScopedKey('pad_timer', explicitUserId);
    localStorage.setItem(key, JSON.stringify(timer));
    return timer;
  },

  clearLocalUserData(explicitUserId?: string | null): void {
    const uid = explicitUserId !== undefined ? explicitUserId : activeUserId;
    localStorage.removeItem(getScopedKey('profile', uid));
    localStorage.removeItem(getScopedKey('daily_logs', uid));
    localStorage.removeItem(getScopedKey('inventory', uid));
    localStorage.removeItem(getScopedKey('usage_logs', uid));
    localStorage.removeItem(getScopedKey('reminders', uid));
    localStorage.removeItem(getScopedKey('pad_timer', uid));
    // Also remove legacy un-scoped keys
    localStorage.removeItem('lunaflow_profile');
    localStorage.removeItem('lunaflow_daily_logs');
    localStorage.removeItem('lunaflow_inventory');
    localStorage.removeItem('lunaflow_usage_logs');
    localStorage.removeItem('lunaflow_reminders');
    localStorage.removeItem('lunaflow_pad_timer');
  },

  clearCurrentUserData(): void {
    this.clearLocalUserData();
  },

  /**
   * Loads full user-specific data from Supabase PostgreSQL database.
   * If this is a new user, automatically provisions their row in 'profiles'.
   */
  async loadUserDataFromSupabase(user: any): Promise<{
    profile: UserProfile;
    dailyLogs: Record<string, DailyLog>;
    inventory: SanitaryItem[];
  }> {
    if (!supabase || !user) {
      return {
        profile: this.getProfile(),
        dailyLogs: this.getDailyLogs(),
        inventory: this.getInventory(),
      };
    }

    const userId = user.id;
    this.setUserId(userId);

    let loadedProfile = { ...INITIAL_PROFILE };
    let loadedLogs: Record<string, DailyLog> = {};
    let loadedInventory: SanitaryItem[] = [...INITIAL_INVENTORY];

    try {
      // 1. Fetch Profile
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileRow) {
        loadedProfile = {
          displayName: profileRow.display_name || user.email?.split('@')[0] || 'Luna',
          birthYear: profileRow.birth_year || 2002,
          avgCycleLength: profileRow.avg_cycle_length || 28,
          avgPeriodLength: profileRow.avg_period_length || 5,
          isCycleRegular: profileRow.is_cycle_regular ?? true,
          lastPeriodDate: profileRow.last_period_date || '',
          privacyPin: profileRow.privacy_pin || '',
          isPinLocked: Boolean(profileRow.privacy_pin),
          isCamouflaged: false,
          theme: profileRow.theme || 'light',
          language: profileRow.language || 'en',
          notificationsEnabled: profileRow.notifications_enabled ?? true,
          quietHoursStart: profileRow.quiet_hours_start || '22:00',
          quietHoursEnd: profileRow.quiet_hours_end || '08:00',
        };
      } else {
        // Initialize brand-new profile for newly registered user
        const newDisplayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Luna';
        const newBirthYear = user.user_metadata?.birth_year || 2002;
        loadedProfile = {
          ...INITIAL_PROFILE,
          displayName: newDisplayName,
          birthYear: newBirthYear,
          lastPeriodDate: '', // Clean slate: do not invent dates
        };

        await supabase.from('profiles').upsert({
          id: userId,
          display_name: newDisplayName,
          birth_year: newBirthYear,
          avg_cycle_length: 28,
          avg_period_length: 5,
          is_cycle_regular: true,
          last_period_date: null,
          theme: 'light',
          language: 'en',
        });
      }

      // Save user-scoped profile locally
      this.saveProfile(loadedProfile, userId);

      // 2. Fetch User Daily Logs
      const { data: logRows, error: logError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId);

      if (logRows && logRows.length > 0) {
        logRows.forEach((row: any) => {
          loadedLogs[row.log_date] = {
            logDate: row.log_date,
            flow: row.flow_intensity || 'none',
            symptoms: row.symptoms || [],
            moods: row.moods || [],
            cervicalMucus: row.cervical_mucus || undefined,
            waterGlasses: row.water_glasses || 0,
            sleepHours: Number(row.sleep_hours) || 7.5,
            notes: row.notes || '',
            updatedAt: row.updated_at,
          };
        });
      } else {
        loadedLogs = {};
      }
      localStorage.setItem(getScopedKey('daily_logs', userId), JSON.stringify(loadedLogs));

      // 3. Fetch User Sanitary Inventory
      const { data: invRows, error: invError } = await supabase
        .from('sanitary_inventory')
        .select('*')
        .eq('user_id', userId);

      if (invRows && invRows.length > 0) {
        loadedInventory = invRows.map((r: any) => ({
          id: r.id,
          type: r.item_type,
          brand: r.brand_name || '',
          count: r.remaining_count,
          threshold: r.reorder_threshold,
          icon: 'Shield',
        }));
      } else {
        // Seed default sanitary inventory for new user into Supabase
        for (const item of INITIAL_INVENTORY) {
          await supabase.from('sanitary_inventory').insert({
            user_id: userId,
            item_type: item.type,
            brand_name: item.brand,
            remaining_count: item.count,
            reorder_threshold: item.threshold,
          });
        }
      }
      localStorage.setItem(getScopedKey('inventory', userId), JSON.stringify(loadedInventory));

    } catch (err) {
      console.error('Error hydrating user data from Supabase:', err);
    }

    return {
      profile: loadedProfile,
      dailyLogs: loadedLogs,
      inventory: loadedInventory,
    };
  },

  async syncProfileToSupabase(profile: UserProfile, explicitUserId?: string | null): Promise<void> {
    if (!supabase) return;
    try {
      const uid = explicitUserId || activeUserId;
      if (!uid) return;

      await supabase.from('profiles').upsert({
        id: uid,
        display_name: profile.displayName,
        birth_year: profile.birthYear,
        avg_cycle_length: profile.avgCycleLength,
        avg_period_length: profile.avgPeriodLength,
        is_cycle_regular: profile.isCycleRegular,
        last_period_date: profile.lastPeriodDate || null,
        theme: profile.theme,
        language: profile.language,
        notifications_enabled: profile.notificationsEnabled,
      });
    } catch (err) {
      console.warn('Supabase sync notice:', (err as Error).message);
    }
  },

  async syncLogToSupabase(dateStr: string, log: DailyLog, explicitUserId?: string | null): Promise<void> {
    if (!supabase) return;
    try {
      const uid = explicitUserId || activeUserId;
      if (!uid) return;

      await supabase.from('daily_logs').upsert({
        user_id: uid,
        log_date: dateStr,
        flow_intensity: log.flow,
        symptoms: log.symptoms,
        moods: log.moods,
        water_glasses: log.waterGlasses,
        sleep_hours: log.sleepHours,
        notes: log.notes,
        cervical_mucus: log.cervicalMucus || null,
      }, { onConflict: 'user_id, log_date' });
    } catch (err) {
      console.warn('Supabase sync notice:', (err as Error).message);
    }
  },

  async syncInventoryToSupabase(inventory: SanitaryItem[], explicitUserId?: string | null): Promise<void> {
    if (!supabase) return;
    try {
      const uid = explicitUserId || activeUserId;
      if (!uid) return;

      for (const item of inventory) {
        await supabase.from('sanitary_inventory').upsert({
          user_id: uid,
          item_type: item.type,
          brand_name: item.brand,
          remaining_count: item.count,
          reorder_threshold: item.threshold,
        });
      }
    } catch (err) {
      console.warn('Supabase sync notice:', (err as Error).message);
    }
  },
};
