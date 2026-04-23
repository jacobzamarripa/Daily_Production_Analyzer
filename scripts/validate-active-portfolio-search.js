#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
}

function assertPattern(source, pattern, message) {
  assert(pattern.test(source), message);
}

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Function not found: ${name}`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  let end = bodyStart;
  for (; end < source.length; end++) {
    const ch = source[end];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end++;
        break;
      }
    }
  }
  return source.slice(start, end);
}

const utilities = read('src/02_Utilities.js');
const archive = read('src/01_Engine_Archive.js');
const queue = read('src/_module_queue_state.html');
const searchModule = read('src/_module_global_search.html');

[
  '_parseDashboardDateValue',
  '_normalizePortfolioDate',
  '_isPortfolioApprovedStatus',
  '_getPortfolioGraceCutoff',
  '_getPortfolioTimingAnchor',
  '_addPortfolioBusinessDays',
  '_getPortfolioReportExpectationDate',
  '_getPortfolioVisibilityMeta'
].forEach(function(name) {
  vm.runInThisContext(extractFunction(utilities, name), { filename: `src/02_Utilities.js::${name}` });
});

let meta = _getPortfolioVisibilityMeta({
  stage: 'Field CX',
  status: 'In Progress',
  vendor: 'Vendor A',
  cxStart: '2026-04-23',
  referenceDate: '2026-04-23',
  hasHistory: false
});
assert(meta.includeInPortfolio === true, 'start-day project stays in portfolio');
assert(meta.expectDailyReport === false, 'start-day project does not require a daily report yet');
assert(meta.reason === 'active-start-grace', 'start-day project uses start-grace reason');

meta = _getPortfolioVisibilityMeta({
  stage: 'Field CX',
  status: 'In Progress',
  vendor: 'Vendor A',
  cxStart: '2026-04-22',
  referenceDate: '2026-04-23',
  hasHistory: false
});
assert(meta.expectDailyReport === true, 'previous-business-day start requires a daily report');

meta = _getPortfolioVisibilityMeta({
  stage: 'Field CX',
  status: 'In Progress',
  vendor: 'Vendor A',
  cxStart: '2026-04-24',
  referenceDate: '2026-04-23',
  hasHistory: false
});
assert(meta.expectDailyReport === false, 'future-start project does not require a daily report');
assert(meta.reason === 'active-upcoming-start', 'future-start project stays upcoming');

meta = _getPortfolioVisibilityMeta({
  stage: 'Permitting',
  status: 'Approved',
  vendor: 'Vendor A',
  cxStart: '2026-05-15',
  referenceDate: '2026-04-23',
  hasHistory: false
});
assert(meta.reason === 'approved-upcoming-60d', 'approved permitting project stays in 60-day upcoming window');

meta = _getPortfolioVisibilityMeta({
  stage: 'OFS',
  status: 'Open For Sale',
  vendor: 'Vendor A',
  primaryOfsDate: '2026-02-01',
  fallbackOfsDate: '2026-02-01',
  referenceDate: '2026-04-23',
  hasHistory: true
});
assert(meta.includeInPortfolio === false, 'post-grace OFS project stays excluded from Active Portfolio');
assert(meta.reason === 'excluded-post-grace', 'post-grace OFS project carries excluded-post-grace reason');

assertPattern(archive, /INVALID DATE CHRONOLOGY/, 'archive diagnostics flag invalid CX chronology');
assertPattern(archive, /diff > 60/, 'archive diagnostics use 60-day future threshold');
assertPattern(archive, /REPORT PENDING/, 'archive ghost rows support start-grace pending state');

assertPattern(utilities, /function _buildProjectSearchCatalog\(options\)/, 'utilities build lightweight search catalog');
assertPattern(utilities, /function getProjectSearchHydration\(fdh\)/, 'utilities expose single-project hydration path');
assertPattern(utilities, /searchProjects:/, 'dashboard payload includes lightweight search catalog');

assertPattern(searchModule, /window\._lastDashboardPayload.*searchProjects/s, 'global search reads payload search catalog');
assertPattern(searchModule, /getProjectSearchHydration\(fdh\)/, 'global search hydrates suppressed projects on demand');
assertPattern(queue, /!\/CX DELIVERABLE\/i\.test/, 'queue list cards suppress CX Deliverable flag pills');

console.log('\nvalidate-active-portfolio-search: OK');
