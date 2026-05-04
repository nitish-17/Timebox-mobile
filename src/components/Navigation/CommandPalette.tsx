import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = React.useState('');

  const commands: any[] = [
    // Future system commands can be added here
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[200] bg-[#020617] flex flex-col"
        >
          <header className="p-4 border-b border-sky-500/30 flex items-center gap-4">
            <Search className="text-sky-400" size={24} />
            <input
              id="command-input"
              name="command-input"
              autoFocus
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Execute command..."
              className="flex-1 bg-transparent text-lg holographic-text placeholder:text-slate-600 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-sky-400">
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-4 px-2">Available Actions</div>
            
            {commands.length > 0 ? commands.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => {}}
                className="w-full p-4 flex items-center gap-4 rounded-[4px] bg-slate-900/40 border border-sky-500/10 active:bg-sky-500/15 active:border-sky-500/40 transition-all text-left group active:shadow-[0_0_15px_rgba(14,165,233,0.2)]"
              >
                <div className="w-10 h-10 rounded-[4px] bg-sky-500/10 flex items-center justify-center text-sky-400 group-active:scale-90 transition-transform">
                  {cmd.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200 uppercase tracking-wider group-active:text-shadow-[0_0_8px_#0ba5e9]">{cmd.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{cmd.description}</div>
                </div>
              </button>
            )) : (
              <div className="py-20 text-center text-slate-700 uppercase tracking-[0.3em] font-bold text-sm">
                No active modules
              </div>
            )}
          </div>

          <footer className="p-4 border-t border-sky-500/10 text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Timebox System Link</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
