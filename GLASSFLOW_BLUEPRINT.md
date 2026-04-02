# The GlassFlow Blueprint: Mobile-to-Desktop Parity Guide

## 1. Core Philosophy: The "Station" Model
The mobile app succeeds because it treats each view as a **Station**—a focused, high-density environment where all necessary controls are within a "thumb's reach." On desktop, we must translate this from "thumb-reach" to "minimal eye-travel."

### Key Principles:
- **Visual Transparency (Glass):** Deep use of `backdrop-filter: blur` and `color-mix` to create depth without using heavy borders.
- **Spring Physics:** All transitions use `cubic-bezier(0.16, 1, 0.3, 1)` to feel organic and responsive.
- **Information Layering:** Secondary data is hidden in "Peeks" or "Drawers" rather than dedicated page real estate.

## 2. The Admin Hub Benchmark
Distilled from `v2_shell_GlassFlow.html` and the successful mobile screenshots:

### A. Unified Header (High-Density)
- **Status at a Glance:** The header doesn't just name the tab; it provides a live total of "Tasks Remaining" (`ob-header-count`).
- **Integrated KPIs:** Mini-cards (Crossings, Status, BOMs) are not massive separate boxes (like the old desktop `admin-strip`); they are high-density "chips" with clear SVG icons and vibrant status colors.
- **Tab Mobility:** Tab switching is frictionless and doesn't reload the content container, using shared state to maintain scroll position.

### B. List Card Anatomy
- **14px Standard:** All list items (Admin tasks, Queue items) use a strict 14px horizontal padding and 16px vertical padding.
- **Hierarchy:** FDH (ID) is the anchor, followed by high-contrast metadata (City, Vendor) and a dim, italicized "Next Action" hint.
- **Action Proximity:** "Verify" or "Update" buttons are right-aligned and use high-contrast backgrounds (Blue/Green) to signal completion.

## 3. Surgical Desktop Alignment Strategy
Instead of full-page rewrites, we apply these "GlassFlow" injectors to the desktop sidebar:

### Phase 1: The "Station" Header
- **Target:** `src/WebApp.html` `#review-hub-main-header`.
- **Action:** Replace 3-tab badges with a single, unified "Header Count." Standardize on the 52px compact row height.

### Phase 2: KPI Mini-Grids
- **Target:** `src/_styles_glassflow_core.html`.
- **Action:** Extract the `.admin-kpi-mini` grid logic into a universal class that can sit inside the desktop sidebar without "exploding" the width.

### Phase 3: The Backdrop Standard
- **Target:** `src/_styles_layout.html`.
- **Action:** Inject the `24px` blur and `94%` card-bg standard into all desktop side-panels to match the mobile "Glass" feel.

---
*Document created on 2026-04-02 to guide WS20 restoration and future alignment.*
