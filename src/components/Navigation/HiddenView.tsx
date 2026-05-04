import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Check,
  Zap,
  Database,
  Clock,
  Download,
  Upload,
  FileText,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { clsx } from 'clsx';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { exportDB, importDB } from "dexie-export-import";
import { db } from "../../db/db";
import type { NoteType, SystemNote } from '../../types';

type TabType = 'ui' | 'energy' | 'backup' | 'logs' | 'system';

interface HiddenViewProps {
}

export const HiddenView: React.FC<HiddenViewProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ui');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    uiSettings, updateUISettings,
    energyConfig, updateEnergyConfig,
    getNotesInRange, selectedDate
  } = useStore();

  // Scroll to right on mount to prioritize visibility of rightmost tabs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const tabs = [
    { id: 'ui', icon: <Type size={20} />, label: 'UI Scale' },
    { id: 'energy', icon: <Zap size={20} />, label: 'Energy' },
    { id: 'backup', icon: <Database size={20} />, label: 'Backups' },
    { id: 'logs', icon: <FileText size={20} />, label: 'Logs' },
    { id: 'system', icon: <ShieldAlert size={20} />, label: 'System' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'ui':
        return (
          <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section>
              <div className="flex justify-between items-center mb-6">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Terminal Scale</label>
                <span className="text-sm font-mono text-sky-400 font-bold">{Math.round(uiSettings.fontScale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.8" 
                max="1.5" 
                step="0.05"
                value={uiSettings.fontScale}
                onChange={(e) => updateUISettings({ fontScale: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500" 
              />
              <div className="flex justify-between mt-4 text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">
                <span>Compact</span>
                <span className="text-slate-500">Standard</span>
                <span>Enhanced</span>
              </div>
            </section>

            <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 text-center">
              <span className="text-[10px] text-sky-500/60 uppercase tracking-widest leading-relaxed">
                Scaling applies to all neural interfaces including tasks, notes and timeline views.
              </span>
            </div>
          </div>
        );
      case 'energy':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Biological Clock Configuration</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-600 font-black flex items-center gap-1.5">
                    <Clock size={10} className="text-sky-500" /> Peak Energy
                  </label>
                  <input 
                    type="time" 
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    value={energyConfig.startTime}
                    onChange={(e) => updateEnergyConfig({ startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50 transition-all color-scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-600 font-black flex items-center gap-1.5">
                    <Clock size={10} className="text-amber-500" /> Minimum Energy
                  </label>
                  <input 
                    type="time" 
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    value={energyConfig.endTime}
                    onChange={(e) => updateEnergyConfig({ endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50 transition-all color-scheme-dark"
                  />
                </div>
              </div>
            </section>

            <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
              <p className="text-[10px] text-sky-500/60 uppercase tracking-widest leading-relaxed text-center">
                Configure your peak performance window. The energy bar will decay from 100% at Peak to 0% at Minimum.
              </p>
            </div>
          </div>
        );
      case 'backup':
        return <BackupContent />;
      case 'logs':
        return <LogsContent getNotesInRange={getNotesInRange} initialDate={selectedDate} />;
      case 'system':
        return <SystemContent />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-2xl">
      {/* Scrollable Tabs */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto px-4 py-4 gap-3 no-scrollbar border-b border-sky-500/10 scroll-smooth"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={clsx(
              "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300",
              activeTab === tab.id 
                ? "bg-sky-500/15 border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                : "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-400"
            )}
          >
            {tab.icon}
            <span className="text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-10 min-h-[300px]">
        {renderContent()}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const SystemContent: React.FC = () => {
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handlePurge = async () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      return;
    }

    try {
      await db.delete();
      window.location.reload();
    } catch (error) {
      console.error("System purge failed:", error);
      alert("Purge failed. Check console for details.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block text-red-500/80">Danger Zone: System Override</label>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handlePurge}
            className={clsx(
              "flex items-center justify-between p-6 rounded-2xl border transition-all group",
              confirmPurge 
                ? "bg-red-500/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
                : "bg-slate-900/50 border-red-500/10 hover:border-red-500/30"
            )}
          >
            <div className="flex flex-col items-start gap-1">
              <span className={clsx(
                "text-xs uppercase font-black tracking-widest transition-colors",
                confirmPurge ? "text-red-400" : "text-red-500/60"
              )}>
                {confirmPurge ? "Confirm Data Purge" : "Purge Database"}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-500">
                {confirmPurge ? "Tap again to execute protocol" : "Erase all neural records and reset core"}
              </span>
            </div>
            <Trash2 size={24} className={confirmPurge ? "text-red-400 animate-pulse" : "text-red-500/40"} />
          </button>

          {confirmPurge && (
            <button 
              onClick={() => setConfirmPurge(false)}
              className="py-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
            >
              Abort Protocol
            </button>
          )}
        </div>
      </section>

      <div className={clsx(
        "p-4 rounded-2xl transition-colors duration-500",
        confirmPurge ? "bg-red-500/10 border border-red-500/20" : "bg-slate-900/50 border border-slate-800"
      )}>
        <p className={clsx(
          "text-[9px] uppercase tracking-widest leading-relaxed text-center font-bold",
          confirmPurge ? "text-red-400" : "text-slate-600"
        )}>
          {confirmPurge 
            ? "CRITICAL: THIS ACTION IS IRREVERSIBLE. ALL TASKS, NOTES, AND CONFIGURATIONS WILL BE PERMANENTLY DELETED." 
            : "Database purge erases the local Dexie instance. This is useful for clearing corrupt data or starting fresh without affecting browser cookies or other site data."}
        </p>
      </div>
    </div>
  );
};

const BackupContent: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportDB(db);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timebox-core-sync-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Neural export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        await db.delete();
        await importDB(file);
        window.location.reload();
      } catch (error) {
        console.error("Neural synchronization failed:", error);
        window.location.reload();
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Neural Data Management</label>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-between p-6 rounded-2xl bg-slate-900/50 border border-sky-500/10 active:scale-95 transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs uppercase font-black tracking-widest text-sky-400 group-active:text-sky-300">Export Core</span>
              <span className="text-[9px] uppercase font-bold text-slate-500">Backup entire system state to JSON</span>
            </div>
            <Upload size={24} className="text-sky-500/60" />
          </button>

          <button 
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center justify-between p-6 rounded-2xl bg-slate-900/50 border border-emerald-500/10 active:scale-95 transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400 group-active:text-emerald-300">Synchronize Core</span>
              <span className="text-[9px] uppercase font-bold text-slate-500">Restore system from JSON backup</span>
            </div>
            <Download size={24} className="text-emerald-500/60" />
          </button>
        </div>
      </section>

      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
        <p className="text-[9px] text-amber-500/60 uppercase tracking-widest leading-relaxed text-center font-bold">
          Warning: Synchronization will overwrite all current neural data. Ensure your backup is valid.
        </p>
      </div>
    </div>
  );
};

const LogsContent: React.FC<{ getNotesInRange: any, initialDate: string }> = ({ getNotesInRange, initialDate }) => {
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [exportTypes, setExportTypes] = useState<NoteType[]>(['observation', 'tracking', 'other']);
  const [isGenerating, setIsExporting] = useState(false);

  const toggleType = (type: NoteType) => {
    setExportTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allNotes = await getNotesInRange(startDate, endDate);
      const filteredNotes = allNotes.filter((n: SystemNote) => exportTypes.includes(n.type));

      const grouped: Record<string, SystemNote[]> = {};
      filteredNotes.forEach((n: SystemNote) => {
        if (!grouped[n.date]) grouped[n.date] = [];
        grouped[n.date].push(n);
      });

      let md = `# SYSTEM LOG EXPORT\n`;
      md += `Temporal Range: ${startDate} to ${endDate}\n`;
      md += `Extraction Timestamp: ${new Date().toLocaleString()}\n\n`;
      md += `---\n\n`;

      const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      });

      const typesOrder: NoteType[] = ['observation', 'tracking', 'other'];

      days.forEach((day) => {
        const dStr = format(day, "yyyy-MM-dd");
        const dayNotes = grouped[dStr];

        if (dayNotes && dayNotes.length > 0) {
          md += `## LOG: ${format(day, "EEEE, MMMM do, yyyy")}\n\n`;
          const sortedDayNotes = [...dayNotes].sort(
            (a, b) => typesOrder.indexOf(a.type) - typesOrder.indexOf(b.type)
          );

          sortedDayNotes.forEach((n) => {
            md += `### [${n.type.toUpperCase()}]\n`;
            md += `${n.content}\n\n`;
          });
          md += `---\n\n`;
        }
      });

      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neural-logs-${startDate}-to-${endDate}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Log extraction failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Log Extraction Filters</label>
        
        <div className="space-y-3">
          {['observation', 'tracking', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type as NoteType)}
              className={clsx(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                exportTypes.includes(type as NoteType)
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                  : "bg-slate-900/50 border-slate-800 text-slate-500"
              )}
            >
              <span className="text-[10px] uppercase font-black tracking-widest">{type}</span>
              {exportTypes.includes(type as NoteType) ? <Check size={16} /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Temporal Range</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[8px] uppercase font-bold text-slate-600 ml-1">Initiation</span>
            <input 
              type="date" 
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] text-slate-200 outline-none focus:border-sky-500/50 transition-all color-scheme-dark"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[8px] uppercase font-bold text-slate-600 ml-1">Termination</span>
            <input 
              type="date" 
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] text-slate-200 outline-none focus:border-sky-500/50 transition-all color-scheme-dark"
            />
          </div>
        </div>
      </section>

      <button 
        onClick={handleExport}
        disabled={isGenerating || exportTypes.length === 0}
        className="w-full py-4 rounded-2xl bg-sky-500 text-[#020617] text-xs uppercase font-black tracking-[0.2em] shadow-[0_0_20px_rgba(14,165,233,0.3)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
      >
        {isGenerating ? 'Synthesizing...' : 'Generate Markdown Log'}
      </button>
    </div>
  );
};
