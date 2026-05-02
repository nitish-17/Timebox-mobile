# Phase 2: The View-Switcher & Gesture Logic

## 2.1 The View Pager
- [x] Implement a `ViewManager` component that wraps the three primary views.
- [x] Use CSS `transform: translateX()` or a lean library (like `framer-motion`) to slide views left/right.
- [x] Optimization: Only mount/render the `activeView` to save memory, or use `display: none` to keep state alive if transitions need to be instant. (Used `AnimatePresence` for smooth transitions).

## 2.2 Mobile Calendar Optimization
- [x] Configure **FullCalendar**:
  - [x] `initialView`: `timeGridDay` (single day is best for 390px screens).
  - [x] Hide headers and use custom React components for "Today" and "Date Range" display.
  - [x] Set `allDaySlot: false` to maximize vertical space for time-blocks.
  - [x] Adjust `slotDuration` for touch-friendly dragging (30min increments).

## 2.3 Bottom Sheets (Modals)
- [x] Replace centered modals with **Bottom Sheets**.
- [x] Trigger for `.` (Status) and `,` (Config).
- [x] Implementation: CSS-only slide-up animation or `vaul` library. (Used `vaul`).
- [x] Ensure tap targets inside sheets are `44x44px`.

## 2.4 Command Palette (FAB)
- [x] Implement a Floating Action Button (FAB) at the bottom-right.
- [x] On tap: Open a full-screen overlay (Command Palette).
- [x] Search/Input should be at the top, but results should be easily reachable by thumb.

## ✅ Phase 2 Validation
- [x] Views transition smoothly without "jank".
- [x] Calendar is readable and interactive on mobile width.
- [x] Bottom sheets handle "pull-to-dismiss" or have clear close buttons.
- [x] FAB correctly triggers the Command Palette logic.
