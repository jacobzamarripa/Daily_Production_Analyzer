const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assert(condition, label) {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.log(`PASS ${label}`);
}

const bulk = read('src/08_BulkActions.js');
const action = read('src/_module_action_center.html');
const styles = read('src/_styles_action_center.html');
const quickPeek = read('src/_module_quick_peek.html');

assert(/const CROSSINGS_ROUNDTRIP_HEADERS = \[\s*'FDH ID',\s*'Vendor',\s*'Special Crossings\? Yes\/No',\s*'Special Crossings Details',\s*'Source Verified Date'\s*\];/m.test(bulk), 'Crossings XLSX round-trip headers are exact');
assert(/function parseCrossingsImport\(base64Data, fileName\)/.test(bulk), 'Crossings import endpoint accepts filename-aware imports');
assert(/Drive\.Files\.insert\(\{ title: '\[TEMP\]_/.test(bulk), 'XLSX import converts through Drive advanced service');
assert(/Special Crossings\? Yes\/No is required/.test(bulk), 'Import rejects missing Yes/No values');
assert(/Special Crossings Details is required/.test(bulk), 'Import rejects missing Details values');
assert(/invalid crossing value/.test(bulk) && /Use YES or NO/.test(bulk), 'Import restricts crossing choices to YES or NO');
assert(/verifiedDate: dateIdx >= 0 \? _baDateText\(row\[dateIdx\]\) : ''/.test(bulk), 'Import preserves Source Verified Date when provided');
assert(/function exportCrossingsXLSXForFdhs\(fdhList\)/.test(bulk), 'Scoped XLSX export endpoint exists');
assert(/SpreadsheetApp\.newDataValidation\(\)\.requireValueInList\(\['YES', 'NO'\], true\)/.test(bulk), 'Exported workbook constrains Yes/No column');

assert(/function _acEnsurePermanentPeek\(\) \{\s*if \(!\['boms','comments'\]\.includes\(_acActiveTab\)\) return;/m.test(action), 'Crossings tab does not auto-open Quick Peek');
assert(/_acShowCrossingsExportScopeModal/.test(action), 'No-selection export uses scope modal');
assert(/_acSetXingVendorStatusFilter/.test(action), 'Vendor status chips are wired as filters');
assert(/_acToggleXingVendor/.test(action), 'Vendor-level checkbox selection is wired');
assert(/onclick="_acToggleXingGridGroup/.test(action) && /window\._acToggleXingGridGroup\s*=\s*_acToggleXingGridGroup/.test(action), 'Crossing group headers export their inline toggle handler');
assert(/onchange="_acToggleAllVisibleXings/.test(action) && /window\._acToggleAllVisibleXings\s*=\s*_acToggleAllVisibleXings/.test(action), 'Crossing select-all header exports its inline handler');
assert(/function _acApplyXingToSelected\(value\)/.test(action), 'Selected rows can be quick-filled to YES or NO');
assert(/function _acApplyDetailsToSelected\(\)/.test(action), 'Selected rows can receive shared details through a modal');
assert(/function _acClearXingSelection\(\)/.test(action), 'Selected rows can be cleared from the bulk toolbar');
assert(/function _acFocusCrossingContext\(fdh, scrollToXings\)/.test(action), 'Crossing row interactions can synchronize Quick Peek context');
assert(/onfocus="_acFocusCrossingContext/.test(action), 'Crossing inputs focus the active Quick Peek FDH');
assert(/onclick="_acFocusCrossingContext/.test(action), 'Crossing row clicks focus the active Quick Peek FDH');
assert(/onclick="_acOpenPeekAtXings/.test(action), 'Crossing flat-grid row clicks open Quick Peek at Special X-ings');
assert(/<colgroup>[\s\S]*<col class="ac-col-details">[\s\S]*<col class="ac-col-peek">[\s\S]*<\/colgroup>/.test(action), 'Crossing flat-grid table defines deterministic columns');
assert(/data-fdh="' \+ fdhSafe \+ '"/.test(action), 'Crossing flat-grid rows carry FDH data for delegated interactions');
assert(/function _acBindXingGridInteractions\(\)/.test(action) && /_acBindXingGridInteractions\(\);/.test(action), 'Crossing flat-grid delegated interaction binding is installed after render');
assert(/container\.addEventListener\('click'[\s\S]*_acOpenPeekAtXings\(fdh\);/.test(action), 'Crossing delegated row clicks open Quick Peek at Special X-ings');
assert(/container\.addEventListener\('focusin'[\s\S]*_acOpenPeekAtXings\(fdh\);/.test(action), 'Crossing delegated input focus opens Quick Peek at Special X-ings');
assert(/\['input', 'change'\]\.forEach[\s\S]*_acFocusCrossingContext\(fdh, false\);/.test(action), 'Crossing delegated typing and select changes update Quick Peek context');
assert(/function _acOnXingChange\(fdh, val\) \{\s*_acFocusCrossingContext\(fdh, false\);/.test(action), 'Crossing status changes update the active Quick Peek row');
assert(/function _acOnXingDetailChange\(fdh, val\) \{\s*_acFocusCrossingContext\(fdh, false\);/.test(action), 'Crossing details typing updates the active Quick Peek row');
assert(/function _acRenderVendorStatusChip\(vendor, status, label, count\)/.test(action), 'Vendor status chips share disabled-zero rendering');
assert(/disabled aria-disabled="true"/.test(action), 'Zero-count vendor status chips are disabled');
assert(/Set YES/.test(action) && /Set NO/.test(action) && /Apply Details/.test(action), 'Crossings selected toolbar exposes quick-fill actions');
assert(/ac-import-section-title">Unrecognized FDHs/.test(action), 'Import preview separates unrecognized FDHs');
assert(/ac-import-section-title">Rows Needing Correction/.test(action), 'Import preview separates validation errors');
assert(/if \(_acActiveTab === 'crossings'\) _acOpenPeekAtXings\(fdh\);/.test(action), 'Crossings Details opens Quick Peek at Special X-ings');
assert(/\.exportCrossingsXLSXForFdhs\(exportFdhs\)/.test(action), 'Frontend calls XLSX export endpoint');
assert(/\.parseCrossingsImport\(base64, file\.name\)/.test(action), 'Frontend calls XLSX-aware import endpoint');

assert(/\.ac-xing-card-wrap \.off-vendor-stack \{\s*width: min\(100%, 1040px\);\s*margin: 0 auto;/m.test(styles), 'Crossings rows are centered while detail panel is closed');
assert(/#action-workspace\.ac-peek-open \.ac-xing-card-wrap \.off-vendor-stack/.test(styles), 'Crossings rows can expand when detail panel opens');
assert(/\.ac-selected-summary/.test(styles), 'Selected row summary chips are styled');
assert(/\.ac-import-section/.test(styles), 'Grouped import preview sections are styled');
assert(/\.ac-xing-proj-row\.is-active-row/.test(styles), 'Active Quick Peek row is visually highlighted');
assert(/\.off-vendor-stat\.ac-xing-status-chip\.is-disabled/.test(styles), 'Disabled zero-count vendor status chips are styled');
assert(/\.ac-table-crossings-grid \{[\s\S]*min-width: 900px;[\s\S]*table-layout: fixed;[\s\S]*\}/.test(styles), 'Crossings flat-grid table uses deterministic fixed column layout');
assert(/#ac-tab-crossings \{[\s\S]*background: var\(--card-bg\);[\s\S]*\}/.test(styles), 'Crossings tab panel owns the stable card background');
assert(/\.ac-xing-grid-wrap \{[\s\S]*background: var\(--card-bg\);[\s\S]*\}/.test(styles), 'Crossings flat-grid scroll surface uses the card background');
assert(/\.ac-xing-grid-wrap \{[\s\S]*flex: 1 1 auto;[\s\S]*height: 100%;[\s\S]*\}/.test(styles), 'Crossings flat-grid scroll surface stretches through the tab panel');
assert(/\.ac-table-crossings-grid \{[\s\S]*background: var\(--card-bg\);[\s\S]*\}/.test(styles), 'Crossings flat-grid table uses the card background');
assert(/\.ac-table-crossings-grid \.ac-col-details \{ width: auto; \}/.test(styles), 'Crossings Details colgroup owns the remaining flat-grid width');
assert(/\.ac-table-crossings-grid \.ac-td-xing-det,\s*\.ac-table-crossings-grid \.ac-th-xing-det \{ width: auto; min-width: 0; \}/.test(styles), 'Crossings Details cells can shrink within the fixed grid');
assert(/\.ac-table-crossings-grid \.ac-th-peek,\s*\.ac-table-crossings-grid \.ac-td-peek \{ width: 1%; white-space: nowrap; padding-left: 4px; padding-right: 10px; \}/.test(styles), 'Crossings chevron column stays narrow beside Details');
assert(/\.ac-table-crossings-grid thead th \{[\s\S]*position: sticky;[\s\S]*top: 0;[\s\S]*box-shadow: 0 1px 0 var\(--border\);[\s\S]*\}/.test(styles), 'Crossings column headers stay sticky with a visible divider');
assert(/\.ac-table-crossings-grid \.ac-xing-grid-row > td \{ background: var\(--card-bg\); \}/.test(styles), 'Crossings row state paints cells over a stable background');
assert(/\.ac-xing-sep-vendor > td \{[\s\S]*position: sticky;[\s\S]*top: 35px;[\s\S]*z-index: 3;[\s\S]*\}/.test(styles), 'Crossings vendor group headers are sticky below the table header');
assert(/\.ac-xing-sep-city > td \{[\s\S]*position: sticky;[\s\S]*top: 75px;[\s\S]*z-index: 2;[\s\S]*\}/.test(styles), 'Crossings city group headers are sticky below the vendor header');
assert(/body\.action-view-active #action-workspace\.ac-peek-open \{[\s\S]*width: calc\(100% - var\(--ac-peek-width\)\) !important;[\s\S]*max-width: calc\(100% - var\(--ac-peek-width\)\) !important;[\s\S]*flex: 0 1 calc\(100% - var\(--ac-peek-width\)\) !important;[\s\S]*\}/.test(styles), 'Action Center peek-open state pushes/compresses the workspace with sufficient specificity');
assert(/body\.action-view-active \.gantt-quick-peek \{[\s\S]*width: var\(--ac-peek-width\) !important;[\s\S]*\}/.test(styles), 'Action Center Quick Peek uses the shared peek width');
assert(/background:var\(--card-bg\); display:flex; gap:10px; flex-shrink:0;/.test(quickPeek), 'Quick Peek footer uses the panel background instead of the shell gray');
assert(/linear-gradient\(#fff8d6, #fff8d6\) padding-box,\s*repeating-linear-gradient\(135deg, #171717 0, #171717 9px, #facc15 9px, #facc15 18px\) border-box !important/.test(styles), 'Crossings Details focus uses valid soft yellow fill with striped border');
assert(/\.ac-xing-det-input:focus \{[\s\S]*outline: none !important;[\s\S]*box-shadow: none !important;[\s\S]*\}/.test(styles), 'Crossings Details focus suppresses glow');
assert(/\.ac-xing-det-input \{[\s\S]*display: block;[\s\S]*width: 100%;[\s\S]*\}/.test(styles), 'Crossings Details input fills its deterministic cell');

console.log('\nCrossings bulk action validation passed.');
