# Timebox Personal Planner - High-Level System Overview

Timebox is a minimalist, local-first personal planning application designed for deep work and hourly scheduling. It combines task management, calendar visualization, and daily note-taking into a unified, high-performance interface with integrated AI capabilities.

## 1. Project Philosophy & Aesthetic

- **Local-First**: All user data remains in the browser's IndexedDB. No external databases or account systems are required.
- **Terminal Aesthetic**: The UI uses a "Holographic/Terminal" design language, characterized by dark backgrounds, neon accents, and the JetBrains Mono typeface.
- **Minimalist Friction**: Optimized for fast data entry via global keyboard shortcuts and a centralized command palette.

## 2. Core Feature Breadth

### Task Management (Sidebar)

- Dual-list system: **Today** (date-specific) and **Later** (backlog).
- Drag-and-drop support for reordering and calendar scheduling.
- Integrated color-coding and bulk-add capabilities.
- Minimalist header-free layout to maximize vertical task space.

### Visual Scheduling (Main Column)

- Driven by **FullCalendar v6**, providing a precision TimeGrid view.
- Real-time synchronization between task cards and calendar time-blocks.
- Automatic scrolling to the current time and "now" indicator.
- **Text-Only Header**: Integrated date picker (icon-triggered) and minimalist navigation (`< TODAY >`).

### Daily Context (Notes Column)

- Multi-category note system with icon-based navigation.
- **Persistent Notes**: Maintenance, Habits, Fun, Backlog (global state).
- **Transient Notes**: Observation, Tracking, Other (date-specific state).
- Built-in Markdown export for historical logging.

### System Monitoring (Popup)

- **System Status (`.`)**: A dedicated overlay for system metrics and data health.
- **Energy Core**: Dynamic productivity tracking based on user-defined start/end times.
- **Activity Heatmap**: Visual history of task completion frequency.
- **Data Management**: Circular icon-only buttons for JSON backup and restoration.

### AI-Enhanced Workflows

- **Generate Tasks**: AI-assisted deconstruction of complex goals into sequential tasks.
- **Breakdown Task**: Tactical research and "first 15 minutes" guidance for specific missions.
- **Ask AI**: A general-purpose AI brainstormer with templated prompts (# persona, # task, etc.).
- **Auto-schedule**: Automated generation of time-blocks based on priorities and durations.

## 3. Technical Architecture

### Frontend Framework

- **React 19 + Vite + TypeScript**: Modern, type-safe development environment with extremely fast builds.
- **Vanilla CSS**: Performance-focused styling using CSS variables, hardware-accelerated transforms, and strict layout containment.

### Data & State

- **Dexie.js (IndexedDB)**: Robust, reactive local storage. The `useStore` hook orchestrates all database CRUD operations and settings persistence.
- **Live Queries**: Automatic UI updates whenever the underlying database changes.

### Utilities & Integrations

- **date-fns**: Primary engine for time manipulation and range calculations.
- **LM Studio / OpenAI API**: Generic API client for local or remote LLM processing.
- **Floating UI**: Powers precise positioning for the Command Palette, Tooltips, and Modals.

## 4. Key Implementation Details

- **Performance**: High-density lists and scrolling areas optimized via GPU acceleration and render containment.
- **Navigation Shortcuts**:
    - `/`: Command Palette (Generate, Breakdown, Ask AI, Schedule)
    - `.`: System Status (Energy, Heatmap, Backup)
    - `?`: System Manual
    - `n`: Focus Notes
    - `t`: Focus Today's Input
    - `l`: Focus Later Input
    - `,`: Configure AI Settings
    - `Esc`: Close Modals / Clear Focus
- **Portability**: JSON export/import for full environment backup.

## 5. File System Organization

- `/src/components`: UI components categorized by feature (sidebar, schedule, notes, status, heatmap).
- `/src/hooks`: Centralized business logic (state management, AI interaction, planning utilities).
- `/src/db`: Database schema definitions and Dexie initialization.
- `/src/types`: Global TypeScript interfaces defining the core domain entities.
