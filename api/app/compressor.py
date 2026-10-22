"""PDF compression logic, independent from the web layer."""

from pathlib import Path

import pikepdf


def compress_pdf(input_path: Path, output_path: Path) -> None:
    """Rewrite a PDF in a more compact form without changing its content.

    Lossless step only: small objects are packed into compressed object
    streams and existing streams are re-deflated. Images are untouched.
    """
    with pikepdf.open(input_path) as pdf:
        pdf.save(
            output_path,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            compress_streams=True,
            recompress_flate=True,
        )
