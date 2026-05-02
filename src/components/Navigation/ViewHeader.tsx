import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, Target, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import type { Task } from '../../types';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { HiddenView } from './HiddenView';
import { EnergyBar } from './EnergyBar';

interface ViewHeaderProps {
  schedulingTask?: Task | null;
  onCompleteScheduling?: () => void;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ 
  schedulingTask, 
  onCompleteScheduling 
}) => {
  const { selectedDate, energyConfig } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="relative z-[60]">
      <div className="px-6 py-4 border-b border-sky-500/20 bg-slate-900/40 backdrop-blur-xl flex flex-col gap-3">
        {schedulingTask ? (
          <div className="flex items-center justify-between py-1 px-2 bg-sky-500/10 rounded-xl border border-sky-500/30 animate-pulse">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-sky-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-sky-500/60 font-black">Placement Mode</span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[180px]">Place: {schedulingTask.title}</span>
              </div>
            </div>
            <button 
              onClick={onCompleteScheduling}
              className="p-2 text-slate-400 active:text-sky-400"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-widest text-sky-400 holographic-text text-shadow-[0_0_15px_#0ba5e9]">
              {format(new Date(selectedDate), 'EEEE, MMM do')}
            </h2>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={clsx(
                "p-2 text-sky-500/60 active:text-sky-400 transition-transform duration-300",
                isDropdownOpen && "rotate-180"
              )}
            >
              <ChevronDown size={24} />
            </button>
          </div>
        )}
        <EnergyBar config={energyConfig} />
      </div>

      {/* Collapsible Hidden View */}
      <AnimatePresence>
        {isDropdownOpen && !schedulingTask && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-sky-500/10"
          >
            <HiddenView />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
