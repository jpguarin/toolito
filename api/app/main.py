"""FastAPI application and HTTP routes."""

import tempfile
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, Response, UploadFile

from app import __version__
from app.compressor import Level, compress_pdf
from app.config import settings
from app.errors import register_error_handlers
from app.validation import check_pdf, save_upload

app = FastAPI(
    title="Toolito API",
    version=__version__,
    description="Little tools, big results. Server-side PDF compression.",
)
register_error_handlers(app)


@app.get("/health")
def health() -> dict[str, str]:
    """Tell callers (Cloud Run, the website) that the service is alive."""
    return {"status": "ok", "version": __version__}


@app.post("/v1/compress-pdf")
def compress_pdf_route(
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
        result = compress_pdf(input_path, output_path, level)
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
