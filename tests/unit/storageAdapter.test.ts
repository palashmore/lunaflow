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

  it('strictly isolates data between different user accounts', () => {
    // User A logs in and records period data
    StorageAdapter.setUserId('user_aaa_111');
    StorageAdapter.saveProfile({ ...INITIAL_PROFILE, displayName: 'Pallavi', avgCycleLength: 32 });
    StorageAdapter.saveDailyLog('2026-10-19', { flow: 'heavy', symptoms: ['cramps'] });

    // Verify User A data
    expect(StorageAdapter.getProfile().displayName).toBe('Pallavi');
    expect(StorageAdapter.getDailyLogs()['2026-10-19'].flow).toBe('heavy');

    // User B logs in
    StorageAdapter.setUserId('user_bbb_222');
    // User B must NOT see User A's profile or symptoms!
    expect(StorageAdapter.getProfile().displayName).toBe('Luna');
    expect(StorageAdapter.getDailyLogs()['2026-10-19']).toBeUndefined();

    // User B saves their own data
    StorageAdapter.saveProfile({ ...INITIAL_PROFILE, displayName: 'Sushmita', avgCycleLength: 26 });
    expect(StorageAdapter.getProfile().displayName).toBe('Sushmita');

    // Switch back to User A
    StorageAdapter.setUserId('user_aaa_111');
    expect(StorageAdapter.getProfile().displayName).toBe('Pallavi');
    expect(StorageAdapter.getDailyLogs()['2026-10-19'].flow).toBe('heavy');
  });
});
