# Timebox Mobile (Solo Leveling Edition)

A specialized mobile-first PWA port of the Timebox application, featuring an immersive "Solo Leveling" system aesthetic.

## 🛠 Tech Stack
- **Framework:** React + TypeScript (Vite)
- **Persistence:** Dexie.js (IndexedDB) with `dexie-react-hooks` for reactive state.
- **Styling:** Vanilla CSS + Tailwind-like utility classes (integrated via PostCSS).
- **Animations:** Framer Motion (System notifications, view transitions).
- **Icons:** Lucide React.
- **Calendar:** FullCalendar (TimeGridDay) with interaction/drag-and-drop plugins.
- **Components:** Vaul (Drawer) for mobile-first bottom sheets.

## 🏗 Core Architecture

### Persistence & State Management
- **Reactive Storage:** The app uses `useLiveQuery` from Dexie to create a reactive bridge between IndexedDB and React components.
- **`useStore` Hook:** Centralizes all database operations. It handles task management, time-blocking, system notes, and global settings (date, energy, UI scale).
- **Schema Versions:**
  - `v1`: Initial tasks, timeBlocks, notes (date-based), and settings.
  - `v2`: Migration from transient notes to `systemNotes` with advanced filtering (`type+date` index).

### Timeline & Scheduling Logic
- **15-Minute Granularity:** All calendar operations (snapping, resizing, default duration) are locked to 15-minute increments.
- **Midnight Boundary:** Auto-scheduling logic (`bulkScheduleDetailed`) includes a hard stop at 12:00 AM. Tasks cannot spill into the next day.
- **Dynamic Scrolling:** The calendar automatically scrolls to the current time with an 80px offset for immediate visibility.

### UI System (Solo Leveling Aesthetic)
- **Glassmorphism:** Calendar cards use a specialized glass effect (`fc-event-glass-container`) with backdrop blur and dynamic "aura" borders based on task color.
- **Energy System:** A global energy bar that decays from "Peak" to "Minimum" based on user-defined biological clock settings.
- **Hidden Menu:** Accessed via the top-right "v" button. Contains UI scaling, energy config, backups (JSON import/export), and "System" protocols (database purge).

## 🚀 Key Features

### Task Management
- **Quick Add:** Supports sequential batch entry—the sheet remains open after pressing Enter to allow rapid task creation.
- **Multi-Select Mode:** Triggered by long-press or tap in task views. Supports batch scheduling, batch color updates (Aura Palette), and bulk deletion.
- **Auto-Schedule:** Intelligently plans selected tasks sequentially with configurable recovery gaps, respecting the 12:00 AM limit.

### System Notifications
- **XP Feedback:** Completing a task triggers a "QUEST CLEARED" system notification with XP gain feedback.
- **Solo Leveling Parity:** Notification types include `QUEST_CLEARED`, `LEVEL_UP`, and `SKILL_AWAKENED`.

## 📜 Development Conventions
- **Component Placement:** 
  - `Common/`: Reusable UI primitives.
  - `Navigation/`: App-shell elements (Header, Nav, Notifications).
  - `Sheets/`: Bottom sheets and popups (Vaul/Framer-based).
  - `Views/`: Major view-port implementations (Tasks, Calendar, Notes).
- **Styling:** Prefer updating `App.css` or scoped CSS-in-JS (for FullCalendar overrides) over adding complex Tailwind configuration.
- **Database Transactions:** Always use `db.transaction` for operations affecting multiple tables (e.g., deleting a task and its associated time-blocks).

## ⚠️ Maintenance Protocols
- **Database Purge:** Located in the Hidden Menu -> System tab. Securely deletes the IndexedDB instance and reloads the app.
- **Backups:** Use the "Synchronize Core" feature to migrate data between desktop (Timebox-v2) and mobile ports via JSON.
