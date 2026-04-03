# Workstream 20 — Desktop Executive Glass Parity

> **Status:** Phase 4 + Branding Complete — Phases 5 & 6 remain | **Branch:** main | **Started:** 2026-04-01
> **Benchmark:** `src/v2_shell_GlassFlow.html` + `src/_styles_glassflow_core.html`
> **Target:** `src/WebApp.html` + desktop style chain
> **Deployed:** @643 (2026-04-02)

## ⚡ Agent Handoff — Resume Here

**Phases complete:** 1 ✅ 2 ✅ 3 ✅ 4 ✅ **Branding:** OmniSight ✅ | **Next:** Phase 5 → Phase 6

**Current live app URL:**
`https://script.google.com/macros/s/AKfycby3-IXETAY0YKEIDj3mz_ZPWVKx5ArpTrcskpz71gXPRtBCO8RyPxLg5Hk7kECc-M_h/exec`

**Shell state as of OmniSight Realignment:**
- **Brand:** Desktop name standardized as **OMNISIGHT** (high-density logo mark: `OMNI<span>SIGHT</span>`).
- **Header:** Glassy `backdrop-filter: blur(12px)`, `--desktop-header-height: 56px`, framed card workspace below.
- **Sync actions:** Behind `☰` hamburger FAB (`toggleNavFab()`) in nav-actions.
- **Review Hub trigger:** Restored to the **Floating Admin FAB** (`#admin-fab`) per user sign-off; redundant header button removed.
- **Review Hub panel:** GlassFlow-parity HTML — mini KPI chips, desktop tab strip, `review-hub-panel`/`review-hub-scroll-area` classes.
- **Visual Parity:** `--desktop-shell-radius` updated to **24px** (1:1 with mobile); section titles use `.two-tone-header`.
- **Button Parity:** Header buttons scaled to **42x42px** with **14px radius** and glassy backgrounds.

**Known issues to address in Phase 5:**
1. `--dock-content-offset: 88px` still hardcoded in `_styles_base.html:21` — grep all consumers and migrate to `calc(var(--desktop-header-height) + X)` where needed.
2. Gantt / Grid / Deck views not yet visually validated inside the new shell.
3. Presentation mode: ensure radius parity doesn't clip content in full-screen deck mode.

**How to push + redeploy:**
```bash
/Users/jacobzamarripa.omni/.npm-global/bin/clasp push -f
/Users/jacobzamarripa.omni/.npm-global/bin/clasp deploy --deploymentId AKfycby3-IXETAY0YKEIDj3mz_ZPWVKx5ArpTrcskpz71gXPRtBCO8RyPxLg5Hk7kECc-M_h
```

---

## Strategic Intent

The mobile GlassFlow shell (WS18–19) now has the stronger product language: a unified framed container,
branded header, contextual action model, and coherent shell geometry. The desktop shell has not kept pace.

**Goal:** Port the *clarity principles* of GlassFlow to desktop — not the phone layout. Desktop must retain
its information density and power-user efficiency while inheriting the visual discipline, framed geometry,
and contextual action choreography of the mobile shell.

**Branding (OMNISIGHT):** Mobile handles the "Flow" (updates); Desktop provides the "Sight" (intelligence/oversight).

---

## Token Decisions

| Token | Value | Rationale |
|---|---|---|
| `--desktop-shell-inset` | `16px` | Slightly larger than mobile's 12px — more breathing room on wide screens |
| `--desktop-shell-radius` | `24px` | Updated to 24px for 1:1 parity with mobile curvature |
| `--desktop-shell-shadow` | `0 4px 24px rgba(0,0,0,0.08)` | Softer than mobile's `0 8px 32px` — desktop surface is larger, shadow should recede |
| `--desktop-shell-shadow` (dark) | `0 4px 32px rgba(0,0,0,0.36)` | Stronger in dark mode to maintain depth on near-black bg |
| `--desktop-easing` | `cubic-bezier(0.16, 1, 0.3, 1)` | Same spring contract as GlassFlow — consistent feel across shells |
| `--transition-spring` | `280ms cubic-bezier(0.16, 1, 0.3, 1)` | Snappy interaction feel snappier |
| `--desktop-header-height` | `56px` | Calibrated header height for desktop navigation |

---

### ✅ Phase 4 — Desktop Review Hub & Overlay Modernization
**Completed:** 2026-04-02 | **Status:** Perfect State Restored

**What was done:**
- Re-activated the **Floating Admin FAB** workflow per user directive — provides high-visibility access to review tasks.
- Rewrote `WebApp.html` outbox-pane HTML to match GlassFlow mobile structure exactly (signed off state):
  - Header: title + count badge + close button (top row) + KPI mini chips (`admin-kpi-mini-wrap`) + desktop tab strip (`.ob-desktop-tab-strip`)
  - Removed legacy `admin-strip` with large number KPI cards
  - All 3 panels now use `review-hub-panel` + `review-hub-scroll-area` GlassFlow classes
- CSS overrides in `_styles_layout.html` `@media (min-width:769px)`:
  - `.outbox-pane .review-hub-scroll-area { padding-bottom: 20px !important }`
  - `.ob-desktop-tab` / `.ob-desktop-tab.active` — compact pill tab styles
- `syncReviewHubHeaderCount()` now updates header badge and tab indicators.

---

### ✅ Focused Branding Realignment (OmniSight)
**Completed:** 2026-04-02

**Actions:**
- Standardized the brand name as **OMNISIGHT** across the loader, header, and browser title.
- Deployed high-density `OMNI<span>SIGHT</span>` mark in `src/WebApp.html`.
- Implemented `.two-tone-header` typography for segment titles (Diagnostics Queue, Review Hub).
- Applied header button parity: Theme, Help, and Sync FAB are now uniform 42x42px glassy buttons.
