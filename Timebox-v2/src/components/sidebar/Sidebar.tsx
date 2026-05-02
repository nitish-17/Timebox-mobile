import React, { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Draggable } from '@fullcalendar/interaction';
import type { Task, TimeBlock } from '../../types';
import { TaskList } from './TaskList';

interface SidebarProps {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  addTask: (title: string, list: 'today' | 'later') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTaskToList: (id: string, list: 'today' | 'later') => void;
  selectedDate: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  timeBlocks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
  moveTaskToList,
  selectedDate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const draggable = new Draggable(containerRef.current, {
        itemSelector: '.draggable-task-item',
        eventData: function(eventEl) {
          const color = eventEl.getAttribute('data-color') || 'rgba(11, 165, 233, 0.75)';
          return {
            title: eventEl.getAttribute('data-title'),
            duration: '00:30',
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              taskId: eventEl.getAttribute('data-task-id'),
              styles: {
                '--fc-event-bg-color': color.replace(/rgba?\((.*?)(?:,\s*[\d.]+)?\)/, 'rgba($1, 0.4)'),
                '--fc-event-border-color': color
              }
            }
          };
        }
      });
      return () => draggable.destroy();
    }
  }, []);

  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar-droppable',
  });

  const todayTasks = tasks.filter((t) => t.list === 'today' && t.date === selectedDate);
  const laterTasks = tasks.filter((t) => t.list === 'later');

  return (
    <aside 
      ref={(node) => {
        setNodeRef(node);
        (containerRef as any).current = node;
      }} 
      className={`sidebar ${isOver ? 'sidebar-droppable-active' : ''}`}
    >
      <div className="scrollable sidebar-content">
        <TaskList
          title="Today"
          placeholder="Add task to today..."
          tasks={todayTasks}
          timeBlocks={timeBlocks}
          type="today"
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
          moveTaskToList={moveTaskToList}
        />

        <TaskList
          title="Later"
          placeholder="Brain dump..."
          tasks={laterTasks}
          timeBlocks={timeBlocks}
          type="later"
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
          moveTaskToList={moveTaskToList}
        />
      </div>
    </aside>
  );
};
