import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import type { EventContentArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isSameDay } from 'date-fns';
import { useStore } from '../../hooks/useStore';
import { clsx } from 'clsx';
import type { Task } from '../../types';

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
  const [activeEventId, setActiveEventId] = React.useState<string | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleEventTap = (eventId: string, e: React.PointerEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.stopPropagation();
      setActiveEventId(prev => prev === eventId ? null : eventId);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const scrollToCurrentTime = (smooth = true) => {
    if (!calendarRef.current) return;
    
    const calendarApi = calendarRef.current.getApi();
    // Only scroll if we are looking at today
    if (calendarApi && isSameDay(new Date(), new Date(selectedDate))) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Timebox Logic: Offset by 1 hour (60 mins) from the top
      const scrollMinutes = Math.max(0, currentMinutes - 60);
      
      // Slot height is 80px for 30min -> 2.666 px/min
      const pixelsPerMinute = 80 / 30;
      const scrollTop = Math.floor(scrollMinutes * pixelsPerMinute);

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
        // Wrap in setTimeout to prevent "flushSync was called from inside a lifecycle method" error
        setTimeout(() => {
          calendarApi.gotoDate(selectedDate);
        }, 0);
      }
      
      // Use a slightly longer delay to ensure FullCalendar has finished its internal re-rendering
      const timer = setTimeout(() => scrollToCurrentTime(true), 250);
      return () => clearTimeout(timer);
    }
  }, [selectedDate, navigationSignal]);

  // Auto-refresh scroll position every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // For auto-refresh, use smooth scrolling to avoid jarring jumps
      scrollToCurrentTime(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, navigationSignal]);

  const handleEventChange = (info: any) => {
    const { event } = info;
    updateTimeBlock(event.id, {
      startTime: event.startStr,
      endTime: event.endStr
    });
    // Removed setActiveEventId(null) to persist editing mode
  };

  const handleDateClick = (info: any) => {
    if (schedulingTask && onCompleteScheduling) {
      scheduleTask(schedulingTask.id, info.dateStr);
      onCompleteScheduling();
    }
    setActiveEventId(null);
  };

  const filteredBlocks = timeBlocks.filter(block => 
    format(new Date(block.startTime), 'yyyy-MM-dd') === selectedDate
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
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
          eventLongPressDelay={activeEventId ? 0 : 999999}
          selectLongPressDelay={999999}
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
              extendedProps: { completed: isCompleted },
              editable: block.id === activeEventId
            };
          })}
          eventChange={handleEventChange}
          eventContent={(arg: EventContentArg) => {
            const { completed } = arg.event.extendedProps;
            const isActive = arg.event.id === activeEventId;
            const baseColor = arg.event.backgroundColor;
            
            // Solo Leveling Glass Effect: baseColor is rgba(71, 85, 105, 0.4) for completed
            const glassColor = completed 
              ? 'rgba(71, 85, 105, 0.4)' 
              : baseColor.replace(/rgba?\((.*?)(?:,\s*[\d.]+)?\)/, 'rgba($1, 0.4)');

            return (
              <div 
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleEventTap(arg.event.id, e);
                }}
                className={clsx(
                  "fc-event-glass-container",
                  completed && "event-completed",
                  isActive && "is-active-editing"
                )}
                style={{ 
                  '--event-bg': glassColor,
                  '--event-border': baseColor,
                } as React.CSSProperties}
              >
                <div className="fc-event-title">{arg.event.title}</div>
              </div>
            );
          }}
        />
      </div>

      <style>{`
        .fc {
          --fc-border-color: rgba(14, 165, 233, 0.3);
          --fc-now-indicator-color: #0ba5e9;
          --fc-today-bg-color: transparent;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          font-family: inherit;
        }
        .fc .fc-scroller {
          padding-bottom: 80px !important;
        }
        .fc .fc-timegrid-slot {
          height: 80px !important;
          border-bottom: 0;
          border-top: 1px solid rgba(14, 165, 233, 0.3) !important;
        }
        .fc .fc-timegrid-slot-minor {
          border-top-style: solid !important;
          border-top-color: rgba(14, 165, 233, 0.15) !important;
        }
        .fc .fc-timegrid-slot-label-cushion {
          display: block !important;
          padding: 0 8px 0 0 !important;
          color: #0ba5e9;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transform: translateY(-50%);
          opacity: 1;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
          white-space: nowrap;
          text-align: right;
          width: 65px;
        }
        .fc .fc-timegrid-axis-frame {
          justify-content: flex-end;
          padding: 0 8px 0 0 !important;
          color: #0ba5e9;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 1;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
          white-space: nowrap;
          text-align: right;
          width: 65px;
          overflow: visible !important;
        }
        .fc-v-event {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          touch-action: none !important;
        }
        .fc .fc-timegrid-now-indicator-line {
          border-width: 2px 0 0;
          box-shadow: 0 0 15px #0ba5e9;
        }
        .fc .fc-timegrid-now-indicator-arrow {
          border-top: 5px solid transparent !important;
          border-bottom: 5px solid transparent !important;
          border-left: 6px solid #0ba5e9 !important;
          border-right: none !important;
          background-color: transparent !important;
          margin-top: -5px !important;
          width: 0 !important;
          height: 0 !important;
        }
        .fc-event-glass-container {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          padding: 4px 6px;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          cursor: grab;
          font-size: 0.95rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: var(--event-bg);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }
        .fc-event-glass-container:not(.event-completed) {
          box-shadow: 0 0 12px var(--event-border);
          border-color: var(--event-border);
        }
        .fc-event-glass-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--event-border);
          box-shadow: 0 0 8px var(--event-border);
        }
        .fc-event-glass-container:not(.event-completed):hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px var(--event-border);
          z-index: 5;
        }
        .is-active-editing {
          border-color: #fff !important;
          box-shadow: 0 0 25px #fff, 0 0 10px var(--event-border) !important;
          transform: scale(1.05) !important;
          z-index: 100 !important;
          cursor: grabbing !important;
        }
        .event-completed {
          opacity: 0.6;
          box-shadow: none !important;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        .event-completed::before {
          box-shadow: none;
        }
        .event-completed .fc-event-title {
          color: #facc15 !important;
          text-shadow: none !important;
        }
        .fc-timegrid-event .fc-event-title {
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
};
