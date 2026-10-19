import React, { useState } from 'react';
import { X, Calendar, Lock, User } from 'lucide-react';
import { formatDate } from '../services/cycleEngine';
import { UserProfile } from '../types';

interface PeriodDateModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export default function PeriodDateModal({ profile, onSave, onClose }: PeriodDateModalProps) {
  const [lastPeriodDate, setLastPeriodDate] = useState(profile.lastPeriodDate || formatDate(new Date()));
  const [avgCycleLength, setAvgCycleLength] = useState(profile.avgCycleLength || 28);
  const [avgPeriodLength, setAvgPeriodLength] = useState(profile.avgPeriodLength || 5);
  const [isCycleRegular, setIsCycleRegular] = useState(profile.isCycleRegular ?? true);
  const [displayName, setDisplayName] = useState(profile.displayName || 'Luna');
  const [privacyPin, setPrivacyPin] = useState(profile.privacyPin || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...profile,
      displayName: displayName.trim() || 'Luna',
      lastPeriodDate,
      avgCycleLength: Number(avgCycleLength),
      avgPeriodLength: Number(avgPeriodLength),
      isCycleRegular,
      privacyPin: privacyPin.trim(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/80 shadow-2xl bg-white/95 my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-800">
                Cycle Settings
              </h2>
              <p className="text-[11px] text-slate-400">Personalize your cycle parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Display Name */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Your Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                required
              />
            </div>
          </div>

          {/* Last Period Start Date */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Last Period Start Date</label>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              required
            />
          </div>

          {/* Cycle & Period Lengths */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Cycle Length (Days)</label>
              <input
                type="number"
                min="15"
                max="65"
                value={avgCycleLength}
                onChange={(e) => setAvgCycleLength(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
              <span className="text-[10px] text-slate-400">Typical: 28 days</span>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Bleed Length (Days)</label>
              <input
                type="number"
                min="1"
                max="15"
                value={avgPeriodLength}
                onChange={(e) => setAvgPeriodLength(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
              <span className="text-[10px] text-slate-400">Typical: 5 days</span>
            </div>
          </div>

          {/* Regularity Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700 block">Cycle Regularity</span>
              <span className="text-[10px] text-slate-400">Enables uncertainty ranges if irregular</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCycleRegular(!isCycleRegular)}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors ${
                isCycleRegular
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isCycleRegular ? 'Regular' : 'Irregular'}
            </button>
          </div>

          {/* Privacy PIN */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">
              Discreet 4-Digit Privacy PIN (Optional)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={4}
                placeholder="Leave blank for no PIN"
                value={privacyPin}
                onChange={(e) => setPrivacyPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono tracking-widest text-center"
              />
            </div>
            <span className="text-[10px] text-slate-400">Locks your personal health data on device.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all active:scale-95"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
