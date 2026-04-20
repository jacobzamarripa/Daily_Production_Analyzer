const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find ${name}`);
  }

  let braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }

  throw new Error(`Could not parse ${name}`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", received "${actual}"`);
  }
  console.log(`PASS ${label}`);
}

const archiveSource = read('src/01_Engine_Archive.js');
const sharedSource = read('src/_utils_shared.html');
const context = { console, Date };
vm.createContext(context);

vm.runInContext(extractFunction(archiveSource, 'countMissedReportBusinessDays'), context);

assertEqual(
  context.countMissedReportBusinessDays('2026-04-16', '2026-04-20'),
  0,
  'Monday grace keeps Thursday latest reports out of stale status'
);

assertEqual(
  context.countMissedReportBusinessDays('2026-04-17', '2026-04-20'),
  0,
  'Monday grace also keeps Friday latest reports out of stale status'
);

assertEqual(
  context.countMissedReportBusinessDays('2026-04-15', '2026-04-20'),
  1,
  'Monday still flags when Thursday was also missed'
);

assertEqual(
  context.countMissedReportBusinessDays('2026-04-16', '2026-04-21'),
  2,
  'Tuesday sees both Friday and Monday as missed business days after a Thursday report'
);

assertEqual(
  context.countMissedReportBusinessDays('2026-04-17', '2026-04-21'),
  1,
  'Tuesday treats a Friday latest report as one missed business day'
);

assertEqual(
  context.countMissedReportBusinessDays('2026-04-21', '2026-04-21'),
  0,
  'Same-day comparisons do not create stale days'
);

assertEqual(
  /WEEKEND CARRY/.test(archiveSource),
  true,
  'Engine preserves Monday carry rows with a neutral weekend label'
);

assertEqual(
  /STALE REPORT \(1 Business Day\)/.test(archiveSource),
  true,
  'Engine uses business-day wording for one-day stale flags'
);

assertEqual(
  /up\.includes\("STALE REPORT"\) && !up\.includes\("1 BUSINESS DAY"\)/.test(sharedSource),
  true,
  'Shared severity treats one-business-day stale rows as warning rather than critical'
);

console.log('\nStale report window validation passed.');
