import React, { useState } from 'react';
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { Task, TimeBlock } from '../../types';

interface TaskListProps {
  title: string;
  placeholder: string;
  tasks: Task[];
  timeBlocks: TimeBlock[];
  type: 'today' | 'later';
  addTask: (title: string, list: 'today' | 'later') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTaskToList: (id: string, list: 'today' | 'later') => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  title,
  placeholder,
  tasks,
  timeBlocks,
  type,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
  moveTaskToList,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue.trim(), type);
      setInputValue('');
    }
  };

  const moveTarget = type === 'today' ? 'later' : 'today';
  const MoveIcon = type === 'today' ? ArrowRight : ArrowLeft;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <section className="task-list-section">
      <h2 className="task-list-header">{title}</h2>
      <form onSubmit={handleAdd} className="task-input-form">
        <div className="task-input-wrapper">
          <Plus size={16} className="task-input-icon" />
          <input
            id={`task-input-${type}`}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="task-input"
            autoComplete="off"
          />
        </div>
      </form>
      <div className="task-list">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            timeBlock={timeBlocks.find(b => b.taskId === task.id)}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            moveTask={() => moveTaskToList(task.id, moveTarget)}
            moveIcon={<MoveIcon size={14} />}
          />
        ))}
      </div>
    </section>
  );
};
