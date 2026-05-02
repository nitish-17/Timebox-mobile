import Dexie, { type Table } from 'dexie';
import type { Task, TimeBlock, SystemNote } from '../types';

export interface Setting {
  key: string;
  value: any;
}

export class TimeboxDatabase extends Dexie {
  tasks!: Table<Task>;
  timeBlocks!: Table<TimeBlock>;
  systemNotes!: Table<SystemNote>;
  settings!: Table<Setting>;

  constructor() {
    super('TimeboxDatabase');
    // Maintain the exact same schema and versions as v2 to share the DB
    this.version(1).stores({
      tasks: 'id, title, completed, list, date, createdAt',
      timeBlocks: 'id, taskId, title, startTime, endTime',
      notes: 'date',
      settings: 'key'
    });

    this.version(2).stores({
      notes: null,
      systemNotes: '++id, type, date, [type+date]'
    });
  }
}

export const db = new TimeboxDatabase();
