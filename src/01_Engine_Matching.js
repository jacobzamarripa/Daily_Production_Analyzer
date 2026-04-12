/**
 * FILE: 01_Engine_Matching.js
 * PURPOSE: Fuzzy matching logic for project ID normalization and deduplication guards
 * SPLIT FROM: 01_Engine.js (WS16 modularization)
 */

// --- 2. LOGIC & MATCHING ---

function attemptFuzzyMatch(badId, officialKeys, optionalCityContext = null, refDict = null) {
  if (!badId) return null;
  let cleanId = badId.toString().toUpperCase().trim();

  const extractMarketPrefix = (value) => {
    let normalized = String(value || "").toUpperCase().trim();
    let match = normalized.match(/^([A-Z]{3})/);
    return match ? match[1] : "";
  };

  let marketPrefix = extractMarketPrefix(cleanId);
  if (!marketPrefix) return null;

  // 1. Extract the F-Number
  let fMatch = cleanId.match(/F[- ]*0*(\d+)/);
  if (!fMatch) return null;
  let fNum = fMatch[1]; 

  // 2. Find candidates sharing the exact F-Number and market prefix.
  let candidates = officialKeys.filter(k => {
      let key = String(k || "").toUpperCase().trim();
      let keyMarketPrefix = extractMarketPrefix(key);
      let kMatch = key.match(/F[- ]*0*(\d+)$/);
      return keyMarketPrefix === marketPrefix && kMatch && kMatch[1] === fNum;
  });

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // 3. Triangulate with City Context only after the market gate has been enforced.
  if (optionalCityContext && refDict) {
      let safeContext = optionalCityContext.toUpperCase().replace(/[^A-Z]/g, '');
      let cityCandidates = candidates.filter(k => {
          let city = (refDict[k] && refDict[k].city) ? refDict[k].city.toUpperCase().replace(/[^A-Z]/g, '') : "";
          return city && (safeContext.includes(city) || city.includes(safeContext));
      });
      if (cityCandidates.length === 1) return cityCandidates[0];
  }

  return null;
}
