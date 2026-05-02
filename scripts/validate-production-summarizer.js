const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

// Load SchemaMapper (for SchemaAdapter)
const mapperSource = fs.readFileSync(path.join(root, 'src/01_Engine_SchemaMapper.js'), 'utf8');
// Load Summarizer
const summarizerSource = fs.readFileSync(path.join(root, 'src/01_Engine_Summarizer.js'), 'utf8');

const context = {
  console,
  JSON,
  Math,
  Number,
  String,
  module: { exports: {} },
  safeParseFootage: (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(/[,'"\sft]/gi, "")) || 0;
  }
};

vm.createContext(context);
vm.runInContext(mapperSource, context);
vm.runInContext(summarizerSource, context);

const ProductionSummarizer = context.module.exports;
const createSchemaAdapter = context.createSchemaAdapter;

function assert(condition, label) {
  if (!condition) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`FAIL ${label}: expected "${expected}", received "${actual}"`);
  }
  console.log(`PASS: ${label}`);
}

console.log('--- 🧪 STARTING PRODUCTION SUMMARIZER UNIT TESTS ---\n');

const HEADERS = ["Date", "Contractor", "FDH Engineering ID", "Daily UG Footage", "Total UG Footage Completed", "UG BOM Quantity", "Daily Strand Footage", "Total Strand Footage Complete?", "Strand BOM Quantity", "Daily Fiber Footage", "Total Fiber Footage Complete", "Fiber BOM Quantity", "Daily NAPs/Encl. Completed", "Total NAPs Completed", "NAP/Encl. BOM Qty."];
const adapter = createSchemaAdapter(HEADERS);

// 1. SCENARIO: Simple UG Activity
let row = new Array(HEADERS.length).fill("");
row[HEADERS.indexOf("Daily UG Footage")] = 100;
row[HEADERS.indexOf("Total UG Footage Completed")] = 500;
row[HEADERS.indexOf("UG BOM Quantity")] = 1000;

let res = ProductionSummarizer.generateSummary(row, adapter, null, null);

assertEqual(res.metrics.dailyUG, 100, 'Metrics: dailyUG');
assertEqual(res.metrics.totalUG, 500, 'Metrics: totalUG');
assertEqual(res.metrics.bomUG, 1000, 'Metrics: bomUG');
assertEqual(res.visualLines[0], "UG: 100' ▰▰▰▰▰▱▱▱▱▱ 50%", 'Visual: UG 50% line');

// 2. SCENARIO: Tracker Linked + Multiple Phases
row = new Array(HEADERS.length).fill("");
row[HEADERS.indexOf("Daily UG Footage")] = 200;
row[HEADERS.indexOf("Total UG Footage Completed")] = 1000;
row[HEADERS.indexOf("UG BOM Quantity")] = 1000;
row[HEADERS.indexOf("Daily NAPs/Encl. Completed")] = 5;
row[HEADERS.indexOf("Total NAPs Completed")] = 10;
row[HEADERS.indexOf("NAP/Encl. BOM Qty.")] = 10;

const vTracker = { ugPct: 1, napPct: 1 };
res = ProductionSummarizer.generateSummary(row, adapter, null, vTracker);

assertEqual(res.visualLines[0], "UG: 200' ▰▰▰▰▰▰▰▰▰▰ 100% ★", 'Visual: UG 100% with star');
assertEqual(res.visualLines[1], "[Tracker] UG: ▰▰▰▰▰▰▰▰▰▰ 100% ★", 'Visual: UG Tracker line');
assertEqual(res.visualLines[2], "NAP: 5 ▰▰▰▰▰▰▰▰▰▰ 100% ★", 'Visual: NAP 100% line');
assertEqual(res.visualLines[3], "[Tracker] NAP: ▰▰▰▰▰▰▰▰▰▰ 100% ★", 'Visual: NAP Tracker line');
assertEqual(res.visualLines[4], "\n[📡 Tracker Linked]", 'Visual: Tracker linked indicator');

// 3. SCENARIO: 0 BOM Edge Case
row = new Array(HEADERS.length).fill("");
row[HEADERS.indexOf("Daily Fiber Footage")] = 100;
row[HEADERS.indexOf("Total Fiber Footage Complete")] = 100;
row[HEADERS.indexOf("Fiber BOM Quantity")] = 0;

res = ProductionSummarizer.generateSummary(row, adapter, null, null);
assertEqual(res.visualLines[0], "FIB: 100' ▱▱▱▱▱▱▱▱▱▱ 0%", 'Visual: FIB with 0 BOM');

// 4. SCENARIO: Reference Data Overrides
row = new Array(HEADERS.length).fill("");
row[HEADERS.indexOf("Daily Strand Footage")] = 1000;
row[HEADERS.indexOf("Total Strand Footage Complete?")] = 1000;
row[HEADERS.indexOf("Strand BOM Quantity")] = 500; // Row says 500

const refData = { aeBOM: 2000 }; // Ref says 2000
res = ProductionSummarizer.generateSummary(row, adapter, refData, null);

assertEqual(res.metrics.bomAE, 2000, 'Metrics: Ref BOM override');
assertEqual(res.visualLines[0], "AE: 1000' ▰▰▰▰▰▱▱▱▱▱ 50%", 'Visual: AE using Ref BOM');

console.log('\n✅ ALL PRODUCTION SUMMARIZER TESTS PASSED.');
