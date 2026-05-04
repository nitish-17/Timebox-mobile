import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Check, Pipette } from 'lucide-react';
import { ChromePicker } from 'react-color';
import { useStore } from '../../hooks/useStore';
import { clsx } from 'clsx';

interface BulkColorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onConfirm: () => void;
}

const SYSTEM_AURAS = [
  { name: 'System', color: 'rgba(14, 165, 233, 0.8)', glow: 'rgba(14, 165, 233, 0.4)' },
  { name: 'Growth', color: 'rgba(16, 185, 129, 0.8)', glow: 'rgba(16, 185, 129, 0.4)' },
  { name: 'Reward', color: 'rgba(250, 204, 21, 0.8)', glow: 'rgba(250, 204, 21, 0.4)' },
  { name: 'Berserk', color: 'rgba(239, 68, 68, 0.8)', glow: 'rgba(239, 68, 68, 0.4)' },
  { name: 'Void', color: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.4)' },
  { name: 'Shadow', color: 'rgba(100, 116, 139, 0.8)', glow: 'rgba(100, 116, 139, 0.4)' },
];

export const BulkColorPopup: React.FC<BulkColorPopupProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onConfirm
}) => {
  const { updateTask } = useStore();
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('rgba(14, 165, 233, 0.8)');

  const handleColorSelect = async (colorStr: string) => {
    setActiveColor(colorStr);
  };

  const handleAdvancedColorChange = (color: any) => {
    const { r, g, b, a } = color.rgb;
    handleColorSelect(`rgba(${r}, ${g}, ${b}, ${a})`);
  };

  const handleConfirm = async () => {
    for (const id of selectedIds) {
      await updateTask(id, { color: activeColor });
    }
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-[#020617] border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Palette className="text-emerald-400" size={24} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-500/60">Color Selection</span>
                    <h3 className="text-lg font-bold text-slate-100">Batch Color</h3>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-500/60">Color Palette</span>
                  <button 
                    onClick={() => setShowAdvancedPicker(!showAdvancedPicker)}
                    className={clsx(
                      "p-1.5 rounded-[4px] border transition-all",
                      showAdvancedPicker ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-500"
                    )}
                  >
                    <Pipette size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-3">
                  {SYSTEM_AURAS.map((aura) => (
                    <button
                      key={aura.name}
                      onClick={() => handleColorSelect(aura.color)}
                      className="group relative flex flex-col items-center gap-1.5"
                    >
                      <div 
                        className={clsx(
                          "w-10 h-10 rounded-full border-2 transition-all active:scale-75 hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                          activeColor === aura.color ? "border-white scale-110" : "border-white/10"
                        )}
                        style={{ 
                          backgroundColor: aura.color,
                          boxShadow: `0 0 15px ${aura.glow}` 
                        }}
                      />
                      <span className="text-[6px] uppercase font-bold tracking-tighter text-slate-500 group-active:text-emerald-400">{aura.name}</span>
                    </button>
                  ))}
                </div>

                {showAdvancedPicker && (
                  <div className="flex justify-center animate-in fade-in zoom-in-95 duration-200">
                    <div 
                      className="chrome-picker-wrapper p-2 bg-slate-900 rounded-2xl border border-white/5"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <ChromePicker 
                        color={activeColor} 
                        onChange={handleAdvancedColorChange}
                        styles={{
                          default: {
                            picker: {
                              background: 'transparent',
                              boxShadow: 'none',
                              border: 'none',
                              fontFamily: 'inherit'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full mt-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
              >
                <Check size={20} strokeWidth={3} />
                Apply Color
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
