const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assertPattern(source, pattern, label, file) {
  if (!pattern.test(source)) {
    throw new Error(`${label}: missing ${pattern} in ${file}`);
  }
  console.log(`PASS ${label}`);
}

const dashboardModule = read('src/_module_dashboard.html');
const dashboardStyles = read('src/_styles_dashboard.html');
const webApp = read('src/WebApp.html');
const queueModule = read('src/_module_queue_state.html');

assertPattern(dashboardModule, /function getDashboardSourceItems\(\)/, 'Dashboard source helper exists', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /var sourceItems = getDashboardSourceItems\(\);/, 'Dashboard render reads shared filtered source items', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /buildDashboardDiagnosticBreakdown\(items\)/, 'Diagnostic breakdown builder is used', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /dashboardDiagnosticState\.type === 'ALL'/, 'Dashboard diagnostic filter state supports all-types mode', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /dashboardDiagnosticState\.severity === 'ALL'/, 'Dashboard diagnostic filter state supports severity mode', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /function getDashboardUrgencyStats\(sourceItems, actionableItems\)/, 'Dashboard urgency helper exists', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /var sectionEntries = \(dashboardDiagnosticState\.type === 'ALL'/, 'Dashboard diagnostic view uses sectioned admin-style preview', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /var previewLimit = dashboardDiagnosticState\.type === 'ALL' \? 0 : 5;/, 'Dashboard list only previews when a section is selected', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /Open Hub for the full diagnostic queue\./, 'Dashboard footnote still points overflow work to a full queue surface', 'src/_module_dashboard.html');
assertPattern(dashboardModule, /return \(sourceItems \|\| \[\]\)\.filter/, 'Dashboard actionable logic derives diagnostics directly from source items', 'src/_module_dashboard.html');

assertPattern(webApp, /id="dash-filter-summary"/, 'Dashboard filter summary mount exists', 'src/WebApp.html');
assertPattern(webApp, /id="dash-diagnostic-chart"/, 'Dashboard diagnostic chart mount exists', 'src/WebApp.html');
assertPattern(webApp, /id="dash-diagnostic-active"/, 'Dashboard active diagnostic filter mount exists', 'src/WebApp.html');
assertPattern(webApp, /Open Queue/, 'Dashboard keeps a direct path to the working queue', 'src/WebApp.html');
assertPattern(webApp, /Vendor Loadout/, 'Dashboard vendor section is retitled for ranked summary use', 'src/WebApp.html');

assertPattern(dashboardStyles, /\.dash-diagnostic-chart/, 'Dashboard styles include diagnostic chart rules', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-filter-chip/, 'Dashboard styles include active filter chip rules', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-severity-chip/, 'Dashboard styles include severity chip rules', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-stage-strip/, 'Dashboard styles include pipeline status strip rules', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-stage-pill/, 'Dashboard styles include pipeline status legend cards', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-vendor-row/, 'Dashboard styles include ranked vendor rows', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-vendor-meter/, 'Dashboard styles include compact vendor meter rows', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-review-section-header/, 'Dashboard styles include admin-style diagnostic section headers', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-list-footnote/, 'Dashboard styles include overflow footnote rules', 'src/_styles_dashboard.html');
assertPattern(dashboardStyles, /\.dash-freshness-label/, 'Dashboard styles include freshness badge rules', 'src/_styles_dashboard.html');

assertPattern(queueModule, /document\.body\.classList\.contains\('dashboard-active'\) && typeof renderDashboard === 'function'/, 'applyFilters re-renders dashboard when it is open', 'src/_module_queue_state.html');

console.log('\nDashboard module validation passed.');
