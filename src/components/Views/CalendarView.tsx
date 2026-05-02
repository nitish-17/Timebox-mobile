import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isSameDay } from 'date-fns';
import { useStore } from '../../hooks/useStore';
import { clsx } from 'clsx';
import type { Task } from '../../types';
import { ViewHeader } from '../Navigation/ViewHeader';

interface CalendarViewProps {
  schedulingTask?: Task | null;
  onCompleteScheduling?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  schedulingTask, 
  onCompleteScheduling,
}) => {
  const { timeBlocks, tasks, selectedDate, updateTimeBlock, scheduleTask, navigationSignal } = useStore();
  const calendarRef = useRef<FullCalendar>(null);

  const scrollToCurrentTime = (smooth = true) => {
    if (!calendarRef.current) return;
    
    const calendarApi = calendarRef.current.getApi();
    // Only scroll if we are looking at today
    if (calendarApi && isSameDay(new Date(), new Date(selectedDate))) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Timebox Logic: Offset by 1 hour (60 mins) from the top to keep "now" in view but not at the very edge
      const scrollMinutes = Math.max(0, currentMinutes - 60);
      
      // v3 specific: slotDuration is 30m and slotHeight is 70px
      // 70px / 30min = 2.333 pixels per minute
      const pixelsPerMinute = 70 / 30;
      const scrollTop = scrollMinutes * pixelsPerMinute;

      // Access the scroller element directly for precision control
      const scroller = (calendarRef.current as any).elRef.current?.querySelector('.fc-scroller');
      if (scroller) {
        scroller.scrollTo({
          top: scrollTop,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  };

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentCalDate = format(calendarApi.getDate(), 'yyyy-MM-dd');
      
      if (currentCalDate !== selectedDate) {
        // Only update date if it actually changed to avoid redundant re-renders
        setTimeout(() => {
          calendarApi.gotoDate(selectedDate);
        }, 0);
      }
      
      // Always scroll to current time on navigation, using smooth behavior
      // Short delay to allow potential re-renders to settle
      setTimeout(() => scrollToCurrentTime(true), 100);
    }
  }, [selectedDate, navigationSignal]);

  // Auto-refresh scroll position every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      scrollToCurrentTime(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleEventChange = (info: any) => {
    const { event } = info;
    updateTimeBlock(event.id, {
      startTime: event.startStr,
      endTime: event.endStr
    });
  };

  const handleDateClick = (info: any) => {
    if (schedulingTask && onCompleteScheduling) {
      scheduleTask(schedulingTask.id, info.dateStr);
      onCompleteScheduling();
    }
  };

  const filteredBlocks = timeBlocks.filter(block => 
    format(new Date(block.startTime), 'yyyy-MM-dd') === selectedDate
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#020617]">
      <ViewHeader 
        schedulingTask={schedulingTask} 
        onCompleteScheduling={onCompleteScheduling} 
      />

      {/* Calendar Area */}
      <div className={clsx(
        "flex-1 overflow-hidden relative transition-all duration-500",
        schedulingTask && "ring-2 ring-inset ring-sky-500/30 bg-sky-500/[0.02]"
      )}>
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={false}
          allDaySlot={false}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          slotLabelFormat={{
            hour: 'numeric',
            meridiem: 'short',
            hour12: true
          }}
          height="100%"
          editable={true}
          nowIndicator={true}
          dayHeaders={false}
          dateClick={handleDateClick}
          events={filteredBlocks.map(block => {
            const task = tasks.find(t => t.id === block.taskId);
            const isCompleted = task?.completed || false;
            const baseColor = isCompleted ? 'rgba(71, 85, 105, 0.4)' : (task?.color || block.color || 'rgba(11, 165, 233, 0.75)');
            
            return {
              id: block.id,
              title: block.title || 'Untitled',
              start: block.startTime,
              end: block.endTime,
              backgroundColor: baseColor,
              borderColor: baseColor,
              extendedProps: { completed: isCompleted }
            };
          })}
          eventChange={handleEventChange}
          eventContent={(arg) => {
            const { completed } = arg.event.extendedProps;
            const baseColor = arg.event.backgroundColor;
            // Solo Leveling Glass Effect: 0.75 opacity
            const glassColor = completed 
              ? 'transparent' 
              : baseColor.replace(/rgba?\((.*?)(?:,\s*[\d.]+)?\)/, 'rgba($1, 0.75)');

            return (
              <div 
                className={clsx(
                  "w-full h-full p-2.5 rounded-lg border relative overflow-hidden transition-all duration-300",
                  completed 
                    ? "opacity-60 bg-slate-800/20 border-slate-700/30" 
                    : "backdrop-blur-md border-white/10 shadow-[0_0_20px_var(--event-glow)]"
                )}
                style={{ 
                  backgroundColor: glassColor,
                  ['--event-glow' as any]: completed ? 'transparent' : baseColor.replace(/rgba?\((.*?)(?:,\s*[\d.]+)?\)/, 'rgba($1, 0.4)')
                }}
              >
                {/* Left Accent Bar - Hidden when completed in v2 style */}
                {!completed && (
                  <div 
                    className="absolute left-0 top-0 w-1.5 h-full shadow-[0_0_12px_var(--event-accent)]" 
                    style={{ 
                      backgroundColor: baseColor,
                      ['--event-accent' as any]: baseColor
                    }} 
                  />
                )}
                
                <div className={clsx(
                  "flex flex-col gap-1",
                  !completed && "pl-2"
                )}>
                  <div className={clsx(
                    "text-[11px] font-black uppercase tracking-wider leading-tight",
                    completed ? "text-amber-400 opacity-80" : "text-slate-100"
                  )}>
                    {arg.event.title}
                  </div>
                  <div className={clsx(
                    "text-[8px] font-bold uppercase tracking-tighter",
                    completed ? "text-amber-500/50" : "text-slate-200 opacity-80"
                  )}>
                    {format(arg.event.start!, 'HH:mm')} — {format(arg.event.end!, 'HH:mm')}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      <style>{`
        .fc {
          --fc-border-color: rgba(14, 165, 233, 0.08);
          --fc-now-indicator-color: #0ba5e9;
          --fc-today-bg-color: transparent;
          --fc-page-bg-color: transparent;
        }
        .fc .fc-timegrid-slot {
          height: 80px !important; 
          border-bottom: 0;
          border-top: 1px solid rgba(14, 165, 233, 0.05) !important;
        }
        .fc .fc-timegrid-slot-minor {
          border-top-style: dashed !important;
        }
        .fc .fc-timegrid-slot-label-cushion {
          color: #475569;
          font-size: 9px;
          text-transform: uppercase;
          font-family: var(--font-family);
          padding-right: 16px !important;
          font-weight: 800;
          letter-spacing: 0.1em;
        }
        .fc-v-event {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .fc .fc-timegrid-now-indicator-line {
          border-width: 2px 0 0;
          box-shadow: 0 0 15px #0ba5e9;
        }
        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #0ba5e9;
          border-width: 5px 0 5px 6px;
          margin-top: -5px;
        }
      `}</style>
    </div>
  );
};
