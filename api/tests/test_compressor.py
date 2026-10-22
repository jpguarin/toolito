from collections.abc import Callable
from pathlib import Path

import pikepdf
import pytest
from PIL import ImageCms

from app.compressor import LEVELS, compress_pdf
from tests.conftest import SAMPLE_TEXT


@pytest.fixture
def photo_pdf(tmp_path: Path, make_pdf: Callable[..., bytes]) -> Path:
    path = tmp_path / "photo.pdf"
    path.write_bytes(make_pdf(with_photo=True))
    return path


def test_lossless_step_shrinks_pdf_without_object_streams(tmp_path: Path) -> None:
    source, output = tmp_path / "in.pdf", tmp_path / "out.pdf"
    pdf = pikepdf.new()
    for _ in range(50):
        pdf.add_blank_page()
    pdf.save(source, object_stream_mode=pikepdf.ObjectStreamMode.disable)

    result = compress_pdf(source, output)

    assert result.compressed_size < result.original_size
    assert not result.already_optimized


def test_stronger_levels_give_smaller_files(photo_pdf: Path) -> None:
    sizes = [
        compress_pdf(photo_pdf, photo_pdf.with_name(f"{lvl}.pdf"), lvl).compressed_size
        for lvl in ("low", "recommended", "extreme")
    ]

    assert sizes[0] > sizes[1] > sizes[2]
    assert sizes[0] < photo_pdf.stat().st_size


@pytest.mark.parametrize("level", list(LEVELS))
def test_images_are_downscaled_to_the_level_dpi(photo_pdf: Path, level: str) -> None:
    output = photo_pdf.with_name("out.pdf")
    compress_pdf(photo_pdf, output, level)  # type: ignore[arg-type]

    with pikepdf.open(output) as pdf:
        image = next(iter(pdf.pages[0].get_images().values()))
        longest_side = max(int(image.Width), int(image.Height))
    # Letter page: longest side is 11 inches.
    assert longest_side == 11 * LEVELS[level].max_dpi  # type: ignore[index]


def test_text_is_kept(photo_pdf: Path) -> None:
    output = photo_pdf.with_name("out.pdf")
    compress_pdf(photo_pdf, output)

    with pikepdf.open(output) as pdf:
        assert SAMPLE_TEXT in pdf.pages[0].Contents.read_bytes()


def test_already_optimized_returns_identical_original(photo_pdf: Path) -> None:
    once = photo_pdf.with_name("once.pdf")
    twice = photo_pdf.with_name("twice.pdf")
    compress_pdf(photo_pdf, once, "extreme")

    result = compress_pdf(once, twice, "extreme")

    assert result.already_optimized
    assert result.compressed_size == result.original_size
    assert twice.read_bytes() == once.read_bytes()


def test_icc_color_profile_is_kept(photo_pdf: Path) -> None:
    # Give the photo an ICC profile, like iPhone photos (Display P3) have.
    with pikepdf.open(photo_pdf, allow_overwriting_input=True) as pdf:
        image = next(iter(pdf.pages[0].get_images().values()))
        profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
        icc = pdf.make_stream(profile, N=3)
        image.ColorSpace = pikepdf.Array([pikepdf.Name.ICCBased, icc])
        pdf.save(photo_pdf)
    output = photo_pdf.with_name("out.pdf")

    compress_pdf(photo_pdf, output)

    with pikepdf.open(output) as pdf:
        image = next(iter(pdf.pages[0].get_images().values()))
        assert image.Filter == "/DCTDecode"  # It was recompressed...
        assert image.ColorSpace[0] == "/ICCBased"  # ...and kept its profile.
