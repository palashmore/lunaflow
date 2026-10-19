import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplet 
} from 'lucide-react';
import { formatDate, predictCycles, diffDays } from '../services/cycleEngine';
import { CycleStatus, UserProfile, DailyLog } from '../types';

interface CalendarTabProps {
  status: CycleStatus;
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  onSelectDateToLog: (dateStr: string) => void;
  onOpenLogModal: () => void;
}

export default function CalendarTab({
  status,
  profile,
  dailyLogs,
  onSelectDateToLog,
  onOpenLogModal,
}: CalendarTabProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  }

  const futurePredictions = predictCycles(
    profile.lastPeriodDate,
    4,
    profile.avgCycleLength || 28,
    profile.avgPeriodLength || 5,
    profile.isCycleRegular
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = formatDate(new Date());

  function getDateInfo(dateStr: string) {
    const isToday = dateStr === todayStr;
    const hasLog = Boolean(dailyLogs[dateStr]);
    const log = dailyLogs[dateStr] || {};

    const avgPeriod = profile.avgPeriodLength || 5;

    let isPastPeriod = false;
    if (profile.lastPeriodDate) {
      const diff = diffDays(dateStr, profile.lastPeriodDate);
      if (diff >= 0 && diff < avgPeriod) {
        isPastPeriod = true;
      }
    }

    let isPredictedPeriod = false;
    let isOvulation = false;
    let isFertile = false;

    for (const pred of futurePredictions) {
      if (dateStr >= pred.startDate && dateStr <= pred.endDate) {
        isPredictedPeriod = true;
      }
      if (dateStr === pred.ovulationDate) {
        isOvulation = true;
      }
      if (dateStr >= pred.fertileWindow.start && dateStr <= pred.fertileWindow.end) {
        isFertile = true;
      }
    }

    if (dateStr === status.ovulationDate) isOvulation = true;
    if (dateStr >= status.fertileWindow?.start && dateStr <= status.fertileWindow?.end) {
      isFertile = true;
    }

    return {
      isToday,
      hasLog,
      log,
      isPastPeriod,
      isPredictedPeriod,
      isOvulation,
      isFertile,
    };
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Month Header Card */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-100/90 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-800">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">Select any date to log or view symptom observations</p>
          </div>
          <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-rose-100">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date())}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-11 rounded-2xl opacity-0 pointer-events-none" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDate(new Date(year, month, dayNum));
            const info = getDateInfo(dateStr);

            let bgClass = 'bg-white/60 text-slate-700 hover:bg-rose-50';

            if (info.isPastPeriod) {
              bgClass = 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-200';
            } else if (info.isPredictedPeriod) {
              bgClass = 'bg-rose-100/80 text-rose-800 border border-dashed border-rose-300 font-semibold';
            } else if (info.isOvulation) {
              bgClass = 'bg-purple-500 text-white font-bold shadow-sm shadow-purple-200';
            } else if (info.isFertile) {
              bgClass = 'bg-purple-100/70 text-purple-800 border border-purple-200 font-medium';
            }

            return (
              <button
                key={dayNum}
                onClick={() => {
                  onSelectDateToLog(dateStr);
                  onOpenLogModal();
                }}
                className={`relative h-11 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 text-xs ${bgClass} ${
                  info.isToday ? 'ring-2 ring-rose-500 ring-offset-2' : ''
                }`}
              >
                <span>{dayNum}</span>

                {info.hasLog && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    info.isPastPeriod || info.isOvulation ? 'bg-white' : 'bg-rose-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="mt-5 pt-4 border-t border-rose-100/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span>Period Bleed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-100 border border-dashed border-rose-400 shrink-0" />
            <span>Predicted Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
            <span>Ovulation Day (Est)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300 shrink-0" />
            <span>Fertile Window (Est)</span>
          </div>
        </div>
      </div>

      {/* 3-Month Forecast Cards */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 font-serif">
            Estimated Cycle Forecasts
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            Based on {profile.avgCycleLength}d cycle
          </span>
        </div>

        <div className="space-y-2">
          {futurePredictions.slice(0, 3).map((pred) => (
            <div
              key={pred.cycleNumber}
              className="p-3 rounded-2xl bg-white/70 border border-rose-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Cycle #{pred.cycleNumber}: <span className="text-rose-600 font-bold">{pred.startDate}</span> to {pred.endDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Est. Ovulation: <strong className="text-purple-600">{pred.ovulationDate}</strong>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                5 days
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
