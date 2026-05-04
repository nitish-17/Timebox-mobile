import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Timer, BetweenHorizontalEnd, Check, Zap } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { format, addMinutes, setMinutes, startOfHour } from 'date-fns';
import { clsx } from 'clsx';

interface AutoSchedulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onConfirm: () => void;
}

export const AutoSchedulePopup: React.FC<AutoSchedulePopupProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onConfirm
}) => {
  const { selectedDate, bulkScheduleDetailed } = useStore();
  
  // Calculate default start time: next 15-min block after now
  const getDefaultStartTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    let defaultTime = startOfHour(now);
    
    if (minutes < 15) {
      defaultTime = setMinutes(defaultTime, 15);
    } else if (minutes < 30) {
      defaultTime = setMinutes(defaultTime, 30);
    } else if (minutes < 45) {
      defaultTime = setMinutes(defaultTime, 45);
    } else {
      defaultTime = addMinutes(setMinutes(defaultTime, 0), 60);
    }
    return format(defaultTime, 'HH:mm');
  };

  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [duration, setDuration] = useState(30);
  const [gap, setGap] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStartTime(getDefaultStartTime());
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(selectedDate + 'T00:00:00');
    startDateTime.setHours(hours, minutes, 0, 0);

    await bulkScheduleDetailed(selectedIds, startDateTime.toISOString(), duration, gap);
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
                  <Zap className="text-emerald-400" size={24} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-500/60">System Protocol</span>
                    <h3 className="text-lg font-bold text-slate-100">Auto-Schedule</h3>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Start Time */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    <Clock size={14} className="text-emerald-500" />
                    Mission Start Time
                  </label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900/50 border border-emerald-500/10 rounded-lg px-4 py-3 text-slate-100 outline-none focus:border-emerald-500/40 transition-all text-lg font-mono"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    <Timer size={14} className="text-emerald-500" />
                    Duration per Quest (mins)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 60, 90].map(val => (
                      <button
                        key={val}
                        onClick={() => setDuration(val)}
                        className={clsx(
                          "py-2 rounded-lg border transition-all text-xs font-bold",
                          duration === val 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                            : "bg-slate-900/50 border-slate-800 text-slate-500"
                        )}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gap */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    <BetweenHorizontalEnd size={14} className="text-emerald-500" />
                    Recovery Gap (mins)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 15, 30, 60].map(val => (
                      <button
                        key={val}
                        onClick={() => setGap(val)}
                        className={clsx(
                          "py-2 rounded-lg border transition-all text-xs font-bold",
                          gap === val 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                            : "bg-slate-900/50 border-slate-800 text-slate-500"
                        )}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full mt-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
              >
                <Check size={20} strokeWidth={3} />
                Synchronize Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
