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

const utilities = read('src/02_Utilities.js');
const startupBoot = read('src/_module_startup_boot.html');
const webappCore = read('src/_module_webapp_core.html');
const signalModule = read('src/_module_signal.html');

assertPattern(utilities, /function _decoratePayloadMeta\(payload, overrides\)/, 'V2 payload metadata decorator exists', 'src/02_Utilities.js');
assertPattern(utilities, /return _decoratePayloadMeta\(JSON\.parse\(cached\), \{ source: 'cache' \}\);/, 'V2 cache hits are metadata-decorated', 'src/02_Utilities.js');
assertPattern(utilities, /return _decoratePayloadMeta\(JSON\.parse\(payloadStr\), \{[\s\S]*source: 'drive'/, 'V2 drive fetches are metadata-decorated', 'src/02_Utilities.js');
assertPattern(utilities, /source: 'v1-fallback'/, 'V1 fallback path is explicit', 'src/02_Utilities.js');

assertPattern(startupBoot, /function markStartupMetric\(name, meta\)/, 'Startup metric helper exists', 'src/_module_startup_boot.html');
assertPattern(startupBoot, /function scheduleAfterFirstPaint\(fn\)/, 'Post-paint scheduler exists', 'src/_module_startup_boot.html');
assertPattern(startupBoot, /function getPayloadMeta\(payload\)/, 'Payload meta reader exists', 'src/_module_startup_boot.html');

assertPattern(webappCore, /function applyDashboardPayload\(data, contextLabel\)/, 'Dashboard payload apply helper exists', 'src/_module_webapp_core.html');
assertPattern(webappCore, /scheduleAfterFirstPaint\(function\(\) \{\s*hydrateDashboardSecondaryState\(data\);/m, 'Secondary dashboard hydration is deferred until after first paint', 'src/_module_webapp_core.html');
assertPattern(webappCore, /markStartupMetric\('dashboard-init-critical-start'/, 'Critical startup metrics are recorded', 'src/_module_webapp_core.html');
assertPattern(webappCore, /\.getDashboardDataV2\(\);/, 'Startup still hydrates from V2 payload endpoint', 'src/_module_webapp_core.html');

assertPattern(signalModule, /function resetSignalCaches\(\)/, 'Signal cache reset helper exists', 'src/_module_signal.html');
assertPattern(signalModule, /if \(window\.__signalPollingActive \|\| _signalPollingTimer\) return;/, 'Signal polling remains singleton-guarded', 'src/_module_signal.html');
assertPattern(signalModule, /document\.visibilityState && document\.visibilityState !== 'visible'/, 'Signal polling skips when the document is hidden', 'src/_module_signal.html');

console.log('\nStartup contract validation passed.');
