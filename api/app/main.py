"""FastAPI application and HTTP routes."""

from fastapi import FastAPI

from app import __version__

app = FastAPI(
    title="Toolito API",
    version=__version__,
    description="Little tools, big results. Server-side PDF compression.",
)


@app.get("/health")
def health() -> dict[str, str]:
    """Tell callers (Cloud Run, the website) that the service is alive."""
    return {"status": "ok", "version": __version__}
