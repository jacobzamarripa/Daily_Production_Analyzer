# Dailies Command Center
## UI/UX & Performance Overhaul — Unified Implementation Brief

> **Revision:** Consolidated | Files: `WebApp.html` · `02_Utilities.js` · `01_Engine.js` · `06_QBSync.js`

---

## 1. Executive Summary

This brief drives a total architectural and aesthetic reimagining of the Daily Production Analyzer. The fragmented, tab-based interface is being replaced with a **Unified Single-Panel System**. Three primary objectives govern the overhaul:

- **Elevate administrative visibility** by surfacing Admin Tasks as permanent, pinned call-out cards.
- **Achieve a refined "hairline" aesthetic** — all dividers and resize handles must be 1px + drop shadow. No thick bars.
- **Improve performance** via server-side caching, DOM reduction, and client-side date formatting.

> ⚠️ **CRITICAL:** Execute all phases in strict order: **0 → 1 → 2 → 3**. Do not begin a phase until the prior phase is confirmed stable.

---

## 2. Affected Files

| File | Phases |
|---|---|
| `WebApp.html` | Phases 0A, 0B, 0C, 0D, 0E, 0F, 2A, 2B, 2C, 3A–3H — all UI/CSS/JS structural changes |
| `02_Utilities.js` | Phase 1A (cache + invalidation), 1B (formatDate loop), 1C (safeRawRow payload pruning); also `markAdminCheckComplete`, `verifySpecialCrossings`, `markStatusSyncComplete` |
| `06_QBSync.js` | Phase 1A cache invalidation in `commitToQueueWebApp` and `syncFromQBWebApp` |
| `01_Engine.js` | Phase 1A cache invalidation in `generateDailyReviewCore` |

---

## 3. Design Language & Global Constraints

### Hairline Rule *(applies everywhere)*

All section dividers, resize handles, and panel borders must follow this exact pattern:

```css
border: 1px solid rgba(0,0,0,0.08);
box-shadow: 0 1px 3px rgba(0,0,0,0.06);
```

Cursor must change to `row-resize` on hover of any resizable hairline. No chunky drag affordances.

### Caps Lock Rule

Only FDH Engineering IDs (e.g., `WO01-F15`, `KEN02-F03`) should be rendered in ALL-CAPS. All other headers, labels, and section titles must use proper case or small-caps.

### iPad / Responsive Compatibility

The layout must be natively responsive at iPad viewport widths. The hidden side-panel toggle mechanism is **deprecated**. Do not reintroduce it in any form.

---

## Phase 0 — Structural Purge & Admin Task Priority

> **Goal:** Eliminate the tab system, introduce unified Sheet+Gantt, pin Admin Tasks.

### 0A — Tab System Removal

Delete the entire tab-switching mechanism, visual tab strip, and all associated JS. This is a **full removal** — no replacement with a similar tabbed pattern.

> 🗑️ **Remove:** `drawer-tab-group` and all associated CSS/JS. The Admin panel becomes a single vertically-scrolling column of sections separated by hairline dividers.

---

### 0B — Unified Sheet + Gantt

The spreadsheet row header and the Gantt chart must be a **single visual element** sharing one scroll context and one row-alignment boundary.

- One drag handle controls the height of the entire Sheet/Gantt block.
- The handle must be a hairline divider (1px + shadow) — not a thick resize bar.
- No visual break or separate dividing bar between the sheet row and the Gantt chart.

---

### 0C — Pinned Admin Task Header *(Priority Element)*

At the very top of the Admin Panel — **sticky/pinned, never scrolls away** — implement three call-out action cards:

| Card | Purpose |
|---|---|
| **Check Crossing** | Flag/action trigger for crossing reviews |
| **QB Status** | QuickBase status check |
| **Check BOMs** | Bill of materials review |

Cards must read as **actionable** (button-like affordance). They must be the **first visible element** in the Admin Panel at all times.

---

### 0D — iOS-Style Notification Badges

Redesign notification badges as small red circles overlapping the **top-right corner** of the Admin handle element — not centered pills.

```css
.drawer-tab-handle .ob-tab-badge,
.drawer-tab-handle #ob-tab-count {
    position: absolute;
    top: -6px;
    right: -6px;
    left: auto;
    transform: none;
    writing-mode: horizontal-tb;
    min-width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ef4444;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid var(--bg);
    line-height: 1;
    z-index: 1;
}
/* Reviewed badge: insight color, not red */
.drawer-tab-handle #ob-tab-count { background: var(--color-insight); }
```

`display: none` when count = 0 is already handled in `updateAdminBadge()` — no JS change needed.

---

### 0E — Admin Row Click Navigation

Admin rows (Check Crossings, QB Status) must be **clickable at the row level** to open the corresponding project card in the center pane.

- Add `style="cursor:pointer;"` and `onclick="selectItemForNav('${item.fdh}')"` to the outer row container div for both CHECK CROSSINGS and QB STATUS rows in `renderAdminPane()`.
- Add `event.stopPropagation()` to existing action buttons (`verifyXingFromAdmin`, `markQbUpdatedFromAdmin`) to prevent row-click from also firing.

Helper function to add:

```javascript
function selectItemForNav(fdh) {
    let item = (allItems || []).find(i => i.fdh === fdh);
    if (item) openPane(item, null);
}
```

---

### 0F — Gantt Fullscreen Integrity

The Gantt fullscreen mode must fully hide the Admin panel and any fixed-position overlays.

- In `toggleFullscreen()`, after setting `isFs` flag, add:
  ```javascript
  document.body.classList.toggle('gantt-fullscreen', isFs);
  ```
- CSS rule:
  ```css
  body.gantt-fullscreen .drawer-tab-group,
  body.gantt-fullscreen .outbox-pane { display: none; }
  ```

---

## Phase 1 — Backend Performance & Data Pruning

> **Goal:** Reduce server round-trips, prevent execution timeouts, shrink payload.

### 1A — 30-Minute Server-Side Cache

Implement `CacheService` in `getDashboardData()` in `02_Utilities.js` (~line 104).

**Add at top of function:**

```javascript
const CACHE_KEY = 'dashboard_data_cache';
const cache = CacheService.getScriptCache();
const cached = cache.get(CACHE_KEY);
if (cached) {
    try { return JSON.parse(cached); } catch(e) { /* fall through */ }
}
```

**Add before `return` at end of function:**

```javascript
try { cache.put(CACHE_KEY, JSON.stringify(payload), 1800); } catch(e) {}
```

**Cache Invalidation** — add the following line at the **START** of each function below:

```javascript
CacheService.getScriptCache().remove('dashboard_data_cache');
```

| Function | File |
|---|---|
| `commitToQueueWebApp()` | `06_QBSync.js` |
| `markAdminCheckComplete()` | `02_Utilities.js` |
| `verifySpecialCrossings()` | `02_Utilities.js` |
| `markStatusSyncComplete()` | `02_Utilities.js` |
| `syncFromQBWebApp()` | `06_QBSync.js` |
| `generateDailyReviewCore()` | `01_Engine.js` |

---

### 1B — Remove `Utilities.formatDate` from Data Loop

**File:** `02_Utilities.js` ~line 153. The per-row loop causes execution timeouts on large datasets.

**Remove:**
```javascript
let safeRawRow = data[i].map(cell => (cell instanceof Date)
    ? Utilities.formatDate(cell, "GMT-5", "MM/dd/yy") : cell);
```

**Replace with:**
```javascript
let safeRawRow = data[i].map(cell => (cell instanceof Date)
    ? cell.toISOString() : cell);
```

> ℹ️ **Note:** The `parseDate()` helper's internal `Utilities.formatDate` call (~line 152) parses a single value, not a per-row loop. **Leave it untouched.**

---

### 1C — Prune `safeRawRow` Payload

Strip null/empty cells before sending to the client. Keep bundled (not on-demand) — the `raw-data-strip` renders immediately on card open.

**Replace `safeRawRow` construction:**
```javascript
let rawCells = data[i].map(cell => (cell instanceof Date) ? cell.toISOString() : cell);
let safeRawRow = rawCells
    .map((v, idx) => ({ h: headers[idx], v: v }))
    .filter(({ v }) => v !== null && v !== undefined && v !== '');
```

Update `renderDiagnosticStrip(rawRow)` in `WebApp.html` to accept `{h, v}` pairs instead of positional arrays. Replace all `headers[idx]` / `row[idx]` references with `entry.h` / `entry.v`.

---

## Phase 2 — Frontend Performance & Date Handling

> **Goal:** Reduce Gantt DOM, modernize date formatting, debounce search.

### 2A — Gantt Grid Line DOM Reduction

The existing loop in `renderGantt()` (~lines 1814–1843) **cannot be deleted** — it also generates spike labels, EOM lines, and date labels. Only the Monday grid line `div` nodes are removed and replaced with a CSS gradient.

**Remove this line** from inside the `if(curr.getDay() === 1)` block (keep the date label line):
```javascript
if(!isEOM) gridLines += `<div style="position:absolute; left:${pct}%; top:0; bottom:0;
    width:1px; background:var(--border); z-index:0; opacity:0.5;"></div>`;
```

**Add CSS variable** on the grid container in `renderGantt()` before building DOM:
```javascript
let gridBgEl = getEl('gantt-grid-bg');
if (gridBgEl) gridBgEl.style.setProperty('--gantt-total-days', totalDays);
```

**Add CSS:**
```css
.gantt-grid-bg {
    background-image: repeating-linear-gradient(
        to right,
        transparent,
        transparent calc(700% / var(--gantt-total-days) - 1px),
        var(--border) calc(700% / var(--gantt-total-days) - 1px),
        var(--border) calc(700% / var(--gantt-total-days))
    );
}
```

*(700% = 100% × 7 for weekly Monday spacing.)*

---

### 2B — Client-Side Date Formatting

> ⚠️ **Depends on Phase 1B.** All dates arrive as ISO strings after 1B is complete.

**Add utility near top of `<script>` block:**
```javascript
function formatDate(isoString) {
    if (!isoString) return '';
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: '2-digit', day: '2-digit', year: '2-digit',
            timeZone: 'America/Chicago'
        }).format(new Date(isoString));
    } catch(e) { return isoString; }
}
```

Wrap all display uses of `item.ofsDate`, `item.reportDate`, `item.targetDate`, `item.cxStart`, `item.cxEnd` in `openPane()` and card HTML with `formatDate()`.

---

### 2C — Debounced Search Filter

Remove `onkeyup="applyFilters()"` from `#search-input` (~line 609).

**Add to JS init block:**
```javascript
let _searchInput = getEl('search-input');
let _filterDebounce;
if (_searchInput) {
    _searchInput.addEventListener('input', () => {
        clearTimeout(_filterDebounce);
        _filterDebounce = setTimeout(applyFilters, 300);
    });
}
```

---

## Phase 3 — UI/UX Polish & Logic Refinement

> **Goal:** Final aesthetic cleanup, intelligent data surfacing, visual hierarchy.

### 3A — Sticky Action Footer

```css
.pane-footer {
    position: sticky;
    bottom: 0;
    background: var(--card-bg);
    border-top: 1px solid var(--border);
    margin-top: 24px;
    padding-top: 16px;
    z-index: 10;
}
```

Verify `.pane-content` has no `overflow: hidden` — sticky requires a scrolling ancestor, not a clipping one.

---

### 3B — Informational Tag Color Hierarchy

Audit tag CSS classes in `renderList()`. Apply to non-action informational tags only:

```css
.tag-info, .tag-bench /* identify exact class names */ {
    color: #a1a1aa;
    background: #27272a;
    border: none;
}
```

**Preserve full contrast on:** `tag-crit`, `tag-warn`, and any flag matching `MISSING QB STATUS`, `LIGHTING RISK`, `ADMIN: CHECK CROSSINGS`.

---

### 3C — Reduce Visual Weight

- `.em-fdh`: `font-weight: 900` → `font-weight: 600`
- `.glass-pill`: Remove `border: 1.5px solid` — background color alone differentiates.

---

### 3D — Special X-ings Data Rename + Suggestion Logic

- Rename `QB Crossings Data` section to **"Special X-ings Data"** everywhere it appears.
- If the QuickBase "Special Crossings?" reference field is empty/null but the **CD Intelligence** cell has content, display a prominent suggestion banner prompting the user to update the QuickBase records.

---

### 3E — Surface Verify Crossings Button in Center Pane

In `openPane()`, after building pane content, conditionally insert a Verify Crossings button:

```javascript
if (item.flags && item.flags.includes('ADMIN: CHECK CROSSINGS')) {
    let verifyBtn = document.createElement('button');
    verifyBtn.className = 'btn btn-primary';
    verifyBtn.style.cssText = 'margin-bottom: 12px; font-size: 11px; padding: 7px 14px;';
    verifyBtn.textContent = '🛡 Verify Crossings';
    verifyBtn.onclick = () => verifyXingFromAdmin(item.fdh);
    let managerNoteEl = pane.querySelector('.manager-note');
    if (managerNoteEl) managerNoteEl.parentNode.insertBefore(verifyBtn, managerNoteEl);
}
```

Reuses existing `verifyXingFromAdmin()` — no new backend logic needed.

---

### 3F — Collapse "No Anomalies" Diagnostics Strip

In `openPane()`, after rendering the diagnostics container:

```javascript
let anomalyCount = (item.flags || []).filter(f =>
    f.startsWith('ADMIN:') || f.includes('MISMATCH') || f.includes('MISSING')
).length;
let diagEl = pane.querySelector('#raw-data-strip'); // confirm actual selector
if (diagEl && anomalyCount === 0) {
    diagEl.style.opacity = '0.4';
    diagEl.style.pointerEvents = 'none';
}
```

> ℹ️ **Note:** Use `opacity` + `pointer-events: none`, **not** `display:none` or `height:0`. The element must remain in the layout.

---

### 3G — Diag. Queue Header

- Change header text from all-caps `DIAG. QUEUE` to title-case **"Diag. Queue"**.
- Allow the header to wrap to two lines if needed to reduce horizontal footprint.

---

### 3H — Clear Filters Button

**HTML** — inside `#filter-strip` after `#search-input` (~line 610):
```html
<button class="btn-nav" id="btn-clear-filters" onclick="clearAllFilters()"
    style="display:none; font-size:11px; padding:5px 10px; color:var(--text-muted);">
    ✕ Clear
</button>
```

**JS — add function:**
```javascript
function clearAllFilters() {
    let s = getEl('search-input'); if (s) s.value = '';
    ['filter-severity','filter-vendor','filter-city','filter-ofs'].forEach(id => {
        let el = getEl(id); if (el) el.value = 'ALL';
    });
    activeAdminFilter = null;
    applyFilters();
}
```

**Show/hide** — at end of `applyFilters()`:
```javascript
let clearBtn = getEl('btn-clear-filters');
if (clearBtn) clearBtn.style.display = anyActive ? 'inline-flex' : 'none';
```

---

## 5. Verification Checklist

### Phase 0 — Structural
- [ ] Tab system fully removed — no tab strip, no tab panels, no tab JS
- [ ] Sheet row and Gantt chart share one container and one drag handle
- [ ] No visual break or thick bar between sheet row and Gantt
- [ ] Check Crossing, QB Status, Check BOMs cards visible at top of Admin Panel without scrolling
- [ ] Admin badges: small red circle at TOP-RIGHT corner, number upright, fully hidden when count = 0
- [ ] Reviewed badge uses insight color (not red)
- [ ] Admin row click (not button) navigates to that project's card in center pane
- [ ] Action buttons (Verify, Updated) still fire correctly without also triggering navigation
- [ ] Fullscreen: Admin panel disappears; Gantt fills viewport
- [ ] Exit fullscreen: panel reappears correctly

### Phase 1 — Backend
- [ ] Second web app load is noticeably faster than first (cache hit)
- [ ] After commit/sync, next load reflects updated data (cache was invalidated)
- [ ] Dates display correctly after removing `Utilities.formatDate` from loop
- [ ] `raw-data-strip` renders correctly with new `{h, v}` pair format

### Phase 2 — Frontend Performance
- [ ] Gantt renders with significantly reduced DOM node count for grid lines
- [ ] Monday grid lines still visible (CSS), spike highlights, EOM lines, date labels still render (DOM)
- [ ] Search filter does not fire until 300ms after last keystroke

### Phase 3 — Polish
- [ ] Skip/Commit buttons visible without scrolling on long card content (desktop)
- [ ] Informational tags are muted; action-required tags remain red/orange
- [ ] FDH ID font-weight is visibly lighter (600 not 900)
- [ ] Status pills have no border
- [ ] Section renamed to "Special X-ings Data" everywhere
- [ ] Verify Crossings button appears in center pane for CHECK CROSSINGS flagged items
- [ ] Diagnostics strip is dimmed (0.4 opacity) when no anomalies; fully visible when anomalies exist
- [ ] Diag. Queue header is title-case, not all-caps
- [ ] Clear Filters button appears when any filter is active; disappears when all cleared

---

*Dailies Command Center — Unified Brief | Consolidated from v1 structural brief + v2 hardened refactor | All phases must execute in order.*
