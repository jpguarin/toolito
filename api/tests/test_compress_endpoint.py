import dataclasses
import tempfile
from collections.abc import Callable
from pathlib import Path

import pikepdf
import pytest
from fastapi.testclient import TestClient

import app.main

URL = "/v1/compress-pdf"


def post_pdf(client: TestClient, data: bytes, level: str = "recommended"):
    return client.post(
        URL,
        files={"file": ("any name.pdf", data, "application/pdf")},
        data={"level": level},
    )


def error_code(response) -> str:
    return response.json()["error"]["code"]


def test_returns_compressed_pdf_with_size_headers(
    client: TestClient, make_pdf: Callable[..., bytes]
) -> None:
    original = make_pdf(with_photo=True)

    response = post_pdf(client, original)

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'filename="compressed.pdf"' in response.headers["content-disposition"]
    assert response.headers["x-original-size"] == str(len(original))
    assert response.headers["x-compressed-size"] == str(len(response.content))
    assert response.headers["x-already-optimized"] == "false"
    assert response.content.startswith(b"%PDF-")


def test_missing_file(client: TestClient) -> None:
    response = client.post(URL, data={"level": "low"})

    assert response.status_code == 400
    assert error_code(response) == "missing_file"


def test_invalid_level(client: TestClient, make_pdf: Callable[..., bytes]) -> None:
    response = post_pdf(client, make_pdf(), level="turbo")

    assert response.status_code == 400
    assert error_code(response) == "invalid_level"


def test_file_too_large(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    # Shrink the limit to 1 MB so the test does not need a 30 MB upload.
    small = dataclasses.replace(app.main.settings, max_file_mb=1)
    monkeypatch.setattr(app.main, "settings", small)

    response = post_pdf(client, b"%PDF-" + b"0" * (1024 * 1024))

    assert response.status_code == 413
    assert error_code(response) == "file_too_large"


@pytest.mark.parametrize(
    ("build", "status", "code"),
    [
        (lambda make: b"\x89PNG\r\n\x1a\n fake", 415, "not_a_pdf"),
        (lambda make: b"%PDF-1.7\nnot really a pdf", 422, "corrupted_pdf"),
        (lambda make: make(pages=501), 422, "too_many_pages"),
        (
            lambda make: make(encryption=pikepdf.Encryption(user="pw", owner="pw")),
            422,
            "encrypted_pdf",
        ),
        (
            lambda make: make(encryption=pikepdf.Encryption(user="", owner="pw")),
            422,
            "encrypted_pdf",
        ),
    ],
    ids=["not-pdf", "corrupted", "too-many-pages", "user-password", "owner-password"],
)
def test_rejects_invalid_files(
    client: TestClient,
    make_pdf: Callable[..., bytes],
    build: Callable[[Callable[..., bytes]], bytes],
    status: int,
    code: str,
) -> None:
    response = post_pdf(client, build(make_pdf))

    assert response.status_code == status
    assert error_code(response) == code


def test_temp_files_are_always_deleted(
    client: TestClient,
    make_pdf: Callable[..., bytes],
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Send every temporary folder to a directory we can inspect.
    monkeypatch.setattr(tempfile, "tempdir", str(tmp_path))

    assert post_pdf(client, make_pdf()).status_code == 200
    assert post_pdf(client, b"%PDF-1.7\nbroken").status_code == 422

    assert list(tmp_path.iterdir()) == []
