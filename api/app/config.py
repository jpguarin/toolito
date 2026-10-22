"""Settings read from environment variables (see docs/API.md)."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str]
    max_file_mb: int
    max_pages: int
    processing_timeout_s: int
    rate_limit: str

    @property
    def max_file_bytes(self) -> int:
        return self.max_file_mb * 1024 * 1024


def load_settings() -> Settings:
    """Build settings from the environment, falling back to local defaults."""
    origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:4321")
    return Settings(
        allowed_origins=[o.strip() for o in origins.split(",") if o.strip()],
        max_file_mb=int(os.environ.get("MAX_FILE_MB", "30")),
        max_pages=int(os.environ.get("MAX_PAGES", "500")),
        processing_timeout_s=int(os.environ.get("PROCESSING_TIMEOUT_S", "60")),
        rate_limit=os.environ.get("RATE_LIMIT", "20/minute"),
    )


settings = load_settings()
