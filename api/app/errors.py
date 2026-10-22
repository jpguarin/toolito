"""Error format shared by every endpoint: {"error": {"code", "message"}}."""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger("toolito")


class ApiError(Exception):
    """An expected failure that is shown to the user (messages in English)."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def _error_response(
    status_code: int,
    code: str,
    message: str,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
        headers=headers,
    )


def _handle_api_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, ApiError)
    return _error_response(exc.status_code, exc.code, exc.message)


def _handle_validation_error(_: Request, exc: Exception) -> JSONResponse:
    """Map FastAPI's form validation errors to the codes in docs/API.md."""
    assert isinstance(exc, RequestValidationError)
    fields = {error["loc"][-1] for error in exc.errors()}
    if "file" in fields:
        return _error_response(400, "missing_file", "Please choose a PDF file.")
    if "level" in fields:
        return _error_response(
            400, "invalid_level", "Level must be low, recommended or extreme."
        )
    return _error_response(400, "invalid_request", "The request is not valid.")


def _handle_rate_limit(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RateLimitExceeded)
    # Window length in seconds: an upper bound of the real wait.
    retry_after = exc.limit.limit.get_expiry() if exc.limit else 60
    return _error_response(
        429,
        "rate_limited",
        "Too many requests. Please wait a moment and try again.",
        headers={"Retry-After": str(retry_after)},
    )


def _handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    """Log the traceback for us; show the user nothing internal."""
    logger.error("Unexpected error", exc_info=exc)
    return _error_response(
        500, "internal_error", "Something went wrong. Please try again."
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ApiError, _handle_api_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(RateLimitExceeded, _handle_rate_limit)
    app.add_exception_handler(Exception, _handle_unexpected_error)
