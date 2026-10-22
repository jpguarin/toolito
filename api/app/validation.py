"""Checks an upload must pass before it goes into the compressor."""

from pathlib import Path
from typing import BinaryIO

import pikepdf

from app.errors import ApiError

PDF_MAGIC = b"%PDF-"  # Every real PDF starts with these bytes.
CHUNK_SIZE = 1024 * 1024  # Copy uploads 1 MB at a time.


def save_upload(source: BinaryIO, destination: Path, max_bytes: int) -> None:
    """Copy an upload to disk, stopping as soon as it exceeds max_bytes."""
    written = 0
    with destination.open("wb") as out:
        while chunk := source.read(CHUNK_SIZE):
            written += len(chunk)
            if written > max_bytes:
                raise ApiError(
                    413,
                    "file_too_large",
                    f"The file exceeds the {max_bytes // (1024 * 1024)} MB limit.",
                )
            out.write(chunk)


def check_pdf(path: Path, max_pages: int) -> None:
    """Reject files that are not PDFs, are protected, broken or too long."""
    with path.open("rb") as file:
        if file.read(len(PDF_MAGIC)) != PDF_MAGIC:
            raise ApiError(415, "not_a_pdf", "This file is not a PDF.")

    try:
        with pikepdf.open(path) as pdf:
            if pdf.is_encrypted:
                raise _encrypted_error()
            if len(pdf.pages) > max_pages:
                raise ApiError(
                    422,
                    "too_many_pages",
                    f"The PDF has more than {max_pages} pages.",
                )
    except pikepdf.PasswordError as exc:
        raise _encrypted_error() from exc
    except pikepdf.PdfError as exc:
        raise ApiError(
            422, "corrupted_pdf", "This PDF is damaged and cannot be opened."
        ) from exc


def _encrypted_error() -> ApiError:
    return ApiError(
        422,
        "encrypted_pdf",
        "This PDF is password-protected. Remove the password and try again.",
    )
