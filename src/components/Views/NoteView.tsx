import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../../hooks/useStore';
import { 
  Inbox, 
  Repeat, 
  Wrench, 
  Zap, 
  NotebookPen, 
  List, 
  Hash,
  Clipboard,
  Check,
  ListPlus
} from 'lucide-react';
import type { NoteType, SystemMessage } from '../../types';
import { clsx } from 'clsx';
import { ViewHeader } from '../Navigation/ViewHeader';

const PERSISTENT_TYPES: NoteType[] = ["backlog", "habits", "maintenance", "recharge"];
const TRANSIENT_TYPES: NoteType[] = ["observation", "tracking", "other"];

const NOTE_TYPE_ICONS: Record<NoteType, React.ReactNode> = {
  backlog: <Inbox size={20} />,
  habits: <Repeat size={20} />,
  maintenance: <Wrench size={20} />,
  recharge: <Zap size={20} />,
  observation: <NotebookPen size={20} />,
  tracking: <List size={20} />,
  other: <Hash size={20} />,
};

interface NoteViewProps {
  addMessage: (type: SystemMessage['type'], title: string, description: string) => void;
}

export const NoteView: React.FC<NoteViewProps> = ({ addMessage }) => {
  const { notes, selectedDate, updateNote, addTasksBulk } = useStore();
  const [activeType, setActiveType] = useState<NoteType>("observation");
  const [localNote, setLocalNote] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentContent = useMemo(() => {
    const typeNotes = notes[activeType] || {};
    const effectiveDate = PERSISTENT_TYPES.includes(activeType) ? "global" : selectedDate;
    return typeNotes[effectiveDate] || "";
  }, [notes, activeType, selectedDate]);

  useEffect(() => {
    setLocalNote(currentContent);
  }, [currentContent, selectedDate, activeType]);

  const handleBlur = () => {
    if (localNote !== currentContent) {
      const effectiveDate = PERSISTENT_TYPES.includes(activeType) ? "global" : selectedDate;
      updateNote(activeType, effectiveDate, localNote);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localNote);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConvertToTasks = useCallback(() => {
    if (!localNote.trim()) return;
    
    const lines = localNote
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^-\s*/, "").replace(/^-/, "").trim())
      .filter((line) => line.length > 0);

    if (lines.length > 0) {
      addTasksBulk(lines, "later");
      addMessage(
        "QUEST_CLEARED",
        "SYSTEM SYNCHRONIZED",
        `${lines.length} tasks extracted from log to Later list.`
      );
    }
  }, [localNote, addTasksBulk, addMessage]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#020617]">
      <ViewHeader />

      <header className="flex items-center bg-slate-900/40 backdrop-blur-md border-b border-sky-500/20 px-4 py-3">
        {/* Category Switcher - Horizontal Scrollable on Mobile */}
        <div className="flex-1 flex overflow-x-auto gap-2 no-scrollbar pr-2 border-r border-sky-500/10">
          {PERSISTENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={clsx(
                "flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-all",
                activeType === type ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.1)]" : "bg-slate-900/50 border-slate-800 text-slate-500"
              )}
            >
              {NOTE_TYPE_ICONS[type]}
              <span className="text-[6px] uppercase mt-0.5 tracking-tighter opacity-80">{type}</span>
            </button>
          ))}
          <div className="w-[1px] h-8 bg-sky-500/10 my-auto mx-1 flex-shrink-0" />
          {TRANSIENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={clsx(
                "flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-all",
                activeType === type ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.1)]" : "bg-slate-900/50 border-slate-800 text-slate-500"
              )}
            >
              {NOTE_TYPE_ICONS[type]}
              <span className="text-[6px] uppercase mt-0.5 tracking-tighter opacity-80">{type}</span>
            </button>
          ))}
        </div>

        {/* Utility Actions - Cleaner icons with spacing */}
        <div className="flex items-center gap-4 pl-4 flex-shrink-0">
          <button 
            onClick={handleConvertToTasks}
            disabled={!localNote.trim()}
            className={clsx(
              "p-1 transition-all active:scale-75",
              !localNote.trim() ? "text-slate-800 opacity-40 cursor-not-allowed" : "text-sky-400/70 active:text-sky-400"
            )}
            title="Convert to Later list"
          >
            <ListPlus size={22} />
          </button>
          <button 
            onClick={handleCopy}
            className={clsx(
              "p-1 transition-all active:scale-75",
              isCopied ? "text-emerald-400" : "text-sky-400/70 active:text-sky-400"
            )}
            title="Copy notes"
          >
            {isCopied ? <Check size={22} /> : <Clipboard size={22} />}
          </button>
        </div>
      </header>

      <div className="px-6 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.4em] font-black text-sky-500/40">{activeType} interface</span>
      </div>

      <div className="flex-1 p-6 pt-2">
        <textarea
          id="note-textarea"
          name="note-textarea"
          ref={textareaRef}
          className="w-full h-full bg-transparent resize-none text-slate-300 text-lg leading-relaxed placeholder:text-slate-800 focus:outline-none"
          placeholder={`Initialize ${activeType.toUpperCase()} stream...`}
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
