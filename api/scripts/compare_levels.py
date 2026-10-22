"""Compress one PDF at every level and print the resulting sizes.

Usage (from api/, with the virtual environment active):
    python -m scripts.compare_levels ../samples/my-file.pdf
"""

import sys
from pathlib import Path
from typing import get_args

from app.compressor import Level, compress_pdf


def main() -> None:
    source = Path(sys.argv[1])
    original_size = source.stat().st_size
    print(f"{'original':12} {original_size:>12,} bytes")
    for level in get_args(Level):
        output = source.with_name(f"{source.stem}.{level}.pdf")
        compress_pdf(source, output, level)
        size = output.stat().st_size
        saved = 100 * (1 - size / original_size)
        print(f"{level:12} {size:>12,} bytes  (-{saved:.1f}%)  -> {output.name}")


if __name__ == "__main__":
    main()
