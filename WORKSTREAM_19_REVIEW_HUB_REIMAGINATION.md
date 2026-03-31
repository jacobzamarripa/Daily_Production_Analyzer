# WORKSTREAM 19 — Review Hub Reimagination (Square One)

> **Status:** Planning Handoff
> **Philosophy:** "Ground-up redesign. High tactile density. Mobile-native interaction."

## 🎯 The Vision
The Review Hub needs a radical departure from the "floating card" layout. It should feel like a dedicated "Station" within the app, utilizing full-screen real estate or highly-integrated sliding surfaces that don't feel detached from the shell.

---

## 🛠️ Implementation Plan (Unstarted)

### Phase 1 — Spatial Refactoring
**Goal:** Establish a new physical presence for the Hub.
- [ ] Refactor `.outbox-pane` geometry to be a full-height bottom sheet or side-drawer that physically displaces or overlaps the queue with native-feeling momentum.
- [ ] Fix the masking/padding issues where scrollable content feels "cut off" or detached from its container.
- [ ] Unify the background blur and saturation (Executive Glass) to match the premium feel of the dock.

### Phase 2 — Admin Hub (Re-reimagined)
**Goal:** High-density task management.
- [ ] **Header Integration:** Move KPI filters into a dedicated sub-header or utility bar that stays sticky at the top.
- [ ] **Icon Restoration:** Ensure all filters have high-quality SVG icons for quick scanning.
- [ ] **Persistent Utilities:** Make the "Crossing to Verify" section a permanent resident of the Admin tab, perhaps as a top-docked tray.
- [ ] **Card Design:** Abandon the legacy card style for a denser, more list-oriented approach with "Actionable Rows".

### Phase 3 — Reviewed Hub (Visual Distinction)
**Goal:** Absolute clarity on what is staged vs. what is finished.
- [ ] Implement high-contrast, labeled sections for "Staged for Export" and "Finalized Reviews".
- [ ] Add "Action Strips" to section headers (Batch Export, Clear All) to reduce vertical clutter within the list.
- [ ] Use visual cues (glows, specific accents) to distinguish Staged items from Reviewed ones.

### Phase 4 — Activity Hub (Extreme Compaction)
**Goal:** Handle high log volume without scrolling fatigue.
- [ ] Transition from cards to a dense "Feed" style view.
- [ ] Remove redundant "Go to Project" buttons (trigger navigation from the row itself).
- [ ] Use iconography to represent event types (Updates, Syncs, Flags) instead of text labels.
- [ ] Implement a two-line summary limit with tap-to-expand logic for long change values.

---

## 📋 Smoke Test Checklist (Future)
- [ ] Entire Hub surface feels like a native part of the GlassFlow shell.
- [ ] No "masking" artifacts or strange whitespace gaps at the edges.
- [ ] Tabs switch instantly with tactile feedback.
- [ ] Activity feed is legible even with 100+ entries.
- [ ] Swipe-to-dismiss is consistent across the entire Hub station.
