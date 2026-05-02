# Project: Timebox-v3 (Mobile-Only)

## 🎯 Primary Goal

The objective is to refactor the **Timebox-v2** personal planner into a high-performance, mobile-only PWA. The design must be thumb-driven and optimized for a single-column, small-screen experience (target width: 390px–430px). I want to retail most of the logic and look and feel of the existining implementation i.e., the **Timebox-v2**.

## 🏗️ Architecture & Context

- **Reference Code**: All core logic, database schemas, and AI utilities are located in the `./Timebox-v2` sub-folder.
- **Tech Stack**: React 19, Vite, TypeScript, and Dexie.js (IndexedDB).
- **Data Strategy**: Maintain local-first data sovereignty. v3 should ideally interface with the same IndexedDB as v2 to ensure a seamless data transition.

## 📱 Mobile-Only Design Principles

- **Single-Column Navigation**: Replace the 3-column desktop layout with a view-switcher (Tasks | Timeline | Notes).
- **Thumb-First UI**:
  - All primary buttons must have a minimum tap target of **44x44px**.
  - Use a **Bottom Navigation Bar** for primary views.
  - Use **Bottom Sheets** (slide-up modals) for popups like Status (`.`) and AI Config (`,`).
- **Typography & Scaling**:
  - Use `rem` for all font sizes to support user-driven scaling.
  - Input fields must have a font size of at least `16px` to prevent automatic browser zooming.

## ⌨️ Shortcut Mapping (Touch Equivalents)

Since physical keys are unavailable, implement the following touch-based triggers:

- **Floating Action Button (FAB)**: Trigger the Command Palette (`/`).
- **Bottom Nav Icons**:
  - **Status Icon**: Replaces `.` (System Status/Energy).
  - **Config Icon**: Replaces `,` (AI Settings).
  - **Help Icon**: Replaces `?` (System Manual).

## 🛠️ Development Standards

- **Modular Structure**: Keep components separate (e.g., `/Navigation`, `/Views`, `/Actions`).
- **CSS Strategy**: Use `100dvh` (Dynamic Viewport Height) for the app shell to handle mobile browser toolbars correctly.
- **Strict Typing**: Maintain TypeScript interfaces defined in v2.
