/**
 * src/01_Engine_SchemaMapper.js
 * Centralized Schema Mapper for Omni-PMO-App.
 * Unifies column hunting, aliasing, and normalization logic.
 */

/**
 * Creates a schema adapter for a set of headers.
 * @param {string[]} rawHeaders
 * @returns {SchemaAdapter}
 */
function createSchemaAdapter(rawHeaders) {
  return new SchemaAdapter(rawHeaders);
}

/**
 * Canonical Project Aliases
 */
const _SCHEMA_ALIASES = {
  "FDH": ["FDH Engineering ID", "FDH ID", "Project ID", "FDH"],
  "CITY": ["City", "Market"],
  "STAGE": ["Stage", "Phase"],
  "BSL": ["BSLs", "HHPs", "BSL"],
  "OFS": ["OFS DATE", "Budget OFS", "Target OFS"],
  "CX_START": ["CX Start"],
  "CX_COMPLETE": ["CX Complete", "CX End"],
  "BOM_UG": ["UG BOM Qty.", "UG BOM Quantity", "UG Footage", "UG BOM", "Est. UG Footage"],
  "BOM_AE": ["AE BOM Qty.", "Strand BOM Quantity", "AE BOM Quantity", "AE Footage", "AE BOM", "Strand BOM", "Est. AE Footage"],
  "BOM_FIB": ["Fiber BOM Qty.", "Fiber BOM Quantity", "Fiber Footage", "Fiber BOM", "Est. Fiber Footage"],
  "BOM_NAP": ["NAPs BOM Qty.", "NAP/Encl. BOM Qty.", "NAP BOM Quantity", "Total Naps", "NAP BOM", "NAP Qty.", "Est. Total Naps"],
  "DATE": ["Date", "Report Date", "Daily Work Date", "Report", "Daily", "Work", "Production", "Activity", "Service", "Log", "Timestamp"],
  "CONTRACTOR": ["Contractor", "Vendor", "Partner", "Company"],
  "COMMENT": ["Comment", "Note", "Vendor Comment", "Vendor Note"],
  "DRG": ["DRG", "Direct Vendor", "Direct Vendor Tracking", "DRG Tracker", "Direct Vendor Tracker"],
  "DRG_URL": ["DRG Tracker URL", "Direct Vendor Tracker URL", "DRG URL", "Direct Vendor URL", "Tracker URL"]
};

/**
 * @constructor
 */
function SchemaAdapter(rawHeaders) {
  this.rawHeaders = (rawHeaders || []).map(function(h) { return String(h || "").trim(); });
  this.lowerHeaders = this.rawHeaders.map(function(h) { return h.toLowerCase(); });
  this.cache = {};
}

/**
 * Resolves a canonical name or alias to a column index.
 * @param {string} name - Canonical name or specific header string.
 * @param {Object} [options] - Configuration for the search.
 * @param {string[]} [options.aliases] - Additional aliases to check.
 * @param {boolean} [options.isFootage] - If true, applies footage-specific guardrails.
 * @returns {number} The column index or -1 if not found.
 */
SchemaAdapter.prototype.getIdx = function(name, options) {
  if (!name) return -1;
  options = options || {};
  
  const normName = name.toLowerCase().trim();
  const cacheKey = normName + (options.isFootage ? "_footage" : "");
  if (this.cache[cacheKey] !== undefined) return this.cache[cacheKey];

  // 1. Exact match against raw headers
  let idx = this.lowerHeaders.indexOf(normName);
  if (idx !== -1) return (this.cache[cacheKey] = idx);

  // 2. Check canonical project aliases
  const canonicalKey = Object.keys(_SCHEMA_ALIASES).find(function(k) { return k.toLowerCase() === normName; });
  const aliases = (canonicalKey ? _SCHEMA_ALIASES[canonicalKey] : []).concat(options.aliases || []);
  
  if (aliases.length > 0) {
    for (let i = 0; i < aliases.length; i++) {
      let aIdx = this.lowerHeaders.indexOf(aliases[i].toLowerCase());
      if (aIdx !== -1) return (this.cache[cacheKey] = aIdx);
    }
  }

  // 3. Robust Column Hunt (Partial matches)
  const isFootageSearch = options.isFootage || normName.includes("footage") || normName.includes("completed");
  
  idx = this.lowerHeaders.findIndex(function(h) {
    // If it's a date search, reject target/ofs variants
    if (normName === "date" || (canonicalKey === "DATE")) {
      if (h.includes("target") || h.includes("ofs")) return false;
      // Date specific variants
      let dateVariants = _SCHEMA_ALIASES["DATE"];
      if (dateVariants.some(function(v) { return h.includes(v.toLowerCase()); })) return true;
    }

    // Substring match
    let match = h.includes(normName);
    if (!match && aliases.length > 0) {
      match = aliases.some(function(a) {
        if (Array.isArray(a)) {
          return a.every(function(v) { return h.includes(v.toLowerCase()); });
        }
        return h.includes(a.toLowerCase());
      });
    }

    if (match && isFootageSearch) {
      // 🛡️ Guard: Reject footage candidates that are actually dates or BOMs
      if (h.includes("date") || h.includes("target") || h.includes("bom") || h.includes("ofs") || h.includes("quantity")) return false;
    }

    return match;
  });

  return (this.cache[cacheKey] = idx);
};

/**
 * Normalizes a header key (Daily Upload style).
 */
SchemaAdapter.prototype.normalizeKey = function(val) {
  return String(val || "").toLowerCase().replace(/[^a-z0-9]/g, "");
};
