"""Shared fixtures: an API client and generated test PDFs (no real files)."""

import io
import zlib
from collections.abc import Callable

import pikepdf
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.rate_limit import limiter

PHOTO_SIZE = (3000, 2000)
SAMPLE_TEXT = b"Hello Toolito"


@pytest.fixture(autouse=True)
def reset_rate_limits() -> None:
    """Each test starts with fresh counters, so tests never hit 429 by accident."""
    limiter.reset()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def make_pdf() -> Callable[..., bytes]:
    """Build a PDF in memory: blank pages, optionally a photo or a password."""

    def _make_pdf(
        pages: int = 1,
        with_photo: bool = False,
        encryption: pikepdf.Encryption | None = None,
    ) -> bytes:
        pdf = pikepdf.new()
        for _ in range(pages):
            pdf.add_blank_page(page_size=(612, 792))  # US Letter, in points.
        if with_photo:
            _add_photo_and_text(pdf, pdf.pages[0])
        buffer = io.BytesIO()
        pdf.save(buffer, encryption=encryption or False)
        return buffer.getvalue()

    return _make_pdf


def _add_photo_and_text(pdf: pikepdf.Pdf, page: pikepdf.Page) -> None:
    """A large, photo-like image stored uncompressed-ish, plus a line of text."""
    noise = Image.effect_noise(PHOTO_SIZE, 40).convert("RGB")
    gradient = Image.linear_gradient("L").resize(PHOTO_SIZE).convert("RGB")
    photo = Image.blend(noise, gradient, 0.6)
    image = pikepdf.Stream(
        pdf,
        zlib.compress(photo.tobytes()),
        Type=pikepdf.Name.XObject,
        Subtype=pikepdf.Name.Image,
        Width=PHOTO_SIZE[0],
        Height=PHOTO_SIZE[1],
        ColorSpace=pikepdf.Name.DeviceRGB,
        BitsPerComponent=8,
        Filter=pikepdf.Name.FlateDecode,
    )
    font = pdf.make_indirect(
        pikepdf.Dictionary(
            Type=pikepdf.Name.Font,
            Subtype=pikepdf.Name.Type1,
            BaseFont=pikepdf.Name.Helvetica,
        )
    )
    page.Resources = pikepdf.Dictionary(
        XObject=pikepdf.Dictionary(Im0=image), Font=pikepdf.Dictionary(F1=font)
    )
    page.Contents = pdf.make_stream(
        b"q 540 0 0 360 36 400 cm /Im0 Do Q "
        b"BT /F1 24 Tf 72 200 Td (" + SAMPLE_TEXT + b") Tj ET"
    )
