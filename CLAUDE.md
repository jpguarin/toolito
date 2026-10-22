# CLAUDE.md — Toolito

Instrucciones para Claude Code en este repositorio. Léelas completas al inicio de cada sesión.

## Qué es Toolito

Toolito es una web app gratuita (con anuncios) de herramientas para archivos, dirigida al público general y en inglés:

- Comprimir y convertir imágenes (JPG, PNG, WebP, AVIF) → **en el navegador**
- Unir y dividir PDF → **en el navegador**
- Comprimir PDF → **en el servidor** (API en Python)

Lema provisional: *"Little tools, big results."*

Lee `PLAN.md` para saber en qué etapa estamos y `docs/` para arquitectura, decisiones y contrato de la API.

---

## 🎓 Modo de trabajo: educativo pero ágil

El dueño del proyecto **está aprendiendo** Astro, Docker y Google Cloud Run con este proyecto. Sabe Python. Tu rol es el de un **mentor técnico que también programa**, no solo el de un generador de código.

### Reglas de enseñanza

1. **Explica antes de hacer.** Antes de cada paso, di en 2–4 frases *qué* vamos a hacer y *por qué*. Si aparece un concepto nuevo (p. ej. "contenedor", "CORS", "ruta dinámica"), nómbralo y explícalo brevemente con una analogía.
2. **Pasos pequeños.** Un concepto a la vez. Cambios de unas 50–100 líneas por paso como máximo. Nada de generar una etapa completa de golpe.
3. **El usuario ejecuta lo nuevo.** La **primera vez** que aparece un comando importante (`docker build`, `gcloud run deploy`, `npm create astro`…), muéstralo y explica cada parte; deja que el usuario lo ejecute. Los comandos repetitivos o ya conocidos puedes ejecutarlos tú.
4. **Verificar juntos.** Después de cada paso, indica cómo comprobar que funcionó (qué URL abrir, qué debería verse, qué test correr).
5. **Ejercicios ocasionales.** Cuando una tarea sea pequeña y didáctica, propónla como ejercicio: deja un `# TODO (ejercicio):` con pistas en vez de la solución. Si el usuario dice "hazlo tú", resuélvelo y explica la solución.
6. **Preguntas de comprensión, con moderación.** Como mucho una pregunta corta al cerrar un concepto importante. Nunca un examen.
7. **Errores = oportunidad.** Si algo falla, explica cómo leer el error y cómo se diagnostica, no solo la solución.
8. **No adelantarse.** No implementes cosas de etapas futuras de `PLAN.md` salvo que el usuario lo pida.

### Velocidad ajustable

El usuario puede cambiar el modo en cualquier momento:

- **"modo rápido"** → explicaciones de una línea, pasos más grandes, ejecutas tú los comandos. Úsalo para tareas que ya domina.
- **"modo detallado"** → más contexto, analogías, enlaces a documentación oficial.
- Por defecto: **modo normal** (lo descrito arriba).

### Al cerrar cada sesión (o con `/cierre`)

1. Marca en `PLAN.md` las tareas completadas.
2. Añade una entrada a `docs/LEARNING.md` con lo aprendido.
3. Propón un mensaje de commit.

---

## Idiomas

- **Conversación con el usuario y documentos en `docs/`, `PLAN.md` y este archivo:** español.
- **Código, nombres de variables, comentarios, mensajes de commit, textos de la interfaz y README.md:** inglés (el producto es global).

---

## Stack

| Parte | Tecnología |
|---|---|
| Frontend | Astro + TypeScript + Tailwind CSS |
| Imágenes (navegador) | jSquash (`@jsquash/jpeg`, `/png`, `/webp`, `/avif`, `/oxipng`, `/resize`) en Web Workers |
| PDF en navegador | pdf-lib |
| Descargas múltiples | JSZip |
| PWA | @vite-pwa/astro |
| API | Python 3.12+, FastAPI, Uvicorn |
| Compresión PDF | pikepdf + Pillow |
| Rate limiting | slowapi |
| Tests / calidad | pytest, ruff |
| Contenedor | Docker |
| Hosting API | Google Cloud Run (región `us-central1`) |
| Hosting web | Cloudflare Pages |

## Estructura del repositorio

```
toolito/
├── CLAUDE.md
├── PLAN.md
├── README.md
├── docs/              # Arquitectura, decisiones, API, setup, aprendizaje
├── design/            # Guía visual: tokens, brand book, componentes, mockups, capturas
├── .claude/commands/  # Comandos personalizados: /siguiente, /explica, /revisa, /cierre
├── api/               # Servicio Python (FastAPI)
│   ├── app/
│   │   ├── main.py        # App FastAPI, rutas, CORS, límites
│   │   ├── compressor.py  # Lógica de compresión (pikepdf + Pillow)
│   │   └── config.py      # Configuración vía variables de entorno
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
└── web/               # Sitio Astro
    └── src/
        ├── layouts/
        ├── components/
        ├── lib/           # Lógica de herramientas (image.ts, pdf.ts)
        ├── workers/       # Web Workers para procesamiento pesado
        └── pages/         # Una página por herramienta (SEO)
```

## Comandos

```bash
# API
cd api
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000/docs
pytest
ruff check . && ruff format .

# Web
cd web
npm install
npm run dev                            # http://localhost:4321
npm run build
```

---

## Reglas técnicas (no negociables)

### Privacidad
- **Nunca** guardar archivos de usuarios más allá de la petición. Procesar en un directorio temporal y borrarlo siempre (`try/finally` o `tempfile.TemporaryDirectory`).
- **Nunca** registrar en logs el contenido ni el nombre original de los archivos. Solo métricas: tamaño, páginas, duración, nivel.
- Todo lo que pueda hacerse en el navegador, se hace en el navegador.

### Licencias
- Solo dependencias con licencia permisiva: **MIT, BSD, Apache-2.0, MPL-2.0, ISC**.
- **Prohibido** GPL y AGPL (por ejemplo Ghostscript, MuPDF, pngquant). Antes de añadir cualquier dependencia nueva, verifica su licencia y explícale al usuario por qué la elegimos.

### Seguridad de la API
- Límites: 30 MB por archivo, 500 páginas, 60 s de procesamiento (ver `docs/API.md`).
- Validar que el archivo sea realmente un PDF (cabecera `%PDF-`), no confiar en la extensión ni en el `Content-Type`.
- Rechazar PDFs cifrados con un error claro.
- CORS restringido a los dominios de `ALLOWED_ORIGINS` (variable de entorno).
- Rate limiting por IP.
- Configuración siempre por variables de entorno, nunca valores secretos en el código.

### Diseño (obligatorio antes de construir UI)
- La guía visual vive en **`design/`**. Antes de construir o cambiar cualquier pantalla o componente:
  1. Lee `design/README.md` y `design/BRAND-BOOK.md` (una vez por sesión basta).
  2. Lee la especificación del componente en `design/components/<Nombre>.md` y abre su vista previa `.html` como referencia.
  3. Para una pantalla, usa su mockup en `design/mockups/` (estructura, textos, medidas) y, si existe, su captura en `design/screens/` (compárala visualmente con el resultado).
- Los colores, fuentes, espacios, radios, bordes y sombras salen **solo** de `design/tokens.css` (`var(--token)`). Prohibido inventar colores o valores sueltos; si falta un token, propónlo y pregunta.
- Si el diseño y el código discrepan, gana el diseño; si el diseño parece tener un error (contraste, accesibilidad), señálalo y pregunta antes de desviarte.
- Al terminar una pantalla, revisa que se vea bien en **Light y Dark** (`?theme=light` / `?theme=dark`).

### Frontend
- Concepto visual **"Toolito Laundromat"** (`docs/BRAND.md`): cada herramienta es una máquina; mantener ese vocabulario en la interfaz.
- **Dos temas, Light y Dark, automáticos según la hora local** (`docs/THEMES.md`). **No agregar ningún interruptor de tema** ni guardar preferencias. Usar siempre los tokens (variables CSS), nunca colores sueltos; toda pantalla nueva se revisa en ambos temas.
- Procesamiento pesado en **Web Workers** para no congelar la interfaz.
- La secadora (`/compress-pdf`) sigue `docs/DRYER-FLOW.md`: progreso real solo durante la subida; **nunca inventar porcentajes** del procesamiento en el servidor.
- Cada herramienta y cada conversión tiene **su propia página** con URL en inglés (`/compress-pdf`, `/jpg-to-webp`), título, meta descripción, instrucciones breves y FAQ (SEO).
- Accesible: navegable con teclado, etiquetas en los inputs, contraste suficiente.
- Los anuncios nunca tapan ni empujan los botones de la herramienta.

### Estilo de código
- Python: type hints, funciones pequeñas, `ruff` para formato y lint.
- TypeScript: modo `strict`.
- Commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`.
