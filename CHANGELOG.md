# SnipURL Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-24

### Added
- **Frontend (UI)**: Complete warm stationery editorial theme landing page at `/ui/`
  - Hero section with spec strip (API, rate limits, storage, auth)
  - Features/argument section (Fast, Simple, Open, Observable)
  - Interactive demo with 3 variants: Basic, Custom Code, With Stats
  - SVG drawing animation with scroll-triggered path reveal
  - Travelling product scroll-driven animation
  - Wordmark spread on scroll (hero + close sections)
  - Technical details & benchmarks sections
  - Dark mode via `prefers-color-scheme`
  - Reduced motion support via `prefers-reduced-motion`
  - Full accessibility: ARIA labels, keyboard navigation, focus styles
  - Responsive breakpoints (900px, 600px)
- **Frontend Configuration**: `ui/config.js` for API base URL (`/api`) and dev API key (`dev-key`)
- **Static File Serving**: FastAPI `StaticFiles` mount at `/ui/` with root redirect (`/` → `/ui/`)
- **Custom Short Codes**: Optional `code` field in `POST /api/shorten` (alphanumeric + hyphen + underscore, 1-32 chars, collision-checked)

### Changed
- **API Routes Namespaced**:
  - `POST /shorten` → `POST /api/shorten`
  - `GET /stats/{code}` → `GET /api/stats/{code}`
  - `GET /{code}` (redirect) → `GET /r/{code}`
- **Frontend Wiring**: Demo forms now call real backend API via `fetch()` with `X-API-Key` header
- **Error Handling**: User-friendly messages for 400 (validation), 401 (auth), 429 (rate limit), network errors

### Fixed
- **`storage.py:21` - `increment_clicks()`**: Was discarding `count + 1` result; now correctly assigns `self._clicks[code] = count + 1`
- **`service.py:11` - `encode_base62(0)`**: Was returning empty string `""`; now returns `"a"` (first alphabet character)
- **`main.py:33` - Redirect 404**: Unknown short codes now return proper `404 Not Found` instead of crashing on `None` URL

### Tests
- **Removed `xfail(strict=True)`** markers from previously planted bugs:
  - `test_click_counter_increments` — now passes
  - `test_encode_base62_handles_zero` — now passes
- **Updated test endpoints** to match new API routes (`/api/shorten`, `/api/stats/`, `/r/{code}`)
- **All 11 tests pass** (9 auth/ratelimit + 2 core functionality)

### Developer Experience
- Single-command dev: `uvicorn main:app --reload` serves both API and UI
- Zero build step — plain static files
- Configuration via `ui/config.js` (overridable at deploy time)

---

## [0.1.0] - 2026-10-24 (Initial Scaffold)

### Added
- FastAPI backend with in-memory storage
- URL shortening via Base62 encoding
- Click tracking
- API key authentication (`X-API-Key` header)
- Rate limiting (sliding window, in-memory)
- Redirect endpoint
- Stats endpoint
- Pytest test suite with 2 planted bugs (`xfail`)

---

## Unreleased / Planned

- [ ] Redis/PostgreSQL storage adapter (Storage Abstraction principle)
- [ ] Correlation ID propagation (Observability principle)
- [ ] Structured JSON logging (Observability principle)
- [ ] Health/metrics endpoints (Observability principle)
- [ ] OpenAPI/Swagger UI at `/docs`
- [ ] URL validation before storage (security)

---

## Notes

### Pre-existing Known Issues (Not Fixed)
- `service.py:14` - `record_visit()` uses mutable default argument (`log=[]`). Harmless in single-process dev; would need fix for multi-worker production.

### Breaking Changes in 1.0.0
- API endpoints moved from root (`/shorten`, `/stats/{code}`, `/{code}`) to namespaced paths (`/api/shorten`, `/api/stats/{code}`, `/r/{code}`). Update any external consumers.

---

## Links
- [Implementation Plan](C:\outskill_capstone\ai-developer-productivity\plans\synchronous-prancing-pie.md)
- [Constitution Reference](.specify/memory/constitution.md#appendix-implemented-fixes-reference)