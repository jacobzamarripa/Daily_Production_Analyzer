/**
 * FILE: 07_Admin_Heal.js
 * PURPOSE: Surgical healing of the Master Archive and automated safety backups.
 */

/**
 * 🛡️ BACKUP: Exports the current Master Archive to a CSV in the Pending Upload folder.
 * Called automatically before any heal operation.
 */
function backupMasterArchiveToCSV() {
  logMsg("🛡️ STARTING: Master Archive Backup (CSV)");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const histSheet = ss.getSheetByName(HISTORY_SHEET);
  
  if (!histSheet) {
    logMsg("❌ BACKUP FAILED: History sheet not found.");
    return null;
  }

  const data = histSheet.getDataRange().getValues();
  let csvContent = "";
  
  data.forEach(row => {
    let csvRow = row.map(cell => {
      let cellStr = "";
      if (cell instanceof Date) {
        cellStr = Utilities.formatDate(cell, "GMT-5", "yyyy-MM-dd");
      } else {
        cellStr = String(cell || "");
      }
      // Escape commas and quotes
      return (cellStr.includes(",") || cellStr.includes("\"") || cellStr.includes("\n")) 
        ? `"${cellStr.replace(/"/g, '""')}"` 
        : cellStr;
    });
    csvContent += csvRow.join(",") + "\n";
  });

  const timestamp = Utilities.formatDate(new Date(), "GMT-5", "yyyy-MM-dd_HH-mm");
  const fileName = `BACKUP_Master_Archive_${timestamp}.csv`;
  const folder = DriveApp.getFolderById(COMPILED_FOLDER_ID);
  const file = folder.createFile(fileName, csvContent, MimeType.CSV);
  
  logMsg(`✅ BACKUP COMPLETE: ${fileName} saved to Pending Upload.`);
  return file.getUrl();
}

/**
 * 🛠️ SURGICAL HEAL: Fixes alignment issues in the Master Archive caused by column insertions.
 * Identifies rows where data was shifted 4 columns to the RIGHT and pulls them LEFT to align with the intended layout.
 */
function healMasterArchiveAlignment() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert("🛠️ HEAL MASTER ARCHIVE", "This will shift data in misaligned rows 4 columns to the LEFT to restore Daily UG Footage to column H.\n\nThe 4 extra columns (BSLs, OFS, CX) will be moved to the end of the sheet.\n\nA CSV backup will be created first.\n\nProceed?", ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) return;

  // 1. Mandatory Backup
  backupMasterArchiveToCSV();

  logMsg("🛠️ STARTING: Master Archive Alignment Healing...");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(HISTORY_SHEET);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  
  let healCount = 0;
  let newRows = [HISTORY_HEADERS]; // Use the fresh headers from Config

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    
    // 🔍 HEURISTIC: Bad rows have UG data starting at index 11 (Column L) instead of index 7 (Column H).
    // In these bad rows, index 7 (H) through 10 (K) are typically empty or contain BSL/CX strings.
    let colHVal = row[7];
    let colLVal = row[11];

    let isMisaligned = false;
    // If H is empty/non-numeric AND L has a number, it's a shifted row.
    if ((colHVal === "" || isNaN(Number(colHVal))) && colLVal !== "" && !isNaN(Number(colLVal))) {
        isMisaligned = true;
    }

    if (isMisaligned) {
      let healedRow = new Array(HISTORY_HEADERS.length).fill("");
      
      // 1. Copy first 7 columns (0-6: Date, Contractor, ID, Locates, Cabinets, Light, Target Date)
      for (let j = 0; j < 7; j++) healedRow[j] = row[j];

      // 2. Capture the BSLs/OFS/CX data that was at 7, 8, 9, 10
      let bsls = row[7];
      let ofs  = row[8];
      let cxs  = row[9];
      let cxe  = row[10];

      // 3. Shift the rest of the data (from index 11 to 32) LEFT by 4 columns (to index 7-28)
      // Original 11 (Daily UG) -> 7
      // ...
      // Original 32 (Vendor Comment) -> 28
      for (let j = 11; j <= 32; j++) {
        if (j < row.length) {
          healedRow[j - 4] = row[j];
        }
      }

      // 4. Place the captured BSLs/OFS/CX data at the NEW end of the row (indices 29, 30, 31, 32)
      healedRow[29] = bsls;
      healedRow[30] = ofs;
      healedRow[31] = cxs;
      healedRow[32] = cxe;

      newRows.push(healedRow);
      healCount++;
    } else {
      // If not misaligned, ensure it matches the new length
      let existingRow = [...row];
      while (existingRow.length < HISTORY_HEADERS.length) existingRow.push("");
      newRows.push(existingRow.slice(0, HISTORY_HEADERS.length));
    }
  }

  if (healCount > 0) {
    sh.clear();
    sh.getRange(1, 1, newRows.length, HISTORY_HEADERS.length).setValues(newRows);
    SpreadsheetApp.flush();
    logMsg(`✅ HEAL COMPLETE: ${healCount} rows were realigned.`);
    ui.alert("✅ HEAL COMPLETE", `${healCount} rows were successfully realigned.\n\nA backup CSV was saved to the Pending Upload folder.`, ui.ButtonSet.OK);
  } else {
    logMsg("ℹ️ HEAL SKIPPED: No misaligned rows detected.");
    ui.alert("ℹ️ HEAL SKIPPED", "No misaligned rows were detected in the Master Archive.", ui.ButtonSet.OK);
  }
}