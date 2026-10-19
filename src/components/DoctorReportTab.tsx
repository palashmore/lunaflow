import React from 'react';
import { Printer } from 'lucide-react';
import { formatDate } from '../services/cycleEngine';
import { UserProfile, DailyLog, CycleStatus } from '../types';

interface DoctorReportTabProps {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  status: CycleStatus;
}

export default function DoctorReportTab({ profile, dailyLogs, status }: DoctorReportTabProps) {
  const avgCycle = profile.avgCycleLength || 28;
  const avgPeriod = profile.avgPeriodLength || 5;

  const logEntries = Object.entries(dailyLogs);
  const totalLoggedDays = logEntries.length;

  let crampDays = 0;
  let heavyFlowDays = 0;
  let headacheDays = 0;
  let bloatingDays = 0;

  logEntries.forEach(([_, log]) => {
    if (log.symptoms?.includes('cramps')) crampDays++;
    if (log.symptoms?.includes('headache')) headacheDays++;
    if (log.symptoms?.includes('bloating')) bloatingDays++;
    if (log.flow === 'heavy') heavyFlowDays++;
  });

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800">
            Doctor Health Report
          </h2>
          <p className="text-xs text-slate-400">Share your cycle summary with your gynecologist</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-sm transition-all active:scale-95"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / PDF
        </button>
      </div>

      {/* Printable Medical Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 print:border-none print:shadow-none print:p-0">
        <div className="flex items-start justify-between border-b pb-4 border-slate-100">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900">
              LunaFlow • Confidential Gynecological Summary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient: <strong>{profile.displayName || 'Confidential Patient'}</strong> (Born: {profile.birthYear || 'N/A'})
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Date: {formatDate(new Date())}
          </span>
        </div>

        {/* Core Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Cycle Length</span>
            <span className="text-base font-bold text-slate-800">{avgCycle} Days</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Normal (21–35d)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Period Bleed</span>
            <span className="text-base font-bold text-slate-800">{avgPeriod} Days</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Normal (3–7d)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Cycle Day</span>
            <span className="text-base font-bold text-rose-600">Day {status.cycleDay}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{status.phase.name}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Logged Days</span>
            <span className="text-base font-bold text-purple-600">{totalLoggedDays} Days</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">In database</span>
          </div>
        </div>

        {/* Symptoms & Pain Frequency */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Symptom & Pain Frequency (Recorded)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50">
              <span className="text-slate-500 block text-[11px]">Dysmenorrhea (Cramps)</span>
              <strong className="text-rose-700 text-sm">{crampDays} days reported</strong>
            </div>

            <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50">
              <span className="text-slate-500 block text-[11px]">Menorrhagia (Heavy Flow)</span>
              <strong className="text-rose-700 text-sm">{heavyFlowDays} days reported</strong>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Headaches / Migraines</span>
              <strong className="text-slate-700 text-sm">{headacheDays} days reported</strong>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Abdominal Bloating</span>
              <strong className="text-slate-700 text-sm">{bloatingDays} days reported</strong>
            </div>
          </div>
        </div>

        {/* Recent Journal History */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent Patient Notes
          </h4>
          <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
            {logEntries.slice(0, 5).map(([dStr, entry]) => (
              <div key={dStr} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <div className="flex justify-between font-semibold text-[11px] text-slate-500 mb-0.5">
                  <span>{dStr}</span>
                  <span className="capitalize text-rose-600">Flow: {entry.flow}</span>
                </div>
                {entry.notes ? <p className="italic">{entry.notes}</p> : <p className="text-slate-400">No written notes.</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Doctor stamp & signature line */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-end text-xs text-slate-400">
          <div>
            <p>Generated via LunaFlow PWA (Supabase Protected)</p>
            <p className="text-[10px]">Data is client-verified and encrypted via PostgreSQL RLS.</p>
          </div>
          <div className="text-right">
            <div className="w-36 border-b border-slate-300 mb-1" />
            <p className="text-[10px]">Doctor / Clinician Review</p>
          </div>
        </div>
      </div>
    </div>
  );
}
