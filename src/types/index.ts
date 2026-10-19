export type CyclePhaseKey = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL' | 'UNKNOWN';

export interface PhaseInfo {
  key: CyclePhaseKey;
  name: string;
  shortName: string;
  color: string;
  badgeClass: string;
  description: string;
  energy: string;
  nutrition: string;
  fitness: string;
  crampRisk: string;
}

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type PregnancyChance = 'Low' | 'Medium' | 'Peak / High' | 'Very Low' | 'Uncertain';

export interface CycleStatus {
  cycleDay: number;
  phase: PhaseInfo;
  phaseKey: CyclePhaseKey;
  daysUntilPeriod: number;
  isLate: boolean;
  daysLate: number;
  nextPeriodDate: string;
  ovulationDate: string;
  fertileWindow: {
    start: string;
    end: string;
  };
  chanceOfPregnancy: PregnancyChance;
  ovulationDay: number;
  confidence: 'high' | 'moderate' | 'low' | 'insufficient_data';
  uncertaintyDays: number;
}

export interface CyclePrediction {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  ovulationDate: string;
  fertileWindow: {
    start: string;
    end: string;
  };
  uncertaintyRange: {
    earliest: string;
    latest: string;
  };
}

export interface UserProfile {
  id?: string;
  displayName: string;
  birthYear?: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  isCycleRegular: boolean;
  lastPeriodDate: string;
  privacyPin?: string;
  isPinLocked?: boolean;
  isCamouflaged?: boolean;
  theme: 'light' | 'dark' | 'oled' | 'system';
  language: 'en' | 'hi' | 'mr';
  notificationsEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface DailyLog {
  id?: string;
  userId?: string;
  logDate: string; // YYYY-MM-DD
  flow: FlowIntensity;
  symptoms: string[];
  moods: string[];
  cervicalMucus?: string;
  waterGlasses: number;
  sleepHours: number;
  notes: string;
  updatedAt?: string;
}

export interface SanitaryItem {
  id: string;
  userId?: string;
  type: string;
  brand?: string;
  count: number;
  threshold: number;
  icon?: string;
  notes?: string;
}

export interface SanitaryUsageLog {
  id: string;
  userId?: string;
  itemId: string;
  itemType: string;
  usedAt: string;
  quantity: number;
}

export interface Reminder {
  id: string;
  userId?: string;
  type: 'period_upcoming' | 'sanitary_change' | 'hydration' | 'medication' | 'custom';
  title: string;
  timeOfDay: string; // HH:MM
  enabled: boolean;
  notes?: string;
}

export interface DoctorReportSummary {
  reportDate: string;
  patientName: string;
  birthYear?: number;
  totalLoggedCycles: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  cycleLengthRange: { min: number; max: number };
  crampDaysTotal: number;
  heavyFlowDaysTotal: number;
  headacheDaysTotal: number;
  bloatingDaysTotal: number;
  recentLogs: Array<{
    date: string;
    flow: string;
    symptoms: string[];
    moods: string[];
    notes: string;
  }>;
}
