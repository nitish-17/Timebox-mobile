import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Palette, Zap, CalendarOff } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { clsx } from 'clsx';
import { AutoSchedulePopup } from './AutoSchedulePopup';
import { BulkColorPopup } from './BulkColorPopup';

interface BulkActionSheetProps {
  selectedIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const BulkActionSheet: React.FC<BulkActionSheetProps> = ({ 
  selectedIds, isOpen, onClose 
}) => {
  const { deleteTask, moveTaskToList, unscheduleTask } = useStore();
  const [showColorPopup, setShowColorPopup] = useState(false);
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
                  onClick={() => setShowColorPopup(true)}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[6px] transition-all border bg-slate-900/50 border-emerald-500/10 text-slate-400 active:bg-emerald-500/20 active:border-emerald-500/40"
                  )}
                >
                  <Palette size={20} className="text-indigo-400" />
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

      <BulkColorPopup
        isOpen={showColorPopup}
        onClose={() => setShowColorPopup(false)}
        selectedIds={selectedIds}
        onConfirm={() => {
          setShowColorPopup(false);
          onClose(); // Exit selection mode
        }}
      />
    </>
  );
};
