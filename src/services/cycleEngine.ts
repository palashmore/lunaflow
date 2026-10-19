import { parseISO, format, differenceInCalendarDays, addDays, isValid } from 'date-fns';
import { 
  CyclePhaseKey, 
  PhaseInfo, 
  CycleStatus, 
  CyclePrediction, 
  PregnancyChance 
} from '../types';

export const PHASES: Record<CyclePhaseKey, PhaseInfo> = {
  MENSTRUAL: {
    key: 'MENSTRUAL',
    name: 'Menstrual Phase',
    shortName: 'Menstruation',
    color: 'rose',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
    description: 'Rest, recharge & replenish iron. Uterine lining sheds.',
    energy: 'Reflective / Restful',
    nutrition: 'Warm broths, iron-rich greens (spinach, lentils), chamomile/ginger tea, dark chocolate.',
    fitness: 'Restorative yoga, gentle walking, light stretching, or guilt-free rest.',
    crampRisk: 'Elevated (Prostaglandin release)',
  },
  FOLLICULAR: {
    key: 'FOLLICULAR',
    name: 'Follicular Phase',
    shortName: 'Follicular',
    color: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
    description: 'Estrogen rises. Follicles develop. Energy and focus naturally increase.',
    energy: 'Rising / Creative & Focused',
    nutrition: 'Fresh salads, avocados, fermented foods, lean proteins, nutrient-dense bowls.',
    fitness: 'Strength training, steady cardio, dance, outdoor hikes, creative projects.',
    crampRisk: 'Low',
  },
  OVULATORY: {
    key: 'OVULATORY',
    name: 'Ovulatory Phase',
    shortName: 'Ovulation',
    color: 'purple',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900',
    description: 'Luteinizing hormone surge triggers egg release. Peak fertility estimate.',
    energy: 'Peak Energy / Sociable',
    nutrition: 'Berries, antioxidant-rich fruits, leafy greens, zinc and selenium sources.',
    fitness: 'High-intensity interval training (HIIT), heavy lifting, social workouts.',
    crampRisk: 'Occasional mild mid-cycle discomfort (Mittelschmerz)',
  },
  LUTEAL: {
    key: 'LUTEAL',
    name: 'Luteal Phase',
    shortName: 'Luteal',
    color: 'amber',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
    description: 'Progesterone rises to support the uterine lining, then drops before bleeding.',
    energy: 'Declining / Nurturing',
    nutrition: 'Complex carbohydrates (sweet potatoes, oats), magnesium, bananas, warm meals.',
    fitness: 'Pilates, steady swimming, leisurely cycling, restorative evening stretching.',
    crampRisk: 'PMS discomfort / Lower back tension possible',
  },
  UNKNOWN: {
    key: 'UNKNOWN',
    name: 'Phase Unavailable',
    shortName: 'Unknown',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    description: 'Log your last period start date to calculate your biological phase.',
    energy: 'Observing',
    nutrition: 'Balanced wholesome nutrition and sufficient daily hydration.',
    fitness: 'Listen to your body and engage in comfortable daily movement.',
    crampRisk: 'Monitor daily symptoms',
  },
};

/**
 * Format Date to YYYY-MM-DD cleanly without UTC distortion
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const parsed = parseISO(date);
    return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  }
  return isValid(date) ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
}

/**
 * Calculate difference in calendar days between two dates
 */
export function diffDays(targetDate: Date | string, baseDate: Date | string): number {
  const d1 = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const d2 = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;
  if (!isValid(d1) || !isValid(d2)) return 0;
  return differenceInCalendarDays(d1, d2);
}

/**
 * Compute average and median cycle length from an array of consecutive start dates
 */
export function calculateHistoricalMetrics(startDates: string[]): {
  averageCycleLength: number;
  medianCycleLength: number;
  recordedLengths: number[];
} {
  if (!startDates || startDates.length < 2) {
    return { averageCycleLength: 28, medianCycleLength: 28, recordedLengths: [] };
  }

  // Sort ascending
  const sorted = [...startDates]
    .map(d => parseISO(d))
    .filter(d => isValid(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(sorted[i], sorted[i - 1]);
    // Biological filter: realistic menstrual cycle length is between 15 and 65 days
    if (diff >= 15 && diff <= 65) {
      lengths.push(diff);
    }
  }

  if (lengths.length === 0) {
    return { averageCycleLength: 28, medianCycleLength: 28, recordedLengths: [] };
  }

  const sum = lengths.reduce((acc, val) => acc + val, 0);
  const avg = Math.round(sum / lengths.length);

  // Median
  const sortedLengths = [...lengths].sort((a, b) => a - b);
  const mid = Math.floor(sortedLengths.length / 2);
  const median = sortedLengths.length % 2 !== 0 
    ? sortedLengths[mid] 
    : Math.round((sortedLengths[mid - 1] + sortedLengths[mid]) / 2);

  return {
    averageCycleLength: avg,
    medianCycleLength: median,
    recordedLengths: lengths,
  };
}

/**
 * Core function to calculate current cycle status
 */
export function calculateCycleStatus(
  lastPeriodDate: string | undefined,
  avgCycle: number = 28,
  avgPeriod: number = 5,
  isRegular: boolean = true,
  today: Date = new Date()
): CycleStatus {
  if (!lastPeriodDate || !isValid(parseISO(lastPeriodDate))) {
    const todayStr = formatDate(today);
    return {
      cycleDay: 1,
      phase: PHASES.UNKNOWN,
      phaseKey: 'UNKNOWN',
      daysUntilPeriod: avgCycle,
      isLate: false,
      daysLate: 0,
      nextPeriodDate: formatDate(addDays(today, avgCycle)),
      ovulationDate: formatDate(addDays(today, Math.max(10, avgCycle - 14))),
      fertileWindow: { start: todayStr, end: todayStr },
      chanceOfPregnancy: 'Uncertain',
      ovulationDay: 14,
      confidence: 'insufficient_data',
      uncertaintyDays: 4,
    };
  }

  const lastDateObj = parseISO(lastPeriodDate);
  const daysSinceStart = diffDays(today, lastDateObj);

  // Handle future period start date edge case
  if (daysSinceStart < 0) {
    return {
      cycleDay: 1,
      phase: PHASES.UNKNOWN,
      phaseKey: 'UNKNOWN',
      daysUntilPeriod: Math.abs(daysSinceStart),
      isLate: false,
      daysLate: 0,
      nextPeriodDate: lastPeriodDate,
      ovulationDate: formatDate(addDays(lastDateObj, Math.max(10, avgCycle - 14))),
      fertileWindow: { start: lastPeriodDate, end: lastPeriodDate },
      chanceOfPregnancy: 'Uncertain',
      ovulationDay: 14,
      confidence: 'low',
      uncertaintyDays: 3,
    };
  }

  const cycleDay = (daysSinceStart % avgCycle) + 1;
  const isLate = daysSinceStart >= avgCycle;
  const daysLate = isLate ? daysSinceStart - avgCycle + 1 : 0;
  const daysUntilPeriod = isLate ? 0 : avgCycle - cycleDay;

  // Next predicted period date
  const cyclesPassed = Math.floor(daysSinceStart / avgCycle);
  const currentCycleStart = addDays(lastDateObj, cyclesPassed * avgCycle);
  const nextPeriodObj = addDays(currentCycleStart, avgCycle);
  const nextPeriodDate = formatDate(nextPeriodObj);

  // Ovulation typically estimated 14 days before next period (subject to biological variance)
  const ovulationDay = Math.max(10, avgCycle - 14);
  const ovulationObj = addDays(currentCycleStart, ovulationDay - 1);
  const ovulationDate = formatDate(ovulationObj);

  // Fertile window: estimated 5 days before ovulation up to 1 day after
  const fertileStartObj = addDays(ovulationObj, -5);
  const fertileEndObj = addDays(ovulationObj, 1);
  const fertileWindow = {
    start: formatDate(fertileStartObj),
    end: formatDate(fertileEndObj),
  };

  // Phase calculation
  let phase: PhaseInfo = PHASES.MENSTRUAL;
  let phaseKey: CyclePhaseKey = 'MENSTRUAL';
  let chanceOfPregnancy: PregnancyChance = 'Low';

  if (cycleDay <= avgPeriod) {
    phase = PHASES.MENSTRUAL;
    phaseKey = 'MENSTRUAL';
    chanceOfPregnancy = 'Very Low';
  } else if (cycleDay < ovulationDay - 4) {
    phase = PHASES.FOLLICULAR;
    phaseKey = 'FOLLICULAR';
    chanceOfPregnancy = 'Medium';
  } else if (cycleDay <= ovulationDay + 1) {
    phase = PHASES.OVULATORY;
    phaseKey = 'OVULATORY';
    chanceOfPregnancy = 'Peak / High';
  } else {
    phase = PHASES.LUTEAL;
    phaseKey = 'LUTEAL';
    chanceOfPregnancy = 'Low';
  }

  const uncertaintyDays = isRegular ? 2 : 5;
  const confidence = isRegular ? 'high' : 'moderate';

  return {
    cycleDay,
    phase,
    phaseKey,
    daysUntilPeriod,
    isLate,
    daysLate,
    nextPeriodDate,
    ovulationDate,
    fertileWindow,
    chanceOfPregnancy,
    ovulationDay,
    confidence,
    uncertaintyDays,
  };
}

/**
 * Predict next N future cycles with explicit uncertainty range metadata
 */
export function predictCycles(
  lastPeriodDate: string | undefined,
  count: number = 6,
  avgCycle: number = 28,
  avgPeriod: number = 5,
  isRegular: boolean = true
): CyclePrediction[] {
  if (!lastPeriodDate || !isValid(parseISO(lastPeriodDate))) return [];

  const predictions: CyclePrediction[] = [];
  const baseStart = parseISO(lastPeriodDate);
  const uncertaintyPerCycle = isRegular ? 2 : 4;

  for (let i = 1; i <= count; i++) {
    const cycleStart = addDays(baseStart, i * avgCycle);
    const cycleEnd = addDays(cycleStart, avgPeriod - 1);
    const ovulationDate = addDays(cycleStart, Math.max(10, avgCycle - 14));
    const fertileStart = addDays(ovulationDate, -5);
    const fertileEnd = addDays(ovulationDate, 1);

    const uncertaintyDays = Math.min(7, uncertaintyPerCycle + Math.floor(i / 2));
    const earliest = addDays(cycleStart, -uncertaintyDays);
    const latest = addDays(cycleStart, uncertaintyDays);

    predictions.push({
      cycleNumber: i,
      startDate: formatDate(cycleStart),
      endDate: formatDate(cycleEnd),
      ovulationDate: formatDate(ovulationDate),
      fertileWindow: {
        start: formatDate(fertileStart),
        end: formatDate(fertileEnd),
      },
      uncertaintyRange: {
        earliest: formatDate(earliest),
        latest: formatDate(latest),
      },
    });
  }

  return predictions;
}
