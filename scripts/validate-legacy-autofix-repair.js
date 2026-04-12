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
  if (start === -1) throw new Error(`Could not find ${name}`);

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
const matchingSource = read('src/01_Engine_Matching.js');

const context = { console };
vm.createContext(context);

[
  extractFunction(matchingSource, 'attemptFuzzyMatch'),
  extractFunction(archiveSource, 'extractAutoFixedFdhFromComment'),
  extractFunction(archiveSource, 'stripAutoFixRepairMarkers'),
  extractFunction(archiveSource, 'buildLegacyAutoFixComment'),
].forEach((snippet) => vm.runInContext(snippet, context));

const original = context.extractAutoFixedFdhFromComment('[Auto-Fixed FDH: NWC01-F13] Crew reported splice only');
assertEqual(original, 'NWC01-F13', 'Original auto-fixed FDH marker is extracted');

const stripped = context.stripAutoFixRepairMarkers('[Blocked Auto-Match: ASH01-F13] [Auto-Fixed FDH: NWC01-F13] [Repair Audit: ASH01-F13 -> NWC01-F13] Crew reported splice only');
assertEqual(stripped, '[Auto-Fixed FDH: NWC01-F13] Crew reported splice only', 'Repair helper strips repair-only markers and preserves original auto-fix marker');

const blockedComment = context.buildLegacyAutoFixComment('[Auto-Fixed FDH: NWC01-F13] Crew reported splice only', 'NWC01-F13', {
  blockedTarget: 'ASH01-F13'
});
assertEqual(blockedComment, '[Blocked Auto-Match: ASH01-F13] [Auto-Fixed FDH: NWC01-F13] Crew reported splice only', 'Blocked auto-match comment is rebuilt deterministically');

const repairedComment = context.buildLegacyAutoFixComment('[Auto-Fixed FDH: BCT01-F43] Legacy note', 'BCT01-F43', {
  auditText: 'PAN03-F43 -> BCT01-F43'
});
assertEqual(repairedComment, '[Auto-Fixed FDH: BCT01-F43] [Repair Audit: PAN03-F43 -> BCT01-F43] Legacy note', 'Repair audit comment is rebuilt deterministically');

const refDict = {
  'ASH01-F13': { city: 'Ashland' },
  'NWC02-F13': { city: 'Norwalk' },
  'PAN03-F43': { city: 'Panama City' },
};

assertEqual(context.attemptFuzzyMatch('BCT01-F43', Object.keys(refDict), null, refDict), null, 'Cross-market legacy auto-fix no longer rematches');
assertEqual(context.attemptFuzzyMatch('NWC01-F13', Object.keys(refDict), null, refDict), 'NWC02-F13', 'Same-market legacy auto-fix still rematches safely');
assertEqual(context.attemptFuzzyMatch('PAN99-F43', Object.keys(refDict), null, refDict), 'PAN03-F43', 'Same-market legacy auto-fix still rematches safely');

console.log('\nLegacy auto-fix repair validation passed.');
