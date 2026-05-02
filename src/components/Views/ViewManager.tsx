import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

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
  
  // Track direction for the animation
  const [prevIndex, setPrevIndex] = React.useState(currentIndex);
  const direction = currentIndex > prevIndex ? 1 : -1;

  React.useEffect(() => {
    setPrevIndex(currentIndex);
  }, [currentIndex]);

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
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

  const renderActiveView = () => {
    switch (activeView) {
      case 'tasks':
        return <TaskView onStartScheduling={onStartScheduling} />;
      case 'calendar':
        return (
          <CalendarView 
            schedulingTask={schedulingTask} 
            onCompleteScheduling={onCompleteScheduling} 
          />
        );
      case 'notes':
        return <NoteView addMessage={addMessage} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617] flex flex-col">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeView}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 w-full h-full flex flex-col"
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
