"""Error format shared by every endpoint: {"error": {"code", "message"}}."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    """An expected failure that is shown to the user (messages in English)."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
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


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ApiError, _handle_api_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
