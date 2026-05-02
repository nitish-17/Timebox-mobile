# Phase 3: Data Migration & Input Optimization

## 3.1 Seamless Data Connection
- [x] Port `db.ts` and ensure the `Dexie` constructor uses the exact same database name as v2.
- [x] Refactor `useStore.ts` to be compatible with the new v3 architecture while preserving all CRUD logic.
- [x] Implement a "Data Sync Status" indicator in the Status Sheet.

## 3.2 Touch-Optimized Inputs
- [x] Update all `<input>` and `<textarea>` styles:
  - [x] `font-size: 16px` (Minimum for iOS).
  - [x] `padding: 12px` (Thumb-friendly).
  - [x] Use `inputmode` (e.g., `inputmode="text"`, `inputmode="numeric"`) to trigger the correct mobile keyboard.
  - [x] Add `autocapitalize="off"` and `autocorrect="off"` for command inputs.

## 3.3 Gesture System
- [x] Implement horizontal swipe detection.
  - [x] Swipe Left: Move to next view (Tasks -> Calendar -> Notes).
  - [x] Swipe Right: Move to previous view.
- [x] Add "haptic-like" visual feedback on successful swipe. (Handled by framer-motion springs).

## 3.4 Accessibility & Scaling
- [x] Create a `--font-scale` CSS variable.
- [x] Add a slider in the Config Sheet to adjust this variable.
- [x] Ensure all UI elements use `rem` based on this scale.

## ✅ Phase 3 Validation
- [x] Changing data in v2 reflects in v3 (and vice-versa).
- [x] No "auto-zoom" occurs when focusing any input field.
- [x] Swipe gestures feel responsive and don't conflict with vertical scrolling.
- [x] Font scaling correctly updates the entire UI without breaking the layout.
