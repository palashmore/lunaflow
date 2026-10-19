import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Moon, 
  Save, 
  Calendar as CalendarIcon, 
  Check 
} from 'lucide-react';
import { formatDate } from '../services/cycleEngine';
import { DailyLog, FlowIntensity } from '../types';

interface DiaryTabProps {
  selectedDate?: string;
  dailyLogs: Record<string, DailyLog>;
  onSaveLog: (dateStr: string, logData: Partial<DailyLog>) => void;
  onClose?: () => void;
}

const FLOW_OPTIONS: Array<{ id: FlowIntensity; label: string; droplets: number }> = [
  { id: 'none', label: 'None', droplets: 0 },
  { id: 'spotting', label: 'Spotting', droplets: 1 },
  { id: 'light', label: 'Light', droplets: 2 },
  { id: 'medium', label: 'Medium', droplets: 3 },
  { id: 'heavy', label: 'Heavy', droplets: 4 },
];

const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Cramps', icon: '⚡' },
  { id: 'tender_breasts', label: 'Tender Breasts', icon: '🌸' },
  { id: 'bloating', label: 'Bloating', icon: '🎈' },
  { id: 'acne', label: 'Acne / Skin', icon: '✨' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'backache', label: 'Back Pain', icon: '🧘‍♀️' },
  { id: 'fatigue', label: 'Fatigue', icon: '🥱' },
  { id: 'cravings', label: 'Cravings', icon: '🍫' },
  { id: 'nausea', label: 'Nausea', icon: '🤢' },
  { id: 'insomnia', label: 'Restless Sleep', icon: '🌙' },
];

const MOOD_OPTIONS = [
  { id: 'calm', label: 'Calm & Zen', icon: '🌿' },
  { id: 'happy', label: 'Happy & Joyful', icon: '🥰' },
  { id: 'energetic', label: 'High Energy', icon: '⚡' },
  { id: 'emotional', label: 'Sensitive', icon: '🥺' },
  { id: 'irritable', label: 'Irritable', icon: '😤' },
  { id: 'anxious', label: 'Anxious', icon: '😰' },
  { id: 'depressed', label: 'Low Mood', icon: '🌧️' },
  { id: 'exhausted', label: 'Exhausted', icon: '💤' },
];

const MUCUS_OPTIONS = [
  { id: 'dry', label: 'Dry' },
  { id: 'sticky', label: 'Sticky' },
  { id: 'creamy', label: 'Creamy' },
  { id: 'egg_white', label: 'Egg-White (Peak Fertile Estimate)' },
  { id: 'watery', label: 'Watery' },
];

export default function DiaryTab({
  selectedDate,
  dailyLogs,
  onSaveLog,
  onClose,
}: DiaryTabProps) {
  const dateStr = selectedDate || formatDate(new Date());
  const existingLog = dailyLogs[dateStr] || {
    logDate: dateStr,
    flow: 'none',
    symptoms: [],
    moods: [],
    cervicalMucus: '',
    waterGlasses: 0,
    sleepHours: 7.5,
    notes: '',
  };

  const [flow, setFlow] = useState<FlowIntensity>(existingLog.flow || 'none');
  const [symptoms, setSymptoms] = useState<string[]>(existingLog.symptoms || []);
  const [moods, setMoods] = useState<string[]>(existingLog.moods || []);
  const [cervicalMucus, setCervicalMucus] = useState<string>(existingLog.cervicalMucus || '');
  const [sleepHours, setSleepHours] = useState<number>(existingLog.sleepHours ?? 7.5);
  const [notes, setNotes] = useState<string>(existingLog.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const log = dailyLogs[dateStr] || {
      logDate: dateStr,
      flow: 'none',
      symptoms: [],
      moods: [],
      cervicalMucus: '',
      sleepHours: 7.5,
      notes: '',
    };
    setFlow(log.flow || 'none');
    setSymptoms(log.symptoms || []);
    setMoods(log.moods || []);
    setCervicalMucus(log.cervicalMucus || '');
    setSleepHours(log.sleepHours ?? 7.5);
    setNotes(log.notes || '');
  }, [dateStr, dailyLogs]);

  function toggleSymptom(id: string) {
    setSymptoms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function toggleMood(id: string) {
    setMoods(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleSave() {
    onSaveLog(dateStr, {
      flow,
      symptoms,
      moods,
      cervicalMucus,
      sleepHours,
      notes,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1000);
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Title & Selected Date */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Daily Journal</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-slate-800">
            {dateStr === formatDate(new Date()) ? `Today's Entry (${dateStr})` : `Entry for ${dateStr}`}
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1"
          >
            Close
          </button>
        )}
      </div>

      {/* 1. Flow Intensity */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-800 font-serif">
          Menstrual Flow Intensity
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {FLOW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFlow(opt.id)}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all text-xs ${
                flow === opt.id
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-200 scale-102'
                  : 'bg-white/80 border border-slate-100 text-slate-600 hover:border-rose-200'
              }`}
            >
              <div className="flex gap-0.5 mb-1">
                {opt.droplets === 0 ? (
                  <span className="text-xs opacity-50">-</span>
                ) : (
                  Array.from({ length: opt.droplets }).map((_, i) => (
                    <Droplet key={i} className="w-2.5 h-2.5 fill-current" />
                  ))
                )}
              </div>
              <span className="text-[10px] leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Physical Symptoms */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-800 font-serif">
          Physical Symptoms
        </label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((sym) => {
            const isSelected = symptoms.includes(sym.id);
            return (
              <button
                key={sym.id}
                onClick={() => toggleSymptom(sym.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200 font-semibold scale-102'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:border-rose-300'
                }`}
              >
                <span>{sym.icon}</span>
                <span>{sym.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Moods */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-800 font-serif">
          Mood & Energy State
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = moods.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleMood(m.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 font-semibold scale-102'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:border-purple-300'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Sleep & Cervical Mucus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              Sleep Duration
            </span>
            <span className="text-indigo-600 font-extrabold">{sleepHours} hrs</span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Cervical Fluid Observation
          </label>
          <select
            value={cervicalMucus}
            onChange={(e) => setCervicalMucus(e.target.value)}
            className="w-full p-2 rounded-xl border border-rose-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="">Select fluid observation...</option>
            {MUCUS_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Personal Private Notes */}
      <div className="glass-panel p-4 rounded-3xl border border-rose-100/90 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-slate-800 font-serif">
          Private Journal & Notes
        </label>
        <textarea
          rows={3}
          placeholder="Personal reflections, medications, physical sensations... (Kept private and secure)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 rounded-2xl border border-rose-100 bg-white/90 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
          savedSuccess
            ? 'bg-emerald-500 text-white shadow-emerald-200'
            : 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white shadow-rose-200 hover:opacity-95'
        }`}
      >
        {savedSuccess ? (
          <>
            <Check className="w-4 h-4" />
            <span>Saved to Diary!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Entry</span>
          </>
        )}
      </button>
    </div>
  );
}
