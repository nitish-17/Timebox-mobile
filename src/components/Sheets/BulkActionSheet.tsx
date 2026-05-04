import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Palette, Zap, CalendarOff, Pipette } from 'lucide-react';
import { ChromePicker } from 'react-color';
import { useStore } from '../../hooks/useStore';
import { clsx } from 'clsx';
import { AutoSchedulePopup } from './AutoSchedulePopup';

interface BulkActionSheetProps {
  selectedIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

const SYSTEM_AURAS = [
  { name: 'System', color: 'rgba(14, 165, 233, 0.8)', glow: 'rgba(14, 165, 233, 0.4)' },
  { name: 'Growth', color: 'rgba(16, 185, 129, 0.8)', glow: 'rgba(16, 185, 129, 0.4)' },
  { name: 'Reward', color: 'rgba(250, 204, 21, 0.8)', glow: 'rgba(250, 204, 21, 0.4)' },
  { name: 'Berserk', color: 'rgba(239, 68, 68, 0.8)', glow: 'rgba(239, 68, 68, 0.4)' },
  { name: 'Void', color: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.4)' },
  { name: 'Shadow', color: 'rgba(100, 116, 139, 0.8)', glow: 'rgba(100, 116, 139, 0.4)' },
];

export const BulkActionSheet: React.FC<BulkActionSheetProps> = ({ 
  selectedIds, isOpen, onClose 
}) => {
  const { deleteTask, moveTaskToList, updateTask, unscheduleTask } = useStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  
  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteTask(id);
    }
    onClose();
  };

  const handleBulkMove = async (list: 'today' | 'later') => {
    for (const id of selectedIds) {
      await moveTaskToList(id, list);
    }
    onClose();
  };

  const handleBulkUnschedule = async () => {
    for (const id of selectedIds) {
      await unscheduleTask(id);
    }
    onClose();
  };

  const handleColorSelect = async (colorStr: string) => {
    for (const id of selectedIds) {
      await updateTask(id, { color: colorStr });
    }
  };

  const handleAdvancedColorChange = (color: any) => {
    const { r, g, b, a } = color.rgb;
    handleColorSelect(`rgba(${r}, ${g}, ${b}, ${a})`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-[70px] left-0 right-0 z-[85] bg-[#020617]/95 backdrop-blur-xl border-t border-emerald-500/30 rounded-t-[16px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] outline-none"
          >
            <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-slate-800 my-3" />
            
            <div className="px-6 pb-6 pt-1">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-emerald-500/60 font-black">Selection Actions</span>
                  <span className="text-xs font-bold text-slate-100">{selectedIds.length} items targeted</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleBulkMove('today')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] bg-slate-900/50 border border-emerald-500/10 active:bg-emerald-500/20 active:border-emerald-500/40 transition-all"
                >
                  <ArrowUpCircle size={20} className="text-emerald-500" />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">To Today</span>
                </button>

                <button 
                  onClick={() => handleBulkMove('later')}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] bg-slate-900/50 border border-emerald-500/10 active:bg-emerald-500/20 active:border-emerald-500/40 transition-all"
                >
                  <ArrowDownCircle size={20} className="text-amber-500" />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">To Later</span>
                </button>

                <button 
                  onClick={handleBulkUnschedule}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] bg-slate-900/50 border border-emerald-500/10 active:bg-emerald-500/20 active:border-emerald-500/40 transition-all"
                >
                  <CalendarOff size={20} className="text-sky-400" />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Unplan</span>
                </button>

                <button 
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowAdvancedPicker(false);
                  }}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] transition-all border",
                    showColorPicker 
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                      : "bg-slate-900/50 border-emerald-500/10 text-slate-400 active:bg-emerald-500/20 active:border-emerald-500/40"
                  )}
                >
                  <Palette size={20} className={showColorPicker ? "text-emerald-400" : "text-indigo-400"} />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Color</span>
                </button>

                <button 
                  onClick={() => setShowAutoSchedule(true)} 
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] bg-slate-900/50 border border-emerald-500/10 active:bg-emerald-500/20 active:border-emerald-500/40 transition-all"
                >
                  <Zap size={20} className="text-emerald-400" />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Auto</span>
                </button>

                <button 
                  onClick={handleBulkDelete}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] bg-red-500/5 border border-red-500/10 active:bg-red-500/15 active:border-red-500/30 transition-all"
                >
                  <Trash2 size={18} className="text-red-500" />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-red-500/60">Delete</span>
                </button>
              </div>

              {/* Simplified Attribute Palette */}
              {showColorPicker && (
                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-500/60">Essence Aura Palette</span>
                    <button 
                      onClick={() => setShowAdvancedPicker(!showAdvancedPicker)}
                      className={clsx(
                        "p-1.5 rounded-[4px] border transition-all",
                        showAdvancedPicker ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-500"
                      )}
                      title="Advanced Color Picker"
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
                          className="w-10 h-10 rounded-full border-2 border-white/10 transition-all active:scale-75 hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
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
                    <div className="mt-6 flex justify-center animate-in fade-in zoom-in-95 duration-200">
                      <div 
                        className="chrome-picker-wrapper p-2 bg-slate-900 rounded-2xl border border-white/5"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <ChromePicker 
                          color="rgba(16, 185, 129, 0.75)" 
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AutoSchedulePopup 
        isOpen={showAutoSchedule}
        onClose={() => setShowAutoSchedule(false)}
        selectedIds={selectedIds}
        onConfirm={() => {
          setShowAutoSchedule(false);
          onClose(); // Exit selection mode
        }}
      />
    </>
  );
};
