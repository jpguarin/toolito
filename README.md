# Toolito 🧰

**Little tools, big results.**

Toolito is a free collection of friendly online tools for everyday files: compress and convert images, and merge, split and compress PDFs, all from your browser.

> 🚧 **Status:** early development. See [PLAN.md](PLAN.md) for the roadmap.

## Features (MVP)

| Tool | Where it runs |
|---|---|
| Compress images (JPG, PNG, WebP, AVIF) | 🔒 In your browser |
| Convert image formats | 🔒 In your browser |
| Merge PDF | 🔒 In your browser |
| Split PDF | 🔒 In your browser |
| Compress PDF | ☁️ On our server, deleted right after processing |

## Privacy first

Most Toolito tools run **entirely on your device**: your files are never uploaded. The only exception is PDF compression, which runs on our server; files are processed in memory and temporary storage and are deleted immediately. We never store or log file contents.

## Tech stack

- **Web:** [Astro](https://astro.build), TypeScript, Tailwind CSS, pdf-lib, jSquash (WebAssembly), PWA
- **API:** Python, FastAPI, pikepdf, Pillow
- **Hosting:** Cloudflare Pages (web), Google Cloud Run (API)

## Project structure

```
toolito/
├── api/    # PDF compression service (FastAPI)
├── web/    # Website (Astro)
└── docs/   # Architecture, decisions and API docs
```

## Getting started

Requirements: Python 3.12+, Node.js LTS, Docker. See [docs/SETUP.md](docs/SETUP.md).

```bash
# API
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # http://localhost:8000/docs

# Web
cd web
npm install
npm run dev                      # http://localhost:4321
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Technical decisions](docs/DECISIONS.md)
- [API reference](docs/API.md)
- [Dryer flow: compress PDF phases, progress and errors](docs/DRYER-FLOW.md)
- [Brand: the Toolito Laundromat](docs/BRAND.md)
- [Design guide: tokens, components and mockups](design/README.md)
- [Light & dark themes (auto by local time)](docs/THEMES.md)

## License

To be defined.
