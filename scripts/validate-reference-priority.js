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

function assert(condition, label) {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.log(`PASS ${label}`);
}

const utilitiesSource = read('src/02_Utilities.js');
const sharedSource = read('src/_utils_shared.html');
const queueSource = read('src/_module_queue_state.html');
const webappCoreSource = read('src/_module_webapp_core.html');
const webappSource = read('src/WebApp.html');

const context = {
  console,
  Date,
};
vm.createContext(context);

[
  extractFunction(utilitiesSource, '_buildReferenceConfidenceMeta'),
  extractFunction(sharedSource, 'safeDate'),
  extractFunction(sharedSource, 'getSeverity'),
  extractFunction(sharedSource, 'getSeverityOrder'),
  extractFunction(sharedSource, 'getQBStatusClass'),
  extractFunction(sharedSource, 'buildReferenceConfidenceMeta'),
  extractFunction(sharedSource, 'getReferenceConfidenceScore'),
  extractFunction(sharedSource, 'getReferenceConfidenceTier'),
  extractFunction(sharedSource, 'getEffectiveOfsDate'),
  extractFunction(sharedSource, 'getPrimarySortDate'),
  extractFunction(sharedSource, 'compareWithSecondarySort'),
  extractFunction(sharedSource, 'compareReferenceConfidence'),
  extractFunction(sharedSource, 'getQueuePillClass'),
].forEach((snippet) => vm.runInContext(snippet, context));

const strong = context._buildReferenceConfidenceMeta({
  flags: '',
  hasReferencePresence: true,
  rid: '123',
  hasSOW: true,
  hasCDDel: true,
  hasCDDist: false,
  hasBOMDel: true,
  hasBOMPo: false,
  cxInferred: '',
});
assertEqual(strong.score, 100, 'Strong reference project receives full confidence score');
assertEqual(strong.tier, 'strong', 'Strong reference project maps to strong tier');

const weak = context._buildReferenceConfidenceMeta({
  flags: '🚩 NOT IN QB REFERENCE\nINFERRED: FIELD CX',
  hasReferencePresence: false,
  rid: '',
  hasSOW: false,
  hasCDDel: false,
  hasCDDist: false,
  hasBOMDel: false,
  hasBOMPo: false,
  cxInferred: 'start:lkv',
});
assertEqual(weak.score, 12, 'Weak inferred project is de-prioritized');
assertEqual(weak.tier, 'weak', 'Weak inferred project maps to weak tier');

const stale = context._buildReferenceConfidenceMeta({
  flags: '🚩 STATUS MISMATCH',
  hasReferencePresence: true,
  rid: '456',
  hasSOW: true,
  hasCDDel: false,
  hasCDDist: true,
  hasBOMDel: false,
  hasBOMPo: true,
  cxInferred: '',
});
assertEqual(stale.score, 90, 'Stale reference project stays below clean strong projects');

const items = [
  { fdh: 'WEAK', flags: 'INFERRED: FIELD CX', rowNum: 3, reportDate: '04/10/26' },
  { fdh: 'WARN', referenceConfidenceScore: 90, flags: '🚩 STATUS MISMATCH', rowNum: 2, targetDate: '04/18/26' },
  { fdh: 'STRONG', referenceConfidenceScore: 100, flags: '', rowNum: 1, cxEnd: '04/20/26', targetDate: '04/20/26' },
  { fdh: 'STRONG-EARLY', referenceConfidenceScore: 100, flags: '', rowNum: 4, cxEnd: '04/15/26', targetDate: '04/15/26' },
];
items.sort((a, b) => context.compareWithSecondarySort(a, b, 'end'));
assertEqual(items[0].fdh, 'STRONG-EARLY', 'Higher confidence sorts first and earlier CX Complete wins tie');
assertEqual(items[1].fdh, 'STRONG', 'Higher confidence outranks stale warning tier');
assertEqual(items[2].fdh, 'WARN', 'Stale but reference-backed project outranks weak inferred project');
assertEqual(items[3].fdh, 'WEAK', 'Weak inferred project sorts last');

assertEqual(context.getQueuePillClass('Field CX', 'Construction'), 'chip-active', 'Queue pills use normal status colors for active projects');
assertEqual(context.getQueuePillClass('Field CX', 'Construction'), context.getQBStatusClass('Field CX', 'Construction', false), 'Queue pill helper bypasses missing-reference override');

assert(/displayFiltered\.sort\(\(a, b\) => compareWithSecondarySort\(a, b, sortVal \|\| 'end'\)\);/.test(queueSource), 'Queue always sorts by confidence first and selected sort second');
assert(/if \(queueSort === 'default' \|\| queueSort === 'confidence'\) return 'end';/.test(webappCoreSource), 'Active sort normalizes default to CX Complete');
assert(!/option value="confidence">Reference Confidence<\/option>/.test(webappSource), 'Reference Confidence option is removed from UI controls');

console.log('\nReference priority validation passed.');
