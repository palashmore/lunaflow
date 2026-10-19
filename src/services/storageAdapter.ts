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
  lastPeriodDate: formatDate(new Date(Date.now() - 11 * 86400000)),
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
  const todayStr = formatDate(new Date());
  return {
    [todayStr]: {
      logDate: todayStr,
      flow: 'none',
      symptoms: ['energetic'],
      moods: ['happy', 'calm'],
      waterGlasses: 5,
      sleepHours: 7.5,
      notes: 'Feeling vibrant and inspired today! Planned morning walk.',
      cervicalMucus: 'creamy',
    },
  };
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

export const StorageAdapter = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem('lunaflow_profile');
      return data ? { ...INITIAL_PROFILE, ...JSON.parse(data) } : { ...INITIAL_PROFILE };
    } catch {
      return { ...INITIAL_PROFILE };
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem('lunaflow_profile', JSON.stringify(profile));
    this.syncProfileToSupabase(profile);
  },

  getDailyLogs(): Record<string, DailyLog> {
    try {
      const data = localStorage.getItem('lunaflow_daily_logs');
      return data ? JSON.parse(data) : getInitialDailyLogs();
    } catch {
      return getInitialDailyLogs();
    }
  },

  saveDailyLog(dateStr: string, logData: Partial<DailyLog>): Record<string, DailyLog> {
    const logs = this.getDailyLogs();
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
    localStorage.setItem('lunaflow_daily_logs', JSON.stringify(logs));
    this.syncLogToSupabase(dateStr, logs[dateStr]);
    return logs;
  },

  deleteDailyLog(dateStr: string): Record<string, DailyLog> {
    const logs = this.getDailyLogs();
    delete logs[dateStr];
    localStorage.setItem('lunaflow_daily_logs', JSON.stringify(logs));
    return logs;
  },

  getInventory(): SanitaryItem[] {
    try {
      const data = localStorage.getItem('lunaflow_inventory');
      return data ? JSON.parse(data) : [...INITIAL_INVENTORY];
    } catch {
      return [...INITIAL_INVENTORY];
    }
  },

  saveInventory(inventory: SanitaryItem[]): void {
    localStorage.setItem('lunaflow_inventory', JSON.stringify(inventory));
    this.syncInventoryToSupabase(inventory);
  },

  updateItemCount(itemId: string, delta: number): SanitaryItem[] {
    const inv = this.getInventory();
    const updated = inv.map(item => {
      if (item.id === itemId) {
        const newCount = Math.max(0, (item.count || 0) + delta);
        return { ...item, count: newCount };
      }
      return item;
    });
    this.saveInventory(updated);

    if (delta < 0) {
      const item = inv.find(i => i.id === itemId);
      if (item) {
        this.addUsageLog({
          id: Date.now().toString(),
          itemId: item.id,
          itemType: item.type,
          usedAt: new Date().toISOString(),
          quantity: Math.abs(delta),
        });
      }
    }

    return updated;
  },

  getUsageLogs(): SanitaryUsageLog[] {
    try {
      const data = localStorage.getItem('lunaflow_usage_logs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addUsageLog(log: SanitaryUsageLog): void {
    const logs = this.getUsageLogs();
    logs.unshift(log);
    localStorage.setItem('lunaflow_usage_logs', JSON.stringify(logs.slice(0, 50)));
  },

  getReminders(): Reminder[] {
    try {
      const data = localStorage.getItem('lunaflow_reminders');
      return data ? JSON.parse(data) : [...INITIAL_REMINDERS];
    } catch {
      return [...INITIAL_REMINDERS];
    }
  },

  saveReminders(reminders: Reminder[]): void {
    localStorage.setItem('lunaflow_reminders', JSON.stringify(reminders));
  },

  toggleReminder(id: string): Reminder[] {
    const rems = this.getReminders();
    const updated = rems.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    this.saveReminders(updated);
    return updated;
  },

  getPadTimer(): PadTimerState {
    try {
      const data = localStorage.getItem('lunaflow_pad_timer');
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

  resetPadTimer(): PadTimerState {
    const timer: PadTimerState = {
      lastChangedAt: new Date().toISOString(),
      maxHours: 4,
    };
    localStorage.setItem('lunaflow_pad_timer', JSON.stringify(timer));
    return timer;
  },

  clearLocalUserData(): void {
    localStorage.removeItem('lunaflow_profile');
    localStorage.removeItem('lunaflow_daily_logs');
    localStorage.removeItem('lunaflow_inventory');
    localStorage.removeItem('lunaflow_usage_logs');
    localStorage.removeItem('lunaflow_reminders');
    localStorage.removeItem('lunaflow_pad_timer');
  },

  async syncProfileToSupabase(profile: UserProfile): Promise<void> {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: profile.displayName,
        birth_year: profile.birthYear,
        avg_cycle_length: profile.avgCycleLength,
        avg_period_length: profile.avgPeriodLength,
        privacy_pin: profile.privacyPin ? 'PROTECTED' : null,
      });
    } catch (err) {
      console.warn('Supabase sync notice:', (err as Error).message);
    }
  },

  async syncLogToSupabase(dateStr: string, log: DailyLog): Promise<void> {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('daily_logs').upsert({
        user_id: user.id,
        log_date: dateStr,
        flow_intensity: log.flow,
        symptoms: log.symptoms,
        moods: log.moods,
        water_glasses: log.waterGlasses,
        sleep_hours: log.sleepHours,
        notes: log.notes,
      }, { onConflict: 'user_id, log_date' });
    } catch (err) {
      console.warn('Supabase sync notice:', (err as Error).message);
    }
  },

  async syncInventoryToSupabase(inventory: SanitaryItem[]): Promise<void> {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const item of inventory) {
        await supabase.from('sanitary_inventory').upsert({
          user_id: user.id,
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
