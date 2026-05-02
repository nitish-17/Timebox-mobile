# Phase 4: Feature Porting & AI Integration

## 4.1 Task View Implementation
- [x] Port `TaskList` logic: Separate "Today" and "Later" lists.
- [x] Port Task Item components: Complete/Toggle, Delete, and Color-coding.
- [x] Implement the "Bulk Add" input for mobile.
- [x] Connect the "Energy Core" progress bar to real-time task completion.

## 4.2 Note View Implementation
- [x] Port the Note Category switcher (Maintenance, Habits, etc.).
- [x] Implement the persistence logic for date-specific vs. global notes.
- [x] Ensure the `<textarea>` handles mobile keyboard resizing correctly without breaking the shell.

## 4.3 Calendar View Logic
- [x] Replace mock data with real `timeBlocks` from `useStore`.
- [x] Implement event dragging and resizing for touch. (Basic drag support enabled).
- [x] Port the "Today" and "Date Navigation" logic.

## 4.4 AI & Command Palette
- [x] Port `useAI.ts` and `usePlanningUtils.ts` logic.
- [x] Connect the Command Palette buttons to:
  - [x] `GenerateTasks` (Goal deconstruction).
  - [x] `BreakdownTask` (Tactical research).
  - [x] `AskAI` (Brainstormer).

## ✅ Phase 4 Validation
- [x] Tasks can be created, completed, and moved between lists.
- [x] Notes are saved correctly across categories and dates.
- [x] Calendar accurately reflects the user's schedule.
- [x] AI commands successfully generate content and interact with the DB.
