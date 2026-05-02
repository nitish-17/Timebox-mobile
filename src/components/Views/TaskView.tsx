import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { TaskItem } from './TaskItem';
import { TaskActionSheet } from '../Sheets/TaskActionSheet';
import { ViewHeader } from '../Navigation/ViewHeader';
import type { Task } from '../../types';

interface TaskViewProps {
  onStartScheduling: (task: Task) => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ onStartScheduling }) => {
  const { 
    tasks, 
    timeBlocks, 
    selectedDate, 
    toggleTask, 
    deleteTask, 
    moveTaskToList,
    updateTask 
  } = useStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const activeTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null;

  const todayTasks = tasks.filter((t) => t.list === 'today' && t.date === selectedDate);
  const laterTasks = tasks.filter((t) => t.list === 'later');

  const sortedTasks = (taskList: typeof tasks) => {
    return [...taskList].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#020617]">
      <ViewHeader />
      
      <div className="mobile-content pb-20 space-y-10">
        {/* Today List */}
        <section>
          <div className="mb-4 px-2">
            <h3 className="text-lg uppercase tracking-[0.3em] text-slate-400 font-bold">Today</h3>
          </div>

          <div className="space-y-1">
            {sortedTasks(todayTasks).map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                timeBlock={timeBlocks.find(b => b.taskId === task.id)}
                toggleTask={toggleTask}
                onOpenActions={() => setSelectedTaskId(task.id)}
              />
            ))}
            {todayTasks.length === 0 && (
              <div className="py-8 text-center border border-dashed border-sky-500/10 rounded-xl text-lg uppercase tracking-widest text-slate-600">
                No active objectives
              </div>
            )}
          </div>
        </section>

        {/* Later List */}
        <section>
          <div className="mb-4 px-2">
            <h3 className="text-lg uppercase tracking-[0.3em] text-slate-400 font-bold">Later</h3>
          </div>

          <div className="space-y-1">
            {sortedTasks(laterTasks).map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                timeBlock={timeBlocks.find(b => b.taskId === task.id)}
                toggleTask={toggleTask}
                onOpenActions={() => setSelectedTaskId(task.id)}
              />
            ))}
            {laterTasks.length === 0 && (
              <div className="py-8 text-center border border-dashed border-sky-500/10 rounded-xl text-lg uppercase tracking-widest text-slate-600">
                Backlog empty
              </div>
            )}
          </div>
        </section>
      </div>

      <TaskActionSheet 
        task={activeTask} 
        isOpen={!!activeTask} 
        onClose={() => setSelectedTaskId(null)}
        onDelete={(id) => { deleteTask(id); setSelectedTaskId(null); }}
        onMove={(id, list) => { moveTaskToList(id, list); setSelectedTaskId(null); }}
        onUpdate={(id, updates) => { updateTask(id, updates); }}
        onStartScheduling={(task) => { onStartScheduling(task); setSelectedTaskId(null); }}
      />
    </div>
  );
};
