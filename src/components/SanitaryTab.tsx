import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Moon, 
  Droplet, 
  Feather, 
  Sparkles,
  Info
} from 'lucide-react';
import { SanitaryItem } from '../types';

interface SanitaryTabProps {
  inventory: SanitaryItem[];
  onUpdateCount: (itemId: string, delta: number) => void;
  onAddProduct: (newProduct: SanitaryItem) => void;
}

export default function SanitaryTab({ inventory, onUpdateCount, onAddProduct }: SanitaryTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState('Regular Pads');
  const [newBrand, setNewBrand] = useState('');
  const [newCount, setNewCount] = useState(10);
  const [newThreshold, setNewThreshold] = useState(3);

  const lowStockItems = inventory.filter(i => (i.count || 0) <= (i.threshold || 3));

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newType.trim()) return;

    onAddProduct({
      id: Date.now().toString(),
      type: newType,
      brand: newBrand.trim() || 'My Brand',
      count: Number(newCount),
      threshold: Number(newThreshold),
    });

    setNewBrand('');
    setNewCount(10);
    setShowAddModal(false);
  }

  function getIcon(type: string) {
    if (type.includes('Overnight')) return <Moon className="w-5 h-5 text-indigo-500" />;
    if (type.includes('Tampon')) return <Droplet className="w-5 h-5 text-purple-500" />;
    if (type.includes('Liner')) return <Feather className="w-5 h-5 text-pink-400" />;
    if (type.includes('Cup')) return <Sparkles className="w-5 h-5 text-amber-500" />;
    return <ShieldCheck className="w-5 h-5 text-rose-500" />;
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Header and Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800">
            Sanitary & Hygiene Stock
          </h2>
          <p className="text-xs text-slate-400">Keep track of pads, tampons & menstrual supplies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold">Stock Up Reminder!</h4>
            <p className="text-amber-800/90 leading-relaxed">
              You are running low on: {lowStockItems.map(i => `${i.type} (${i.count} left)`).join(', ')}. Restock before your next cycle starts.
            </p>
          </div>
        </div>
      )}

      {/* Inventory Cards Grid */}
      <div className="space-y-3">
        {inventory.map((item) => {
          const isLow = (item.count || 0) <= (item.threshold || 3);

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all ${
                isLow
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'glass-panel border-rose-100/90 shadow-sm'
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{item.type}</h4>
                    {isLow && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{item.brand || 'No brand specified'}</p>
                </div>
              </div>

              {/* Counter Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onUpdateCount(item.id, -1)}
                  disabled={item.count <= 0}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="w-10 text-center">
                  <span className="text-base font-extrabold text-slate-800">{item.count}</span>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">left</p>
                </div>
                <button
                  onClick={() => onUpdateCount(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs hover:bg-rose-600 active:scale-95 shadow-sm shadow-rose-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TSS and Sanitary Hygiene Educational Guide */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-100/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-800">
          <Info className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold font-serif">Hygiene Best Practices & TSS Awareness</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
          <li><strong>Pad frequency:</strong> Change disposable pads every 4 to 6 hours or sooner depending on flow intensity.</li>
          <li><strong>Tampon safety:</strong> Use the lowest absorbency suitable for your flow. Avoid leaving any tampon inserted for longer than 8 hours to reduce Toxic Shock Syndrome (TSS) risk.</li>
          <li><strong>Menstrual cups:</strong> Sterilize in boiling water for 5 minutes between each menstrual period. Empty every 8 to 12 hours.</li>
          <li><strong>Storage:</strong> Store disposable hygiene products in clean, dry environments away from humid bathrooms.</li>
        </ul>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4 bg-white/95">
            <h3 className="text-base font-serif font-bold text-slate-800">
              Add Sanitary Product
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Product Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="Regular Pads">Regular Pads</option>
                  <option value="Overnight Pads (XXL)">Overnight Pads (XXL)</option>
                  <option value="Tampons (Regular)">Tampons (Regular)</option>
                  <option value="Tampons (Super)">Tampons (Super)</option>
                  <option value="Pantyliners">Pantyliners</option>
                  <option value="Menstrual Cup">Menstrual Cup</option>
                  <option value="Period Underwear">Period Underwear</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Brand Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Whisper, Stayfree, Tampax"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Count in Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={newCount}
                    onChange={(e) => setNewCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Low-Stock Alert at</label>
                  <input
                    type="number"
                    min="1"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors shadow-sm shadow-rose-200"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
