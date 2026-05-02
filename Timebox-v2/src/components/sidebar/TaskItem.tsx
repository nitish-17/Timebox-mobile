import React, { useState, useEffect, memo } from 'react';
import { Trash2, CheckCircle, Circle, GripVertical, Clock, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { ChromePicker } from 'react-color';
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  useClick, 
  useDismiss, 
  useInteractions,
  FloatingPortal,
  useHover,
  useRole
} from '@floating-ui/react';
import type { Task, TimeBlock } from '../../types';

interface TaskItemProps {
  task: Task;
  timeBlock?: TimeBlock;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: () => void;
  moveIcon: React.ReactNode;
}

export const TaskItem = memo(({ 
  task, timeBlock, toggleTask, deleteTask, updateTask, moveTask, moveIcon 
}: TaskItemProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Prevent text selection while color picker is open/being dragged
  useEffect(() => {
    if (isPickerOpen) {
      document.body.classList.add('picker-open');
    } else {
      document.body.classList.remove('picker-open');
    }
    return () => {
      document.body.classList.remove('picker-open');
    };
  }, [isPickerOpen]);

  // Color Picker Floating Logic
  const { refs: pickerRefs, floatingStyles: pickerStyles, context: pickerContext } = useFloating({
    open: isPickerOpen,
    onOpenChange: setIsPickerOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
  });

  // Tooltip Floating Logic
  const { refs: tooltipRefs, floatingStyles: tooltipStyles, context: tooltipContext } = useFloating({
    open: isTooltipOpen,
    onOpenChange: setIsTooltipOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: 'top-start',
  });

  const pickerClick = useClick(pickerContext);
  const pickerDismiss = useDismiss(pickerContext);
  const { getReferenceProps: getPickerProps, getFloatingProps: getPickerFloatingProps } = useInteractions([
    pickerClick,
    pickerDismiss,
  ]);

  const tooltipHover = useHover(tooltipContext, {
    delay: 0,
  });
  const tooltipRole = useRole(tooltipContext, { role: 'tooltip' });
  const { getReferenceProps: getTooltipProps, getFloatingProps: getTooltipFloatingProps } = useInteractions([
    tooltipHover,
    tooltipRole,
  ]);

  const handleColorChange = (color: any) => {
    const { r, g, b, a } = color.rgb;
    updateTask(task.id, { color: `rgba(${r}, ${g}, ${b}, ${a})` });
  };

  return (
    <div
      className="draggable-task-item task-item-container"
      data-task-id={task.id}
      data-title={task.title}
      data-color={task.color || 'rgba(11, 165, 233, 0.75)'}
      style={{
        '--task-accent': task.color || 'var(--accent)'
      } as React.CSSProperties}
    >
      <div className="task-item-content">
        <div 
          ref={tooltipRefs.setReference}
          className="task-item-drag-handle"
          {...getTooltipProps()}
        >
          <GripVertical size={14} />
        </div>

        {isTooltipOpen && (
          <FloatingPortal>
            <div
              ref={tooltipRefs.setFloating}
              style={tooltipStyles}
              className="task-tooltip"
              {...getTooltipFloatingProps()}
            >
              {task.title}
            </div>
          </FloatingPortal>
        )}
        
        <button 
          className="task-item-toggle" 
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(task.id);
          }}
        >
          {task.completed ? (
            <CheckCircle size={18} color="var(--reward)" fill="var(--reward)" fillOpacity={0.2} />
          ) : (
            <Circle size={18} color="var(--accent)" />
          )}
        </button>

        <div className="task-item-body">
          <div className={`task-item-title ${task.completed ? 'completed' : ''}`}>
            {task.title}
          </div>
          {timeBlock && (
            <div className="task-item-time">
              <Clock size={10} color="var(--accent)" />
              {format(new Date(timeBlock.startTime), 'h:mm a')}
            </div>
          )}
        </div>

        <div className="task-actions" onClick={(e) => e.stopPropagation()}>
          <div className="relative-container">
            <button 
              ref={pickerRefs.setReference}
              {...getPickerProps({
                onClick(e) {
                  e.stopPropagation();
                }
              })}
              title="Change color" 
              className="action-btn"
            >
              <Palette size={14} />
            </button>
            {isPickerOpen && (
              <FloatingPortal>
                <div 
                  ref={pickerRefs.setFloating}
                  style={{ ...pickerStyles, zIndex: 99999 }}
                  {...getPickerFloatingProps({
                    onClick(e) {
                      e.stopPropagation();
                    }
                  })}
                >

                  <ChromePicker 
                    color={task.color || 'rgba(11, 165, 233, 0.75)'} 
                    onChange={handleColorChange}
                    disableAlpha={false}
                  />
                </div>
              </FloatingPortal>
            )}
          </div>
          <button 
            className="action-btn" 
            onClick={(e) => {
              e.stopPropagation();
              moveTask();
            }} 
            title="Move task"
          >
            {moveIcon}
          </button>
          <button 
            className="action-btn" 
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }} 
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});
