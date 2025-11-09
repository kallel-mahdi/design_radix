# Zotero Architecture Notes for Bibliography Service MVP

## Repository Overview
- Core client logic lives under `chrome/content/zotero/xpcom`.
- Shared resources (SQL schema, CSL styles, WebAssembly) are in `resource/`.
- Translation pipelines and citeproc styles are git submodules (see `git submodule status` for required checkouts).

## Data Model & Persistence
- **Relational schema:** `resource/schema/userdata.sql:158` defines normalized tables for `items`, `itemData`, `itemDataValues`, `itemAttachments`, `itemNotes`, `tags`, `collections`, and `fulltext*` tables. Strings are deduplicated via `itemDataValues`, reducing storage and easing comparisons.
- **Entity objects:** `chrome/content/zotero/xpcom/data/item.js:20` exposes the `Zotero.Item` API, lazily hydrating creators, attachments, and tags. Reuse the separation between database rows and rich domain objects.
- **Field metadata:** `chrome/content/zotero/xpcom/data/itemFields.js:60` loads field definitions (labels, formats, per-type applicability) into memory; consistent field IDs underpin CSL export and translators.
- **Cached type infrastructure:** `chrome/content/zotero/xpcom/data/cachedTypes.js:51` provides memoized lookup tables for item types, creator types, file types, etc.—mirror this pattern to keep hot metadata in-memory.
- **Canonical JSON:** `chrome/content/zotero/xpcom/data/item.js:5483` serializes bibliography items to the public API/CSL JSON format; `item.js:5155` ingests JSON, migrating `extra` fields into canonical storage.
- **Raw metadata retention:** `chrome/content/zotero/xpcom/utilities_internal.js:1055` parses `extra` field key-value pairs into real fields while leaving untouched residues—for provenance, keep original source blobs alongside normalized data.
- **Deduplication:** `chrome/content/zotero/xpcom/duplicates.js:49` uses a disjoint-set forest keyed on ISBN/DOI/title+creator signatures. Consider building a similar union-find deduper for automatic merge suggestions.
- **Schema migrations:** `chrome/content/zotero/xpcom/schema.js:2698` iterates versioned migration steps; `schema.js:1730` runs integrity checks and reconciliation of missing tables. Adopt versioned schema scripts with idempotent checks.

## Import & Ingestion Pipelines
- **Translator item saver:** `chrome/content/zotero/xpcom/translation/translate_item.js:54` orchestrates item creation, attachment handling, and progress callbacks. Attachments are staged and saved after top-level items to ensure keys exist.
- **Attachment handling:** `_saveAttachment` in `translate_item.js:580` enforces allowed URL schemes, supports inline snapshot HTML, and funnels linked vs. stored-file logic through `Zotero.Attachments`. It calls `_addToDB` transactional helpers in `attachments.js:20`.
- **Tag sanitization & auto-tags:** `_cleanTags` in `translate_item.js:1032` respects user preferences for automatic tags—worth mirroring to flag system-generated keywords.
- **Open-access PDF enrichment:** `_getOpenAccessPDFURLs` and `saveOpenAccessAttachment` (`translate_item.js:335`, `:372`) attempt DOI-based OA retrieval post-import.
- **Remote translation bridge:** `chrome/content/zotero/RemoteTranslate.mjs:36` feeds schema JSON and preferences to connector-side actors, highlighting how to decouple ingestion workers from core logic.
- **Metadata recognition queue:** `chrome/content/zotero/xpcom/recognizeDocument.js:391` runs asynchronous DOI/arXiv/ISBN lookups with retry-aware queues; integrable as a background job system for enrichment.
- **Translator metadata cache:** `chrome/content/zotero/xpcom/translation/translators.js:78` populates the `translatorCache` table so available translators and their configs can be enumerated without filesystem scans.

## Citation Formatting & Export
- **CSL rendering:** `chrome/content/zotero/xpcom/cite.js:660` invokes `Zotero.Utilities.Item.itemToCSLJSON`, ensuring compatibility with citeproc-js and citeproc-rs.
- **Citeproc-rs bridge:** `chrome/content/zotero/xpcom/citeprocRsBridge.js:33` loads the WASM driver and mirrors the citeproc-js API. Engines are cached per `(style, locale, format)` at `chrome/content/zotero/xpcom/style.js:822`.
- **Style cache & updates:** `style.js:34` preloads CSL metadata, tracks locale availability, and clears caches on memory pressure notifications (`style.js:46`). Use similar caching to avoid recompiling styles per request.
- **Export translators:** `chrome/content/zotero/fileInterface.js:34` feeds `Zotero.Translate.Export`, surfacing translators for BibTeX (`9cb70025-a888-4a29-a210-93ec52da40d4`), BibLaTeX (`b6e39b57-8942-4d11-8259-342c46ce395f`), CSV, and CSL JSON (IDs listed in `server_localAPI.js:38`).
- **Local API:** `chrome/content/zotero/xpcom/server/server_localAPI.js:1` mirrors the public REST API for local integrations—good blueprint for a Node microservice façade.

## Search & Indexing
- **Condition registry:** `chrome/content/zotero/xpcom/data/searchConditions.js:35` enumerates searchable fields and operators, including fulltext predicates.
- **Query builder:** `chrome/content/zotero/xpcom/data/search.js:520` builds SQL and applies post-filters for fulltext, parents/children, and temp-table scopes. It merges indexed word searches with regexp fallbacks.
- **Fulltext subsystem:** `chrome/content/zotero/xpcom/fulltext.js:10` (plus `pdfWorker/manager.js:600`) manages PDF-to-text extraction, worker queues, and synchronization state. Database schema for fulltext lives in `resource/schema/userdata.sql:435`.

## Caching & Performance Patterns
- **Memoized lookups:** `cachedTypes.js:51` caches static tables on startup; `style.js:822` caches citeproc engines; translator metadata stored via `translators.js:646`. Design analogous caches for frequently accessed schema definitions and compiled templates.
- **Progress queues:** Import/recognition workflows use notifier and progress queue infrastructure (`recognizeDocument.js:122` et seq.) to throttle work and surface status.

## Sync, Collaboration & Storage
- **Sync runner:** `chrome/content/zotero/xpcom/sync/syncRunner.js:24` manages concurrency (`ConcurrentCaller`), exponential back-off, and serialized sessions across libraries.
- **Engine loop:** `chrome/content/zotero/xpcom/sync/syncEngine.js:19` handles download/upload cycles, conflict resolution, and full-sync triggers.
- **REST client:** `chrome/content/zotero/xpcom/sync/syncAPIClient.js:40` wraps API endpoints (keys, settings, items, deletions) with pagination, retry intervals, and 503 `Retry-After` support.
- **Credential storage:** `chrome/content/zotero/xpcom/sync/syncLocal.js:20` persists API keys via the login manager, migrates legacy credentials, and verifies user identity before syncing.
- **Streaming updates:** `chrome/content/zotero/xpcom/streamer.js:20` opens a WebSocket (`ZOTERO_CONFIG.STREAMING_URL`) to receive sync hints or translator/style updates—useful for real-time cache invalidation.
- **Storage backends:** `chrome/content/zotero/xpcom/storage/webdav.js:20` and `zfs.js` abstract file sync, with retry intervals and metadata verification (mtime/md5). Attachment metadata updates occur via `storageEngine.js`.

## Security & Sanitization
- **HTTP helper:** `chrome/content/zotero/xpcom/http.js:1` masks API keys in logs, implements retry windows, enforces offline checks, and provides cancellers—model your HTTP layer after this.
- **Attachment restrictions:** `translate_item.js:629` prohibits non-HTTP(S) attachment URLs and disallows arbitrary file URLs, mitigating path traversal.
- **Tag cleaning & auto-tag controls:** `translate_item.js:1032` allows forced tag types and disables auto tags when configured.
- **Prefs & feature flags:** Defaults reside in `defaults/preferences/zotero.js:1`, with upgrade logic in `chrome/content/zotero/xpcom/prefs.js:26` (e.g., migrating reader themes, resetting hardware acceleration toggles).

## Testing & Tooling
- **Unit tests:** Mocha-style suites live in `test/tests/`, e.g., `itemTest.js:1` (field behavior, migrations) and `syncLocalTest.js:5` (API-key storage).
- **Test runner:** `test/runtests.sh` executes UI-independent suites via xvfb.
- **CI pipeline:** `.github/workflows/ci.yml:1` builds the app, caches node modules/xulrunner, runs tests, and uploads artifacts. Utilities have their own Jest suite (`chrome/content/zotero/xpcom/utilities/package-lock.json` is cached before running `npm test`).

## Configuration & Deployment Notes
- **Core constants:** `resource/config.mjs:1` defines API base URLs, streaming endpoints, support links, etc.—override these in deployment-specific builds.
- **Submodules:** Ensure `chrome/content/zotero/xpcom/translate`, `translators/`, `resource/schema/global`, and CSL locales (`chrome/content/zotero/locale/csl`) are initialized; they are not present by default without `git submodule update --init --recursive`.
- **Gecko dependencies:** Much of the code relies on XPCOM (`Components`, `Services`). For a Node.js microservice, reimplement these abstractions (e.g., replace login manager with your secrets store, swap IOUtils with fs/promises).

## MVP Implementation Guidance
1. **Data Layer**
   - Reproduce the core Zotero schema (at least `items`, `itemData`, `itemDataValues`, `creators`, `itemCreators`, `itemAttachments`, `itemTags`, `collections`).
   - Implement value normalization and `extra` parsing from `utilities_internal.js:1055` to stay compatible with CSL and Zotero exports.
   - Provide a deduplication service using ISBN/DOI/title+creator heuristics (`duplicates.js:101`) for merge suggestions.
2. **Import & Normalization**
   - Integrate translator execution or build adapters that mimic `Zotero.Translate.ItemSaver` behavior, maintaining transactional item + child creation.
   - Preserve source exports (BibTeX/RIS/CSL JSON) alongside normalized items for traceability.
3. **Citation Services**
   - Adopt citeproc-rs (preferred) or citeproc-js using the same CSL JSON schema (`itemToCSLJSON`), style caching, and locale loading.
   - Cache compiled style engines with keys `(styleID, locale, format)` to avoid per-request rebuilds.
4. **Search & Fulltext**
   - Implement filtered SQL builders inspired by `search.js`, with optional fulltext indexes (e.g., SQLite FTS) seeded via PDF extraction similar to `fulltext.js`.
   - Support tag filters, collection scopes, parent/child expansion, and boolean joins.
5. **Sync & Collaboration (Future)**
   - For cloud sync, reuse concepts from `syncRunner` and `syncEngine`: library versioning, incremental uploads/downloads, conflict retries, background queues.
   - Implement WebSocket-based invalidation akin to `streamer.js` once multi-client edits arrive.
6. **APIs & Tooling**
   - Expose REST endpoints modeled after `server_localAPI.js`, returning the same schemas to stay compatible with Zotero connectors or third-party tools.
   - Maintain CI/test coverage similar to Zotero’s workflows, including translator regression tests if you embed them.
7. **Security & Ops**
   - Scrub logs for secrets using patterns from `http.js`, enforce attachment sanitizer rules, and gate background tasks behind user preferences/feature flags.
   - Mirror preference/feature toggles via environment config or dedicated settings tables (`defaults/preferences/zotero.js` provides a starting inventory).

## Quick Reference Paths
- Schema: `resource/schema/userdata.sql`
- Item API: `chrome/content/zotero/xpcom/data/item.js`
- Translators: `chrome/content/zotero/xpcom/translation/translate_item.js`
- Citeproc bridge: `chrome/content/zotero/xpcom/citeprocRsBridge.js`
- Search builder: `chrome/content/zotero/xpcom/data/search.js`
- Fulltext: `chrome/content/zotero/xpcom/fulltext.js`, `pdfWorker/manager.js`
- Sync: `chrome/content/zotero/xpcom/sync/`
- Configuration: `resource/config.mjs`, `defaults/preferences/zotero.js`
- Tests: `test/tests/`, `test/runtests.sh`

Leverage these locations and patterns to architect the MVP while maintaining compatibility with Zotero’s data model, translators, and citation tooling. Supporting code for translators, schema locales, and citeproc styles must be kept in sync with upstream submodules to avoid subtle incompatibilities.
