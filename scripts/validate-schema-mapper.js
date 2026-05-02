const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", received "${actual}"`);
  }
  console.log(`PASS ${label}`);
}

const source = read('src/01_Engine_SchemaMapper.js');
const context = {
  console,
  Math,
  Date
};

vm.createContext(context);
vm.runInContext(source, context);

const testHeaders = [
  "FDH Engineering ID",
  "City",
  "Status",
  "Report Date",
  "Target OFS",
  "Daily UG Footage",
  "Total UG Footage Completed",
  "UG BOM Qty."
];

const adapter = context.createSchemaAdapter(testHeaders);

// 1. Exact Match
assertEqual(adapter.getIdx("FDH Engineering ID"), 0, "Exact match for FDH Engineering ID");
assertEqual(adapter.getIdx("City"), 1, "Exact match for City");

// 2. Canonical Alias Match
assertEqual(adapter.getIdx("FDH"), 0, "Canonical alias match for FDH -> FDH Engineering ID");
assertEqual(adapter.getIdx("DATE"), 3, "Canonical alias match for DATE -> Report Date");
assertEqual(adapter.getIdx("OFS"), 4, "Canonical alias match for OFS -> Target OFS");
assertEqual(adapter.getIdx("BOM_UG"), 7, "Canonical alias match for BOM_UG -> UG BOM Qty.");

// 3. Robust Column Hunt (Substring)
assertEqual(adapter.getIdx("UG Footage", { isFootage: true }), 5, "Robust match for 'UG Footage' (isFootage) -> Daily UG Footage");
assertEqual(adapter.getIdx("Daily UG"), 5, "Robust match for 'Daily UG' -> Daily UG Footage");

// 4. Guardrails
// When searching for Date, should NOT match Target OFS
assertEqual(adapter.getIdx("date"), 3, "Guard: 'date' avoids 'Target OFS'");

// When searching for footage, should NOT match BOM or Date
const ambiguousHeaders = [
    "Work Date",
    "UG Footage BOM",
    "UG Footage Completed"
];
const adapter2 = context.createSchemaAdapter(ambiguousHeaders);
assertEqual(adapter2.getIdx("UG Footage", { isFootage: true }), 2, "Guard: 'UG Footage' avoids BOM and Date");

// 5. Caching
const start = Date.now();
for(let i=0; i<1000; i++) adapter.getIdx("FDH");
const end = Date.now();
console.log(`Cache Performance: 1000 lookups in ${end - start}ms`);

console.log('\nSchema Mapper validation passed.');
