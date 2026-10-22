"""Run the compressor in a separate process that can be stopped on timeout.

A thread cannot be killed from outside; a process can. If compression takes
too long, the worker process is terminated and the request fails with 504.
"""

import multiprocessing
from pathlib import Path

from app.compressor import CompressionResult, Level, compress_pdf
from app.errors import ApiError

# "spawn" starts a fresh Python, the same way on macOS and Linux (Docker).
_context = multiprocessing.get_context("spawn")


def compress_with_timeout(
    input_path: Path, output_path: Path, level: Level, timeout_s: float
) -> CompressionResult:
    # Leaving the `with` block terminates the worker, even if it is still busy.
    with _context.Pool(processes=1) as pool:
        job = pool.apply_async(compress_pdf, (input_path, output_path, level))
        try:
            return job.get(timeout=timeout_s)
        except multiprocessing.TimeoutError as exc:
            raise ApiError(
                504,
                "processing_timeout",
                "This PDF took too long to compress. Try a smaller file.",
            ) from exc
