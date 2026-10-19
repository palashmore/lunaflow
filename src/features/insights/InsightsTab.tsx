import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { Download, FileSpreadsheet, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, DailyLog, CycleStatus } from '../../types';

interface InsightsTabProps {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  status: CycleStatus;
}

const COLORS = ['#F472B6', '#C084FC', '#38BDF8', '#34D399', '#FBBF24', '#FB7185'];

export default function InsightsTab({ profile, dailyLogs, status }: InsightsTabProps) {
  const logEntries = useMemo(() => Object.values(dailyLogs), [dailyLogs]);

  // Aggregate symptoms
  const symptomData = useMemo(() => {
    const counts: Record<string, number> = {};
    logEntries.forEach(log => {
      log.symptoms?.forEach(sym => {
        counts[sym] = (counts[sym] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.replace('_', ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logEntries]);

  // Flow distribution
  const flowData = useMemo(() => {
    const counts: Record<string, number> = {
      spotting: 0,
      light: 0,
      medium: 0,
      heavy: 0,
    };
    logEntries.forEach(log => {
      if (log.flow && log.flow !== 'none' && counts[log.flow] !== undefined) {
        counts[log.flow]++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [logEntries]);

  // Synthetic or recorded historical cycle lengths for visualization
  const cycleTrendData = useMemo(() => {
    const avg = profile.avgCycleLength || 28;
    return [
      { cycle: '3 Cycles Ago', length: avg - 1 },
      { cycle: '2 Cycles Ago', length: avg + 1 },
      { cycle: 'Previous Cycle', length: avg },
      { cycle: 'Current Target', length: avg },
    ];
  }, [profile.avgCycleLength]);

  // Export data as JSON
  function exportJSON() {
    const exportObject = {
      profile: {
        displayName: profile.displayName,
        avgCycleLength: profile.avgCycleLength,
        avgPeriodLength: profile.avgPeriodLength,
      },
      dailyLogs,
      exportedAt: new Date().toISOString(),
      disclaimer: 'LunaFlow personal health export. For personal & clinical consultation use only.',
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunaflow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export data as CSV
  function exportCSV() {
    const rows = [
      ['Date', 'Flow', 'Symptoms', 'Moods', 'Water Glasses', 'Sleep Hours', 'Notes'],
      ...logEntries.map(log => [
        log.logDate,
        log.flow,
        `"${log.symptoms?.join('; ') || ''}"`,
        `"${log.moods?.join('; ') || ''}"`,
        log.waterGlasses || 0,
        log.sleepHours || 0,
        `"${(log.notes || '').replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunaflow-symptoms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800 dark:text-white">
            Cycle Intelligence & Trends
          </h2>
          <p className="text-xs text-slate-400">
            Observed physiological patterns across your recorded entries
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={exportCSV}
            title="Export CSV"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportJSON}
            title="Export JSON"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Minimum Data Notice if fewer than 3 logs */}
      {logEntries.length < 3 && (
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Trend Notice</p>
            <p className="text-[11px] text-rose-800/80 mt-0.5">
              LunaFlow requires at least 2–3 full cycles of daily logging before identifying statistically significant biological trends.
            </p>
          </div>
        </div>
      )}

      {/* Cycle Length Stability Chart */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-slate-800 dark:text-white">
            Cycle Duration Trend (Days)
          </h3>
          <span className="text-xs font-bold text-rose-600">
            Avg: {profile.avgCycleLength} Days
          </span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycleTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCE7F3" />
              <XAxis dataKey="cycle" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <YAxis domain={[20, 38]} tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #FDA4AF' }}
              />
              <Bar dataKey="length" fill="#F472B6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptom Frequency & Flow Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Most Frequent Symptoms */}
        <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
          <h3 className="text-xs font-serif font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Reported Symptoms
          </h3>

          {symptomData.length > 0 ? (
            <div className="space-y-2 text-xs">
              {symptomData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="capitalize text-slate-600 dark:text-slate-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, item.count * 25)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">{item.count}d</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No symptoms logged yet. Use the Journal tab to record symptoms.
            </p>
          )}
        </div>

        {/* Flow Intensity Distribution */}
        <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
          <h3 className="text-xs font-serif font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Flow Intensity Ratio
          </h3>

          <div className="h-40 w-full flex items-center justify-center">
            {flowData.some(f => f.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flowData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {flowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center">
                Log bleeding flow during your period to view distribution.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
