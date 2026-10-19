import React, { useState, useEffect } from 'react';
import CycleRing from './CycleRing';
import { 
  Droplet, 
  Clock, 
  Utensils, 
  Activity, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { StorageAdapter, PadTimerState } from '../services/storageAdapter';
import { CycleStatus, UserProfile, DailyLog, SanitaryItem } from '../types';

interface TodayTabProps {
  status: CycleStatus;
  profile: UserProfile;
  todayLog: DailyLog;
  inventory: SanitaryItem[];
  onOpenLogModal: () => void;
  onOpenSosModal: () => void;
  onEditPeriodDate: () => void;
  onUpdateInventory: (itemId: string, delta: number) => void;
  onUpdateLog: (fields: Partial<DailyLog>) => void;
}

export default function TodayTab({
  status,
  profile,
  todayLog,
  inventory,
  onOpenLogModal,
  onOpenSosModal,
  onEditPeriodDate,
  onUpdateInventory,
  onUpdateLog,
}: TodayTabProps) {
  const { phase } = status;

  // Sanitary Pad / Tampon timer state
  const [padTimer, setPadTimer] = useState<PadTimerState>(() => StorageAdapter.getPadTimer());
  const [hoursAgo, setHoursAgo] = useState('0.0');

  useEffect(() => {
    function calcTime() {
      const now = new Date().getTime();
      const last = new Date(padTimer.lastChangedAt).getTime();
      const diffHrs = Math.max(0, (now - last) / (1000 * 60 * 60));
      setHoursAgo(diffHrs.toFixed(1));
    }
    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [padTimer]);

  function handleJustChangedPad() {
    const updatedTimer = StorageAdapter.resetPadTimer();
    setPadTimer(updatedTimer);

    // Auto-decrement default pad from inventory if available
    const regularPad = inventory.find(i => i.type.includes('Regular') || i.type.includes('Pads'));
    if (regularPad && regularPad.count > 0) {
      onUpdateInventory(regularPad.id, -1);
    }
  }

  // Hydration water counter
  const waterCount = todayLog?.waterGlasses || 0;
  function handleAddWater() {
    const nextWater = Math.min(12, waterCount + 1);
    onUpdateLog({ waterGlasses: nextWater });
  }

  function handleRemoveWater() {
    const nextWater = Math.max(0, waterCount - 1);
    onUpdateLog({ waterGlasses: nextWater });
  }

  const isTssWarning = Number(hoursAgo) >= 5;

  return (
    <div className="space-y-5 pb-24">
      {/* 1. Cycle Ring Showcase */}
      <CycleRing
        status={status}
        profile={profile}
        onOpenLogModal={onOpenLogModal}
        onEditPeriodDate={onEditPeriodDate}
      />

      {/* 2. Sanitary Hygiene & TSS Safety Timer Card */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sanitary Product Hygiene</h3>
              <p className="text-[11px] text-slate-400">Regular changes reduce bacterial risk</p>
            </div>
          </div>
          <button
            onClick={handleJustChangedPad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors active:scale-95 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Just Changed
          </button>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          isTssWarning 
            ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
            : 'bg-white/80 border-slate-100 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5">
            {isTssWarning && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
            <div>
              <p className="text-xs font-semibold">
                Last changed: <strong className="text-rose-600">{hoursAgo} hours ago</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                {isTssWarning ? '⚠️ Recommendation: Change pad or tampon soon!' : 'Safe practice: Change every 4–6 hrs based on flow'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100/70 text-rose-700">
            Stock auto-syncs
          </span>
        </div>
      </div>

      {/* 3. Hydration Tracker */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daily Hydration</h3>
              <p className="text-[11px] text-slate-400">Supports circulation & eases abdominal bloating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemoveWater}
              disabled={waterCount <= 0}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs disabled:opacity-40"
            >
              -
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-12 text-center">
              {waterCount} / 8 <span className="text-[10px] font-normal text-slate-400">cups</span>
            </span>
            <button
              onClick={handleAddWater}
              className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs hover:bg-sky-600 active:scale-95 shadow-sm shadow-sky-200"
            >
              +
            </button>
          </div>
        </div>

        {/* 8 cups visual progress */}
        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {Array.from({ length: 8 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onUpdateLog({ waterGlasses: idx + 1 })}
              className={`h-9 rounded-xl flex items-center justify-center transition-all ${
                idx < waterCount
                  ? 'bg-gradient-to-t from-sky-500 to-sky-400 text-white shadow-sm shadow-sky-200 scale-100'
                  : 'bg-white/80 border border-slate-100 text-slate-300 hover:border-sky-200'
              }`}
            >
              <Droplet className={`w-3.5 h-3.5 ${idx < waterCount ? 'fill-white' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* 4. SOS Cramp Relief Trigger Banner */}
      <div 
        onClick={onOpenSosModal}
        className="glass-rose p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all active:scale-[0.99] border border-rose-200/90 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-rose-900">SOS Cramp Sanctuary</h4>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">
                  Comfort
                </span>
              </div>
              <p className="text-xs text-rose-700/80 mt-0.5">
                Guided 4-7-8 breathing, acupressure points & soothing heat measures.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
            Open &rarr;
          </span>
        </div>
      </div>

      {/* 5. Phase-Aware Suggestions */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-100/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 font-serif">
            Phase Context • {phase.name}
          </h3>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            Energy: {phase.energy}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Nutrition */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Utensils className="w-3.5 h-3.5" />
              <span>Nourishment Ideas</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {phase.nutrition}
            </p>
          </div>

          {/* Fitness */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100/80 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-800 font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Movement Guidance</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {phase.fitness}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
