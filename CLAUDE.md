# Omni PMO App - AI Coding Guidelines

## Tech Stack
* **Environment:** Google Apps Script (V8 Runtime).
* **Frontend:** Vanilla HTML, CSS, and ES6 JavaScript served via `HtmlService`. No external bundlers (Webpack/Vite) are currently used.
* **Backend:** Standard `.js` (Apps Script) files.
* **Database:** Google Sheets (`Master_Archive`, `Reference_Data`) synced with QuickBase APIs.

## Architecture Rules
1. **No Node.js:** Do not suggest `npm install`, `require()`, or standard Node.js modules. Use `UrlFetchApp` for HTTP requests, `SpreadsheetApp` for database operations, and `CacheService` for caching.
2. **Frontend Modifications:** `WebApp.html` and `MobileApp.html` are massive files. When making CSS/JS changes, search for existing `:root` variables and reuse them. Do not duplicate CSS classes.
3. **Date Handling:** QuickBase sends dates with midnight timestamps (e.g., `00:00:00 GMT-0600`). Always normalize these on the frontend using standard UTC-locked formatting utilities to avoid timezone shifting bugs.
4. **Z-Index Standards:** * Modals/Widgets (Calculator, Calendar, Digest): `999990` - `999999`
   * Nav/Dock: `10000` - `20000`
   * Floating Pills: `3000`
   * Deck/Cards: `5` - `100`

## Error Handling & Logging
* Use the custom `logMsg()` function in `00_Config.js` instead of `console.log()` for backend logic, as it writes directly to the `System_Logs` sheet.

## Recent UI / Workflow Lessons
1. **Tracker-linked projects:** The real frontend signal for vendor-tracker-linked projects is the engine output in `Field Production`, specifically `[📡 Tracker Linked]`. Do not assume DRG/Direct Vendor columns are the source of truth when the engine already computed tracker linkage.
2. **Tracker override behavior:** Vendor tracker data is already triangulated in `01_Engine.js` and can override baseline database assumptions during Daily Review generation. When adding frontend indicators, follow the review output the engine writes, not a guessed sheet flag.
3. **Frontend tracker pills:** For tracker visibility, prefer a reusable frontend pill keyed off the actual payload state. Keep the pill consistent across queue cards, grid cards, and detail headers.
4. **Diagnostic flag styling:** Engine flags may include emoji markers like `🔵 OFS`, `🟢 COMPLETE`, or `⚪ ON HOLD`. Shared frontend cleaners/tag classifiers must recognize and strip those cleanly so badges do not render as broken `?` icons.
5. **Layout changes:** When the request is for more breathing room around cards or panels, adjust viewport/container spacing first. Do not change internal module padding, card proportions, or aspect-ratio behavior unless the user explicitly asks for that.
6. **Detail vs. deck sizing:** Treat detail cards and deck slides separately. A change that works for the 16:9 deck slide may be wrong for the variable-height detail card.
7. **Admin panel spacing:** The admin/review panel is not anchored the same way as the Diagnostics Queue. If the goal is viewport padding, add spacing on the panel container itself rather than assuming dock padding will affect it.
8. **Bottom dock behavior:** When the dock moves to the bottom (notably in Gantt view), dropdown menus should open upward and floating filter pills should anchor above the dock.
9. **Gantt interactions:** Clicking a timeline item should be treated as both a navigation/open action and a focus action when the user asks for focus mode behavior.
10. **Before changing visuals:** Verify whether the user wants a larger component, more viewport margin, more internal padding, or a different aspect ratio. Those are not interchangeable.

## Safe Defaults For Future Changes
* Prefer using existing engine-generated markers over introducing new parallel flags.
* Reuse existing CSS variables and shared pill/tag helpers before adding one-off inline styles.
* For large layout tweaks, make the smallest possible change first and verify whether the issue is container spacing, internal spacing, or sizing constraints.
* In Gantt mode, assume dock behavior may need to invert vertically compared with top-dock detail mode.

## File Map
> Agent navigation index. Read this before opening any file.
> Last updated: [DATE]

### How to Use This Map
- Check **Agent Notes** before editing any file
- Check **Mobile Notes** if touching layout or event handling
- `QB_USER_TOKEN` lives in Script Properties only — never in frontend code
- `Master_Archive` and `Reference_Data` are read-only from the frontend
- `writebackQBDirect()` is guarded by early return — do not remove the guard
- When in doubt about tracker state, trust the engine output in `01_Engine.js` — not sheet flags
- Reuse existing `:root` CSS variables — do not duplicate classes or add one-off inline styles

---

### Backend — Core / Read First

| File | Role | Agent Notes |
|---|---|---|
| `00_Config.js` | Global constants, sheet names, formatting helpers, shared backend utility primitives | Read before touching any backend file. Sheet name constants live here — never hardcode sheet names elsewhere. |
| `01_Engine.js` | Daily review engine, archive parsing, vendor/ref lookups, mirror-sheet generation | Source of truth for tracker linkage and engine flags (`🔵 OFS`, `🟢 COMPLETE`, etc.). Do not replicate its logic in frontend. |
| `02_Utilities.js` | GAS entrypoints, HtmlService routing, web-app bridges, exports, utility workflows | Contains `doGet()` routing to `WebApp.html` vs `MobileApp.html`. Touch when adding new server-exposed functions. |
| `03_Analytics.js` | Historical benchmark and milestone timeline generation | Isolated — safe to edit without reading other backend files. |
| `05_CDAnalyzer.js` | Gemini/CD analysis workflows, AI narrative generation | Gemini entry points only. Do not hardcode model strings — pull from `00_Config.js`. |
| `06_QBSync.js` | QuickBase sync, change-log import, crossings queue staging, guarded writeback stub | Read QB guard comment before touching writeback. CSV export path only — no direct QB writes from frontend. `QB_USER_TOKEN` via Script Properties only. |

---

### Frontend — Shells

| File | Role | Agent Notes | Mobile Notes |
|---|---|---|---|
| `WebApp.html` | Desktop HtmlService shell and current monolithic frontend runtime | **Massive file.** Search for existing `:root` variables before adding CSS. Do not duplicate classes. When extracting partials, use `<?!= include('filename') ?>`. | Desktop-only layout assumptions — flag any px widths before mobile work |
| `MobileApp.html` | Mobile HtmlService app surface for narrow viewport routing | Routed from `02_Utilities.js` doGet(). Treat as separate surface from `WebApp.html` — changes that work on desktop may break mobile. | Primary mobile surface — touch targets, font sizes, and bottom dock behavior live here |
| `Sidebar.html` | Sidebar dashboard view, anomaly cards, lightweight filtering | Isolated — safe to edit independently | N/A |
| `DatePicker.html` | Modal date-picker partial used by GAS dialogs | Isolated modal — z-index range `999990–999999` | N/A |

---

### Frontend — Partials & Registry

| File | Role | Agent Notes | Mobile Notes |
|---|---|---|---|
| `_registry.html` | Declarative registry of data-layer boundaries, guarded integrations, shared frontend state names | **Read first before any data logic.** Loaded before all other partials. | N/A |

---

### Documentation

| File | Role |
|---|---|
| `CLAUDE.md` | This file — agent navigation index and coding guidelines |
| `WORKSTREAM_0_NOTES.md` | Checkpoint note for foundation workstream and preserved assumptions |

---

### Data Layer Boundaries (Critical)
```
QuickBase (system of record)
    ↓  read-only sync via 06_QBSync.js
Reference_Data sheet (GAS mirror — READ ONLY)
    ↓  read-only to frontend
Master_Archive sheet (working data)
    ↑  engine writes here via 01_Engine.js
    ↓  verified rows queue to →
Crossings queue staging → CSV export → manual QB entry
CD Analyzer → writes via 05_CDAnalyzer.js only
```

---

### Z-Index Standards

| Layer | Range |
|---|---|
| Modals / Widgets (Calculator, Calendar, Digest) | `999990 – 999999` |
| Nav / Dock | `10000 – 20000` |
| Floating Pills | `3000` |
| Deck / Cards | `5 – 100` |

---

### Agent Quick Reference

| I want to... | Start by reading... |
|---|---|
| Add a new `google.script.run` call | `_registry.html`, `02_Utilities.js` |
| Add a tracker indicator or pill | `01_Engine.js` output first, then `WebApp.html` pill/tag helpers |
| Change QB writeback behavior | `06_QBSync.js`, `_registry.html` |
| Add a Gemini feature | `05_CDAnalyzer.js`, `00_Config.js` |
| Change global styles / tokens | Search `:root` in `WebApp.html` or `MobileApp.html` — reuse, don't duplicate |
| Work on Gantt | `WebApp.html` Gantt section + bottom dock inversion rules (see Safe Defaults) |
| Add an admin/review panel feature | `WebApp.html` admin section — note panel is not anchored like Diagnostics Queue |
| Take a feature mobile | `MobileApp.html` + bottom dock upward-open behavior |
| Add a new backend utility | `00_Config.js` for constants, `02_Utilities.js` for GAS entrypoint |
| Debug engine flags or tracker state | `01_Engine.js` — do not guess from sheet columns |
| Add logging | Use `logMsg()` in `00_Config.js` — never `console.log()` for backend |
