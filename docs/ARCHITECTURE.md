# Arquitectura de Toolito

## Vista general

Toolito es **híbrido**: casi todo ocurre en el navegador del usuario y solo la compresión de PDF usa un servidor.

```
                        ┌───────────────────────────────────────┐
                        │        Navegador del usuario          │
                        │                                       │
  toolito.com  ───────► │  Sitio Astro (HTML estático + JS)     │
  (Cloudflare Pages)    │                                       │
                        │  ┌─────────────────────────────────┐  │
                        │  │ Web Workers + WebAssembly       │  │
                        │  │ • jSquash → imágenes            │  │
                        │  │ • pdf-lib → unir / dividir PDF  │  │
                        │  └─────────────────────────────────┘  │
                        │            Los archivos NO salen      │
                        └───────────────┬───────────────────────┘
                                        │ solo /compress-pdf
                                        │ POST multipart (≤ 30 MB)
                                        ▼
                        ┌───────────────────────────────────────┐
                        │  API Toolito — Google Cloud Run       │
                        │  FastAPI + pikepdf + Pillow           │
                        │  • valida → comprime → responde       │
                        │  • archivo temporal borrado siempre   │
                        │  • escala a cero sin tráfico          │
                        └───────────────────────────────────────┘
```

## Componentes

### Web (`web/`)
- **Astro** genera páginas HTML estáticas: rápidas y buenas para SEO.
- Cada herramienta es una página independiente. Las páginas de conversión (`/jpg-to-webp`, etc.) salen de **una sola plantilla** con rutas dinámicas.
- El procesamiento pesado corre en **Web Workers** para que la interfaz no se congele.
- Las librerías de imágenes usan **WebAssembly**: códecs escritos en C/Rust compilados para el navegador.
- Es una **PWA**: se puede instalar y las herramientas locales funcionan sin conexión.

### API (`api/`)
- **FastAPI** expone `POST /v1/compress-pdf` y `GET /health` (ver `docs/API.md`).
- **Síncrona:** recibe el archivo, lo procesa y lo devuelve en la misma respuesta. No hay cola, ni almacenamiento externo, ni base de datos.
- **pikepdf** abre y reescribe el PDF; **Pillow** reduce la resolución y recomprime las imágenes internas. El texto sigue siendo seleccionable.

## Flujo de "Compress PDF"

1. El usuario suelta un PDF y elige el nivel.
2. El frontend valida el tamaño (≤ 30 MB) antes de enviarlo.
3. `XMLHttpRequest` envía `multipart/form-data` a la API (se usa en vez de `fetch` para medir el progreso de subida).
4. La API valida la cabecera `%PDF-`, el cifrado y el número de páginas.
5. Guarda el archivo en un directorio temporal, lo comprime y compara tamaños.
6. Responde con el PDF y las cabeceras `X-Original-Size` y `X-Compressed-Size`.
7. El directorio temporal se borra (`finally`).
8. El frontend muestra el ahorro y ofrece la descarga.

Detalle de la interfaz (fases, progreso, errores, cancelación): `docs/DRYER-FLOW.md`.

## Niveles de compresión

| Nivel | DPI máximo de imágenes | Calidad JPEG |
|---|---|---|
| `low` | 150 | 80 |
| `recommended` | 120 | 65 |
| `extreme` | 96 | 50 |

Estos valores son un punto de partida: se ajustarán en la etapa 1 probando con PDFs reales.

## Costos esperados

| Servicio | Costo |
|---|---|
| Cloudflare Pages | Gratis |
| Google Cloud Run | Gratis dentro del plan gratuito; centavos si se supera (alerta de presupuesto activa) |
| Dominio | ~10–15 USD/año |
