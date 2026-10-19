import { describe, it, expect, beforeEach } from 'vitest';
import { StorageAdapter, INITIAL_PROFILE, INITIAL_INVENTORY } from '../../src/services/storageAdapter';

describe('StorageAdapter Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves default profile when no local storage exists', () => {
    const profile = StorageAdapter.getProfile();
    expect(profile.displayName).toBe('Luna');
    expect(profile.avgCycleLength).toBe(28);
    expect(profile.isCycleRegular).toBe(true);
  });

  it('updates and persists user profile changes', () => {
    const updated = {
      ...INITIAL_PROFILE,
      displayName: 'Aura',
      avgCycleLength: 30,
      avgPeriodLength: 6,
    };
    StorageAdapter.saveProfile(updated);

    const retrieved = StorageAdapter.getProfile();
    expect(retrieved.displayName).toBe('Aura');
    expect(retrieved.avgCycleLength).toBe(30);
    expect(retrieved.avgPeriodLength).toBe(6);
  });

  it('saves, updates, and deletes daily symptom logs', () => {
    const dateStr = '2026-10-19';
    StorageAdapter.saveDailyLog(dateStr, {
      flow: 'medium',
      symptoms: ['cramps', 'bloating'],
      moods: ['calm'],
      waterGlasses: 6,
    });

    let logs = StorageAdapter.getDailyLogs();
    expect(logs[dateStr]).toBeDefined();
    expect(logs[dateStr].flow).toBe('medium');
    expect(logs[dateStr].symptoms).toContain('cramps');
    expect(logs[dateStr].waterGlasses).toBe(6);

    StorageAdapter.deleteDailyLog(dateStr);
    logs = StorageAdapter.getDailyLogs();
    expect(logs[dateStr]).toBeUndefined();
  });

  it('decrements inventory count and records a usage log', () => {
    const inventory = StorageAdapter.getInventory();
    const regularPad = inventory[0];
    const initialCount = regularPad.count;

    const updatedInv = StorageAdapter.updateItemCount(regularPad.id, -1);
    expect(updatedInv[0].count).toBe(initialCount - 1);

    const usageLogs = StorageAdapter.getUsageLogs();
    expect(usageLogs.length).toBeGreaterThan(0);
    expect(usageLogs[0].itemId).toBe(regularPad.id);
    expect(usageLogs[0].quantity).toBe(1);
  });

  it('clears all local private data on account logout for privacy isolation', () => {
    StorageAdapter.saveProfile({ ...INITIAL_PROFILE, displayName: 'PrivateUser' });
    StorageAdapter.saveDailyLog('2026-10-19', { flow: 'heavy' });

    StorageAdapter.clearLocalUserData();

    // After clearing, profile reverts to fresh default without personal info
    const profile = StorageAdapter.getProfile();
    expect(profile.displayName).toBe('Luna');
    const logs = StorageAdapter.getDailyLogs();
    expect(logs['2026-10-19']?.flow).not.toBe('heavy');
  });
});
