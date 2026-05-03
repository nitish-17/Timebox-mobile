export interface Task {
  id: string;
  title: string;
  completed: boolean;
  list: "today" | "later";
  createdAt: string;
  date?: string; // YYYY-MM-DD for tasks assigned to a specific day
  color?: string;
}

export interface TimeBlock {
  id: string;
  taskId: string | null;
  title?: string;
  startTime: string; // ISO string for the specific day/time
  endTime: string;
  color?: string;
}

export type NoteType =
  | "maintenance"
  | "habits"
  | "recharge"
  | "backlog" // Persistent
  | "observation"
  | "tracking"
  | "other"; // Transient

export interface SystemNote {
  id?: number;
  type: NoteType;
  date: string; // 'global' for persistent, 'YYYY-MM-DD' for transient
  content: string;
}

export interface EnergyConfig {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface UISettings {
  fontScale: number;
}

export interface SystemMessage {
  id: string;
  type: 'QUEST_CLEARED' | 'LEVEL_UP' | 'SKILL_AWAKENED';
  title: string;
  description: string;
}

export interface AppState {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  notes: Record<string, Record<string, string>>; // type -> date -> content
  selectedDate: string; // YYYY-MM-DD
  energyConfig: EnergyConfig;
  uiSettings: UISettings;
}
