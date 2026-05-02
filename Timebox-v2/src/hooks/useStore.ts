import { useState, useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { db } from "../db/db";
import type { Task, TimeBlock, AISettings, NoteType, EnergyConfig } from "../types";

const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "ollama",
  baseUrl: "http://localhost:11434/v1",
  model: "gemma4:e4b",
};

const DEFAULT_ENERGY_CONFIG: EnergyConfig = {
  startTime: "06:00",
  endTime: "00:00",
};

export function useStore() {
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );

  // Reactive data from Dexie
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const timeBlocks = useLiveQuery(() => db.timeBlocks.toArray(), []) || [];
  const notesArray = useLiveQuery(() => db.systemNotes.toArray(), []) || [];
  const settingsArray = useLiveQuery(() => db.settings.toArray(), []) || [];

  const aiSettings = useMemo(() => {
    const aiSetting = settingsArray.find((s) => s.key === "aiConfig");
    return (aiSetting?.value as AISettings) || DEFAULT_AI_SETTINGS;
  }, [settingsArray]);

  const energyConfig = useMemo(() => {
    const energySetting = settingsArray.find((s) => s.key === "energyConfig");
    return (energySetting?.value as EnergyConfig) || DEFAULT_ENERGY_CONFIG;
  }, [settingsArray]);

  const updateAISettings = useCallback(
    async (updates: Partial<AISettings>) => {
      const current = aiSettings;
      const newValue = { ...current, ...updates };
      await db.settings.put({ key: "aiConfig", value: newValue });
    },
    [aiSettings],
  );

  const updateEnergyConfig = useCallback(
    async (updates: Partial<EnergyConfig>) => {
      const current = energyConfig;
      const newValue = { ...current, ...updates };
      await db.settings.put({ key: "energyConfig", value: newValue });
    },
    [energyConfig],
  );

  // Convert notes array to nested record: type -> date -> content
  const notes = useMemo(() => {
    return notesArray.reduce(
      (acc, note) => {
        if (!acc[note.type]) acc[note.type] = {};
        acc[note.type][note.date] = note.content;
        return acc;
      },
      {} as Record<string, Record<string, string>>,
    );
  }, [notesArray]);

  const addTask = useCallback(
    async (title: string, list: "today" | "later") => {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false,
        list,
        color: "rgba(11, 165, 233, 0.75)",
        createdAt: new Date().toISOString(),
        date: list === "today" ? selectedDate : undefined,
      };
      await db.tasks.add(newTask);
    },
    [selectedDate],
  );

  const addTasksBulk = useCallback(
    async (titles: string[], list: "today" | "later") => {
      const baseTime = new Date().getTime();
      const newTasks: Task[] = titles.map((title, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false,
        list,
        color: "rgba(11, 165, 233, 0.75)",
        createdAt: new Date(baseTime + index).toISOString(),
        date: list === "today" ? selectedDate : undefined,
      }));
      await db.tasks.bulkAdd(newTasks);
    },
    [selectedDate],
  );

  const toggleTask = useCallback(async (id: string) => {
    const task = await db.tasks.get(id);
    if (task) {
      await db.tasks.update(id, { completed: !task.completed });
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await db.transaction("rw", db.tasks, db.timeBlocks, async () => {
      await db.tasks.delete(id);
      await db.timeBlocks.where("taskId").equals(id).delete();
    });
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await db.transaction("rw", db.tasks, db.timeBlocks, async () => {
      await db.tasks.update(id, updates);
      if (updates.color) {
        await db.timeBlocks
          .where("taskId")
          .equals(id)
          .modify({ color: updates.color });
      }
    });
  }, []);

  const updateTaskTitle = useCallback(async (id: string, title: string) => {
    await db.tasks.update(id, { title });
  }, []);

  const moveTaskToList = useCallback(
    async (id: string, list: "today" | "later") => {
      const date = list === "today" ? selectedDate : undefined;
      await db.transaction("rw", db.tasks, db.timeBlocks, async () => {
        await db.tasks.update(id, { list, date });
        if (list === "later") {
          await db.timeBlocks.where("taskId").equals(id).delete();
        }
      });
    },
    [selectedDate],
  );

  const scheduleTask = useCallback(
    async (taskId: string, startTime: string, durationMinutes: number = 30) => {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      const dateStr = format(start, "yyyy-MM-dd");

      await db.transaction("rw", db.tasks, db.timeBlocks, async () => {
        const task = await db.tasks.get(taskId);
        if (!task) return;

        await db.tasks.update(taskId, { list: "today", date: dateStr });

        const newBlock: TimeBlock = {
          id: Math.random().toString(36).substr(2, 9),
          taskId: taskId,
          title: task.title,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          color: task.color || "rgba(11, 165, 233, 0.75)",
        };

        await db.timeBlocks.where("taskId").equals(taskId).delete();
        await db.timeBlocks.add(newBlock);
      });
    },
    [],
  );

  const unscheduleTask = useCallback(async (taskId: string) => {
    await db.timeBlocks.where("taskId").equals(taskId).delete();
  }, []);

  const setDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const updateNote = useCallback(
    async (type: NoteType, date: string, content: string) => {
      const existing = await db.systemNotes.where({ type, date }).first();
      if (existing) {
        await db.systemNotes.update(existing.id!, { content });
      } else {
        await db.systemNotes.add({ type, date, content });
      }
    },
    [],
  );

  const updateTimeBlock = useCallback(
    async (id: string, updates: Partial<TimeBlock>) => {
      await db.timeBlocks.update(id, updates);
    },
    [],
  );

  const deleteTimeBlock = useCallback(async (id: string) => {
    await db.timeBlocks.delete(id);
  }, []);

  const bulkScheduleTasks = useCallback(
    async (plannedTasks: { id: string; start: string; duration: number }[]) => {
      await db.transaction("rw", db.tasks, db.timeBlocks, async () => {
        for (const planned of plannedTasks) {
          const task = await db.tasks.get(planned.id);
          if (!task) continue;

          let [hours, minutes] = planned.start.split(":").map(Number);
          const totalMinutes = hours * 60 + minutes;
          const roundedTotal = Math.round(totalMinutes / 15) * 15;
          hours = Math.floor(roundedTotal / 60);
          minutes = roundedTotal % 60;

          const startTime = new Date(selectedDate + "T00:00:00");
          startTime.setHours(hours, minutes, 0, 0);
          const endTime = new Date(
            startTime.getTime() + planned.duration * 60000,
          );

          const newBlock: TimeBlock = {
            id: Math.random().toString(36).substr(2, 9),
            taskId: planned.id,
            title: task.title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            color: task.color || "rgba(11, 165, 233, 0.75)",
          };

          await db.timeBlocks.where("taskId").equals(planned.id).delete();
          await db.timeBlocks.add(newBlock);
          await db.tasks.update(planned.id, {
            list: "today",
            date: selectedDate,
          });
        }
      });
    },
    [selectedDate],
  );

  const getNotesInRange = useCallback(
    async (startDate: string, endDate: string, type?: NoteType) => {
      let query = db.systemNotes
        .where("date")
        .between(startDate, endDate, true, true);
      if (type) {
        query = query.filter((n) => n.type === type);
      }
      return await query.toArray();
    },
    [],
  );

  return {
    tasks,
    timeBlocks,
    notes,
    selectedDate,
    addTask,
    addTasksBulk,
    toggleTask,
    deleteTask,
    updateTask,
    updateTaskTitle,
    moveTaskToList,
    setDate,
    updateNote,
    updateTimeBlock,
    deleteTimeBlock,
    scheduleTask,
    bulkScheduleTasks,
    unscheduleTask,
    aiSettings,
    updateAISettings,
    energyConfig,
    updateEnergyConfig,
    getNotesInRange,
  };
}
