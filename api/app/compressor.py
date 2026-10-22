"""PDF compression logic, independent from the web layer."""

import io
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


def compress_pdf(
    input_path: Path, output_path: Path, level: Level = "recommended"
) -> None:
    """Shrink a PDF: recompress its images, then pack its structure.

    Text and vector graphics are never touched, so text stays selectable.
    """
    with pikepdf.open(input_path) as pdf:
        _recompress_images(pdf, LEVELS[level])
        pdf.save(
            output_path,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            compress_streams=True,
            recompress_flate=True,
        )


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
    image.ColorSpace = pikepdf.Name(
        "/DeviceRGB" if pil_image.mode == "RGB" else "/DeviceGray"
    )
    image.BitsPerComponent = 8
    if "/DecodeParms" in image:
        del image.DecodeParms
