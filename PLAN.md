# PLAN.md — Hoja de ruta de Toolito (Fase 1 / MVP)

Cada etapa tiene un **objetivo**, lo que vas a **aprender**, las **tareas** y un criterio de **terminado**. Marca las casillas a medida que avances (Claude lo hace al cerrar cada sesión con `/cierre`).

> Consejo: usa `/siguiente` en Claude Code para retomar donde quedaste.

**Estado actual:** Etapa 0

---

## Etapa 0 — Preparación del entorno

**Objetivo:** tener todas las herramientas instaladas y el repositorio en GitHub.
**Aprendes:** Git básico, estructura de un monorepo.

- [ ] Instalar herramientas (ver `docs/SETUP.md`) y verificar versiones
- [ ] Crear el repositorio `toolito` en GitHub y clonarlo
- [ ] Primer commit con estos documentos (`docs: add project documentation`)
- [ ] Repasar comandos Git: `status`, `add`, `commit`, `push`, `log`

**Terminado cuando:** los documentos están en GitHub y todos los comandos de verificación de `docs/SETUP.md` responden.

---

## Etapa 1 — API de compresión de PDF (en tu computador)

**Objetivo:** un servicio FastAPI que comprime PDFs y funciona en local.
**Aprendes:** estructura de un proyecto FastAPI, entornos virtuales, pikepdf, Pillow, tests con pytest.

- [ ] Crear `api/` con entorno virtual y `requirements.txt`
- [ ] Endpoint `GET /health`
- [ ] `compressor.py`: abrir el PDF con pikepdf y guardarlo con object streams (sin tocar imágenes)
- [ ] Recomprimir imágenes con Pillow según el nivel (`low`, `recommended`, `extreme`)
- [ ] Devolver el original si el resultado pesa más ("already optimized")
- [ ] Endpoint `POST /v1/compress-pdf` según `docs/API.md`
- [ ] Validaciones: tamaño, cabecera `%PDF-`, cifrado, número de páginas
- [ ] Archivos temporales que se borran siempre
- [ ] Tests con pytest (PDFs de prueba generados en los tests)
- [ ] Probar a mano desde `http://localhost:8000/docs` con PDFs reales y anotar resultados en `docs/LEARNING.md`

**Terminado cuando:** `pytest` pasa y un PDF con fotos se reduce notablemente manteniendo el texto seleccionable.

---

## Etapa 2 — Docker

**Objetivo:** la API corre dentro de un contenedor.
**Aprendes:** qué es una imagen y un contenedor, `Dockerfile`, capas, `.dockerignore`.

- [ ] Escribir `api/Dockerfile` (imagen `python:3.12-slim`, usuario no root)
- [ ] `.dockerignore`
- [ ] `docker build` y `docker run` en local, probar `/docs`
- [ ] Leer la variable `PORT` (Cloud Run la define)

**Terminado cuando:** la API responde igual dentro del contenedor que fuera de él.

---

## Etapa 3 — Google Cloud Run

**Objetivo:** la API publicada en internet con costo controlado.
**Aprendes:** proyectos de Google Cloud, facturación y alertas, `gcloud`, despliegue serverless, logs.

- [ ] Crear cuenta y proyecto en Google Cloud
- [ ] **Antes que nada:** alerta de presupuesto (p. ej. 5 USD)
- [ ] Instalar e iniciar sesión con `gcloud`
- [ ] Primer despliegue: `gcloud run deploy --source .` en `us-central1`
- [ ] Configurar memoria, timeout, `max-instances` y concurrencia
- [ ] Variables de entorno (`ALLOWED_ORIGINS`, límites)
- [ ] Probar la URL pública y revisar los logs

**Terminado cuando:** puedes comprimir un PDF usando la URL de Cloud Run y la alerta de presupuesto está activa.

---

## Etapa 4 — Astro: fundamentos

**Objetivo:** el esqueleto del sitio con diseño base.
**Aprendes:** estructura de Astro, componentes `.astro`, layouts, rutas por archivos, Tailwind.

- [ ] Tutorial oficial de Astro (fuera del proyecto, unas horas)
- [ ] Crear `web/` con Astro + TypeScript estricto
- [x] Exportar las capturas de las pantallas a `design/screens/` (ver `design/screens/README.md`)
- [ ] Copiar `design/tokens.css` a `web/src/styles/`, importarlo en el layout y conectar Tailwind a esas variables; cargar Bungee, Work Sans y Caveat
- [ ] Script en línea en el `<head>` que elige el tema antes de pintar (sin parpadeo)
- [ ] Cambio automático en vivo: reevaluar la hora cada minuto y al volver a la pestaña (sin interruptor de tema)
- [ ] Función `resolveTheme(hour)` con tests de las horas límite (6, 7, 18, 19)
- [ ] `BaseLayout.astro` con cabecera (toldo + letrero), pie y metadatos SEO
- [ ] Página de inicio con la lista de herramientas
- [ ] Componente `Dropzone` reutilizable (arrastrar y soltar archivos)

**Terminado cuando:** el sitio corre en local con la portada y el diseño base.

---

## Etapa 5 — Herramientas en el navegador

**Objetivo:** las cuatro herramientas que no necesitan servidor.
**Aprendes:** archivos en el navegador (`File`, `Blob`), Web Workers, WebAssembly, pdf-lib, jSquash, rutas dinámicas.

- [ ] `/merge-pdf` con pdf-lib (reordenar antes de unir)
- [ ] `/split-pdf` (por rangos y "cada página por separado")
- [ ] `/compress-image` con jSquash en un Web Worker, con control de calidad
- [ ] Conversión de formatos (JPG, PNG, WebP, AVIF)
- [ ] Páginas de conversión con `getStaticPaths` (`/jpg-to-webp`, `/png-to-webp`, `/webp-to-jpg`, `/png-to-jpg`…)
- [ ] Procesamiento por lotes y descarga en ZIP (JSZip)
- [ ] Mostrar tamaño antes y después y el porcentaje ahorrado

**Terminado cuando:** las herramientas funcionan sin conexión a ningún servidor (pruébalo en modo avión).

---

## Etapa 6 — Conectar, PWA y contenido

**Objetivo:** el sitio completo listo para publicar.
**Aprendes:** `fetch` con archivos, CORS, PWA y service workers, SEO técnico.

- [ ] Leer `docs/DRYER-FLOW.md` (fases, progreso, errores, cancelación)
- [ ] Estado de la secadora como tipo `DryerState` y validación previa (≤ 30 MB, cabecera `%PDF-`)
- [ ] `/compress-pdf` envía el PDF con `XMLHttpRequest`: progreso real de subida (`LOADING n%`)
- [ ] Fase de secado: barra indeterminada, tiempo transcurrido (`DRYING 0:12`) y aviso a los 8 s
- [ ] Resultado: cabeceras de tamaño, caso "already optimized", descarga y `revokeObjectURL`
- [ ] Errores de la API → tarjetas OutOfOrder (incluidos timeout, offline y `Retry-After`)
- [ ] Botón "Stop the dryer" con `abort()` y protección contra doble clic
- [ ] Precalentar Cloud Run con `GET /health` al soltar el PDF
- [ ] Probar los escenarios de `docs/DRYER-FLOW.md` §10 en Light y Dark
- [ ] CORS correcto, incluido `Access-Control-Expose-Headers` (tamaños, `X-Already-Optimized`, `Retry-After`)
- [ ] PWA: manifest, íconos, funcionamiento offline de las herramientas locales
- [ ] Texto de cada página: instrucciones y FAQ
- [ ] `sitemap.xml`, `robots.txt`, etiquetas Open Graph
- [ ] Páginas legales: Privacy Policy, Terms, About, Contact
- [ ] Revisión con Lighthouse (objetivo: 90+ en todo), **en ambos temas**
- [ ] `theme-color` de la PWA que cambia con el tema

**Terminado cuando:** el flujo completo funciona en local apuntando a la API de Cloud Run.

---

## Etapa 7 — Lanzamiento

**Objetivo:** Toolito en internet.
**Aprendes:** dominios y DNS, despliegue continuo, analítica, Search Console.

- [ ] Registrar el dominio (Cloudflare Registrar)
- [ ] Publicar `web/` en Cloudflare Pages conectado a GitHub
- [ ] Conectar el dominio y actualizar `ALLOWED_ORIGINS` en Cloud Run
- [ ] Cloudflare Web Analytics (gratis y sin cookies)
- [ ] Google Search Console y envío del sitemap
- [ ] Solicitar Google AdSense cuando haya contenido y algo de tráfico

**Terminado cuando:** toolito está publicado con su dominio y Google indexa las páginas.

---

## Backlog (fase 2 y siguientes)

Ideas para después del MVP; no se implementan hasta terminar la fase 1.

- Redimensionar imágenes y generar sets `srcset`
- Generador de favicons
- Quitar metadatos EXIF
- Rotar y reordenar páginas de PDF; PDF a imágenes; imágenes a PDF
- OCR (OCRmyPDF en el servidor)
- Word, Excel y PowerPoint a PDF (LibreOffice en el servidor)
- Versión en español del sitio
- Quitar fondo de imágenes con IA en el navegador
