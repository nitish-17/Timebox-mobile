import { List, Calendar, FileText, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { format, addDays, subDays } from 'date-fns';
import { useStore } from '../../hooks/useStore';

export type ViewType = 'tasks' | 'calendar' | 'notes';

interface BottomNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const BottomNav = ({
  activeView,
  onViewChange,
}: BottomNavProps) => {
  const { selectedDate, setDate } = useStore();

  const handlePrevDay = () => setDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  const handleNextDay = () => setDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  const handleToday = () => setDate(format(new Date(), 'yyyy-MM-dd'));

  return (
    <nav className="nav-fixed-bottom bg-[#020617]/95 backdrop-blur-xl border-t border-sky-500/30 px-2 justify-around">
      {/* Date Controls */}
      <button 
        onClick={handleToday}
        className="p-2 my-2 text-sky-400 active:scale-90 transition-transform"
        title="Today"
      >
        <Clock size={24} />
      </button>

      <button 
        onClick={handlePrevDay}
        className="p-2 my-2 text-slate-400 active:text-sky-400 active:scale-90 transition-all"
        title="Previous Day"
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={handleNextDay}
        className="p-2 my-2 text-slate-400 active:text-sky-400 active:scale-90 transition-all"
        title="Next Day"
      >
        <ChevronRight size={24} />
      </button>

      <div className="w-[1px] h-6 bg-sky-500/20 mx-1" />

      {/* View Switchers */}
      <button
        onClick={() => onViewChange('tasks')}
        className={clsx(
          "p-2 my-2 transition-all active:scale-90 rounded-[4px]",
          activeView === 'tasks' ? "text-sky-400 bg-sky-500/10 shadow-[0_0_10px_rgba(14,165,233,0.2)] text-shadow-[0_0_8px_#0ba5e9]" : "text-slate-500"
        )}
        title="Tasks"
      >
        <List size={24} />
      </button>

      <button
        onClick={() => onViewChange('calendar')}
        className={clsx(
          "p-2 my-2 transition-all active:scale-90 rounded-[4px]",
          activeView === 'calendar' ? "text-sky-400 bg-sky-500/10 shadow-[0_0_10px_rgba(14,165,233,0.2)] text-shadow-[0_0_8px_#0ba5e9]" : "text-slate-500"
        )}
        title="Timeline"
      >
        <Calendar size={24} />
      </button>

      <button
        onClick={() => onViewChange('notes')}
        className={clsx(
          "p-2 my-2 transition-all active:scale-90 rounded-[4px]",
          activeView === 'notes' ? "text-sky-400 bg-sky-500/10 shadow-[0_0_10px_rgba(14,165,233,0.2)] text-shadow-[0_0_8px_#0ba5e9]" : "text-slate-500"
        )}
        title="Notes"
      >
        <FileText size={24} />
      </button>
    </nav>
  );
};
