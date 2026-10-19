import { describe, it, expect } from 'vitest';
import { 
  calculateCycleStatus, 
  predictCycles, 
  calculateHistoricalMetrics,
  formatDate,
  diffDays,
  PHASES
} from '../../src/services/cycleEngine';
import { parseISO } from 'date-fns';

describe('CycleEngine Unit Tests', () => {
  it('calculates cycle day and menstrual phase accurately on Day 2 of bleed', () => {
    const today = parseISO('2026-10-19');
    const lastPeriodDate = '2026-10-18'; // 1 day ago -> cycle day 2

    const status = calculateCycleStatus(lastPeriodDate, 28, 5, true, today);

    expect(status.cycleDay).toBe(2);
    expect(status.phaseKey).toBe('MENSTRUAL');
    expect(status.phase.name).toBe('Menstrual Phase');
    expect(status.chanceOfPregnancy).toBe('Very Low');
    expect(status.isLate).toBe(false);
  });

  it('identifies ovulatory phase around Day 14 for a 28-day cycle', () => {
    const today = parseISO('2026-10-19');
    const lastPeriodDate = '2026-10-06'; // 13 days ago -> cycle day 14

    const status = calculateCycleStatus(lastPeriodDate, 28, 5, true, today);

    expect(status.cycleDay).toBe(14);
    expect(status.phaseKey).toBe('OVULATORY');
    expect(status.chanceOfPregnancy).toBe('Peak / High');
  });

  it('identifies luteal phase past ovulation', () => {
    const today = parseISO('2026-10-19');
    const lastPeriodDate = '2026-09-29'; // 20 days ago -> cycle day 21

    const status = calculateCycleStatus(lastPeriodDate, 28, 5, true, today);

    expect(status.cycleDay).toBe(21);
    expect(status.phaseKey).toBe('LUTEAL');
    expect(status.daysUntilPeriod).toBe(7);
    expect(status.isLate).toBe(false);
  });

  it('detects delayed/late periods without diagnosing pregnancy', () => {
    const today = parseISO('2026-10-19');
    const lastPeriodDate = '2026-09-15'; // 34 days ago on a 28-day cycle

    const status = calculateCycleStatus(lastPeriodDate, 28, 5, true, today);

    expect(status.isLate).toBe(true);
    expect(status.daysLate).toBeGreaterThan(0);
    expect(status.daysUntilPeriod).toBe(0);
  });

  it('handles missing/undefined last period date gracefully without crashing', () => {
    const today = parseISO('2026-10-19');
    const status = calculateCycleStatus(undefined, 28, 5, true, today);

    expect(status.phaseKey).toBe('UNKNOWN');
    expect(status.confidence).toBe('insufficient_data');
    expect(status.cycleDay).toBe(1);
  });

  it('handles leap year boundaries correctly (e.g. 2028-02-28 to 2028-03-01)', () => {
    const leapDate = parseISO('2028-03-01');
    const periodStart = '2028-02-28'; // 2028 is a leap year (has Feb 29)

    const diff = diffDays(leapDate, periodStart);
    expect(diff).toBe(2); // Feb 28 -> Feb 29 (1), Feb 29 -> Mar 1 (2)
  });

  it('predicts future cycles with distinct uncertainty ranges', () => {
    const predictions = predictCycles('2026-10-01', 3, 28, 5, false);

    expect(predictions).toHaveLength(3);
    expect(predictions[0].startDate).toBe('2026-10-29');
    expect(predictions[0].uncertaintyRange.earliest).toBeDefined();
    expect(predictions[0].uncertaintyRange.latest).toBeDefined();
  });

  it('computes historical average and median cycle lengths accurately', () => {
    const dates = [
      '2026-06-01',
      '2026-06-29', // 28 days
      '2026-07-29', // 30 days
      '2026-08-27', // 29 days
    ];

    const metrics = calculateHistoricalMetrics(dates);
    expect(metrics.recordedLengths).toEqual([28, 30, 29]);
    expect(metrics.averageCycleLength).toBe(29);
    expect(metrics.medianCycleLength).toBe(29);
  });
});
