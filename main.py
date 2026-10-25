from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from auth import require_api_key
from models import ShortenRequest, ShortenResponse, StatsResponse
from ratelimit import RateLimiter, rate_limit
from storage import Storage
from service import shorten, record_visit

app = FastAPI(title="SnipURL", version="0.1.0")
store = Storage()

shorten_limiter = RateLimiter(limit=10, window_seconds=60)
redirect_limiter = RateLimiter(limit=60, window_seconds=60)
stats_limiter = RateLimiter(limit=30, window_seconds=60)


@app.post(
    "/api/shorten",
    response_model=ShortenResponse,
    dependencies=[Depends(require_api_key), Depends(rate_limit(shorten_limiter))],
)
def create_short_url(req: ShortenRequest):
    code = shorten(store, req.url, req.code)
    return ShortenResponse(code=code, short_url=f"http://snip.url/{code}")


@app.get("/r/{code}", dependencies=[Depends(rate_limit(redirect_limiter))])
def redirect_to_url(code: str):
    long_url = store.get_url(code)
    if long_url is None:
        raise HTTPException(status_code=404, detail="Short code not found")
    store.increment_clicks(code)
    record_visit(code)
    return RedirectResponse(long_url)


@app.get(
    "/api/stats/{code}",
    response_model=StatsResponse,
    dependencies=[Depends(require_api_key), Depends(rate_limit(stats_limiter))],
)
def get_stats(code: str):
    return StatsResponse(
        code=code,
        long_url=store.get_url(code),
        clicks=store.get_clicks(code),
    )

# Serve static UI files from /ui directory (mounted last so API routes take precedence)
ui_path = Path(__file__).parent / "ui"
app.mount("/ui", StaticFiles(directory=ui_path, html=True), name="ui")

# Redirect root to /ui/
@app.get("/")
def root_redirect():
    return RedirectResponse(url="/ui/")