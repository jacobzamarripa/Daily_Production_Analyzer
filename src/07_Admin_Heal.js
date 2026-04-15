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
 * Identifies rows where data is shifted 4 columns to the left and pushes them right to align with HISTORY_HEADERS.
 */
function healMasterArchiveAlignment() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert("🛠️ HEAL MASTER ARCHIVE", "This will shift data in misaligned rows 4 columns to the right to match the new H-K headers.\n\nA CSV backup will be created first.\n\nProceed?", ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) return;

  // 1. Mandatory Backup
  backupMasterArchiveToCSV();

  logMsg("🛠️ STARTING: Master Archive Alignment Healing...");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(HISTORY_SHEET);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  
  // Columns H-K indices are 7, 8, 9, 10
  const expectedHIdx = 7; // "BSLs"
  const expectedLIdx = 11; // "Daily UG Footage"
  
  let healCount = 0;
  let newRows = [headers];

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    
    // 🔍 HEURISTIC: If column H (BSLs) has a number that looks like footage,
    // and column L (Daily UG) is empty, it's likely an old misaligned row.
    let colHVal = row[expectedHIdx];
    let colLVal = row[expectedLIdx];

    // BSLs and Budget OFS are usually empty or strings in the archive unless sync'd.
    // Daily UG Footage is almost always a number in old records.
    let isMisaligned = false;
    if (colHVal !== "" && !isNaN(Number(colHVal)) && colLVal === "") {
        // Double check: if it was shifted, column AC (Vendor Comment) would be at column Y.
        // History headers length is 33. Old length was 29.
        isMisaligned = true;
    }

    if (isMisaligned) {
      let healedRow = [...row];
      // Shift indices 7 (H) to the end of the old row (29 columns) to index 11 (L)
      // Old data: [0...6] [7...28]
      // New data: [0...6] [7,8,9,10] [11...32]
      
      let oldDataPart = row.slice(7, 29); // The data that got pushed left
      healedRow[7] = "";  // BSLs
      healedRow[8] = "";  // Budget OFS
      healedRow[9] = "";  // CX Start
      healedRow[10] = ""; // CX Complete
      
      for (let j = 0; j < oldDataPart.length; j++) {
        healedRow[11 + j] = oldDataPart[j];
      }
      
      // Ensure row length matches HISTORY_HEADERS
      while (healedRow.length < HISTORY_HEADERS.length) healedRow.push("");
      if (healedRow.length > HISTORY_HEADERS.length) healedRow = healedRow.slice(0, HISTORY_HEADERS.length);

      newRows.push(healedRow);
      healCount++;
    } else {
      newRows.push(row);
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