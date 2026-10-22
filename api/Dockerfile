# Same Python as local development; "slim" = Debian without extras (smaller).
FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencies first: this layer is cached until requirements.txt changes,
# so editing the code does not reinstall everything.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/

# Never run as root: if the app is compromised, the attacker has no admin rights.
RUN useradd --create-home --uid 10001 toolito
USER toolito

# Cloud Run sets PORT; locally it falls back to 8000.
EXPOSE 8000
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
