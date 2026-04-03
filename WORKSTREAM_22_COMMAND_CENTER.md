# Workstream 22 — Command Center & Production Leaderboard

> **Status:** Phase 3 complete — Phases 4 and 5 remain | **Branch:** main | **Started:** 2026-04-02
> **Primary files:** `src/_module_command_view.html`, `src/_module_router.html`, `src/WebApp.html`, `src/_styles_badges.html`, `src/02_Utilities.js`, `src/_state_payload.html`, `src/_state_session.html`
> **Goal:** Ship a first-class audit workspace that unifies DB/system logs while preserving stable workspace switching and accurate production leaderboard analytics.

## Current State
- Phase 1 introduced a unified command feed that combines database logs and backend system logs into one chronological workspace.
- Phase 2 added the inspector panel for FDH, user, and date-level audit deep dives.
- Phase 3 integrated command-specific dock controls and view routing into the shared shell.
- The previous Morning Brief widget has been retired; its surviving production leaderboard concept now lives in the Command Center shoulder.

## Remaining Scope
### Phase 4 — Production Leaderboard Logic Refinement
- [ ] Verify "Lifetime" mileage totals against the real hybrid stats source
- [ ] Fix "Current" timeframe so it reflects the latest valid production day rather than a naive today-only assumption
- [ ] Validate fuzzy header matching and date bucketing behavior in `getVendorHybridStats`
- [ ] Confirm the leaderboard does not regress existing digest analytics

### Phase 5 — Terminal Feed Polish & Infinite Scroll Optimization
- [ ] Refine row density, event hierarchy, and field-flow readability in the command terminal
- [ ] Decide whether the feed should remain capped at 300 rows or move to incremental/infinite rendering
- [ ] Verify command-view dock replacement behaves correctly when switching among detail, grid, gantt, and command
- [ ] Run a regression pass on workspace switching so command-mode logic cannot break all views again

## Definition Of Done
- [ ] Leaderboard data is correct for lifetime and current windows
- [ ] Command Center can be entered and exited without workspace regressions
- [ ] Inspector interactions are stable and visually coherent
- [ ] Terminal feed remains performant with large audit histories

## Constraints
- Keep Command Center logic isolated to its module and router/view orchestration paths
- Do not reintroduce the retired Morning Brief widget as a separate floating tool
- Treat workspace switching as high-risk: any router changes require a full detail/grid/gantt/slide/command pass
