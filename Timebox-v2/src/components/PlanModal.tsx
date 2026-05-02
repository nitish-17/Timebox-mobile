import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Check } from "lucide-react";
import { parseTimeRanges } from "../hooks/usePlanningUtils";
import type { TimeRange } from "../hooks/usePlanningUtils";

interface PlanModalProps {
  onClose: () => void;
  onSuccess: (timeRanges: TimeRange[], taskIds: string[]) => void;
  unfinishedTasks: { id: string }[];
  unscheduledTasks: { id: string }[];
}

export const PlanModal: React.FC<PlanModalProps> = ({
  onClose,
  onSuccess,
  unfinishedTasks,
  unscheduledTasks,
}) => {
  const [scope, setScope] = useState<"unscheduled" | "all">(
    unscheduledTasks.length > 0 ? "unscheduled" : "all",
  );
  const targetTasks =
    scope === "unscheduled" ? unscheduledTasks : unfinishedTasks;
  const unfinishedTasksCount = targetTasks.length;

  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);
    now.setSeconds(0);
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });
  const [duration, setDuration] = useState(30);
  const [breakGap, setBreakGap] = useState(15);

  const [content, setContent] = useState("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea if we enter review mode
    if (isReviewMode) {
      textareaRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReviewMode, onClose]);

  const handleGenerate = () => {
    let currentTotalMinutes = 0;
    const [h, m] = startTime.split(":").map(Number);
    currentTotalMinutes = h * 60 + m;

    const lines: string[] = [];
    for (let i = 0; i < unfinishedTasksCount; i++) {
      const startH = Math.floor(currentTotalMinutes / 60);
      const startM = currentTotalMinutes % 60;

      const endTotalMinutes = currentTotalMinutes + duration;
      const endH = Math.floor(endTotalMinutes / 60);
      const endM = endTotalMinutes % 60;

      if (startH >= 24) break;

      const formatTime = (hh: number, mm: number) =>
        `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

      lines.push(`- ${formatTime(startH, startM)} ${formatTime(endH, endM)}`);

      currentTotalMinutes = endTotalMinutes + breakGap;
    }

    setContent(lines.join("\n"));
    setIsReviewMode(true);
  };

  const handleSchedule = () => {
    const timeRanges = parseTimeRanges(content);

    if (timeRanges.length > 0) {
      onSuccess(
        timeRanges,
        targetTasks.map((t) => t.id),
      );
      onClose();
    } else {
      alert('No valid time ranges found. Expected format: "- HH:mm HH:mm"');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReviewMode) {
      handleSchedule();
    } else {
      handleGenerate();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div className="title-group">
            <Calendar size={18} className="title-icon" />
            <h2 className="modal-title h-glow">
              {isReviewMode ? "Review Timeline" : "Auto-schedule"}
            </h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          {!isReviewMode ? (
            <div className="planning-params">
              <div className="scope-selector">
                <button
                  className={`scope-btn ${scope === "unscheduled" ? "active" : ""}`}
                  onClick={() => setScope("unscheduled")}
                >
                  Unscheduled ({unscheduledTasks.length})
                </button>
                <button
                  className={`scope-btn ${scope === "all" ? "active" : ""}`}
                  onClick={() => setScope("all")}
                >
                  All ({unfinishedTasks.length})
                </button>
              </div>
              <div className="param-grid">
                <div className="param-item">
                  <label className="section-label">Start Time:</label>
                  <input
                    type="time"
                    className="count-input time-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="param-item">
                  <label className="section-label">Duration (m):</label>
                  <input
                    type="number"
                    className="count-input"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="param-item">
                  <label className="section-label">Break (m):</label>
                  <input
                    type="number"
                    className="count-input"
                    value={breakGap}
                    onChange={(e) => setBreakGap(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="instruction-form">
              <label className="section-label">
                Calculated Timeline (Editable):
              </label>
              <textarea
                ref={textareaRef}
                className="instruction-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSchedule();
                  }
                }}
              />
            </div>
          )}

          <div className="modal-footer">
            <div className="kb-hint">
              {isReviewMode
                ? "Review and edit time slots"
                : "Press Enter to generate"}
            </div>
            <button
              onClick={handleSubmit}
              className={`send-btn ${isReviewMode ? "success" : ""}`}
              disabled={!isReviewMode && !startTime}
            >
              {isReviewMode ? <Check size={18} /> : <Calendar size={18} />}
              <span>
                {isReviewMode ? "Sync Timeline" : "Generate Schedule"}
              </span>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000000;
        }
        .modal-content {
          width: 90%;
          max-width: 600px;
          padding: 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid var(--border);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .title-icon {
          color: var(--accent);
        }
        .modal-title {
          font-family: var(--font-family);
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin: 0;
        }
        .h-glow {
          text-shadow: 0 0 15px var(--accent);
        }
        .close-btn {
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .close-btn:hover {
          color: var(--urgent);
          transform: rotate(90deg);
        }
        .section-label {
          display: block;
          font-family: var(--font-family);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          letter-spacing: 0.1em;
        }
        .planning-params {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
        }
        .scope-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 1.2rem;
        }
        .scope-btn {
          flex: 1;
          padding: 6px;
          font-size: 0.7rem;
          text-transform: uppercase;
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-secondary);
          background: rgba(15, 23, 42, 0.4);
          transition: all 0.2s;
        }
        .scope-btn.active {
          color: var(--reward);
          border-color: var(--reward);
          background: rgba(250, 204, 21, 0.1);
          box-shadow: 0 0 10px rgba(250, 204, 21, 0.1);
        }
        .param-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .param-item .section-label {
          margin-bottom: 0.5rem;
          font-size: 0.6rem;
        }
        .count-input {
          width: 100%;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 6px 10px;
          color: var(--accent);
          font-family: var(--font-family);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
        }
        .time-input {
          color-scheme: dark;
        }
        .count-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
        }
        .instruction-input {
          width: 100%;
          height: 200px;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1rem;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.9rem;
          line-height: 1.6;
          resize: none;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          outline: none;
        }
        .instruction-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.15);
        }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kb-hint {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .send-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid var(--accent);
          padding: 10px 24px;
          border-radius: 4px;
          color: var(--accent);
          font-family: var(--font-family);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .send-btn:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.2);
          box-shadow: 0 0 20px var(--accent);
        }
        .send-btn.success {
          border-color: var(--reward);
          color: var(--reward);
          background: rgba(34, 197, 94, 0.1);
        }
        .send-btn.success:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.2);
          box-shadow: 0 0 20px var(--reward);
        }
        .send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
