import React from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  maxHeight?: string; // e.g. "90dvh"
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  showHandle = true,
  showCloseButton = true,
  maxHeight = "96dvh",
  className,
}) => {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Drawer.Content 
          className={clsx(
            "fixed bottom-6 left-4 right-4 z-[101] flex flex-col outline-none",
            "bg-[#020617]/95 backdrop-blur-2xl border border-sky-500/30 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
            className
          )}
          style={{ maxHeight: `calc(${maxHeight} - 2rem)` }}
        >
          {/* Handle */}
          {showHandle && (
            <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-800/80" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-6 pt-4 pb-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {title && (
                    <Drawer.Title className="text-xl uppercase tracking-[0.15em] text-sky-400 font-black text-shadow-[0_0_15px_rgba(14,165,233,0.4)] truncate">
                      {title}
                    </Drawer.Title>
                  )}
                  {description && (
                    <Drawer.Description className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mt-2 leading-relaxed">
                      {description}
                    </Drawer.Description>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900/60 border border-sky-500/20 flex items-center justify-center text-slate-500 active:text-sky-400 active:border-sky-500/50 active:scale-90 transition-all"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="px-6 pb-8">
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
