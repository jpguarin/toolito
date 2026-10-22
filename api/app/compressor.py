"""PDF compression logic, independent from the web layer."""

import io
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import pikepdf
from PIL import Image

Level = Literal["low", "recommended", "extreme"]


@dataclass(frozen=True)
class LevelSettings:
    max_dpi: int  # Resolution cap, assuming an image at most fills the page.
    jpeg_quality: int  # Pillow scale 1-95: lower is smaller and blurrier.


LEVELS: dict[Level, LevelSettings] = {
    "low": LevelSettings(max_dpi=200, jpeg_quality=85),
    "recommended": LevelSettings(max_dpi=150, jpeg_quality=70),
    "extreme": LevelSettings(max_dpi=96, jpeg_quality=50),
}

MIN_IMAGE_SIDE = 64  # Icons and tiny images are not worth recompressing.
POINTS_PER_INCH = 72  # PDF page sizes are measured in points.


@dataclass(frozen=True)
class CompressionResult:
    original_size: int  # Bytes.
    compressed_size: int  # Bytes of the file left at output_path.
    already_optimized: bool  # True when the original was returned unchanged.


def compress_pdf(
    input_path: Path, output_path: Path, level: Level = "recommended"
) -> CompressionResult:
    """Shrink a PDF: recompress its images, then pack its structure.

    Text and vector graphics are never touched, so text stays selectable.
    If the result is not smaller, the original is copied to output_path.
    """
    with pikepdf.open(input_path) as pdf:
        _recompress_images(pdf, LEVELS[level])
        pdf.save(
            output_path,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            compress_streams=True,
            recompress_flate=True,
        )

    # Never hand back a bigger file: fall back to the original.
    original_size = input_path.stat().st_size
    compressed_size = output_path.stat().st_size
    already_optimized = compressed_size >= original_size
    if already_optimized:
        shutil.copyfile(input_path, output_path)
        compressed_size = original_size
    return CompressionResult(original_size, compressed_size, already_optimized)


def _recompress_images(pdf: pikepdf.Pdf, settings: LevelSettings) -> None:
    max_side = _max_image_side(pdf, settings.max_dpi)
    images = [
        obj
        for obj in pdf.objects
        if isinstance(obj, pikepdf.Stream) and obj.get("/Subtype") == "/Image"
    ]
    # Soft masks (transparency) must keep the size of the image they belong to.
    mask_ids = {image.SMask.objgen for image in images if "/SMask" in image}
    for image in images:
        if image.objgen not in mask_ids and _is_safe_to_recompress(image):
            _recompress_image(image, max_side, settings.jpeg_quality)


def _max_image_side(pdf: pikepdf.Pdf, max_dpi: int) -> int:
    """Longest side in pixels that an image filling the largest page needs."""
    longest_points = max(
        max(abs(float(box[2] - box[0])), abs(float(box[3] - box[1])))
        for box in (page.mediabox for page in pdf.pages)
    )
    return round(longest_points / POINTS_PER_INCH * max_dpi)


def _is_safe_to_recompress(image: pikepdf.Stream) -> bool:
    """Skip images whose look depends on details a plain JPEG would lose."""
    if any(key in image for key in ("/SMask", "/Mask", "/ImageMask", "/Decode")):
        return False
    width, height = int(image.get("/Width", 0)), int(image.get("/Height", 0))
    return min(width, height) >= MIN_IMAGE_SIDE


def _recompress_image(image: pikepdf.Stream, max_side: int, quality: int) -> None:
    try:
        pil_image = pikepdf.PdfImage(image).as_pil_image()
    # Unsupported encodings (JBIG2, CCITT...) or damaged data: keep as is.
    except (pikepdf.PikepdfError, NotImplementedError, OSError, ValueError):
        return
    if pil_image.mode not in ("RGB", "L"):  # CMYK, palette, 1-bit: keep as is.
        return

    pil_image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    pil_image.save(buffer, format="JPEG", quality=quality, optimize=True)
    data = buffer.getvalue()
    if len(data) >= len(image.read_raw_bytes()):
        return  # Never make an image bigger.

    image.write(data, filter=pikepdf.Name.DCTDecode)
    image.Width, image.Height = pil_image.size
    # Pixels are not color-converted, so an ICC profile (e.g. an iPhone's
    # Display P3) stays valid; dropping it would make colors look duller.
    if not _has_icc_profile(image, channels=len(pil_image.getbands())):
        image.ColorSpace = pikepdf.Name(
            "/DeviceRGB" if pil_image.mode == "RGB" else "/DeviceGray"
        )
    image.BitsPerComponent = 8
    if "/DecodeParms" in image:
        del image.DecodeParms


def _has_icc_profile(image: pikepdf.Stream, channels: int) -> bool:
    color_space = image.get("/ColorSpace")
    return (
        isinstance(color_space, pikepdf.Array)
        and len(color_space) == 2
        and color_space[0] == "/ICCBased"
        and int(color_space[1].get("/N", 0)) == channels
    )
