import React from 'react';
import { motion } from 'framer-motion';
import type { ViewType } from '../Navigation/BottomNav';
import { TaskView } from './TaskView';
import { CalendarView } from './CalendarView';
import { NoteView } from './NoteView';
import type { Task, SystemMessage } from '../../types';

interface ViewManagerProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  schedulingTask: Task | null;
  onStartScheduling: (task: Task) => void;
  onCompleteScheduling: () => void;
  addMessage: (type: SystemMessage['type'], title: string, description: string) => void;
}
const viewOrder: ViewType[] = ['tasks', 'calendar', 'notes'];

export const ViewManager: React.FC<ViewManagerProps> = ({ 
  activeView, 
  onViewChange,
  schedulingTask,
  onStartScheduling,
  onCompleteScheduling,
  addMessage,
}) => {
  const currentIndex = viewOrder.indexOf(activeView);

  // Use a ref to handle drag interaction without constant re-renders
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 100; // Increased from 50 to require more intentional swipe
    if (info.offset.x < -swipeThreshold) {
      // Swiped Left -> Move Right
      const nextIndex = Math.min(currentIndex + 1, viewOrder.length - 1);
      if (nextIndex !== currentIndex) onViewChange(viewOrder[nextIndex]);
    } else if (info.offset.x > swipeThreshold) {
      // Swiped Right -> Move Left
      const prevIndex = Math.max(currentIndex - 1, 0);
      if (prevIndex !== currentIndex) onViewChange(viewOrder[prevIndex]);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      <motion.div
        ref={containerRef}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
        }}
        className="flex h-full w-full"
      >
        <div className="w-full h-full flex-shrink-0 overflow-hidden">
          <TaskView onStartScheduling={onStartScheduling} />
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
