import React from 'react';
import { motion } from 'framer-motion';
import type { ViewType } from '../Navigation/BottomNav';
import { TaskView } from './TaskView';
import { CalendarView } from './CalendarView';
import { NoteView } from './NoteView';
import type { Task, SystemMessage } from '../../types';

interface ViewManagerProps {
  activeView: ViewType;
  schedulingTask: Task | null;
  onStartScheduling: (task: Task) => void;
  onCompleteScheduling: () => void;
  addMessage: (type: SystemMessage['type'], title: string, description: string) => void;
  selectedTaskIds: Set<string>;
  onToggleTaskSelection: (taskId: string) => void;
  onClearSelection: () => void;
}
const viewOrder: ViewType[] = ['tasks', 'calendar', 'notes'];

export const ViewManager: React.FC<ViewManagerProps> = ({ 
  activeView, 
  schedulingTask,
  onStartScheduling,
  onCompleteScheduling,
  addMessage,
  selectedTaskIds,
  onToggleTaskSelection,
  onClearSelection,
}) => {
  const currentIndex = viewOrder.indexOf(activeView);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      <motion.div
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
        }}
        className="flex h-full w-full"
      >
        <div className="w-full h-full flex-shrink-0 overflow-hidden">
          <TaskView 
            onStartScheduling={onStartScheduling} 
            selectedTaskIds={selectedTaskIds}
            onToggleTaskSelection={onToggleTaskSelection}
            onClearSelection={onClearSelection}
          />
        </div>
        <div className="w-full h-full flex-shrink-0 overflow-hidden">
          <CalendarView 
            schedulingTask={schedulingTask} 
            onCompleteScheduling={onCompleteScheduling} 
          />
        </div>
        <div className="w-full h-full flex-shrink-0 overflow-hidden">
          <NoteView addMessage={addMessage} />
        </div>
      </motion.div>
    </div>
  );
};
