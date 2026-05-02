import React, { useState } from 'react';
import { Drawer } from 'vaul';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Clock, X, Palette, Check } from 'lucide-react';
import { ChromePicker } from 'react-color';
import type { Task } from '../../types';

interface TaskActionSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onMove: (id: string, list: 'today' | 'later') => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onStartScheduling: (task: Task) => void;
}

export const TaskActionSheet: React.FC<TaskActionSheetProps> = ({ 
  task, isOpen, onClose, onDelete, onMove, onUpdate, onStartScheduling 
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  if (!task) return null;

  const handleColorChange = (color: any) => {
    const { r, g, b, a } = color.rgb;
    onUpdate(task.id, { color: `rgba(${r}, ${g}, ${b}, ${a})` });
  };

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setShowColorPicker(false);
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-[#020617] border-t border-sky-500/30 flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[101] outline-none max-h-[90dvh]">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-800 my-4" />
          
          <div className="p-6 pt-2 overflow-y-auto">
            {/* Header: Task Title */}
            <div className="flex items-start justify-between mb-8 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Drawer.Description className="text-[10px] uppercase tracking-widest text-sky-500/60 font-bold">
                    Objective Details
                  </Drawer.Description>
                </div>
                <Drawer.Title className="text-lg font-bold text-slate-100 leading-tight">
                  {task.title}
                </Drawer.Title>
              </div>
              <button 
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-slate-900 border border-sky-500/20 flex items-center justify-center text-slate-400 active:text-sky-400"
              >
                <X size={20} />
              </button>
            </div>

            {showColorPicker ? (
              <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-full flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-sky-500">Select Attribute Aura</span>
                  <button 
                    onClick={() => setShowColorPicker(false)}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <Check size={12} /> Confirm
                  </button>
                </div>
                
                <div 
                  className="chrome-picker-wrapper w-full flex justify-center pb-4"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <ChromePicker 
                    color={task.color || 'rgba(11, 165, 233, 0.75)'} 
                    onChange={handleColorChange}
                    disableAlpha={false}
                    width="100%"
                  />
                </div>
              </div>
            ) : (
              /* Action Grid */
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onMove(task.id, task.list === 'today' ? 'later' : 'today')}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-sky-500/10 active:bg-sky-500/10 active:border-sky-500/30 transition-all"
                >
                  {task.list === 'today' ? (
                    <>
                      <ArrowDownCircle size={28} className="text-amber-500" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Move to Later</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle size={28} className="text-emerald-500" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Move to Today</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => task && onStartScheduling(task)}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-sky-500/10 active:bg-sky-500/10 active:border-sky-500/30 transition-all"
                >
                  <Clock size={28} className="text-sky-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Schedule</span>
                </button>

                <button 
                  onClick={() => setShowColorPicker(true)}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-sky-500/10 active:bg-sky-500/10 active:border-sky-500/30 transition-all"
                >
                  <Palette size={28} className="text-indigo-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Attribute Color</span>
                </button>

                <button 
                  onClick={() => onDelete(task.id)}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-red-500/10 active:bg-red-500/10 active:border-red-500/30 transition-all"
                >
                  <Trash2 size={24} className="text-red-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-red-500/60">Terminate</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-8" /> {/* Safe area bottom padding */}
        </Drawer.Content>
      </Drawer.Portal>

      <style>{`
        .chrome-picker {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid rgba(14, 165, 233, 0.2) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
          border-radius: 12px !important;
          font-family: var(--font-family) !important;
        }
        .chrome-picker input {
          background: rgba(2, 6, 23, 0.5) !important;
          color: #fff !important;
          border: 1px solid rgba(14, 165, 233, 0.2) !important;
          border-radius: 4px !important;
        }
        .chrome-picker label {
          color: #64748b !important;
          text-transform: uppercase !important;
          font-size: 8px !important;
          font-weight: 800 !important;
          letter-spacing: 0.1em !important;
        }
      `}</style>
    </Drawer.Root>
  );
};
