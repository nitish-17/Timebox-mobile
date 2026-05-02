import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  ListPlus,
  FileDown,
  X,
  Wrench,
  Repeat,
  Zap,
  Inbox,
  List,
  NotebookPen,
  Hash,
} from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import type { NoteType, SystemNote } from "../../types";

interface NotesProps {
  date: string;
  notes: Record<string, Record<string, string>>;
  updateNote: (type: NoteType, date: string, content: string) => void;
  addTasksBulk: (titles: string[], list: "today" | "later") => void;
  addMessage: (
    type: "QUEST_CLEARED",
    title: string,
    description: string,
  ) => void;
  getNotesInRange: (
    startDate: string,
    endDate: string,
    type?: NoteType,
  ) => Promise<SystemNote[]>;
}

const PERSISTENT_TYPES: NoteType[] = [
  "backlog",
  "habits",
  "maintenance",
  "recharge",
];
const TRANSIENT_TYPES: NoteType[] = ["observation", "tracking", "other"];

const NOTE_TYPE_ICONS: Record<NoteType, React.ReactNode> = {
  backlog: <Inbox size={16} />,
  habits: <Repeat size={16} />,
  maintenance: <Wrench size={16} />,
  recharge: <Zap size={16} />,
  observation: <NotebookPen size={16} />,
  tracking: <List size={16} />,
  other: <Hash size={16} />,
};

export const Notes: React.FC<NotesProps> = ({
  date,
  notes,
  updateNote,
  addTasksBulk,
  addMessage,
  getNotesInRange,
}) => {
  const [activeType, setActiveType] = useState<NoteType>("observation");
  const [localNote, setLocalNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Export State
  const [exportStart, setExportStart] = useState(date);
  const [exportEnd, setExportEnd] = useState(date);
  const [exportTypes, setExportTypes] = useState<NoteType[]>([
    "observation",
    "tracking",
    "other",
  ]);

  // Sync export dates with selected date when menu opens
  useEffect(() => {
    if (isExportMenuOpen) {
      setExportStart(date);
      setExportEnd(date);
    }
  }, [isExportMenuOpen, date]);

  const getNoteContent = (type: NoteType, d: string) => {
    const typeNotes = notes[type] || {};
    const effectiveDate = PERSISTENT_TYPES.includes(type) ? "global" : d;
    return typeNotes[effectiveDate] || "";
  };

  const currentContent = getNoteContent(activeType, date);

  useEffect(() => {
    setLocalNote(currentContent);
  }, [activeType, date, currentContent]);

  const handleBlur = () => {
    if (localNote !== currentContent) {
      const effectiveDate = PERSISTENT_TYPES.includes(activeType)
        ? "global"
        : date;
      updateNote(activeType, effectiveDate, localNote);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      textareaRef.current?.blur();
      setIsExportMenuOpen(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvertToTasks = () => {
    if (!localNote.trim()) return;
    const lines = localNote
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => (line.startsWith("- ") ? line.substring(2) : line));

    if (lines.length > 0) {
      addTasksBulk(lines, "today");
      addMessage(
        "QUEST_CLEARED",
        "SYSTEM SYNCHRONIZED",
        `${lines.length} tasks extracted from log.`,
      );
    }
  };

  const toggleExportType = (type: NoteType) => {
    setExportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleExport = async () => {
    try {
      const allNotes = await getNotesInRange(exportStart, exportEnd);
      const filteredNotes = allNotes.filter((n) =>
        exportTypes.includes(n.type),
      );

      // Group by date
      const grouped: Record<string, SystemNote[]> = {};
      filteredNotes.forEach((n) => {
        if (!grouped[n.date]) grouped[n.date] = [];
        grouped[n.date].push(n);
      });

      // Generate Markdown
      let md = `# SYSTEM LOG EXPORT\n`;
      md += `Period: ${exportStart} to ${exportEnd}\n`;
      md += `Generated: ${new Date().toLocaleString()}\n\n`;
      md += `---\n\n`;

      const days = eachDayOfInterval({
        start: parseISO(exportStart),
        end: parseISO(exportEnd),
      });

      days.forEach((day) => {
        const dStr = format(day, "yyyy-MM-dd");
        const dayNotes = grouped[dStr];

        if (dayNotes && dayNotes.length > 0) {
          md += `## ${format(day, "EEEE, MMMM do, yyyy")}\n\n`;
          // Sort by TRANSIENT_TYPES order
          const sortedDayNotes = [...dayNotes].sort(
            (a, b) =>
              TRANSIENT_TYPES.indexOf(a.type) - TRANSIENT_TYPES.indexOf(b.type),
          );

          sortedDayNotes.forEach((n) => {
            md += `### ${n.type.toUpperCase()}\n`;
            md += `${n.content}\n\n`;
          });
          md += `---\n\n`;
        }
      });

      // Download
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timebox-logs-${exportStart}-to-${exportEnd}.md`;
      a.click();
      URL.revokeObjectURL(url);

      setIsExportMenuOpen(false);
      addMessage(
        "QUEST_CLEARED",
        "EXPORT COMPLETE",
        `Markdown log generated for ${days.length} days.`,
      );
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Check console for details.");
    }
  };

  return (
    <div className="notes-panel relative-container">
      <header className="notes-header">
        <div className="notes-header-content">
          {/* Note Type Group */}
          <div className="notes-type-icons">
            {PERSISTENT_TYPES.map((type) => (
              <button
                key={type}
                className={`note-type-btn persistent ${activeType === type ? "active" : ""}`}
                onClick={() => setActiveType(type)}
                title={type.toUpperCase()}
              >
                {NOTE_TYPE_ICONS[type]}
              </button>
            ))}
            <div className="type-separator" />
            {TRANSIENT_TYPES.map((type) => (
              <button
                key={type}
                className={`note-type-btn transient ${activeType === type ? "active" : ""}`}
                onClick={() => setActiveType(type)}
                title={type.toUpperCase()}
              >
                {NOTE_TYPE_ICONS[type]}
              </button>
            ))}
          </div>

          <div className="type-separator" />

          {/* Utility Group */}
          <div className="notes-utility-icons">
            <button
              className="note-type-btn"
              onClick={handleCopy}
              title="Copy to Clipboard"
              disabled={!localNote}
              style={{ opacity: localNote ? 1 : 0.3 }}
            >
              {copied ? (
                <Check size={18} color="#22c55e" />
              ) : (
                <Copy size={18} />
              )}
            </button>

            <button
              className={`note-type-btn ${isExportMenuOpen ? "active" : ""}`}
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              title="Export Logs"
            >
              <FileDown size={18} />
            </button>

            <button
              className="note-type-btn"
              onClick={handleConvertToTasks}
              title="Convert to Tasks"
              disabled={!localNote}
              style={{ opacity: localNote ? 1 : 0.3 }}
            >
              <ListPlus size={18} />
            </button>
          </div>
        </div>
      </header>

      {isExportMenuOpen && (
        <div className="export-menu glow-border">
          <div className="export-menu-header">
            <span>EXPORT SYSTEM LOGS</span>
            <button onClick={() => setIsExportMenuOpen(false)}>
              <X size={14} />
            </button>
          </div>

          <div className="export-menu-section">
            <label className="export-label">DATA TYPES</label>
            <div className="export-checkbox-group">
              {TRANSIENT_TYPES.map((type) => (
                <label key={type} className="export-checkbox-item">
                  <input
                    type="checkbox"
                    checked={exportTypes.includes(type)}
                    onChange={() => toggleExportType(type)}
                  />
                  <span>{type.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="export-menu-section">
            <label className="export-label">TEMPORAL RANGE</label>
            <div className="export-date-group">
              <div className="export-date-item">
                <span>START</span>
                <input
                  type="date"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value)}
                  className="export-date-input"
                />
              </div>
              <div className="export-date-item">
                <span>END</span>
                <input
                  type="date"
                  value={exportEnd}
                  onChange={(e) => setExportEnd(e.target.value)}
                  className="export-date-input"
                />
              </div>
            </div>
          </div>

          <button
            className="export-submit-btn"
            onClick={handleExport}
            disabled={exportTypes.length === 0}
          >
            GENERATE MARKDOWN
          </button>
        </div>
      )}

      <div className="notes-content">
        <textarea
          id="notes-textarea"
          ref={textareaRef}
          placeholder={
            PERSISTENT_TYPES.includes(activeType)
              ? `Name: ${activeType.toUpperCase()}\nDate Specific: False`
              : `Name: ${activeType.toUpperCase()}\nDate: ${date}`
          }
          value={localNote || ""}
          onChange={(e) => setLocalNote(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="notes-textarea"
        />
      </div>
    </div>
  );
};
