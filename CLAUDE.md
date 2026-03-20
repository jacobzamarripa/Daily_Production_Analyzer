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
