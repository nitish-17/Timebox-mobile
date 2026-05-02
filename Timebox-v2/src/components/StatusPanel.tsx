import React, { useEffect, useState } from "react";
import { Download, Upload, Clock, Save, Check } from "lucide-react";
import { exportDB, importDB } from "dexie-export-import";
import { db } from "../db/db";
import { useStore } from "../hooks/useStore";
import { ActivityHeatmap } from "./heatmap/ActivityHeatmap";
import type { EnergyConfig, Task } from "../types";

interface StatusPanelProps {
  onClose: () => void;
  tasks: Task[];
}

const EnergyBar: React.FC<{ config: EnergyConfig }> = ({ config }) => {
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    const calculateEnergy = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = config.startTime.split(":").map(Number);
      const [endH, endM] = config.endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      // If end time is same or before start time, assume it's the next day
      if (endMinutes <= startMinutes) {
        endMinutes += 1440;
      }

      const totalDuration = endMinutes - startMinutes;

      const normalizedNow =
        currentMinutes < startMinutes ? currentMinutes + 1440 : currentMinutes;

      let elapsed = 0;
      if (normalizedNow >= startMinutes && normalizedNow <= endMinutes) {
        elapsed = normalizedNow - startMinutes;
      } else if (normalizedNow > endMinutes) {
        elapsed = totalDuration; // Stay at 0
      } else {
        elapsed = 0; // Stay at 100 (should not happen with this normalization)
      }

      const level = 100 - (elapsed / totalDuration) * 100;
      setEnergy(Math.max(0, Math.min(100, level)));
    };

    calculateEnergy();
    const interval = setInterval(calculateEnergy, 60000);
    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className="energy-bar-container">
      <div className="energy-bar-fill" style={{ width: `${energy}%` }} />
    </div>
  );
};

export const StatusPanel: React.FC<StatusPanelProps> = ({ onClose, tasks }) => {
  const { energyConfig, updateEnergyConfig } = useStore();
  const [localConfig, setLocalConfig] = useState<EnergyConfig>(energyConfig);
  const [isSaved, setIsSaved] = useState(false);

  // Sync local config when store config loads or changes
  useEffect(() => {
    setLocalConfig(energyConfig);
  }, [energyConfig]);

  const handleExport = async () => {
    try {
      const blob = await exportDB(db);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timebox-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await db.delete();
        await importDB(file);
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        window.location.reload();
      }
    };
    input.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEnergyConfig(localConfig);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel glow-border status-panel-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "2rem 2rem 0 2rem" }}
      >
        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/* Energy Section */}
          <section
            className="status-section"
            style={{ margin: 0, padding: "1rem 0 1.5rem 0" }}
          >
            <EnergyBar config={energyConfig} />
          </section>

          {/* Heatmap Section */}
          <section
            className="status-section"
            style={{ margin: "1.5rem 0 1rem 0" }}
          >
            <ActivityHeatmap tasks={tasks} />
          </section>

          {/* Data Actions Section */}
          <section className="status-section" style={{ margin: "1rem 0 0 0" }}>
            <div className="status-actions-minimal">
              <button
                className="minimal-icon-btn"
                onClick={handleExport}
                title="Export"
              >
                <Upload size={20} />
              </button>
              <button
                className="minimal-icon-btn"
                onClick={handleImportClick}
                title="Import"
              >
                <Download size={20} />
              </button>
            </div>
          </section>

          {/* Hidden Settings Section (Visible on Hover over this area) */}
          <div className="settings-ghost-wrapper">
            <form onSubmit={handleSave} className="hover-settings">
              <div className="time-fields">
                <div className="status-input-wrapper">
                  <input
                    type="time"
                    value={localConfig.startTime}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        startTime: e.target.value,
                      })
                    }
                    className="status-time-input"
                  />
                  <Clock size={14} className="input-icon-right" />
                </div>
                <div className="status-input-wrapper">
                  <input
                    type="time"
                    value={localConfig.endTime}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        endTime: e.target.value,
                      })
                    }
                    className="status-time-input"
                  />
                  <Clock size={14} className="input-icon-right" />
                </div>
                <button
                  type="submit"
                  className={`minimal-icon-btn ${isSaved ? "success" : ""}`}
                >
                  {isSaved ? <Check size={18} /> : <Save size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        .status-panel-content {
          max-width: 420px;
          width: 95%;
          background: rgba(2, 6, 23, 0.9);
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        }
        .settings-ghost-wrapper {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hover-settings {
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          width: 100%;
          justify-content: center;
          padding: 10px 0 0 0;
        }
        .settings-ghost-wrapper:hover .hover-settings {
          opacity: 1;
        }
        .status-divider {
          height: 1px;
          background: var(--accent);
          width: 100%;
          opacity: 0.2;
        }
        .status-section .activity-heatmap {
          border-bottom: none;
          padding: 1rem 0;
        }
        .time-fields {
          display: flex;
          align-items: center;
        }
        .status-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          padding: 6px 10px;
          border-radius: 4px;
          width: 105px;
        }
        .status-time-input {
          background: none;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.85rem;
          outline: none;
          color-scheme: dark;
          width: 100%;
          -webkit-appearance: none;
        }
        .status-time-input::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
        .input-icon-right {
          color: var(--bg-primary);
          filter: brightness(3);
          opacity: 0.5;
          margin-left: 4px;
        }
        .minimal-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 10px;
          border-radius: 4px;
          color: var(--accent);
          transition: all 0.2s;
          cursor: pointer;
        }
        .minimal-icon-btn:hover {
          background: rgba(14, 165, 233, 0.1);
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
        }
        .minimal-icon-btn.success {
          color: var(--reward);
        }
        .status-actions-minimal {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }
      `}</style>
    </div>
  );
};
