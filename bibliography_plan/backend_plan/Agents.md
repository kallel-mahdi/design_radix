# Agents Brief — Bibliography Service

Welcome! You’re assisting Mahdi in building a bibliography microservice (`services/bibliography-service`) that matches the Citable UI mockups. Mahdi is not a professional software engineer, so instructions must be clear and fail-safe.

## Ground Rules
1. **Assume MVP scope** — follow `Spec.md` and `ImplementationChecklist.md`. Do not over-engineer; production hardening (rate limits, IAM, S3, collaboration) is reserved for senior teammates.
2. **Match existing stack** — Same toolchain as other services: Node.js 22+, Express, TypeScript, Mongoose, Winston logging, `ts-node-dev` for local runs, `npm run build` → `tsc`, and the shared Dockerfile pattern. Stick to the repo’s microservice layout (`src/index.ts`, `routes/`, `models/`, `middleware/`, `utils/`) just like document-service and api-gateway.
3. **Auth model** — trust API Gateway headers using the `trustGatewayAuth` middleware pattern; include a development bypass for local testing.
4. **Storage** — save uploaded PDFs to local volume `./data/bibliography/uploads`. Leave TODO comments where S3 integration would hook in later.
5. **External APIs** — Crossref REST for DOI import. Use polite user-agent, handle basic errors; advanced rate limiting is future work.
6. **Duplicate detection** — run synchronously on create/import (DOI exact match + normalized title/year). Persist results for the Duplicates view.
7. **Documentation** — keep README and inline comments beginner-friendly. If you change interfaces, update `Spec.md` and `Roadmap.md`.
8. **Tooling integration** — whenever you add scripts or configs, mirror the conventions in the backend root (`package.json` workspace scripts, Docker Compose service definitions, `.env.example` files).

## When in Doubt
- Check `bibliography/docs/Spec.md` first.
- For Zotero learnings, run a separate agent in the Zotero repository (see prompt below).
- Review `bibliography/User_interface/claude.md` for UI expectations and priority breakdown.
- Ask Mahdi or teammates to resolve product questions that remain open in Spec.md §8.

## Zotero Agent Prompt (copy/paste)
Use this prompt to run a separate agent against a local checkout of the Zotero repo. Adjust paths as needed.

"You are embedded in a local Zotero repository checkout. Tasks:
- Map Zotero’s canonical JSON and export pipelines to our needs: identify where CSL‑JSON is produced and how fields are normalized. List files and line refs that serialize items to CSL JSON and to BibTeX.
- Summarize Zotero’s duplicate detection signatures and grouping logic (ISBN/DOI/title+creator) and note how to adapt a minimal DOI + normalized title/year detector.
- Explain attachment handling patterns (single primary PDF vs multiple attachments) and recommend a migration path from one‑PDF MVP to multi‑attachment.
- Output: a concise brief with file paths and line ranges to re‑read, and a checklist of implementation steps we can port to our Node service. Keep it self‑contained for a teammate."

## Deliverables Expectations
- Working Express service with routes outlined in Spec.md.
- Mongoose models for References, Collections, Tags, ProjectLink, DuplicateCandidate.
- Multer-based PDF upload handling and simple BibTeX exporter.
- Minimal search/filter endpoint using Mongo aggregation.
- Health check and Docker Compose wiring similar to existing services.
- README with setup instructions, env vars, sample curl commands, and known TODOs.

## Logging & Error Handling
- Use Winston logging as per document service. Log structured details for imports and duplicate detection.
- Centralize error handling; return JSON with `success`, `message`, optional `details`.

## Testing
- Prioritize sanity checks (manual curl/Postman). Optional but encouraged: Jest unit tests for helper functions (Crossref mapper, duplicate detector).
- If adding tests, note instructions for running them in README.

## Roadmap Awareness
- Features explicitly deferred (bulk actions, collaboration roles, natbib preamble, PDF peek overlay, etc.) must be left as TODOs or stub endpoints returning 501. Do not silently implement them.

Thank you for helping! Keep notes of outstanding issues and sync with the team before making architectural changes. 
