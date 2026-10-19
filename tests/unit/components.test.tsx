import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CycleRing from '../../src/components/CycleRing';
import SanitaryTab from '../../src/components/SanitaryTab';
import DoctorReportTab from '../../src/components/DoctorReportTab';
import { calculateCycleStatus } from '../../src/services/cycleEngine';
import { INITIAL_PROFILE, INITIAL_INVENTORY, getInitialDailyLogs } from '../../src/services/storageAdapter';

describe('UI Component Unit Tests', () => {
  it('renders CycleRing with calculated cycle day and phase', () => {
    const status = calculateCycleStatus('2026-10-10', 28, 5, true, new Date('2026-10-19'));

    render(
      <CycleRing
        status={status}
        profile={INITIAL_PROFILE}
        onOpenLogModal={vi.fn()}
        onEditPeriodDate={vi.fn()}
      />
    );

    expect(screen.getByText(/Cycle Day 10/i)).toBeInTheDocument();
    expect(screen.getByText(/\+ Log Today/i)).toBeInTheDocument();
    expect(screen.getByText(/Fertility Estimate:/i)).toBeInTheDocument();
  });

  it('renders SanitaryTab and warns when an item is low in stock', () => {
    const lowInventory = [
      { id: '1', type: 'Overnight Pads', brand: 'Whisper', count: 1, threshold: 3 },
    ];

    render(
      <SanitaryTab
        inventory={lowInventory}
        onUpdateCount={vi.fn()}
        onAddProduct={vi.fn()}
      />
    );

    expect(screen.getByText(/Sanitary & Hygiene Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock Up Reminder!/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Overnight Pads/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Low Stock/i)).toBeInTheDocument();
  });

  it('renders DoctorReportTab with medical summary headers', () => {
    const status = calculateCycleStatus('2026-10-10', 28, 5, true, new Date('2026-10-19'));
    const logs = getInitialDailyLogs();

    render(
      <DoctorReportTab
        profile={INITIAL_PROFILE}
        dailyLogs={logs}
        status={status}
      />
    );

    expect(screen.getByText(/Doctor Health Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidential Gynecological Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Print \/ PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Dysmenorrhea \(Cramps\)/i)).toBeInTheDocument();
  });
});
