import { Sidebar } from "./components/sidebar/Sidebar";
import { Schedule } from "./components/schedule/Schedule";
import { Notes } from "./components/notes/Notes";
import { useStore } from "./hooks/useStore";
import { useSystemAI } from "./hooks/useSystemAI";
import { SystemNotifications } from "./components/SystemNotifications";
import { CommandPalette } from "./components/CommandPalette";
import { ExpandModal } from "./components/ExpandModal";
import { BriefModal } from "./components/BriefModal";
import { PlanModal } from "./components/PlanModal";
import { SettingsModal } from "./components/SettingsModal";
import { HelpModal } from "./components/HelpModal";
import { StatusPanel } from "./components/StatusPanel";
import { AskAIModal } from "./components/AskAIModal";
import { DndContext } from "@dnd-kit/core";
import { useState, useCallback, useEffect } from "react";
import { calculateDuration } from "./hooks/usePlanningUtils";
import type { TimeRange } from "./hooks/usePlanningUtils";
import type { Task } from "./types";

function App() {
  const store = useStore();
  const {
    tasks,
    timeBlocks,
    notes,
    selectedDate,
    addTask,
    addTasksBulk,
    toggleTask,
    deleteTask,
    updateTask,
    moveTaskToList,
    setDate,
    updateNote,
    updateTimeBlock,
    deleteTimeBlock,
    scheduleTask,
    bulkScheduleTasks,
    unscheduleTask,
    getNotesInRange
  } = store;

  const { messages, dismissMessage, dismissAllMessages, addMessage } =
    useSystemAI(tasks);

  // Filter and sort tasks for the currently selected date (Today list only)
  const todayTasksForDate = tasks.filter(
    (t) => t.list === "today" && t.date === selectedDate,
  );
  const unfinishedTasks = todayTasksForDate
    .filter((t) => !t.completed)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  // Identify which of those are not yet scheduled
  const scheduledTaskIds = new Set(timeBlocks.map((b) => b.taskId));
  const unscheduledTasks = unfinishedTasks.filter(
    (t) => !scheduledTaskIds.has(t.id),
  );

  // Modal States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isStatusPanelOpen, setIsStatusPanelOpen] = useState(false);
  const [isAskAIModalOpen, setIsAskAIModalOpen] = useState(false);
  const [selectedTaskForBrief, setSelectedTaskForBrief] = useState<Task | null>(
    null,
  );

  const handleExpandSuccess = useCallback(
    async (newTasks: string[]) => {
      if (newTasks.length > 0) {
        await addTasksBulk(newTasks, "today");
        addMessage(
          "QUEST_CLEARED",
          "SYSTEM EXPANDED",
          `${newTasks.length} new tasks synchronized to your log.`,
        );
      }
    },
    [addTasksBulk, addMessage],
  );
  const handleBriefSuccess = useCallback(
    async (brief: string) => {
      // For briefing, we'll use the 'other' note type by default
      const otherNotes = notes["other"] || {};
      const currentNote = otherNotes[selectedDate] || "";
      const trimmedNote = currentNote.trim();
      const updatedNote = trimmedNote
        ? `${trimmedNote}\n\n${brief.trim()}`
        : brief.trim();
      await updateNote("other", selectedDate, updatedNote);
      addMessage(
        "QUEST_CLEARED",
        "SYSTEM UPDATED",
        `Mission briefing appended to OTHER.`,
      );
    },
    [notes, selectedDate, updateNote, addMessage],
  );

  const handlePlanSuccess = useCallback(
    async (timeRanges: TimeRange[], targetTaskIds: string[]) => {
      const planned: { id: string; start: string; duration: number }[] = [];

      // Sequentially assign ranges to the targeted tasks
      for (
        let i = 0;
        i < Math.min(timeRanges.length, targetTaskIds.length);
        i++
      ) {
        const range = timeRanges[i];
        const taskId = targetTaskIds[i];

        planned.push({
          id: taskId,
          start: range.start,
          duration: calculateDuration(range.start, range.end),
        });
      }

      if (planned.length > 0) {
        await bulkScheduleTasks(planned);
        addMessage(
          "QUEST_CLEARED",
          "PLAN SYNCHRONIZED",
          `${planned.length} missions scheduled to your timeline.`,
        );
      }
    },
    [bulkScheduleTasks, addMessage],
  );

  const handleCommandSelect = useCallback(
    async (command: string, data?: any) => {
      if (command === "expand") {
        setIsCommandPaletteOpen(false);
        setIsExpandModalOpen(true);
      } else if (command === "brief") {
        setIsCommandPaletteOpen(false);
        setSelectedTaskForBrief(data?.task || null);
        setIsBriefModalOpen(true);
      } else if (command === "plan") {
        setIsCommandPaletteOpen(false);
        setIsPlanModalOpen(true);
      } else if (command === "ask") {
        setIsCommandPaletteOpen(false);
        setIsAskAIModalOpen(true);
      }
    },
    [],
  );

  // Global key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTextArea = activeEl instanceof HTMLTextAreaElement;
      const isStandardInput =
        activeEl instanceof HTMLInputElement &&
        (activeEl.type === "text" ||
          activeEl.type === "number" ||
          activeEl.type === "password");

      // We block / if we are in a text-entry field, but allow it for other elements like date pickers
      const isTyping = isTextArea || isStandardInput;

      if (e.key === "?" && !isCommandPaletteOpen) {
        if (!isTyping) {
          e.preventDefault();
          if (activeEl instanceof HTMLElement) activeEl.blur();
          setIsHelpModalOpen((prev) => !prev);
        }
      }

      if (e.key === "/" && !isCommandPaletteOpen && !isHelpModalOpen) {
        if (!isTyping) {
          e.preventDefault();
          if (activeEl instanceof HTMLElement) activeEl.blur();
          setIsCommandPaletteOpen(true);
        }
      }

      if (e.key === "," && !isSettingsOpen && !isHelpModalOpen) {
        if (!isTyping) {
          e.preventDefault();
          if (activeEl instanceof HTMLElement) activeEl.blur();
          setIsSettingsOpen(true);
        }
      }

      if (e.key === "." && !isStatusPanelOpen && !isHelpModalOpen) {
        if (!isTyping) {
          e.preventDefault();
          if (activeEl instanceof HTMLElement) activeEl.blur();
          setIsStatusPanelOpen(true);
        }
      }

      if (!isTyping && !isCommandPaletteOpen && !isHelpModalOpen) {
        if (e.key === "n") {
          e.preventDefault();
          document.getElementById("notes-textarea")?.focus();
        } else if (e.key === "t") {
          e.preventDefault();
          document.getElementById("task-input-today")?.focus();
        } else if (e.key === "l") {
          e.preventDefault();
          document.getElementById("task-input-later")?.focus();
        }
      }

      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (isExpandModalOpen) {
          setIsExpandModalOpen(false);
        } else if (isBriefModalOpen) {
          setIsBriefModalOpen(false);
          setSelectedTaskForBrief(null);
        } else if (isPlanModalOpen) {
          setIsPlanModalOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isHelpModalOpen) {
          setIsHelpModalOpen(false);
        } else if (isStatusPanelOpen) {
          setIsStatusPanelOpen(false);
        } else if (isAskAIModalOpen) {
          setIsAskAIModalOpen(false);
        } else if (
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement
        ) {
          activeEl.blur();
        }
        dismissAllMessages();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isCommandPaletteOpen,
    isExpandModalOpen,
    isBriefModalOpen,
    isPlanModalOpen,
    isSettingsOpen,
    isHelpModalOpen,
    isStatusPanelOpen,
    isAskAIModalOpen,
    dismissAllMessages,
  ]);

  return (
    <DndContext>
      <div className="app-container">
        <SystemNotifications messages={messages} onDismiss={dismissMessage} />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelect={handleCommandSelect}
          tasks={todayTasksForDate}
        />

        {isExpandModalOpen && (
          <ExpandModal
            onClose={() => setIsExpandModalOpen(false)}
            onSuccess={handleExpandSuccess}
          />
        )}

        {isBriefModalOpen && (
          <BriefModal
            onClose={() => {
              setIsBriefModalOpen(false);
              setSelectedTaskForBrief(null);
            }}
            onSuccess={handleBriefSuccess}
            initialContent={selectedTaskForBrief?.title || ""}
          />
        )}

        {isPlanModalOpen && (
          <PlanModal
            onClose={() => setIsPlanModalOpen(false)}
            onSuccess={handlePlanSuccess}
            unfinishedTasks={unfinishedTasks}
            unscheduledTasks={unscheduledTasks}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal onClose={() => setIsSettingsOpen(false)} />
        )}

        {isHelpModalOpen && (
          <HelpModal onClose={() => setIsHelpModalOpen(false)} />
        )}

        {isAskAIModalOpen && (
          <AskAIModal onClose={() => setIsAskAIModalOpen(false)} />
        )}

        {isStatusPanelOpen && (
          <StatusPanel 
            onClose={() => setIsStatusPanelOpen(false)} 
            tasks={tasks}
          />
        )}

        <div className="app-sidebar-column">
          <Sidebar
            tasks={tasks}
            timeBlocks={timeBlocks}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            moveTaskToList={moveTaskToList}
            selectedDate={selectedDate}
          />
        </div>

        <Schedule
          selectedDate={selectedDate}
          timeBlocks={timeBlocks}
          tasks={tasks}
          deleteTimeBlock={deleteTimeBlock}
          updateTimeBlock={updateTimeBlock}
          setDate={setDate}
          scheduleTask={scheduleTask}
          unscheduleTask={unscheduleTask}
        />

        <div className="app-notes-column">
          <Notes
            date={selectedDate}
            notes={notes}
            updateNote={updateNote}
            addTasksBulk={addTasksBulk}
            addMessage={addMessage}
            getNotesInRange={getNotesInRange}
          />
        </div>
      </div>
    </DndContext>
  );
}

export default App;
