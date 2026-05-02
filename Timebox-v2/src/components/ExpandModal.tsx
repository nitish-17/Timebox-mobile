import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Check } from 'lucide-react';
import { useAI } from "../hooks/useAI";

interface ExpandModalProps {
  onClose: () => void;
  onSuccess: (tasks: string[]) => void;
}

export const ExpandModal: React.FC<ExpandModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { fetchTaskExpansionText } = useAI();
  const [taskCount, setTaskCount] = useState(5);

  const getTemplate = (
    count: number,
  ) => `### Universal Task Deconstruction Instructions
1. **Objective**: Analyze the provided input (which may be an idea, goal, milestone, complex task, or event) and deconstruct it into exactly ${count} sequential, actionable tasks.
2. **Context Adaptation**:
   - If a **Goal/Idea**: Provide the first ${count} steps to move from concept to reality.
   - If an **Event**: Provide ${count} logistical tasks required to execute it.
   - If a **Complex Task**: Break it into ${count} smaller, manageable sub-tasks.
   - If a **Milestone**: List ${count} requirements to achieve it.
3. **Actionability Rule**: Every line must start with a strong action verb and represent a completion-oriented "To-Do" item.
4. **Formatting Rules (Strict)**:
   - Output ONLY the tasks.
   - Format: - [Task Description]
   - No introductory text, no "Here are your steps," and no summary.
   - Exactly ${count} lines total.

### Input to Expand:
- `;

  const [content, setContent] = useState(() => getTemplate(5));
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea on mount
    setTimeout(() => textareaRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCountChange = (newCount: number) => {
    setTaskCount(newCount);
    if (!isReviewMode) {
      setContent(getTemplate(newCount));
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const result = await fetchTaskExpansionText(content);
      setContent(result);
      setIsReviewMode(true);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } catch (error) {
      alert(
        "Failed to generate tasks. Make sure LM Studio is running at localhost:1234",
      );
    }
 finally {
      setIsLoading(false);
    }
  };

  const handleCreateTasks = () => {
    const tasks = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter((line) => line.length > 0);

    if (tasks.length > 0) {
      onSuccess(tasks);
      onClose();
    } else {
      alert('No valid tasks found. Each task must start with "- "');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReviewMode) {
      handleCreateTasks();
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
            <Sparkles size={18} className="title-icon" />
            <h2 className="modal-title h-glow">
              {isReviewMode ? "Review Quests" : "Generate Tasks"}
            </h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          {!isReviewMode && (
            <div className="count-selector">
              <label className="section-label">Number of Tasks:</label>
              <input
                type="number"
                className="count-input"
                value={taskCount}
                onChange={(e) =>
                  handleCountChange(parseInt(e.target.value) || 1)
                }
                min="1"
                max="20"
              />
            </div>
          )}
          <form onSubmit={handleSubmit} className="instruction-form">
            <label className="section-label">
              {isReviewMode
                ? "Tactical Actions (Editable):"
                : "Mission Instructions & Plans:"}
            </label>
            <textarea
              ref={textareaRef}
              className="instruction-input"
              placeholder={
                isReviewMode
                  ? ""
                  : "Type your goals, appointments, or instructions here..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />

            <div className="modal-footer">
              <div className="kb-hint">
                {isReviewMode
                  ? "Review and edit bullet points"
                  : "Press ⌘+Enter to expand"}
              </div>
              <button
                type="submit"
                className={`send-btn ${isLoading ? "loading" : ""} ${isReviewMode ? "success" : ""}`}
                disabled={isLoading || !content.trim()}
              >
                {isReviewMode ? <Check size={18} /> : <Sparkles size={18} />}
                <span>
                  {isLoading
                    ? "Processing..."
                    : isReviewMode
                      ? "Create Tasks"
                      : "Generate Tasks"}
                </span>
              </button>
            </div>
          </form>
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
        .count-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .count-selector .section-label {
          margin-bottom: 0;
        }
        .count-input {
          width: 60px;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 4px 8px;
          color: var(--accent);
          font-family: var(--font-family);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
        }
        .count-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
        }
        .instruction-input {
          width: 100%;
          height: 250px;
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
