import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Terminal, Zap, Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useStore } from '../../hooks/useStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { fetchTaskExpansion, fetchRawAIResponse } = useAI();
  const { addTasksBulk } = useStore();

  const handleAction = async (type: 'GENERATE' | 'BREAKDOWN' | 'ASK') => {
    if (!query.trim()) return;
    setIsProcessing(true);
    
    try {
      if (type === 'GENERATE') {
        const prompt = `Deconstruct the following goal into a sequence of small, actionable tasks (maximum 8). Format each as a bullet point starting with "- ". Goal: ${query}`;
        const tasks = await fetchTaskExpansion(prompt);
        if (tasks.length > 0) {
          await addTasksBulk(tasks, 'today');
          onClose();
        }
      } else if (type === 'ASK') {
        const response = await fetchRawAIResponse(query);
        alert(response); // Basic for now, could be a result sheet
      }
    } catch (e) {
      console.error(e);
      alert("AI Neural Link Failed. Check Config.");
    } finally {
      setIsProcessing(false);
      setQuery('');
    }
  };

  const commands = [
    { type: 'GENERATE', icon: <Sparkles size={18} />, label: 'Generate Tasks', description: 'Deconstruct goals using AI', shortcut: 'G' },
    { type: 'BREAKDOWN', icon: <Zap size={18} />, label: 'Breakdown Task', description: 'Plan the first 15 minutes', shortcut: 'B' },
    { type: 'ASK', icon: <Terminal size={18} />, label: 'Ask AI', description: 'General brainstomer', shortcut: 'A' },
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
            {isProcessing ? <Loader2 className="text-sky-400 animate-spin" size={24} /> : <Search className="text-sky-400" size={24} />}
            <input
              id="command-input"
              name="command-input"
              autoFocus
              type="text"
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={isProcessing ? "Processing neural link..." : "Execute command..."}
              className="flex-1 bg-transparent text-lg holographic-text placeholder:text-slate-600 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isProcessing}
            />
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-sky-400">
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-4 px-2">Available Actions</div>
            
            {commands.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleAction(cmd.type as any)}
                disabled={isProcessing || !query.trim()}
                className="w-full p-4 flex items-center gap-4 rounded-xl bg-slate-900/40 border border-sky-500/10 active:bg-sky-500/10 active:border-sky-500/30 transition-all text-left group disabled:opacity-30"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-active:scale-90 transition-transform">
                  {cmd.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200 uppercase tracking-wider">{cmd.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{cmd.description}</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-500">
                  {cmd.shortcut}
                </div>
              </button>
            ))}
          </div>

          <footer className="p-4 border-t border-sky-500/10 text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Timebox-v3 Neural Link</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
