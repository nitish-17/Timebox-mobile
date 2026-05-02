import React, { useState, useEffect, useRef } from 'react';
import { 
  FloatingPortal,
} from '@floating-ui/react';
import { Sparkles, FileText, ArrowRight, Calendar } from 'lucide-react';
import type { Task } from '../types';

type PaletteStage = 'COMMANDS' | 'SELECT_TASK';
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: string, data?: any) => void;
  tasks?: Task[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  tasks = [],
}) => {
  const [stage, setStage] = useState<PaletteStage>('COMMANDS');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'expand', label: 'Generate Tasks (AI)', icon: <Sparkles size={14} /> },
    { id: 'brief', label: 'Breakdown Task (AI)', icon: <FileText size={14} /> },
    { id: 'ask', label: 'Ask AI (AI)', icon: <Sparkles size={14} /> },
    { id: 'plan', label: 'Auto-schedule', icon: <Calendar size={14} /> }
  ];

  const filteredTasks = tasks
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const items = stage === 'COMMANDS' ? commands : filteredTasks;

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      if (inputRef.current) {
        const val = inputRef.current.value;
        inputRef.current.value = '';
        inputRef.current.value = val;
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [stage, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setStage('COMMANDS');
      setSearchQuery('');
      setSelectedIndex(0);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleAction = async () => {
    if (stage === 'COMMANDS') {
      const cmd = commands[selectedIndex];
      if (cmd.id === 'brief') {
        setStage('SELECT_TASK');
        setSearchQuery('');
        setSelectedIndex(0);
      } else if (cmd.id === 'expand') {
        onSelect('expand');
      } else if (cmd.id === 'plan') {
        onSelect('plan');
      } else {
        onSelect(cmd.id);
      }
    } else if (stage === 'SELECT_TASK') {
      const task = filteredTasks[selectedIndex];
      if (task) {
        onSelect('brief', { task });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isLoading) return;

      if (e.key === 'ArrowDown' && (stage === 'COMMANDS' || stage === 'SELECT_TASK')) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
      } else if (e.key === 'ArrowUp' && (stage === 'COMMANDS' || stage === 'SELECT_TASK')) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (items.length || 1)) % (items.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAction();
      } else if (e.key === 'Escape') {
        if (stage === 'SELECT_TASK') {
          setStage('COMMANDS');
          setSelectedIndex(0);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedIndex, items, stage, isLoading]);

  if (!isOpen) return null;

  return (
    <FloatingPortal>
      <div className="command-palette-overlay" onClick={onClose}>
        <div
          className="command-palette glass-panel glow-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="command-palette-search">
            <input 
              ref={inputRef}
              type="text" 
              placeholder={stage === 'COMMANDS' ? "Search system commands..." : "Select task to breakdown..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
            />
          </div>
          <div className="command-list scrollable-palette">
            {items.length > 0 ? items.map((item: any, index) => (
              <button
                key={item.id}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedIndex(index);
                  handleAction();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {stage === 'COMMANDS' ? item.icon : <div className="task-dot" style={{background: item.color}} />}
                <span className="truncate">{stage === 'COMMANDS' ? item.label : item.title}</span>
                {stage === 'COMMANDS' && item.id !== 'expand' && item.id !== 'plan' && <ArrowRight size={12} className="ml-auto opacity-50" />}
              </button>
            )) : (
              <div className="no-results">No matches found.</div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .command-palette-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000000;
          display: flex; justify-content: center; padding-top: 15vh;
          background: rgba(2, 6, 23, 0.4); backdrop-filter: blur(2px);
        }
        .command-palette {
          width: 90%; max-width: 500px; height: fit-content; max-height: 500px;
          border-radius: 8px; box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          background: rgba(15, 23, 42, 0.98); overflow: hidden; border: 1px solid var(--border);
          display: flex; flex-direction: column;
        }
        .command-palette-search { padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .command-palette-search input {
          width: 100%; font-family: var(--font-family); color: var(--accent);
          font-size: 1rem; letter-spacing: 0.05em; background: transparent; border: none; outline: none;
        }
        .scrollable-palette { overflow-y: auto; padding: 8px; }
        .command-item {
          width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 16px;
          border-radius: 4px; text-align: left; font-family: var(--font-family); font-size: 0.9rem;
          color: var(--text-primary); transition: all 0.1s ease; background: transparent; border: 1px solid transparent;
        }
        .command-item.selected { background: rgba(14, 165, 233, 0.2); text-shadow: 0 0 8px var(--accent); border-color: var(--border); }
        .command-item span { letter-spacing: 0.05em; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .task-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .no-results { padding: 20px; text-align: center; color: var(--text-secondary); font-family: var(--font-family); font-size: 0.8rem; text-transform: uppercase; }
        .instruction-stage, .planning-stage { padding: 16px; overflow-y: auto; }
        .stage-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .stage-header h3 { font-family: var(--font-family); font-size: 1rem; letter-spacing: 0.2em; color: var(--reward); }
        .planning-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .planning-field label { display: block; font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.1em; }
        .planning-field.full { grid-column: span 2; }
        .system-slider { width: 100%; accent-color: var(--reward); }
        .system-time-input { width: 100%; background: rgba(2, 6, 23, 0.5); border: 1px solid var(--border); border-radius: 4px; padding: 8px; color: var(--text-primary); font-family: var(--font-family); color-scheme: dark; }
        .task-preview { margin-bottom: 12px; font-family: var(--font-family); font-size: 0.8rem; display: flex; gap: 8px; }
        .task-preview .label { color: var(--text-secondary); text-transform: uppercase; }
        .task-preview .task-name { color: var(--accent); font-weight: bold; }
        .palette-textarea {
          width: 100%; height: 80px; background: rgba(2, 6, 23, 0.5); border: 1px solid var(--border);
          border-radius: 4px; padding: 12px; color: var(--text-primary); font-family: var(--font-family);
          font-size: 0.9rem; resize: none; outline: none;
        }
        .palette-textarea:focus { border-color: var(--accent); }
        .palette-footer { text-align: center; }
        .action-btn-large {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(14, 165, 233, 0.1); border: 1px solid var(--accent); padding: 12px;
          border-radius: 4px; color: var(--accent); font-family: var(--font-family);
          text-transform: uppercase; letter-spacing: 0.2em; transition: all 0.3s ease;
        }
        .action-btn-large:hover:not(:disabled) { background: rgba(14, 165, 233, 0.2); box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); }
        .action-btn-large:disabled { opacity: 0.3; cursor: not-allowed; }
        .kb-hint { font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .mt-4 { margin-top: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .instruction-stage.no-scroll { overflow-y: hidden; }
        .expand-section { margin-bottom: 12px; }
        .section-label { display: block; font-size: 0.65rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px; letter-spacing: 0.1em; }
        .payload-preview.large {
          max-height: 180px; overflow-y: auto; background: rgba(14, 165, 233, 0.05);
          border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 4px; padding: 10px;
          font-size: 0.7rem; color: var(--accent); white-space: pre-wrap;
          opacity: 0.9; font-family: var(--font-family); line-height: 1.4;
        }
        .empty-hint { font-style: italic; opacity: 0.5; }
        .ml-auto { margin-left: auto; }
        .opacity-50 { opacity: 0.5; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </FloatingPortal>
  );
};
