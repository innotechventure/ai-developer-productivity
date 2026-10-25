# SnipURL Constitution
<!-- Spec Kit governance document for the SnipURL URL shortener. -->

## Core Principles

### I. API-First Contract
Every public endpoint is defined by a Pydantic request/response model and
exposed through FastAPI's OpenAPI schema. Route handlers accept typed models and
return typed models — no raw dict manipulation, no untyped JSON passthrough.
The OpenAPI spec is the single source of truth; consumers read the spec, not
the implementation.

### II. Storage Abstraction
All persistence goes through a single `Storage` protocol. Route handlers and
services never import or call a database driver directly. Swapping the backing
store (in-memory, Redis, Postgres) changes one adapter, not N files.

### III. Test-First (NON-NEGOTIABLE)
TDD is mandatory. For every behavior: write the test, confirm it fails,
implement, confirm it passes, refactor. The Red-Green-Refactor cycle is
enforced by the test suite — a feature with no failing-then-passing test is
not considered done.

### IV. Observability
Every request carries a correlation ID propagated through the request/response
lifecycle. All logs are structured (JSON) and include the correlation ID. Errors
are logged with context and never swallowed. The service exposes health and
metrics endpoints so operational behavior is visible without new instrumentation.

### V. Simplicity
Start small. No framework inside a framework. YAGNI: every abstraction must earn
its place by solving a real, current problem. If a feature is not needed today,
it is not built today.

## Additional Constraints
Technology stack is fixed: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, httpx
for outbound calls, pytest for tests. Dependencies are pinned in
`requirements.txt` and reviewed on every change. No new third-party dependency
is added without a documented reason. Security: URLs are validated and
normalized before storage; redirects are server-side only; no
user-controlled redirect targets are served.

## Development Workflow
All changes land via pull request. Every PR must pass the full test suite and
include a test for any new behavior. Code review is required for every change —
a PR with no reviewer is not merged. Features follow the Spec Kit flow:
specify, plan, then implement. Complexity beyond the obvious must be justified
in the PR description.

## Governance
This constitution supersedes all other practices for the SnipURL project. Any
conflict between this document and another practice is resolved in favor of
this constitution. Amendments require a documented proposal, a PR, and approval;
the amended version is recorded with its new version and date. All PRs and
reviews must verify compliance with these principles. Use the Spec Kit
workflow (`/speckit-*`) for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-10-24 | **Last Amended**: 2026-10-24

## Appendix: Implemented Fixes Reference

The following document summarizes all bugfixes and wiring completed to connect the SnipURL front-end to the real backend API:

**See**: `C:\outskill_capstone\ai-developer-productivity\plans\synchronous-prancing-pie.md`

This plan file documents:
- Backend bug fixes: `increment_clicks()` (storage.py), `encode_base62(0)` (service.py)
- Custom short code support: added `code` field to `ShortenRequest` (models.py), extended `shorten()` (service.py), updated API route (main.py)
- API route restructuring: `/api/shorten`, `/api/stats/{code}`, `/r/{code}` to avoid StaticFiles collision
- Static file serving: UI mounted at `/ui/`, root `/` redirects to `/ui/`
- Frontend wiring: `ui/config.js`, `ui/app.js` with real `fetch()` to backend, error handling (400/401/429/network)
- Test updates: removed `xfail(strict=True)` markers, updated endpoint paths
- All 11 tests pass; manual verification complete