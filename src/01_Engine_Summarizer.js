/**
 * src/01_Engine_Summarizer.js
 * Production Summarizer Engine for Omni-PMO-App.
 * Unifies visual string generation and production metric extraction.
 */

const ProductionSummarizer = (function() {

  /**
   * Generates a structured production summary.
   * @param {Object[]} row - Raw history row data.
   * @param {SchemaAdapter} adapter - The schema adapter for the headers.
   * @param {Object} refData - Reference data for the FDH.
   * @param {Object} vTracker - Vendor tracker data for the FDH.
   * @returns {Object} { visualLines: string[], metrics: Object }
   */
  function generateSummary(row, adapter, refData, vTracker) {
    const summary = [];
    const metrics = {};

    // 1. Data Extraction
    metrics.dailyUG = safeParseFootage(row[adapter.getIdx("DAILY_UG")]);
    metrics.totalUG = safeParseFootage(row[adapter.getIdx("TOTAL_UG")]);
    metrics.bomUG   = (refData && refData.ugBOM > 0) ? refData.ugBOM : safeParseFootage(row[adapter.getIdx("BOM_UG")]);

    metrics.dailyAE = safeParseFootage(row[adapter.getIdx("DAILY_AE")]);
    metrics.totalAE = safeParseFootage(row[adapter.getIdx("TOTAL_AE")]);
    metrics.bomAE   = (refData && refData.aeBOM > 0) ? refData.aeBOM : safeParseFootage(row[adapter.getIdx("BOM_AE")]);

    metrics.dailyFIB = safeParseFootage(row[adapter.getIdx("DAILY_FIB")]);
    metrics.totalFIB = safeParseFootage(row[adapter.getIdx("TOTAL_FIB")]);
    metrics.bomFIB   = (refData && refData.fibBOM > 0) ? refData.fibBOM : safeParseFootage(row[adapter.getIdx("BOM_FIB")]);

    metrics.dailyNAP = safeParseFootage(row[adapter.getIdx("DAILY_NAP")]);
    metrics.totalNAP = safeParseFootage(row[adapter.getIdx("TOTAL_NAP")]);
    metrics.bomNAP   = (refData && refData.napBOM > 0) ? refData.napBOM : safeParseFootage(row[adapter.getIdx("BOM_NAP")]);

    metrics.ugPct  = vTracker ? vTracker.ugPct : 0;
    metrics.aePct  = vTracker ? vTracker.aePct : 0;
    metrics.fibPct = vTracker ? vTracker.fibPct : 0;
    metrics.napPct = vTracker ? vTracker.napPct : 0;

    // 2. Visual Generation
    _addPhaseSummary(summary, "UG", metrics.dailyUG, metrics.totalUG, metrics.bomUG, metrics.ugPct, true);
    _addPhaseSummary(summary, "AE", metrics.dailyAE, metrics.totalAE, metrics.bomAE, metrics.aePct, true);
    _addPhaseSummary(summary, "FIB", metrics.dailyFIB, metrics.totalFIB, metrics.bomFIB, metrics.fibPct, true);
    _addPhaseSummary(summary, "NAP", metrics.dailyNAP, metrics.totalNAP, metrics.bomNAP, metrics.napPct, false);

    if (vTracker) {
      summary.push("\n[📡 Tracker Linked]");
    }

    return {
      visualLines: summary,
      metrics: metrics
    };
  }

  /**
   * Internal helper for phase string building.
   * @private
   */
  function _addPhaseSummary(summary, phaseName, daily, total, bom, trkPct, isFootage) {
    const hasDaily = daily > 0;
    const hasTracker = trkPct && trkPct > 0;
    const unit = isFootage ? "'" : "";

    if (hasDaily) {
      const pct = bom > 0 ? (total / bom) : 0;
      const star = pct >= 1 ? " ★" : "";
      summary.push(`${phaseName}: ${daily}${unit} ${drawProgressBar(Math.min(1, pct))} ${Math.round(pct * 100)}%${star}`);
    }
    if (hasTracker) {
      const star = trkPct >= 1 ? " ★" : "";
      summary.push(`[Tracker] ${phaseName}: ${drawProgressBar(Math.min(1, trkPct))} ${Math.round(trkPct * 100)}%${star}`);
    }
  }

  return {
    generateSummary: generateSummary
  };

})();

if (typeof module !== 'undefined') {
  module.exports = ProductionSummarizer;
}

/**
 * Shared Visual Progress Bar Helper.
 */
function drawProgressBar(percent) {
  const bars = 10;
  const fill = Math.round(percent * bars);
  return "▰".repeat(fill) + "▱".repeat(bars - fill);
}
