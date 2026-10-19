import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export default function PinLockScreen({ correctPin, onUnlock }: PinLockScreenProps) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  function handleDigit(d: number) {
    if (pinInput.length >= 4) return;
    const next = pinInput + d;
    setPinInput(next);

    if (next.length === 4) {
      if (next === correctPin) {
        onUnlock();
      } else {
        setErrorMsg(true);
        setTimeout(() => {
          setPinInput('');
          setErrorMsg(false);
        }, 600);
      }
    }
  }

  function handleDelete() {
    setPinInput(prev => prev.slice(0, -1));
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF8F9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs flex flex-col items-center space-y-6">
        <div className="w-14 h-14 rounded-3xl bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm shadow-rose-200">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-serif font-bold text-slate-800">
            LunaFlow Sanctuary
          </h2>
          <p className="text-xs text-slate-400 mt-1">Enter your 4-digit privacy PIN</p>
        </div>

        {/* 4 dots */}
        <div className={`flex gap-3 my-2 ${errorMsg ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                i < pinInput.length
                  ? errorMsg
                    ? 'bg-rose-500 border-rose-500'
                    : 'bg-rose-500 border-rose-500 scale-110'
                  : 'border-slate-300'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-500 font-bold">Incorrect PIN. Try again.</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="h-14 rounded-2xl glass-panel text-lg font-bold text-slate-800 shadow-sm border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit(0)}
            className="h-14 rounded-2xl glass-panel text-lg font-bold text-slate-800 shadow-sm border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl glass-panel flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
