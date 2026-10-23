# Decisiones técnicas

Registro de las decisiones importantes y su porqué (formato tipo ADR, *Architecture Decision Record*). Cuando tomemos una decisión nueva, se agrega aquí. Así, dentro de seis meses, sabrás por qué el proyecto es como es.

Formato: **Decisión · Contexto · Alternativas descartadas · Consecuencias**.

---

## D-001 · Procesar en el navegador todo lo que se pueda

- **Contexto:** no hay presupuesto y la privacidad es un argumento de venta.
- **Decisión:** imágenes y unir/dividir PDF se procesan en el navegador con WebAssembly.
- **Descartado:** procesar todo en el servidor (costos crecientes con el tráfico, archivos de usuarios en nuestros servidores).
- **Consecuencias:** costo de hosting cerca de cero, escala sola y funciona sin conexión. A cambio, depende de la potencia del dispositivo del usuario.

## D-002 · Comprimir PDF en el servidor con Python

- **Contexto:** en el navegador solo se puede comprimir PDF convirtiendo páginas en imágenes, y el texto deja de ser seleccionable.
- **Decisión:** API en Python con pikepdf + Pillow que recomprime solo las imágenes internas.
- **Descartado:** rasterizar con pdf.js en el navegador (pierde el texto); Ghostscript (AGPL, ver D-005).
- **Consecuencias:** mejor resultado y aprovecha que el dueño sabe Python. Requiere servidor, límites y medidas contra abuso.

## D-003 · Astro para el frontend

- **Contexto:** el tráfico vendrá de Google; cada herramienta necesita su propia página indexable y rápida.
- **Decisión:** Astro, que genera HTML estático y solo envía JavaScript donde hace falta.
- **Descartado:** Next.js (más complejo para un sitio estático); una SPA con React puro (peor SEO).
- **Consecuencias:** sitio muy rápido y fácil de alojar gratis. Hay que aprender Astro (es parte del objetivo).

## D-004 · Hosting: Cloudflare Pages + Google Cloud Run

- **Contexto:** presupuesto cero y monetización con anuncios.
- **Decisión:** web en Cloudflare Pages (gratis, permite uso comercial); API en Cloud Run (escala a cero, plan gratuito mensual).
- **Descartado:**
  - **Vercel Hobby:** prohíbe uso comercial (los anuncios cuentan) y limita el cuerpo de las peticiones a 4,5 MB.
  - **Render gratis:** se duerme tras 15 min y tarda 30–50 s en despertar; ancho de banda muy reducido.
  - **Fly.io / Hugging Face Spaces:** ya no tienen plan gratuito para este uso.
- **Consecuencias:** Cloud Run pide tarjeta; se mitiga con alerta de presupuesto y `max-instances`.

## D-005 · Solo licencias permisivas

- **Contexto:** es un producto comercial; las licencias GPL/AGPL podrían obligar a publicar el código o a comprar licencias.
- **Decisión:** solo MIT, BSD, Apache-2.0, MPL-2.0 o ISC.
- **Descartado:** Ghostscript y MuPDF (AGPL), pngquant (GPL).
- **Consecuencias:** compresión de PDF algo menos agresiva que con Ghostscript, pero sin riesgo legal.

## D-006 · API síncrona y sin almacenamiento

- **Contexto:** una sola herramienta en servidor y archivos de hasta 30 MB.
- **Decisión:** la petición recibe, procesa y responde; nada se guarda.
- **Descartado:** cola de trabajos + almacenamiento (Celery, S3/R2): más piezas, más costo, más superficie de privacidad.
- **Consecuencias:** arquitectura mínima. Si en el futuro hay archivos grandes u OCR, se revisará esta decisión.

## D-007 · Sitio en inglés primero

- **Contexto:** mercado global.
- **Decisión:** interfaz y URLs en inglés; versión en español en el backlog.
- **Consecuencias:** el código y la interfaz están en inglés; la documentación interna, en español.

## D-008 · Concepto visual "Toolito Laundromat"

- **Contexto:** se exploraron 10 direcciones (A–J) para evitar una estética genérica "hecha por IA".
- **Decisión:** la web es una lavandería de autoservicio: cada herramienta es una máquina (lavadoras, secadora, mesa de doblar, tendedero), la privacidad son las "House rules" y los errores son letreros "Out of order". Detalle en `docs/BRAND.md`.
- **Descartado:** estilo limpio genérico (A), taller (B), periódico (C), escritorio retro (D) y otras paletas de la lavandería (E original, F esmalte, G años 70, J azul).
- **Consecuencias:** identidad memorable y coherente; los textos deben mantener el vocabulario de lavandería sin sacrificar claridad.

## D-009 · Tema claro/oscuro automático según la hora local

- **Contexto:** la propuesta nocturna con neón (I) y la diurna intensa (H) gustaron por igual; la lavandería "de noche" refuerza el concepto.
- **Decisión:** dos temas (Light = paleta H, Dark = paleta I), elegidos **solo** por la hora local del dispositivo: oscuro de 19:00 a 06:59. **Sin interruptor** en ninguna página y sin guardar preferencias. Detalle en `docs/THEMES.md`.
- **Descartado:** interruptor Auto · Light · Dark (se probó en el diseño y se retiró: la cabecera conserva los letreros OPEN 24/7 y SELF-SERVICE); solo `prefers-color-scheme` (no transmite el "cambio de turno" de la lavandería); tema fijo.
- **Consecuencias:** todo el CSS usa tokens (variables), un script en línea evita el parpadeo al cargar, y hay que diseñar y probar cada pantalla en ambos temas. Quien prefiera otro tema no puede cambiarlo; si aparece esa necesidad, se revisará esta decisión.

## D-010 · Progreso honesto en la secadora

- **Contexto:** el mockup muestra `DRYING 64%`, pero la API es síncrona y no informa cuánto lleva la compresión.
- **Decisión:** progreso real solo en la subida (`XMLHttpRequest` + `upload.onprogress`, LED `LOADING n%`); durante la compresión, barra indeterminada y tiempo transcurrido (`DRYING 0:12`). Detalle en `docs/DRYER-FLOW.md`.
- **Descartado:** porcentaje simulado (miente y se congela en archivos grandes); API asíncrona con trabajos y consulta de estado (necesita almacenamiento y cola: demasiado para la fase 1); Server-Sent Events con progreso (pikepdf no informa avance por página de forma sencilla).
- **Consecuencias:** se usa `XMLHttpRequest` solo en esta pantalla; si más adelante la API pasa a ser asíncrona, se revisará esta decisión.

## D-011 · PWA con Workbox directo, no con @vite-pwa/astro

- **Contexto:** el stack proponía `@vite-pwa/astro`, pero su versión 1.2.0 solo declara compatibilidad con Astro 1–5 y el proyecto usa Astro 7. Instalarlo forzando la versión podía funcionar por casualidad y romperse en cualquier actualización.
- **Decisión:** usar **Workbox** (`workbox-build`, MIT, de Google), que es lo que esa integración usa por dentro. Un script (`web/scripts/build-sw.mjs`) recorre `dist/` después de `astro build` y genera `sw.js`; el manifest (`public/manifest.webmanifest`) y los íconos se escriben a mano.
- **Qué se guarda:** precaché de páginas, JS, CSS, fuentes, íconos y los códecs comunes (~3 MB); los códecs **AVIF** (~8 MB) solo al primer uso; las peticiones a la API **nunca** (privacidad).
- **Licencias del árbol de `workbox-build`** (315 paquetes, solo se usan al construir): MIT, ISC, BSD, Apache-2.0, más **BlueOak-1.0.0** (permisiva) y un **CC-BY-4.0** (`caniuse-lite`, una tabla de datos). Ningún GPL.
- **Íconos:** `design/icons/app-icon.svg` (ojo de buey con ropa) es la fuente; `npm run icons` genera los PNG con `@resvg/resvg-js` (MPL-2.0). Se descartó `sharp` porque incluye libvips (LGPL).
- **Consecuencias:** no depende de la versión de Astro. En `npm run dev` el service worker se desinstala solo, para no servir copias viejas.

