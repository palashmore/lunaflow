import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Droplet, 
  ShieldCheck, 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  Moon, 
  Info,
  Plus
} from 'lucide-react';
import { Reminder } from '../../types';
import { StorageAdapter } from '../../services/storageAdapter';

export default function RemindersTab() {
  const [reminders, setReminders] = useState<Reminder[]>(() => StorageAdapter.getReminders());
  const [permissionState, setPermissionState] = useState<string>('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [newType, setNewType] = useState<Reminder['type']>('period_upcoming');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  async function requestNotificationPermission() {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermissionState(result);
    }
  }

  function toggleReminder(id: string) {
    const updated = StorageAdapter.toggleReminder(id);
    setReminders(updated);
  }

  function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      timeOfDay: newTime,
      enabled: true,
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    StorageAdapter.saveReminders(updated);
    setNewTitle('');
    setShowAddModal(false);
  }

  function getIcon(type: Reminder['type']) {
    switch (type) {
      case 'period_upcoming':
        return <Bell className="w-4 h-4 text-rose-500" />;
      case 'sanitary_change':
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      case 'hydration':
        return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800 dark:text-white">
            Smart Reminders
          </h2>
          <p className="text-xs text-slate-400">
            Discreet cycle alerts, hydration nudges & product changes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Permission Status Banner */}
      {permissionState !== 'granted' && (
        <div className="p-4 rounded-3xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Bell className="w-4 h-4 text-purple-600" />
              <span>Enable Browser Notifications</span>
            </div>
            {permissionState === 'unsupported' ? (
              <span className="text-[10px] text-slate-400">Not supported on this browser</span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
              >
                Enable
              </button>
            )}
          </div>
          <p className="text-[11px] text-purple-800/80 leading-relaxed">
            LunaFlow respects your privacy: reminder messages display generic comfort phrases on your lock screen so sensitive personal details remain private.
          </p>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-4 rounded-3xl border transition-all ${
              rem.enabled
                ? 'glass-panel border-rose-100/90 shadow-sm'
                : 'bg-white/40 border-slate-100 opacity-60'
            } flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100">
                {getIcon(rem.type)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{rem.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Scheduled for {rem.timeOfDay}</span>
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => toggleReminder(rem.id)}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                rem.enabled ? 'bg-rose-500' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                  rem.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Platform & Background Delivery Disclosure */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-100/90 shadow-sm space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Info className="w-4 h-4 text-rose-500" />
          <span>Device & Background Delivery Disclosure</span>
        </div>
        <p className="text-slate-500 leading-relaxed text-[11px]">
          Mobile operating systems (especially iOS) restrict background tasks when web applications are closed. For maximum reminder reliability, add LunaFlow to your home screen (<strong className="text-slate-700">Share &rarr; Add to Home Screen</strong> on iOS) and keep notification permissions active.
        </p>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white shadow-2xl bg-white/95 space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-800">
              New Personal Reminder
            </h3>

            <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Reminder Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Reminder['type'])}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="period_upcoming">Upcoming Period Alert</option>
                  <option value="sanitary_change">Sanitary Product Change</option>
                  <option value="hydration">Water / Hydration Drink</option>
                  <option value="medication">Medication / Iron / Contraceptive</option>
                  <option value="custom">Custom Wellness Nudge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Drink water & check pad"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Time of Day</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-sm shadow-rose-200"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
