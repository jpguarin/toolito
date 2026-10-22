# Diario de aprendizaje

Una entrada por sesión. Claude la completa contigo al usar `/cierre`; tú puedes editarla y agregar notas propias. Con el tiempo será tu propio manual.

## Plantilla

```markdown
## AAAA-MM-DD — Etapa N: título corto

**Qué hicimos:**
- ...

**Conceptos nuevos:**
- **Concepto:** explicación en una frase, con tus palabras.

**Comandos que aprendí:**
- `comando` → qué hace

**Errores y cómo los resolvimos:**
- Error: ... → Causa: ... → Solución: ...

**Dudas pendientes:**
- ...
```

---

## Glosario

Se va llenando a medida que aparecen términos nuevos.

| Término | Significado |
|---|---|
| **API** | Programa que recibe peticiones y devuelve respuestas; en Toolito, el servicio que comprime PDFs. |
| **WebAssembly (WASM)** | Formato que permite ejecutar en el navegador código escrito en C, C++ o Rust, casi a velocidad nativa. |
| **Contenedor** | Paquete con tu aplicación y todo lo que necesita para correr, igual en cualquier computador. |
| **Serverless** | Tú entregas el código; la nube decide cuándo encenderlo, cuántas copias correr y lo apaga si no hay uso. |
| **CORS** | Regla del navegador que decide qué sitios pueden llamar a tu API desde JavaScript. |
| **Remoto (`origin`)** | La copia del repositorio que vive en GitHub; `origin` es su apodo. |
| **Staging area** | La "caja abierta": lo que `git add` prepara para el próximo commit. |
| **Conventional Commits** | Formato de mensajes `tipo(alcance): título` (`docs:`, `feat:`, `fix:`…). |
| **Reflog** | La "caja negra" de Git: registra cada movimiento de `HEAD`, aunque no salga en `git log`. |
| **Entorno virtual (venv)** | Caja de herramientas privada de un proyecto (`api/.venv`); lo que instalas ahí no afecta a otros proyectos. |
| **Ruta / endpoint** | Una "ventanilla" de la API: método HTTP + ruta (`GET /health`, `POST /v1/compress-pdf`). |
| **Uvicorn** | El servidor que escucha en un puerto y le pasa las peticiones a FastAPI (el mesero; FastAPI es el cocinero). |
| **Código de estado HTTP** | Número que resume la respuesta: `200` bien, `400` petición mala, `413` muy grande, `415` tipo incorrecto, `422` no procesable. |
| **Object streams** | Empacar los objetos pequeños de un PDF en una sola "caja" comprimida; compresión sin pérdida. |
| **DPI** | Píxeles por pulgada impresa; cuánta resolución necesita una imagen en la página. |
| **Compresión con pérdida** | Bota detalle que el ojo casi no nota (JPEG); la "sin pérdida" no cambia nada de lo que se ve. |
| **multipart/form-data** | Formato con el que el navegador envía archivos: un sobre con compartimentos (`file`, `level`). |
| **Variable de entorno** | Ajuste que se le da al programa al arrancar, fuera del código (`MAX_FILE_MB=30`). |
| **Magic bytes** | Primeros bytes que identifican el formato real de un archivo (`%PDF-`); la extensión se puede falsificar. |
| **Traceback** | El rastro de un error en Python; se lee de abajo hacia arriba: qué pasó, dónde, quién llamó. |
| **Fixture** | Ingrediente preparado que pytest le pasa a un test (un cliente, un PDF de prueba, una carpeta temporal). |
| **Perfil de color ICC** | Datos que dicen cómo interpretar los colores de una imagen (sRGB, Display P3…). |
| **Imagen (Docker)** | Plantilla congelada con el sistema, Python, dependencias y código; de ella se crean contenedores. |
| **Capa** | Cada paso del Dockerfile; Docker guarda en caché las que no cambian. |
| **Mapeo de puertos** | Conectar un puerto del computador con uno del contenedor (`-p 8000:8000`). |
| **Cold start** | El tiempo que tarda un contenedor en arrancar antes de poder responder. |
| **REPL** | La consola interactiva de Python (`>>>`): escribes una línea y se ejecuta al instante. |

---

<!-- Las entradas de cada sesión van debajo de esta línea, la más reciente arriba. -->

## 2026-10-22 — Etapa 2: Docker

**Qué hicimos:**
- `api/Dockerfile` con `python:3.14-slim` (la misma versión que en local, en vez de la 3.12 del plan), usuario no root `toolito` y puerto leído de `PORT`.
- `api/.dockerignore`: la imagen solo lleva `app/` y `requirements.txt` (nada de tests, `.venv` ni PDFs).
- Construimos la imagen (296 MB) y la probamos: mismo resultado que fuera de Docker (13.371.192 → 234.580 bytes), errores iguales, 0 archivos temporales, y los logs no muestran nombres de archivo.

**Conceptos nuevos:**
- **Imagen vs. contenedor:** la imagen es la "lonchera" congelada (Linux + Python + código); el contenedor es la lonchera abierta y corriendo. De una imagen salen muchos contenedores.
- **Capas y caché:** cada línea del Dockerfile es una capa. Copiamos `requirements.txt` antes que el código para que cambiar el código no reinstale todas las dependencias.
- **Usuario no root:** si alguien ataca la app, no tiene permisos de administrador dentro del contenedor.
- **`PORT` con valor por defecto:** `${PORT:-8000}` = "usa `PORT` si existe; si no, 8000". Cloud Run define `PORT`.
- **Mapeo de puertos:** `-p 8001:9000` conecta el puerto 8001 del Mac con el 9000 del contenedor.
- **El contenedor tarda en arrancar:** las peticiones que llegan antes de que uvicorn esté listo fallan (en Cloud Run se llama *cold start*).

**Comandos que aprendí:**
- `docker build -t toolito-api ./api` → construir la imagen con nombre (`-t`) desde la carpeta `api/`.
- `docker run --rm -p 8000:8000 toolito-api` → correr un contenedor; `--rm` lo borra al detenerlo.
- `docker run -e PORT=9000 ...` → pasar una variable de entorno al contenedor.
- `docker logs <nombre>` / `docker exec <nombre> <comando>` → ver los logs / ejecutar algo dentro del contenedor.
- `docker images` / `docker rm -f <nombre>` → listar imágenes / borrar un contenedor.

**Errores y cómo los resolvimos:**
- Error: `curl` devolvía respuestas vacías y los logs salían vacíos. → Causa: las pruebas corrieron en menos de 1 s, antes de que uvicorn arrancara; el puente de puertos de Docker Desktop acepta la conexión aunque el servidor no esté listo, así que `--retry-connrefused` no reintentaba. → Solución: diagnosticar desde dentro (`docker exec ... python -c ...`) y probar de nuevo cuando estaba arriba.
- `ps: executable file not found` → La imagen *slim* no trae herramientas extra; es normal y es parte de que pese poco.

**Dudas pendientes:**
- Todavía faltan en la API: timeout de 60 s (`504`), error `500 internal_error`, CORS y rate limiting. Revisar en qué etapa entran antes de desplegar.
- Probar con un PDF con texto real y con un escaneo cuando tenga uno.

## 2026-10-22 — Etapa 1: tests y prueba manual (cierre de la etapa)

**Qué hicimos:**
- Cambiamos `httpx` por `httpx2` (BSD-3), que es lo que pide Starlette 1.9 para `TestClient`.
- Suite de pytest: 19 tests (health, compresor, endpoint, validaciones y archivos temporales), con PDFs generados en memoria.
- Comprobamos que el test de temporales detecta fugas de verdad: rompimos la limpieza a propósito y falló.
- Prueba manual con `YOUR-FILE.pdf` y corrección del perfil de color.

**Resultados de la prueba manual (`YOUR-FILE.pdf`: 1 página, foto de iPhone 4032×3024, Display P3, guardada sin pérdida):**

| Nivel | Tamaño | Foto | ¿Se ve bien? |
|---|---|---|---|
| original | 13,4 MB | 4032×3024 | — |
| `low` | 563 KB (−95,8 %) | 2200×1650 | sí |
| `recommended` | 235 KB (−98,2 %) | 1650×1238 | sí, colores iguales y nítida al 100 % |
| `extreme` | 86 KB (−99,4 %) | 1056×792 | sí, aceptable para enviar por chat |

- Este PDF no tiene texto, así que "texto seleccionable" lo cubre el test automático `test_text_is_kept`.

**Conceptos nuevos:**
- **Fixture:** un "ingrediente preparado" que pytest le entrega a cada test (`client`, `make_pdf`, `tmp_path`).
- **`parametrize`:** un solo test que corre con muchos casos.
- **`monkeypatch`:** cambia algo solo durante un test (bajar el límite a 1 MB, redirigir las carpetas temporales).
- **Probar el test:** romper el código a propósito para comprobar que el test falla; si no falla, no protege nada.
- **Perfil de color ICC:** describe cómo interpretar los colores de una imagen. Las fotos de iPhone usan Display P3 (más amplio que sRGB); si se borra el perfil, los colores se ven más apagados.

**Comandos que aprendí:**
- `pytest -q` / `pytest -v` → correr los tests en resumen / uno por uno.

**Errores y cómo los resolvimos:**
- Error: la prueba manual mostró que la foto Display P3 perdía su perfil ICC al recomprimir. → Causa: reemplazábamos el espacio de color por `DeviceRGB`. → Solución: conservar el perfil ICC si tiene los mismos canales, y un test nuevo (`test_icc_color_profile_is_kept`).

**Dudas pendientes:**
- Probar con un PDF con texto real y con un escaneo cuando tenga uno.

## 2026-10-22 — Etapa 1: API de compresión de PDF

**Qué hicimos:**
- Creamos `api/` con su entorno virtual y dependencias fijadas (`requirements.txt` para producción, `requirements-dev.txt` con pytest, httpx y ruff). Revisamos la licencia de cada una (Pillow es MIT-CMU, permisiva).
- `GET /health` responde `{"status": "ok", "version": "0.1.0"}`.
- `compressor.py`: compresión sin pérdida (object streams) y recompresión de imágenes por nivel (DPI máximo + calidad JPEG). Si el resultado no es más pequeño, se devuelve el original (`already_optimized`).
- `POST /v1/compress-pdf` en una carpeta temporal que siempre se borra, con las cabeceras `X-Original-Size`, `X-Compressed-Size` y `X-Already-Optimized`.
- `config.py` (límites por variables de entorno), `errors.py` (formato único `{"error": {"code", "message"}}`) y `validation.py` (30 MB, `%PDF-`, cifrado, 500 páginas, corrupto).
- Script `scripts/compare_levels.py` para comparar los 3 niveles con un PDF real.

**Resultados con mi PDF (13,4 MB, con fotos):**
- Solo sin pérdida: 11,6 MB (−14 %).
- `low` 562 KB (−95,8 %) · `recommended` 234 KB (−98,2 %) · `extreme` 86 KB (−99,4 %). Casi todo el peso eran imágenes.

**Conceptos nuevos:**
- **Entorno virtual:** cada proyecto con su propia caja de herramientas; se activa con `source .venv/bin/activate` en cada terminal nueva.
- **Ruta y decorador:** `@app.get("/health")` registra la función que responde esa ventanilla.
- **`def` y no `async def`:** comprimir usa mucha CPU; con `def`, FastAPI lo corre en otro hilo y no bloquea el servidor.
- **Lo que hay dentro de un PDF:** objetos numerados; el contenido grande va en *streams* comprimibles.
- **DPI y aproximación:** asumimos que una imagen ocupa como mucho la página entera (lado mayor en pulgadas × DPI máximo).
- **dataclass como "recibo":** devolver `CompressionResult` con nombres en vez de una tupla suelta.
- **La trampa de `FileResponse`:** envía el archivo *después* de salir de la función, cuando la carpeta temporal ya se borró; por eso leemos el resultado en memoria.
- **Validar en el servidor siempre:** `/docs` (o la web) puede bloquear peticiones malas, pero cualquiera puede llamar la API directo con `curl`.
- **Validar de lo barato a lo caro:** tamaño → magic bytes → abrir con pikepdf.
- **Dos tipos de PDF protegido:** con contraseña para abrir (`PasswordError`) y solo con contraseña de dueño (`is_encrypted`); rechazamos ambos para no quitar protecciones sin permiso.

**Comandos que aprendí:**
- `python3 -m venv .venv` / `source .venv/bin/activate` / `deactivate` → crear, abrir y cerrar el entorno virtual.
- `pip install -r requirements-dev.txt` → instalar la lista de dependencias.
- `uvicorn app.main:app --reload` → arrancar la API; `--reload` reinicia al guardar (solo en desarrollo).
- `python -m scripts.compare_levels ../samples/archivo.pdf` → correr un módulo como script, con argumento.
- `python -c "..."` → correr una línea de Python desde la terminal.
- `curl -i -X POST URL -F "file=@ruta.pdf" -F "level=low"` → probar la API sin navegador (`-F` = campo de formulario, `@` = adjuntar archivo, `-i` = ver cabeceras).
- `pwd` / `ls` → saber dónde estoy y qué hay antes de usar rutas relativas.

**Errores y cómo los resolvimos:**
- `IndentationError: unexpected indent` → Causa: al pegar en la consola de Python las líneas llegaron con espacios al inicio. → Solución: pegar línea por línea o usar un script.
- `SyntaxError` con un `for ... do ... done` → Causa: lo escribí dentro de Python (`>>>`), y es un comando de zsh. → Solución: mirar el prompt; salir con `exit()`.
- `SyntaxError: Expected one or more names after 'import'` → Causa: el comando largo se copió con saltos de línea reales. → Solución: un script en archivo (`compare_levels.py`).
- `NotImplementedError` → Causa: el ejercicio del TODO seguía sin hacer (el `raise` estaba a propósito). → Aprendí a leer el traceback de abajo hacia arriba.
- `ruff BLE001` → Causa: `except Exception` atrapa todo, incluso nuestros bugs. → Solución: atrapar solo los errores esperados (`pikepdf.PikepdfError`, `OSError`…).
- `curl: (26)` → Causa: ruta relativa calculada desde la carpeta equivocada (`../samples` desde la raíz). → Solución: `pwd` y quitar el `../`.
- `git push` desde Claude falla con `could not read Username` → Causa: su terminal no es interactiva y no puede pedir credenciales. → Solución: hacer push yo, o configurar `gh auth login`.

**Dudas pendientes:**
- Python 3.14 en local vs. `python:3.12-slim` en el plan de Docker: decidir en la etapa 2 (sugerencia: `3.14-slim`).
- Aún faltan: timeout de 60 s, error `500 internal_error`, CORS y rate limiting (siguientes tareas / etapas).

## 2026-10-22 — Etapa 0: preparación del entorno

**Qué hicimos:**
- Verificamos las herramientas: Git 2.50, Python 3.14, Node 22, npm 10, Docker 29 y Claude Code. Falta `gcloud` (se instala en la etapa 3).
- Subimos a GitHub el commit con la documentación (`docs: Project Setup starter kit`).
- Marcamos las tareas de la etapa 0 en `PLAN.md` con un ciclo completo de Git: editar → `status` → `diff` → `add` → `commit` → `push`.

**Conceptos nuevos:**
- **Local vs. remoto:** `commit` guarda en mi computador; solo con `push` llega a GitHub.
- **Las 3 zonas de Git:** escritorio (archivos editados) → caja abierta (`git add`) → paquete sellado (`git commit`).
- **Mensaje de commit:** título corto en imperativo y en inglés, línea en blanco y un cuerpo opcional con el qué y el porqué.
- **Reescribir historia:** `--amend` reemplaza el último commit; si ya estaba subido hace falta `push --force-with-lease`. Solo se hace en ramas que nadie más usa.

**Comandos que aprendí:**
- `git status -sb` → estado corto; `[ahead 1]` = tengo commits sin subir.
- `git diff` / `git diff --staged` → cambios del escritorio / de la caja.
- `git commit -m "título" -m "cuerpo"` → cada `-m` es un párrafo.
- `git push origin main` → sube mis commits a GitHub.
- `git log --oneline` → historial en una línea por commit.
- `git reflog` → historial de todos los movimientos de `HEAD`, útil para diagnosticar.

**Errores y cómo los resolvimos:**
- Error: el cuerpo del commit `docs(plan)` quedó con un texto equivocado (copié la explicación en vez del mensaje). → Causa: copiar el bloque incorrecto. → Solución: intentamos `--amend` + `--force-with-lease`, pero `git reflog` mostró que el amend nunca se ejecutó. Decidimos dejarlo así: el título está bien y no rompe nada.

**Dudas pendientes:**
- ¿Por qué no se aplicó el amend? (¿quedó la terminal en `dquote>`? ¿otra carpeta?) Si vuelve a pasar, pegar la salida.
