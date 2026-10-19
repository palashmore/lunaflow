import React, { useState } from 'react';
import { Eye } from 'lucide-react';

interface CamouflageViewProps {
  onExitCamouflage: () => void;
  secretCode?: string;
}

export default function CamouflageView({ onExitCamouflage, secretCode = '1234' }: CamouflageViewProps) {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  function handleNum(digit: number) {
    setDisplay(prev => (prev === '0' ? String(digit) : prev + digit));
  }

  function handleOp(op: string) {
    setPrevVal(Number(display));
    setOperation(op);
    setDisplay('0');
  }

  function handleEqual() {
    if (display === secretCode) {
      onExitCamouflage();
      return;
    }

    if (prevVal === null || operation === null) return;
    const current = Number(display);
    let result: number | string = 0;
    if (operation === '+') result = prevVal + current;
    if (operation === '-') result = prevVal - current;
    if (operation === '×') result = prevVal * current;
    if (operation === '÷') result = current !== 0 ? prevVal / current : 'Error';

    setDisplay(String(result));
    setPrevVal(null);
    setOperation(null);
  }

  function handleClear() {
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-4">
        {/* Disguise Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span className="font-mono">Calculator • System Tools</span>
          <button
            onClick={onExitCamouflage}
            title="Exit Camouflage"
            className="p-1 hover:text-slate-300 opacity-40 hover:opacity-100 transition-opacity"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 rounded-2xl bg-slate-800 text-right font-mono text-3xl font-bold tracking-tight text-emerald-400 overflow-x-auto">
          {display}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
          <button onClick={handleClear} className="p-3.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 active:scale-95">C</button>
          <button onClick={() => setDisplay(prev => String(-Number(prev)))} className="p-3.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95">±</button>
          <button onClick={() => setDisplay(prev => String(Number(prev) / 100))} className="p-3.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95">%</button>
          <button onClick={() => handleOp('÷')} className="p-3.5 rounded-xl bg-amber-600 text-white hover:bg-amber-500 active:scale-95">÷</button>

          <button onClick={() => handleNum(7)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">7</button>
          <button onClick={() => handleNum(8)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">8</button>
          <button onClick={() => handleNum(9)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">9</button>
          <button onClick={() => handleOp('×')} className="p-3.5 rounded-xl bg-amber-600 text-white hover:bg-amber-500 active:scale-95">×</button>

          <button onClick={() => handleNum(4)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">4</button>
          <button onClick={() => handleNum(5)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">5</button>
          <button onClick={() => handleNum(6)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">6</button>
          <button onClick={() => handleOp('-')} className="p-3.5 rounded-xl bg-amber-600 text-white hover:bg-amber-500 active:scale-95">-</button>

          <button onClick={() => handleNum(1)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">1</button>
          <button onClick={() => handleNum(2)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">2</button>
          <button onClick={() => handleNum(3)} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">3</button>
          <button onClick={() => handleOp('+')} className="p-3.5 rounded-xl bg-amber-600 text-white hover:bg-amber-500 active:scale-95">+</button>

          <button onClick={() => handleNum(0)} className="col-span-2 p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">0</button>
          <button onClick={() => !display.includes('.') && setDisplay(prev => prev + '.')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95">.</button>
          <button onClick={handleEqual} className="p-3.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold active:scale-95">=</button>
        </div>

        <p className="text-[10px] text-center text-slate-600">
          Tip: Type {secretCode} followed by = or tap eye to return.
        </p>
      </div>
    </div>
  );
}
