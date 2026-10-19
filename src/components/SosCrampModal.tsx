import React, { useState, useEffect } from 'react';
import { X, Heart, Sparkles, Flame, Coffee } from 'lucide-react';

interface SosCrampModalProps {
  onClose: () => void;
}

export default function SosCrampModal({ onClose }: SosCrampModalProps) {
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (breathePhase === 'Inhale') {
          setBreathePhase('Hold');
          return 7;
        } else if (breathePhase === 'Hold') {
          setBreathePhase('Exhale');
          return 8;
        } else {
          setBreathePhase('Inhale');
          setBreathCycles(c => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathePhase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/80 shadow-2xl bg-white/95 my-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-800">
                SOS Cramp Sanctuary
              </h2>
              <p className="text-[11px] text-slate-400">Gentle relaxation for uterine muscle comfort</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Interactive 4-7-8 Breathing Circle */}
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-rose-50/70 to-purple-50/70 border border-rose-100 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-2">
            Rhythmic 4-7-8 Pelvic Relaxation
          </span>

          <div className="relative w-40 h-40 flex items-center justify-center my-3">
            <div
              className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${
                breathePhase === 'Inhale'
                  ? 'scale-115 bg-rose-200/60 shadow-lg shadow-rose-200'
                  : breathePhase === 'Hold'
                  ? 'scale-115 bg-purple-200/60 shadow-lg shadow-purple-200'
                  : 'scale-90 bg-sky-200/50 shadow-sm'
              }`}
            />
            <div className="relative z-10 text-center">
              <span className="text-xl font-serif font-bold text-slate-800 block">
                {breathePhase}
              </span>
              <span className="text-3xl font-extrabold text-rose-600">
                {secondsLeft}s
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                {breathePhase === 'Inhale' && 'Slowly through nose'}
                {breathePhase === 'Hold' && 'Softly relax abdomen'}
                {breathePhase === 'Exhale' && 'Slowly release tension'}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 mt-1">
            Cycles completed: {breathCycles} ✨
          </span>
        </div>

        {/* 2. Fast Cramp Relief Remedies */}
        <div className="space-y-2 text-xs">
          <h3 className="font-serif font-bold text-slate-800">Natural Comfort Measures</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Flame className="w-3.5 h-3.5" />
                <span>Topical Heat (Wrapped)</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Apply a warm hot-water bottle wrapped in cloth for 20–30 min to relax pelvic blood vessels.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Coffee className="w-3.5 h-3.5" />
                <span>Chamomile & Ginger</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Chamomile and warm ginger tea inhibit inflammatory prostaglandins that trigger cramping.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Acupressure Points for Cramps */}
        <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 space-y-2 text-xs">
          <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Acupressure Point: San Yin Jiao (SP6)
          </h4>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Place 4 fingers above your inner ankle bone on the inside of your calf. Gently apply circular firm pressure with your thumb for 1–2 minutes while breathing deeply.
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-200 active:scale-98 transition-all"
        >
          I Feel Calmer Now 🌸
        </button>
      </div>
    </div>
  );
}
