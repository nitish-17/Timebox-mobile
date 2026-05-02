import React, { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import { Send, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface QuickAddSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({ isOpen, onOpenChange }) => {
  const [text, setText] = useState('');
  const { addTask } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      addTask(text.trim(), 'later');
      setText('');
      onOpenChange(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
        <Drawer.Content 
          className="bg-[#020617] border-t border-sky-500/30 flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[101] outline-none max-h-[96dvh]"
          onOpenAutoFocus={(e) => {
            inputRef.current?.focus();
            e.preventDefault();
          }}
        >
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-800 mt-4 mb-6" />
          
          <div className="px-6 pb-12 safe-area-bottom">
            <div className="flex items-center justify-between mb-8">
              <Drawer.Title className="text-base uppercase tracking-[0.4em] text-sky-400 font-bold holographic-text">Initialize Objective</Drawer.Title>
              <Drawer.Description className="sr-only">Enter a new task to be added to Today's list.</Drawer.Description>
              <button 
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-sky-500/20 flex items-center justify-center text-slate-500 active:text-sky-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input 
                ref={inputRef}
                id="quick-add-input"
                name="quick-add-input"
                type="text"
                placeholder="Type mission details..."
                className="w-full bg-slate-950 border border-sky-500/20 rounded-xl py-4 pl-5 pr-14 text-base text-slate-100 placeholder:text-slate-800 outline-none focus:border-sky-500/50 transition-all"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-center justify-center text-sky-400 disabled:opacity-10 transition-all active:scale-90"
              >
                <Send size={18} strokeWidth={2} />
              </button>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
