import React, { memo } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, TimeBlock } from '../../types';
import { clsx } from 'clsx';

interface TaskItemProps {
  task: Task;
  timeBlock?: TimeBlock;
  toggleTask: (id: string) => void;
  onOpenActions: () => void;
}

export const TaskItem = memo(({ 
  task, timeBlock, toggleTask, onOpenActions 
}: TaskItemProps) => {
  return (
    <div
      onClick={onOpenActions}
      className="task-item-container active:scale-[0.98] transition-transform cursor-pointer"
      style={{
        '--task-accent': task.color || 'var(--accent)'
      } as React.CSSProperties}
    >
      <div className="task-item-content">
        <button 
          className="task-item-toggle" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening actions sheet when toggling
            toggleTask(task.id);
          }}
        >
          {task.completed ? (
            <CheckCircle size={22} color="var(--reward)" fill="var(--reward)" fillOpacity={0.2} />
          ) : (
            <Circle size={22} color="var(--accent)" />
          )}
        </button>

        <div className="task-item-body">
          <div className={clsx(
            "task-item-title",
            task.completed && "completed"
          )}>
            {task.title}
          </div>
          {timeBlock && (
            <div className="task-item-time">
              <Clock size={12} color="var(--accent)" />
              <span className="text-[10px] uppercase font-bold tracking-tighter">
                {format(new Date(timeBlock.startTime), 'h:mm a')}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .task-item-container {
          display: flex;
          flex-direction: column;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 0.6rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.2);
          will-change: transform;
          contain: layout style;
        }

        .task-item-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 2px;
          height: 100%;
          background: var(--task-accent, var(--accent));
          box-shadow: 0 0 8px var(--task-accent, var(--accent));
        }

        .task-item-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .task-item-body {
          flex: 1;
          min-width: 0;
        }

        .task-item-title {
          font-size: 0.9rem;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.05em;
        }

        .task-item-title.completed {
          color: var(--reward);
          opacity: 0.8;
          text-shadow: none;
        }

        .task-item-title.completed::after {
          content: " [CLEARED]";
          font-size: 0.7rem;
          font-weight: bold;
          vertical-align: middle;
          margin-left: 0.5rem;
        }

        .task-item-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.25rem;
          color: var(--accent);
          opacity: 0.9;
          text-shadow: 0 0 5px rgba(14, 165, 233, 0.2);
        }

        .task-item-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
});
