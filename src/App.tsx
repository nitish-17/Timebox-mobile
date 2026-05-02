import { useState, useCallback, useEffect, useRef } from 'react';
import { BottomNav } from './components/Navigation/BottomNav';
import type { ViewType } from './components/Navigation/BottomNav';
import { ViewManager } from './components/Views/ViewManager';
import { QuickAddSheet } from './components/Sheets/QuickAddSheet';
import { Plus } from 'lucide-react';
import type { Task } from './types';
import { useNotifications } from './hooks/useNotifications';
import { SystemNotifications } from './components/Navigation/SystemNotifications';
import { useStore } from './hooks/useStore';

function App() {
  const { tasks } = useStore();
  const [activeView, setActiveView] = useState<ViewType>('tasks');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [schedulingTask, setSchedulingTask] = useState<Task | null>(null);
  const { messages, addMessage, dismissMessage } = useNotifications();
  const prevTasksRef = useRef<Task[]>([]);

  // Detect task completion (Solo Leveling Parity)
  useEffect(() => {
    const prevTasks = prevTasksRef.current;
    if (prevTasks.length > 0) {
      tasks.forEach((task) => {
        const prevTask = prevTasks.find((t) => t.id === task.id);
        if (prevTask && !prevTask.completed && task.completed) {
          addMessage(
            "QUEST_CLEARED",
            "QUEST CLEARED",
            `Task "${task.title}" completed. XP GAINED: +100`,
          );
        }
      });
    }
    prevTasksRef.current = tasks;
  }, [tasks, addMessage]);

  // Initial greeting
  useEffect(() => {
    const hasGreeted = sessionStorage.getItem("system_greeted");
    if (!hasGreeted) {
      addMessage(
        "QUEST_CLEARED",
        "SYSTEM INITIALIZED",
        "Welcome back, Player. Today's missions are ready.",
      );
      sessionStorage.setItem("system_greeted", "true");
    }
  }, [addMessage]);

  const handleStartScheduling = useCallback((task: Task) => {
    setSchedulingTask(task);
    setActiveView('calendar');
  }, []);

  const handleCompleteScheduling = useCallback(() => {
    setSchedulingTask(null);
  }, []);

  return (
    <div className="app-shell flex flex-col h-[100dvh] overflow-hidden">
      <SystemNotifications messages={messages} onDismiss={dismissMessage} />
      
      <main className="flex-1 relative overflow-hidden">
        <ViewManager 
          activeView={activeView} 
          onViewChange={setActiveView} 
          schedulingTask={schedulingTask}
          onCompleteScheduling={handleCompleteScheduling}
          onStartScheduling={handleStartScheduling}
          addMessage={addMessage}
        />
      </main>

      {/* Floating Action Button (FAB) for Quick Add Task */}
      <button 
        className="fab-fixed-br w-14 h-14 bg-sky-500 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5)] flex items-center justify-center text-slate-900 active:scale-95 transition-transform"
        onClick={() => setIsQuickAddOpen(true)}
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <BottomNav 
        activeView={activeView} 
        onViewChange={setActiveView}
      />

      <QuickAddSheet isOpen={isQuickAddOpen} onOpenChange={setIsQuickAddOpen} />
    </div>
  );
}

export default App;
