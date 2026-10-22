"""FastAPI application and HTTP routes."""

import tempfile
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.compressor import Level
from app.config import settings
from app.errors import register_error_handlers
from app.isolation import compress_with_timeout
from app.rate_limit import limiter
from app.validation import check_pdf, save_upload

app = FastAPI(
    title="Toolito API",
    version=__version__,
    description="Little tools, big results. Server-side PDF compression.",
)
app.state.limiter = limiter  # slowapi looks for it here.
register_error_handlers(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST"],
    # Without this, browser JavaScript cannot read these response headers.
    expose_headers=[
        "X-Original-Size",
        "X-Compressed-Size",
        "X-Already-Optimized",
        "Retry-After",
    ],
    max_age=600,  # Browsers may cache the preflight answer for 10 minutes.
)


@app.get("/health")
def health() -> dict[str, str]:
    """Tell callers (Cloud Run, the website) that the service is alive."""
    return {"status": "ok", "version": __version__}


@app.post("/v1/compress-pdf")
@limiter.limit(settings.rate_limit)
def compress_pdf_route(
    request: Request,  # Required by slowapi to read the client IP.
    file: Annotated[UploadFile, File(description="The PDF to compress.")],
    level: Annotated[Level, Form()] = "recommended",
) -> Response:
    """Compress an uploaded PDF and return it in the same response.

    A plain `def` (not `async`) on purpose: compression is CPU-heavy, so
    FastAPI runs it in a worker thread instead of blocking the server.
    """
    # Files live only inside this folder, which is deleted when the block
    # ends, even on errors. The user's original filename is never used.
    with tempfile.TemporaryDirectory(prefix="toolito-") as workdir:
        input_path = Path(workdir) / "input.pdf"
        output_path = Path(workdir) / "output.pdf"
        save_upload(file.file, input_path, settings.max_file_bytes)
        check_pdf(input_path, settings.max_pages)
        result = compress_with_timeout(
            input_path, output_path, level, settings.processing_timeout_s
        )
        # Read into memory before the folder disappears (max 30 MB).
        content = output_path.read_bytes()

    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="compressed.pdf"',
            "X-Original-Size": str(result.original_size),
            "X-Compressed-Size": str(result.compressed_size),
            "X-Already-Optimized": str(result.already_optimized).lower(),
        },
    )
