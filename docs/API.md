# API de Toolito — Contrato

Base URL:
- Local: `http://localhost:8000`
- Producción: la URL de Cloud Run (se define en la etapa 3)

Versionado en la ruta (`/v1/...`) para poder cambiar el contrato en el futuro sin romper el frontend.

---

## `GET /health`

Comprueba que el servicio está vivo. Cloud Run y tú lo usarán para verificar despliegues.

**Respuesta 200**
```json
{ "status": "ok", "version": "0.1.0" }
```

---

## `POST /v1/compress-pdf`

Comprime un PDF y lo devuelve en la misma respuesta.

### Petición

`Content-Type: multipart/form-data`

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `file` | archivo | sí | El PDF (≤ 30 MB) |
| `level` | texto | no | `low`, `recommended` (por defecto) o `extreme` |

Ejemplo con `curl`:
```bash
curl -X POST http://localhost:8000/v1/compress-pdf \
  -F "file=@documento.pdf" \
  -F "level=recommended" \
  -o documento-comprimido.pdf -D -
```

### Respuesta exitosa — 200

- Cuerpo: el PDF comprimido (`Content-Type: application/pdf`).
- Cabeceras:

| Cabecera | Ejemplo | Significado |
|---|---|---|
| `Content-Disposition` | `attachment; filename="compressed.pdf"` | Nombre sugerido de descarga |
| `X-Original-Size` | `5242880` | Bytes del original |
| `X-Compressed-Size` | `1310720` | Bytes del resultado |
| `X-Already-Optimized` | `true` / `false` | `true` si no se logró reducir y se devolvió el original |

> El frontend necesita leer estas cabeceras desde otro dominio, así que CORS debe incluirlas en `Access-Control-Expose-Headers` (junto con `Retry-After`).

### Errores

Todos los errores devuelven JSON con la misma forma:

```json
{ "error": { "code": "file_too_large", "message": "The file exceeds the 30 MB limit." } }
```

| HTTP | `code` | Cuándo |
|---|---|---|
| 400 | `missing_file` | No se envió el campo `file` |
| 400 | `invalid_level` | `level` no es uno de los valores permitidos |
| 413 | `file_too_large` | Más de 30 MB |
| 415 | `not_a_pdf` | No empieza con `%PDF-` |
| 422 | `encrypted_pdf` | Protegido con contraseña |
| 422 | `too_many_pages` | Más de 500 páginas |
| 422 | `corrupted_pdf` | pikepdf no puede abrirlo |
| 429 | `rate_limited` | Demasiadas peticiones desde la misma IP (incluye la cabecera `Retry-After` en segundos) |
| 504 | `processing_timeout` | Superó los 60 s de procesamiento |
| 500 | `internal_error` | Error inesperado (sin detalles internos) |

Los mensajes (`message`) están en inglés porque se muestran al usuario final.

---

## Configuración (variables de entorno)

| Variable | Por defecto | Descripción |
|---|---|---|
| `ALLOWED_ORIGINS` | `http://localhost:4321` | Dominios permitidos por CORS, separados por comas |
| `MAX_FILE_MB` | `30` | Tamaño máximo por archivo |
| `MAX_PAGES` | `500` | Páginas máximas |
| `PROCESSING_TIMEOUT_S` | `60` | Tiempo máximo de compresión |
| `RATE_LIMIT` | `20/minute` | Límite por IP (sintaxis de slowapi) |
| `PORT` | `8000` | Puerto (Cloud Run lo define automáticamente) |
