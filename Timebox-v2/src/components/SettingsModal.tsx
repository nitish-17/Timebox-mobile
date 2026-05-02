import React, { useState, useEffect } from "react";
import { X, Settings, Cpu, Globe, Database, Save, Check } from "lucide-react";
import { useStore } from "../hooks/useStore";
import type { AIProvider, AISettings } from "../types";

interface SettingsModalProps {
  onClose: () => void;
}

const PROVIDER_DEFAULTS: Record<
  AIProvider,
  { baseUrl: string; model: string }
> = {
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "gemma4:e4b",
  },
  lmstudio: {
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
  },
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { aiSettings, updateAISettings } = useStore();
  const [localSettings, setLocalSettings] = useState<AISettings>(aiSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleProviderChange = (provider: AIProvider) => {
    setLocalSettings({
      ...localSettings,
      provider,
      ...PROVIDER_DEFAULTS[provider],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAISettings(localSettings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div className="title-group">
            <Settings size={18} className="title-icon" />
            <h2 className="modal-title h-glow">System Settings</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSave} className="modal-body">
          <section className="settings-section">
            <label className="section-label">AI Intelligence Provider</label>
            <div className="provider-grid">
              {(["lmstudio", "ollama", "openai"] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`provider-card ${localSettings.provider === p ? "active" : ""}`}
                  onClick={() => handleProviderChange(p)}
                >
                  {p === "lmstudio" && <Cpu size={20} />}
                  {p === "ollama" && <Database size={20} />}
                  {p === "openai" && <Globe size={20} />}
                  <span className="provider-name">{p.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <div className="input-group">
              <label className="input-label">Base URL</label>
              <input
                type="text"
                className="settings-input"
                value={localSettings.baseUrl}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    baseUrl: e.target.value,
                  })
                }
                placeholder="http://localhost:11434/v1"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Model Name</label>
              <input
                type="text"
                className="settings-input"
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                placeholder="llama3"
              />
            </div>

            {localSettings.provider === "openai" && (
              <div className="input-group">
                <label className="input-label">API Key</label>
                <input
                  type="password"
                  className="settings-input"
                  value={localSettings.apiKey || ""}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      apiKey: e.target.value,
                    })
                  }
                  placeholder="sk-..."
                />
              </div>
            )}
          </section>

          <div className="modal-footer">
            <div className="kb-hint">Press ESC to cancel</div>
            <button
              type="submit"
              className={`save-btn ${isSaved ? "success" : ""}`}
              disabled={isSaved}
            >
              {isSaved ? <Check size={18} /> : <Save size={18} />}
              <span>{isSaved ? "Settings Saved" : "Save Configuration"}</span>
            </button>
          </div>
        </form>
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
          max-width: 500px;
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
        .settings-section {
          margin-bottom: 2rem;
        }
        .section-label {
          display: block;
          font-family: var(--font-family);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          letter-spacing: 0.1em;
        }
        .provider-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .provider-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .provider-card:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(14, 165, 233, 0.05);
        }
        .provider-card.active {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(14, 165, 233, 0.1);
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.1);
        }
        .provider-name {
          font-family: var(--font-family);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
        }
        .input-group {
          margin-bottom: 1.2rem;
        }
        .input-label {
          display: block;
          font-family: var(--font-family);
          font-size: 0.6rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
        .settings-input {
          width: 100%;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 8px 12px;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
        }
        .settings-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.1);
        }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }
        .kb-hint {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .save-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid var(--accent);
          padding: 8px 20px;
          border-radius: 4px;
          color: var(--accent);
          font-family: var(--font-family);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .save-btn:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.2);
          box-shadow: 0 0 20px var(--accent);
        }
        .save-btn.success {
          border-color: var(--reward);
          color: var(--reward);
          background: rgba(34, 197, 94, 0.1);
        }
        .save-btn:disabled {
          opacity: 0.8;
          cursor: default;
        }
      `}</style>
    </div>
  );
};
