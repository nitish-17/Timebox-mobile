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
    // Version 1 was the initial schema
    this.version(1).stores({
      tasks: 'id, title, completed, list, date, createdAt',
      timeBlocks: 'id, taskId, title, startTime, endTime',
      notes: 'date',
      settings: 'key'
    });

    // Version 2: Migrate to systemNotes to change primary key structure
    this.version(2).stores({
      notes: null, // Delete the old notes table
      systemNotes: '++id, type, date, [type+date]'
    });
  }
}

export const db = new TimeboxDatabase();
