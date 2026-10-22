from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from starlette.requests import Request

import app.main
from app.main import app as fastapi_app
from app.rate_limit import client_ip

URL = "/v1/compress-pdf"


def test_rate_limit_returns_429_with_retry_after(client: TestClient) -> None:
    # Default limit is 20/minute; tiny invalid files are rejected quickly.
    statuses = [
        client.post(URL, files={"file": ("x.pdf", b"x")}).status_code for _ in range(21)
    ]

    assert statuses[:20] == [415] * 20
    assert statuses[20] == 429
    response = client.post(URL, files={"file": ("x.pdf", b"x")})
    assert response.json()["error"]["code"] == "rate_limited"
    assert response.headers["retry-after"] == "60"


def test_unexpected_error_returns_500_without_details(
    make_pdf: Callable[..., bytes], monkeypatch: pytest.MonkeyPatch
) -> None:
    def explode(*args: object) -> None:
        raise RuntimeError("secret internal detail")

    monkeypatch.setattr(app.main, "compress_pdf", explode)
    # Return the 500 response instead of re-raising the error in the test.
    client = TestClient(fastapi_app, raise_server_exceptions=False)

    response = client.post(URL, files={"file": ("x.pdf", make_pdf())})

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "secret" not in response.text


@pytest.mark.parametrize(
    ("forwarded_for", "expected"),
    [
        (None, "10.0.0.1"),  # Local: no proxy, use the peer address.
        ("203.0.113.7", "203.0.113.7"),
        ("1.2.3.4, 203.0.113.7", "203.0.113.7"),  # First entry can be forged.
    ],
)
def test_client_ip(forwarded_for: str | None, expected: str) -> None:
    headers = [(b"x-forwarded-for", forwarded_for.encode())] if forwarded_for else []
    scope = {"type": "http", "headers": headers, "client": ("10.0.0.1", 1234)}

    assert client_ip(Request(scope)) == expected
