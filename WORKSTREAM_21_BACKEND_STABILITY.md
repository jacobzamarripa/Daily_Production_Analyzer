# Workstream 21 — Backend Stability & Resilient Ingestion

> **Status:** Phase 5 complete — Phase 6 remains | **Branch:** main | **Started:** 2026-04-02
> **Primary backend files:** `src/00_Config.js`, `src/01_Engine_Archive.js`, `src/02_Utilities.js`, `src/06_QBSync.js`
> **Goal:** Close the stability loop by validating real folder topology, staged output integrity, and safe rerun behavior.

## Current State
- Phase 1 restored the correct incoming folder and removed dangerous folder deletion logic.
- Phase 2 optimized archive sweeps with a folder cache map to avoid timeout-prone repeated lookups.
- Phase 3 added standalone cleanup triggers so archive movement can be rerun safely after ingestion.
- Phase 4 introduced `01_Pending_Upload` and `02_Uploaded` staging structure for manual QuickBase handoff.
- Phase 5 automated ingestion and compilation scheduling across the day.

## Remaining Scope
### Phase 6 — Cross-Folder Data Integrity Audit
- [ ] Verify configured folder IDs in `src/00_Config.js` against the actual Drive structure and intended business flow
- [ ] Trace the file lifecycle end to end:
  incoming -> processed -> archived
  compiled -> pending upload -> uploaded -> monthly consolidation
- [ ] Confirm that monthly consolidation only sweeps intended folders and never touches pending assets
- [ ] Confirm missing-report generation does not re-emit already uploaded or consolidated data
- [ ] Validate rerun safety for:
  `triggerIngestion`
  `triggerCompilation`
  `autoArchiveProcessedFiles`
  `generateMissingCompiledReports`
  `consolidateToMonthlyFolders`
- [ ] Document expected operator recovery steps when a run partially succeeds

## Audit Output Required
- [ ] Integrity findings captured in `AGENT_LOG.md`
- [ ] PRD phase checkbox updated when audit is complete
- [ ] Obsidian mirrors synced after sign-off

## Constraints
- Never reintroduce folder deletion logic such as `setTrashed(true)` in recursive sweeps
- Prefer additive validation and logging over destructive correction logic
- Preserve the `01_Pending_Upload` -> `02_Uploaded` contract as the manual control boundary
