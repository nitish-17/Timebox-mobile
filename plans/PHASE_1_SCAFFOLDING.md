# Phase 1: Environment Analysis & Shell Setup

## 1.1 Source Code Audit (v2)
- [x] **Database**: Analyze `Timebox-v2/src/db/db.ts`. Confirm DB name and versioning strategy.
- [x] **Types**: Extract core interfaces from `Timebox-v2/src/types`.
- [x] **Hooks**: Analyze `Timebox-v2/src/hooks/useStore.ts` to understand how Dexie queries are wrapped.
- [x] **Styles**: Identify global CSS variables in `Timebox-v2/src/index.css` for aesthetic parity.

## 1.2 Scaffolding v3
- [x] **Initialize**: `npm create vite@latest . -- --template react-ts`.
- [x] **Install Dependencies**:
  - `dexie`, `dexie-react-hook`
  - `date-fns`
  - `@fullcalendar/react`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`
  - `lucide-react` (for mobile-friendly icons)
  - `clsx`, `tailwind-merge` (optional, for class management)
- [x] **Structure**:
  - `/src/components/Navigation`: BottomNav, FAB.
  - `/src/components/Views`: TaskView, CalendarView, NoteView.
  - `/src/components/Sheets`: StatusSheet, ConfigSheet.

## 1.3 Mobile App Shell (`App.tsx`)
- [x] **Layout**:
  - Root container: `height: 100dvh`, `overflow: hidden`.
  - Content area: `flex-grow: 1`, `overflow-y: auto`.
  - Navigation: Fixed at bottom.
- [x] **State Management**:
  - `activeView`: 'tasks' | 'calendar' | 'notes'.
  - Persistent storage of last active view.

## 1.4 Baseline Aesthetic
- [x] Port `variables.css` from v2.
- [x] Implement the "Terminal" dark mode as the default.
- [x] Set global `touch-action: manipulation` to prevent double-tap zoom delay.

## ✅ Phase 1 Validation
- [x] v2 schema is fully mapped.
- [x] v3 dev server starts without errors.
- [x] Bottom Navigation toggles the `activeView` state.
- [x] Layout remains fixed at `100dvh` on mobile resize.
