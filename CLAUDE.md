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