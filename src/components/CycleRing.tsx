import React from 'react';
import { CycleStatus, UserProfile } from '../types';

interface CycleRingProps {
  status: CycleStatus;
  profile: UserProfile;
  onOpenLogModal: () => void;
  onEditPeriodDate: () => void;
}

export default function CycleRing({ status, profile, onOpenLogModal, onEditPeriodDate }: CycleRingProps) {
  const {
    cycleDay,
    phase,
    daysUntilPeriod,
    isLate,
    daysLate,
    chanceOfPregnancy,
    nextPeriodDate,
    uncertaintyDays,
  } = status;

  const avgCycle = profile.avgCycleLength || 28;
  const progressPercent = Math.min(100, Math.round((cycleDay / avgCycle) * 100));
  
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const isMenstruating = status.phaseKey === 'MENSTRUAL';

  return (
    <div className="relative flex flex-col items-center justify-center p-6 glass-panel rounded-3xl shadow-sm border border-rose-100/90 overflow-hidden">
      {/* Decorative soft glowing backdrops */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

      {/* Phase Pill Top */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm ${phase.badgeClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {phase.name}
        </span>
        <span className="text-[11px] font-medium text-slate-500 bg-white/70 px-2.5 py-1 rounded-full border border-slate-100">
          Fertility Estimate: <strong className={chanceOfPregnancy.includes('Peak') ? 'text-purple-600 font-bold' : 'text-slate-700'}>{chanceOfPregnancy}</strong>
        </span>
      </div>

      {/* SVG Ring */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="45%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <filter id="ringShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#EC4899" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="#FFE4E6"
            strokeWidth="16"
            fill="transparent"
            className="opacity-70"
          />

          {/* Active progress track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#ringShadow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500/80 mb-0.5">
            {isMenstruating ? '🩸 Menstrual Phase' : `Cycle Day ${cycleDay}`}
          </span>

          {isLate ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-extrabold text-amber-600">
                {daysLate} {daysLate === 1 ? 'day' : 'days'}
              </span>
              <span className="text-xs font-semibold text-amber-600/90 mt-0.5">Estimated Delayed</span>
            </div>
          ) : isMenstruating ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-extrabold text-rose-600">
                Day {cycleDay}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-0.5">of period</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-extrabold text-slate-800">
                {daysUntilPeriod}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {daysUntilPeriod === 1 ? 'day until period' : 'days until period'}
              </span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-1 max-w-[170px] line-clamp-1">
            Next: {nextPeriodDate || 'Calculating...'} (±{uncertaintyDays}d)
          </p>

          <button
            onClick={onOpenLogModal}
            className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-md shadow-rose-200 hover:shadow-lg hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all"
          >
            + Log Today
          </button>
        </div>
      </div>

      {/* Sub-label & Edit Date button */}
      <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500 pt-3 border-t border-rose-100/60">
        <span className="text-slate-400">
          Last start: <strong className="text-slate-700">{profile.lastPeriodDate || 'Not set'}</strong>
        </span>
        <button
          onClick={onEditPeriodDate}
          className="text-rose-600 hover:text-rose-700 font-semibold underline decoration-rose-200"
        >
          Update dates
        </button>
      </div>
    </div>
  );
}
