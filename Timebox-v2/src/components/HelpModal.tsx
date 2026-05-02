import React from "react";
import {
  X,
  Keyboard,
  Command,
  Settings,
  FileText,
  CheckSquare,
  ListTodo,
  XCircle,
} from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const shortcuts = [
    {
      key: ".",
      description: "Show Status / Import & Export",
      icon: <Keyboard size={16} />,
    },
    {
      key: ",",
      description: "Configure AI settings",
      icon: <Settings size={16} />,
    },
    {
      key: "/",
      description: "Generate / Breakdown / Ask AI",
      icon: <Command size={16} />,
    },
    {
      key: "T",
      description: "Focus Today's Task input",
      icon: <CheckSquare size={16} />,
    },
    {
      key: "L",
      description: "Focus Later Task input",
      icon: <ListTodo size={16} />,
    },
    {
      key: "N",
      description: "Focus Notes input",
      icon: <FileText size={16} />,
    },
    {
      key: "Esc",
      description: "Exit input focus or close",
      icon: <XCircle size={16} />,
    },
  ];

  return (
    <div className="modal-overlay">
      <div
        className="glass-panel glow-border"
        style={{
          width: "400px",
          padding: "2rem",
          position: "relative",
          background: "rgba(2, 6, 23, 0.9)",
        }}
      >
        <button
          onClick={onClose}
          className="action-btn"
          style={{ position: "absolute", top: "1rem", right: "1rem" }}
        >
          <X size={20} />
        </button>

        <h2
          className="holographic-text"
          style={{
            margin: "0 0 1.5rem 0",
            fontSize: "1.2rem",
            textAlign: "center",
            letterSpacing: "0.1em",
          }}
        >
          SYSTEM MANUAL
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                {shortcut.icon}
                <span style={{ fontSize: "0.85rem" }}>
                  {shortcut.description}
                </span>
              </div>
              <kbd
                style={{
                  background: "rgba(14, 165, 233, 0.1)",
                  color: "var(--accent)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  border: "1px solid var(--border)",
                  boxShadow: "0 0 5px rgba(14, 165, 233, 0.2)",
                }}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
