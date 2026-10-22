"""Per-IP rate limiting with slowapi."""

from fastapi import Request
from slowapi import Limiter


def client_ip(request: Request) -> str:
    """Best guess of the caller's IP address.

    On Cloud Run the direct peer is Google's proxy, which appends the real
    client IP as the LAST entry of X-Forwarded-For (earlier entries can be
    forged by the caller). Locally there is no proxy, so use the peer address.
    TODO (stage 3): confirm this in the Cloud Run logs.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


# Counters live in memory: each Cloud Run instance keeps its own, which is
# fine while max-instances stays small.
limiter = Limiter(key_func=client_ip)
