# Timebox-v3: Master Implementation Plan

This document outlines the strategic roadmap for refactoring **Timebox-v2** into a mobile-only PWA (**Timebox-v3**). The core objective is to retain the functional power of v2 while radically optimizing the interface for thumb-driven, single-column interaction.

## 🏛 Architectural Vision
- **Logic Continuity**: Direct port of Dexie.js schemas and AI utility logic from v2.
- **Mobile-First Layout**: A strict `100dvh` shell with a view-switcher rather than a multi-column desktop layout.
- **Data Sovereignty**: Shared IndexedDB instance between v2 and v3 to ensure zero-friction migration for the user.

## 🛣 Phase Roadmap

### Phase 1: Environment Analysis & Shell Setup
- **Objective**: Establish the foundation. Map the v2 source and scaffold the v3 React/Vite environment.
- **Key Outputs**: Analysis report of v2 types/DB, initialized v3 project, and the basic App Shell with Bottom Navigation.
- **Verification**: App runs on mobile emulator; bottom nav switches internal state.

### Phase 2: The View-Switcher & Gesture Logic
- **Objective**: Translate desktop paradigms to mobile.
- **Key Outputs**: View pager (Tasks | Calendar | Notes), Mobile-optimized FullCalendar, Bottom Sheet modals, and the Floating Action Button (FAB).
- **Verification**: Smooth transitions between views; "Thumb-friendly" tap targets; Modals slide up from bottom.

### Phase 3: Data Migration & Input Optimization
- **Objective**: Finalize logic and polish UX.
- **Key Outputs**: Shared `useStore` hook, 16px+ touch-optimized inputs, swipe-to-switch gestures, and font scaling system.
- **Verification**: Data persists between v2 and v3; No browser "auto-zoom" on focus; Gestures feel native.

### Phase 4: Feature Porting & AI Integration
- **Objective**: Port functional UI and AI logic.
- **Key Outputs**: Fully functional Task/Note/Calendar views and working Command Palette.
- **Verification**: App achieves functional parity with v2 but optimized for mobile.

## 🛠 Engineering Standards
- **Style**: Vanilla CSS with v2 variable inheritance.
- **Typing**: Strict TypeScript, mirroring v2 interfaces.
- **Performance**: Minimize re-renders in the single-column view; leverage GPU for transitions.
