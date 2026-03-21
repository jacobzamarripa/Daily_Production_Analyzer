// ============================================================
// FILE: WORKSTREAM_0_NOTES.md
// ROLE: Checkpoint note describing Workstream 0 foundation changes, preserved assumptions, and handoff state for Workstream 1.
// DEPENDS ON: _registry.html, 02_Utilities.js, WebApp.html, CLAUDE.md
// DEPENDED ON BY: Engineers and agents validating the staged refactor sequence.
// MOBILE NOTES: Notes the GAS-specific route and bridge assumptions preserved at the foundation layer.
// AGENT NOTES: Read this after CLAUDE.md to understand what was intentionally changed, what was left untouched, and what is next.
// ============================================================

# Workstream 0 Checkpoint
> Last updated: March 21, 2026

---

## What Was Done (Workstream 0)

### Originally completed — preserved verbatim:
- Added shared `include(filename)` helper in `02_Utilities.js`.
- Added `_registry.html` and included it first in `WebApp.html`.
- Updated `CLAUDE.md` with an initial `## File Map`.
- Left the desktop monolith intact; no function signatures, globals, or `google.script.run` names changed.
- Known pre-existing issue preserved: `doGet(view=codex)` still references `CodexMobileApp`, which is not present in this workspace.

### Additional work completed as of March 21, 2026:
- `CLAUDE.md` File Map expanded to full agent navigation index with Agent Notes, Mobile Notes, and Agent Quick Reference table.
- `MobileApp.html` routing from `doGet()` confirmed working.
- `05_CDAnalyzer.js` Gemini calls confirmed working.
- `06_QBSync.js` QB writeback guard confirmed intact — CSV export path only, no direct QB writes.
- `_registry.html` confirmed loaded and functional.

---

## Confirmed Working Post-Workstream 0
- `_registry.html` — loaded first in `WebApp.html`, data-layer boundaries declared
- `MobileApp.html` — routing from `doGet()` confirmed
- `05_CDAnalyzer.js` — Gemini calls working
- `06_QBSync.js` — writeback guard intact

---

## Known Issues Carried Forward
- `doGet(view=codex)` references `CodexMobileApp` which is not present in this workspace — do not resolve without deliberate decision
- `WebApp.html` remains monolithic — partial extraction is Workstream 1
- Tab fullscreen bleed-through — root cause not yet isolated, do not move tab code until diagnosed

---

## Preserved Assumptions (Do Not Override Without Deliberate Decision)

### Data Layer
- `Reference_Data` sheet is **read-only** — no frontend or engine writes to it
- `Master_Archive` is the working data layer — engine writes here via `01_Engine.js`
- `writebackQBDirect()` in `06_QBSync.js` is **guarded by early return** — guard must not be removed
- `QB_USER_TOKEN` lives in **Script Properties only** — never in frontend code or committed files
- CD Analyzer writes to its target sheet via `05_CDAnalyzer.js` only

### Engine Authority
- Tracker linkage state is computed in `01_Engine.js` — frontend reads engine output, not sheet columns
- Engine flags (`🔵 OFS`, `🟢 COMPLETE`, `⚪ ON HOLD`) must be stripped by shared frontend cleaner — not one-off inline handling
- Do not introduce parallel flag logic that duplicates what the engine already computes

### Frontend Conventions
- All CSS changes must search for existing `:root` variables first — do not duplicate classes
- `WebApp.html` and `MobileApp.html` are separate surfaces — changes on one are not assumed to work on the other
- Z-index ranges are fixed — do not add layers outside defined ranges without updating `CLAUDE.md`
- `logMsg()` in `00_Config.js` is the only approved logging method for backend — no `console.log()`
- `doGet()` routing lives in `02_Utilities.js` — any new app surface must be registered there and documented in `CLAUDE.md`

---

## Next — Workstream 1: WebApp.html Partial Extraction

### Goal
Decompose `WebApp.html` into named partials using `<?!= include('filename') ?>`
directives without changing any function signatures, variable names, or
`google.script.run` API surface.

### Extraction Order (Lowest → Highest Risk)

**Phase 1 — CSS (zero JS coupling)**
- `_styles_base.html` — `:root` variables, resets, typography
- `_styles_layout.html` — grid, flex, page-level containers
- `_styles_components.html` — tabs, cards, badges, buttons, modals
- `_styles_gantt.html` — Gantt-specific styles, resizable split panel

**Phase 2 — Utility JS (no DOM dependencies)**
- `_utils_shared.html` — formatters, date helpers, pure functions only
- `_utils_notifications.html` — badge logic, toasts, error display

**Phase 3 — Data Layer JS (depends on `_registry.html` only)**
- `_data_layer.html` — all `google.script.run` calls consolidated

**Phase 4 — Feature Modules (one at a time, verify after each)**
- `_module_cd_analyzer.html`
- `_module_special_crossings.html`
- `_module_qb_sync.html`
- `_module_admin.html`
- `_module_tabs.html` — do not extract until fullscreen bleed-through is diagnosed
- `_module_gantt.html` — highest risk, extract last

### Agent Rules for Workstream 1
- Do not change any function signatures, variable names, or `google.script.run` call signatures
- Add the standard file header block to every extracted partial (format in `CLAUDE.md`)
- Verify app loads and extracted feature works after each extraction before proceeding
- Flag tightly coupled global state with `// TODO: HIGH RISK` — do not refactor, leave in place
- Gantt ↔ Row Header coupling is known high-risk — extract Gantt last
- Bottom dock inverts in Gantt view — dropdown menus open upward, pills anchor above dock

### Open Decisions to Resolve During Workstream 1
- [ ] Audit which partials were already extracted — update File Map in `CLAUDE.md` before starting
- [ ] Decide whether `WebApp.html` shell becomes a thin include-only file or retains inline logic
- [ ] Diagnose tab fullscreen bleed-through before extracting `_module_tabs.html`
- [ ] Confirm Gantt resizable split scope — Workstream 1 or separate workstream?
- [ ] Resolve `CodexMobileApp` reference — stub, remove, or build?