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
| **Rate limiting** | Límite de peticiones por visitante en un tiempo (20 por minuto); al pasarlo, `429`. |
| **Proceso vs. hilo** | Un hilo comparte el programa y no se puede matar desde fuera; un proceso es otro Python aparte que sí se puede detener. |
| **Preflight** | Petición `OPTIONS` que el navegador hace antes de un envío para preguntar si el origen tiene permiso (CORS). |
| **X-Forwarded-For** | Cabecera con la lista de IPs por las que pasó la petición; Google añade la IP real al final. |
| **Proyecto (Google Cloud)** | El "apartamento" donde viven todos los recursos y costos de Toolito (`toolito-api`). |
| **Cuenta de servicio** | Usuario "robot" que usan los servicios de Google para actuar en tu nombre. |
| **IAM** | Sistema de roles y permisos de Google Cloud: quién puede hacer qué. |
| **Revisión** | Cada versión desplegada de un servicio de Cloud Run; se puede volver a una anterior. |
| **Concurrencia** | Cuántas peticiones atiende una instancia al mismo tiempo. |
| **Escalar a cero** | Sin tráfico, Cloud Run apaga el contenedor y no cobra nada. |
| **Monorepo** | Un solo repositorio con varios proyectos (`api/` en Python y `web/` en Astro). |
| **Isla (Astro)** | Parte interactiva de una página estática; solo ahí llega JavaScript al navegador. |
| **Utility-first** | Estilo de Tailwind: combinar clases pequeñas (`p-5 bg-accent`) en vez de escribir CSS a medida. |
| **FOUC** | Parpadeo cuando la página se pinta con un estilo y salta a otro; lo evitamos decidiendo el tema antes de pintar. |
| **Gestor de versiones** | Herramienta (nvm) para tener varias versiones de Node y elegir cuál usar. |
| **Comodín (glob)** | Símbolos como `*` que la terminal convierte en nombres de archivos; se evitan con comillas. |
| **Vitest** | El "pytest" del mundo JavaScript/Vite: `test`, `expect`, `test.each`. |
| **Props** | Los "parámetros" de un componente Astro (`<ShopHeader current="pdfs" />`). |
| **ARIA** | Atributos que le cuentan a un lector de pantalla lo que se ve (`aria-expanded`, `aria-current`). |
| **Foco** | El "cursor" de quien navega con teclado (`Tab`); hay que devolverlo a un lugar lógico. |
| **CLS** | Cuánto "salta" la página mientras carga; se evita reservando el espacio (p. ej. del anuncio). |
| **Capa de CSS (`@layer`)** | Grupo de estilos con prioridad; lo que no está en ninguna capa gana. |
| **XSS** | Ataque que mete código en una página a través de datos del usuario; se evita con `textContent`. |
| **Evento personalizado** | Aviso propio (`dropzone:files`) que un componente lanza para que otros reaccionen. |
| **Atributo booleano** | Atributo de HTML que se activa solo con estar presente (`multiple`, `disabled`, `hidden`). |
| **ArrayBuffer** | Los bytes en bruto de un archivo en memoria; se leen con una vista como `Uint8Array`. |
| **Web Worker** | Un segundo hilo de JavaScript para trabajo pesado, sin congelar la página. |
| **Code splitting** | Separar el código pesado en archivos que se descargan solo cuando hacen falta (`import()`). |
| **Blob** | Un "archivo" creado en memoria del navegador, listo para descargar. |
| **Parsear** | Convertir texto que escribe el usuario en datos que el programa entiende (o en un error claro). |
| **Roving tabindex** | Patrón de teclado: un grupo es una sola parada de `Tab` y se recorre con flechas. |
| **Licencia dual** | El autor ofrece dos licencias ("MIT OR GPL"); tú eliges una. |
| **Slot** | Hueco de un componente Astro donde la página inserta su propio contenido. |
| **ImageData** | La imagen como píxeles sin comprimir (RGBA); lo que se decodifica antes de volver a codificar. |
| **Códec** | Programa que codifica y decodifica un formato (MozJPEG para JPG, libwebp para WebP…). |
| **Cola** | Lista de trabajos que esperan turno y se procesan uno a uno. |
| **clipPath** | Forma de SVG que recorta lo que se dibuja dentro, como un esténcil. |
| **REPL** | La consola interactiva de Python (`>>>`): escribes una línea y se ejecuta al instante. |

---

<!-- Las entradas de cada sesión van debajo de esta línea, la más reciente arriba. -->

## 2026-10-22 — Etapa 5: `/compress-image` (Washer No.1)

**Qué hicimos:**
- Motor de imágenes con **jSquash** (códecs de Squoosh en WebAssembly) dentro de un Web Worker: decodificar → (redimensionar) → codificar en JPG, PNG (OxiPNG, sin pérdida), WebP o AVIF.
- Revisamos la licencia de cada códec empaquetado (MozJPEG, libwebp, libavif, OxiPNG, resize…): todas permisivas.
- Página `/compress-image`: `WasherControls` (LED `Q75 · WEBP`, formatos, calidad, redimensionar), ojo de buey grande con **ropa** (tus miniaturas) que gira mientras lava, cola de una imagen a la vez, filas con estado, resumen "CLEAN LOAD" y **Take all home (ZIP)**, botón **Rewash**.
- "Already clean": si una imagen no baja de tamaño en su mismo formato, devolvemos el original (como la API).
- Añadí el icono `chevron-down` al diseño; tokens versión 11 (ojo de buey grande, miniatura, ropa). 68 tests en `web/`.
- Probado con capturas: PNG → WebP de 185 KB a 47 KB (−75 %) en 0,1 s.

**Conceptos nuevos:**
- **WebAssembly (WASM):** código C/Rust compilado a un formato binario que el navegador ejecuta casi a velocidad nativa.
- **Licencias de lo empaquetado:** que un paquete sea Apache no cambia la licencia del código que lleva dentro; hay que revisar cada códec. BSD e IJG piden mostrar los avisos de copyright (créditos).
- **Cargar cada códec solo cuando hace falta:** el codificador AVIF pesa 3,5 MB y solo se descarga si eliges AVIF.
- **`ImageData`:** la imagen "sin lavar" (ancho × alto × 4 bytes). Una foto de 12 MP ocupa unos 48 MB.
- **Cola de procesamiento:** una imagen a la vez para no agotar la memoria.
- **Animaciones con `prefers-reduced-motion`:** el tambor y la barra solo se mueven si el sistema lo permite.
- **`clipPath` de SVG:** un "esténcil" que recorta tu foto con la forma de cada prenda.
- **El signo menos real** (`−72%`, no un guion) como pide el brand book.
- **Recordar con qué ajustes se lavó cada carga** para saber cuándo hace falta "Rewash".
- **Evitar trabajo repetido:** el ZIP solo se rehace cuando cambian los resultados, no con cada movimiento del deslizador.

**Comandos que aprendí:**
- `curl -s localhost:4321/src/styles/global.css | grep ...` → comprobar si una clase de Tailwind existe de verdad en el CSS de desarrollo.

**Errores y cómo los resolvimos:**
- Las clases nuevas no se aplicaban (la flecha del select salía debajo) → Causa: la carpeta `src/pages/dev/` se creó con el servidor ya encendido y Tailwind no la escaneaba. → Solución: reiniciar `npm run dev`.
- Comentario HTML dentro de `{ cond ? (...) : (...) }` → Causa: dentro de una expresión es JavaScript. → Solución: comentario fuera de la expresión (o `{/* */}`).
- El botón Rewash desaparecía al añadir fotos tras cambiar ajustes → Causa: un solo "ajustes usados" para toda la lista. → Solución: guardar los ajustes en cada carga.
- La flecha nativa del `<select>` pegada al borde → Solución: `appearance-none` + icono `chevron-down` propio con tokens de espacio.

**Dudas pendientes:**
- Página de créditos con los avisos BSD/IJG de los códecs (etapa 6, páginas legales).
- "Add more to the drum" en dos líneas como el diseño, y el banner de anuncio bajo la lista.
- AVIF multihilo (`avif_enc_mt`) necesita cabeceras especiales de seguridad; revisar en la etapa 6 si AVIF va lento.

## 2026-10-22 — Etapa 5: `/split-pdf` (Clothesline No.5)

**Qué hicimos:**
- `lib/ranges.ts`: leer y escribir rangos de páginas ("1-3, 8") con errores amables; `splitPdf` en `lib/pdf.ts` y un mensaje `split` en el worker.
- Página `/split-pdf`: `SegmentedTabs` reutilizable (Pick pages · Ranges · Every page), tendedero con páginas que se pinzan (clic, Espacio, Mayús+clic), cesta con el campo "Pages" sincronizado con las pinzas, radios y resumen.
- **TAKE DOWN & SPLIT:** un PDF se descarga directo; varios van en un ZIP con JSZip (cargado solo cuando hace falta).
- `lib/filenames.ts` (nombres de descarga) y `lib/download.ts` (`DownloadLink`, ahora también usado por `/merge-pdf`).
- Tokens versión 9: tamaños del tendedero y `shadow-pinned`. 49 tests en `web/`.

**Conceptos nuevos:**
- **Parsear la entrada del usuario:** convertir texto libre en datos o en un mensaje claro que nunca culpa al usuario.
- **Test de ida y vuelta:** `formatRanges` y luego `parseRanges` deben devolver lo mismo.
- **Roving tabindex:** una fila de pestañas es una sola parada de `Tab`; dentro se usan las flechas.
- **Dos vistas, un estado:** las pinzas y el campo se actualizan mutuamente a partir de los mismos datos.
- **Errores tras salir del campo:** se valida mientras escribes, pero el error se muestra al hacer blur (FormField.md).
- **Licencia dual "MIT OR GPL":** con "OR" uno elige; usamos JSZip bajo MIT.
- **ZIP con `STORE`:** solo agrupa, sin volver a comprimir (los PDF ya vienen comprimidos).
- **Ceros a la izquierda en los nombres** (`page-02`) para que el explorador de archivos los ordene bien.
- **Slot de Astro:** hueco en un componente donde la página mete su propio contenido (las pestañas al lado del título).
- **Código compartido entre páginas:** Vite separa en archivos comunes lo que usan varias páginas, y el navegador lo cachea.

**Comandos que aprendí:**
- (Ninguno nuevo: `npm test`, `npm run check` y `npm run build` siguen siendo la rutina antes de cada commit).

**Errores y cómo los resolvimos:**
- La barra de pestañas ocupaba todo el ancho → Causa: `self-start` solo funciona dentro de un flex. → Solución: `w-fit`.
- La tarjeta del tendedero se estiraba hasta la altura de la cesta → Causa: el grid estira las celdas por defecto. → Solución: `self-start`.

**Dudas pendientes:**
- "TAKE DOWN & SPLIT" ocupa dos líneas (20 px en una columna de 300 px; el mockup usa 17 px).
- Miniaturas reales de las páginas en el tendedero (hoy son hojas rayadas).
- Arrastrar filas con el ratón en `/merge-pdf` y las tarjetas OutOfOrder para los errores.

## 2026-10-22 — Etapa 5: `/merge-pdf` (Folding table No.4)

**Qué hicimos:**
- `lib/pdf.ts` con pdf-lib (MIT): `mergePdfs` y `countPages`, con los mismos códigos de error que la API (`not_a_pdf`, `encrypted_pdf`, `corrupted_pdf`) y 6 tests.
- Página `/merge-pdf`: `ToolIntro` (Badge + título), mesa de madera `FoldStack` con filas de toalla, ↑/↓/× y teclado, "The pile", **FOLD INTO ONE** y descarga **Take it home**.
- La unión corre en un **Web Worker**; la página solo carga 5 KB y pdf-lib (≈420 KB) llega con el primer PDF.
- `lib/format.ts` (`formatBytes`, `plural`) con tests. 15 tests en total en `web/`.
- Borramos la página temporal `/dev/dropzone`. Probé una unión real: el orden de las páginas es el correcto.

**Conceptos nuevos:**
- **`ArrayBuffer` vs `Uint8Array`:** el primero es la memoria en bruto; el segundo, una "vista" para leerla. `file.arrayBuffer()` abre la bolsa de la ropa.
- **Unir PDF:** documento vacío + copiar las páginas de cada archivo en orden.
- **Los tests descubren cómo se comporta una librería:** pdf-lib lanza un `Error` genérico con PDFs cifrados (mejor preguntar `isEncrypted`) y "abre" basura sin quejarse (hay que tocar las páginas dentro del `try`).
- **`<template>`:** HTML que el navegador lee pero no muestra; el script clona el molde y lo rellena con `textContent`.
- **Importación dinámica (code splitting):** `import()` dentro de una función separa el código pesado en otro archivo que se descarga solo cuando hace falta.
- **Web Worker:** un segundo hilo para el trabajo pesado; la página no se congela. Se habla con `postMessage` y un `id` por petición.
- **Transferir en vez de copiar:** pasar un `ArrayBuffer` como *transferable* lo entrega sin copiarlo (el que lo envía ya no puede usarlo).
- **`Blob` + `URL.createObjectURL`:** archivo en memoria con una URL `blob:` para `<a download>`; liberarla con `revokeObjectURL`.
- **Resultados viejos fuera:** si la mesa cambia, el PDF unido anterior se oculta y se libera.

**Comandos que aprendí:**
- `git rm -r carpeta` → borrar archivos y dejar el borrado listo para el commit.

**Errores y cómo los resolvimos:**
- `ts(2769): No overload matches this call` en `new Uint8Array(bytes, 0, 5)` → Causa: `bytes` podía ser una vista, no memoria en bruto (bug real). → Solución: usar la vista o crear una, y `subarray`.
- Tests rojos de cifrado y de PDF dañado → Causa: comportamiento de pdf-lib (ver arriba). → Solución: `ignoreEncryption` + `isEncrypted`, y contar páginas dentro del `try`.
- 424 KB de JavaScript al abrir la página → Causa: pdf-lib incluido en el script de la página. → Solución: moverlo a un Worker que se crea con el primer PDF.
- El cliente del worker añadía un `listener` en cada llamada → Causa: `addEventListener` fuera del "solo al crear". → Solución: registrarlo una vez.

**Dudas pendientes:**
- Arrastrar filas con el ratón (la especificación pide arrastrar **y** teclado; hoy hay ↑/↓ y teclado).
- Mostrar los errores con tarjetas OutOfOrder en vez de una lista roja.
- pdf-lib no se actualiza desde 2021: si aparece un PDF que falle, probar el fork `@pdfme/pdf-lib` (solo hay que tocar `lib/pdf.ts`).

## 2026-10-22 — Etapa 4: Dropzone (cierre de la etapa)

**Qué hicimos:**
- Componente `Dropzone` reutilizable: `<label>` con un `<input type="file">` oculto, arrastrar y soltar, estado "Let go to load it · N files", versión compacta y anillo de foco para teclado.
- `scripts/dropzone.ts`: avisa a cada herramienta con el evento `dropzone:files` (lista de `File`). No sube nada; cada herramienta revisará tipo y tamaño.
- Página temporal `/dev/dropzone` con `noindex` para probarlo (se borra cuando exista la primera herramienta).
- Token nuevo `dropzone-min-height` (tokens.json versión 7).
- **Etapa 4 completada.**

**Conceptos nuevos:**
- **`File` en el navegador:** nombre, tamaño, tipo y contenido; nada sale del computador salvo que el código lo envíe.
- **Eventos de arrastrar:** `dragenter`, `dragover` (con `preventDefault()` o el navegador abre el archivo), `dragleave` y `drop` (`dataTransfer.files`).
- **Contador de entradas:** `dragleave` también salta sobre los hijos; contamos entradas y salidas para que el resaltado no parpadee.
- **Evento personalizado (`CustomEvent`):** el componente "toca el timbre" y quien escucha decide qué hacer.
- **`input.value = ""`:** si no, elegir el mismo archivo dos veces no dispara `change`.
- **`textContent`, nunca `innerHTML`, con datos del usuario:** un nombre de archivo podría contener HTML y ejecutar código (XSS).
- **Atributos booleanos de HTML:** basta con que existan para estar activos; `multiple="false"` ¡está encendido!

**Comandos que aprendí:**
- `curl -s localhost:4321/ruta | grep -o '<input[^>]*>'` → mirar el HTML que de verdad genera Astro.

**Errores y cómo los resolvimos:**
- `outline-thick` no generaba nada → Causa: los grosores de `outline` en Tailwind son números, no tokens. → Solución: `outline-[length:var(--border-thick)]`.
- La secadora aceptaba 3 archivos → Causa: Astro escribió `multiple="false"`, que HTML trata como activo. → Solución: `multiple={multiple || undefined}`.

**Dudas pendientes:**
- "Toda la página acepta archivos" y "pegar desde el portapapeles" (Dropzone.md) quedan para las páginas de herramientas.
- Borrar `/dev/dropzone` al construir `/merge-pdf`.

## 2026-10-22 — Etapa 4: cabecera, pie y portada

**Qué hicimos:**
- `BaseLayout` completo: enlace "Skip to content", `ShopHeader` (toldo, letrero, navegación, letreros OPEN 24/7 / SELF-SERVICE), menú de teléfono accesible y `Footer`.
- Portada: `StorefrontHeader` (toldo grande con festón), `Storefront` (letrero, titular, entrada), 5 `MachineCard` con `Porthole` y `LedDisplay`, `HouseRules` y `NoticeBoard` (corcho con espacio reservado de 300 × 250).
- `tokens.json` pasó de la versión 1 a la 6: grupo `layout` (breakpoint, anchos, toldo, objetivo táctil, ojo de buey, anuncio…), colores `sign-border` y `shadow-sign`, y el estilo `card-title`.
- Script `npm run tokens:typography`: convierte los estilos de texto de `tokens.json` en utilidades de Tailwind.
- Iconos de `design/icons/` copiados a `web/src/icons/` y usados como componentes SVG.

**Conceptos nuevos:**
- **Componente Astro y props:** el bloque `---` corre al generar el HTML (nunca en el navegador); `interface Props` tipa los parámetros, como una función de Python.
- **Las variantes de Tailwind (`wide:`, `hover:`) solo sirven con sus utilidades**, no con clases CSS normales. Por eso generamos utilidades de tipografía desde `tokens.json`.
- **Capas de CSS:** importamos `tokens.css` en `layer(base)` para que las utilidades le ganen.
- **Tailwind lee el código como texto:** solo genera clases escritas completas; `` `bg-glass-${id}` `` nunca se genera.
- **SVG como componente:** se inserta en línea y acepta props (`stroke="currentColor"`), así el icono toma el color del tema.
- **Dibujar con CSS:** el festón del toldo son `radial-gradient` repetidos; el corcho, puntos con `color-mix`.
- **ARIA y foco:** `aria-expanded`, `aria-controls`, `aria-current`, `hidden`; Escape cierra el menú y el foco vuelve al botón.
- **`npm run build` no revisa tipos:** solo `npm run check` lo hace. Hay que correr los dos.
- **Una sola fuente de verdad para el estado:** el menú lee `aria-expanded`, el mismo atributo que usa el CSS.
- **CLS:** reservar el tamaño del anuncio antes de que cargue para que la página no salte.
- **Un solo `<h1>` por página.**

**Comandos que aprendí:**
- `npm run tokens:typography` → regenerar las utilidades de texto tras cambiar `tokens.json`.
- `Cmd+Shift+M` en DevTools → vista de teléfono.

**Errores y cómo los resolvimos:**
- `wide:sign-lg` no se generaba → Causa: `sign-lg` es una clase normal, no una utilidad. → Solución: generar utilidades desde `tokens.json` (primero lo resolvimos duplicando elementos, luego lo hicimos bien).
- `ts(2345): 'string | boolean' is not assignable to 'boolean'` en el menú → Causa: `hidden` puede valer `"until-found"`. → Solución: usar `aria-expanded` como estado.
- La fila de navegación de la portada salía centrada → Causa: en un flex de columna, `mx-auto` encoge el elemento a su contenido. → Solución: `w-full`.
- Las tarjetas no llenaban su columna → Causa: dentro de un `<li class="flex">` el hijo toma el ancho de su contenido. → Solución: `w-full` en la tarjeta.
- El borde del letrero no tenía neón de noche → Causa: usé `awning-b`, que es crema en los dos temas. → Solución: tokens nuevos `sign-border` y `shadow-sign` sacados del mockup.

**Dudas pendientes:**
- Copiar los tokens nuevos (versiones 2 a 6) al design system original en Claude.
- El mockup pone sombra suave al volante del corcho, pero el brand book la prohíbe: la dejé sin sombra.
- En teléfono el espacio de 300 × 250 no cabe: usar el banner 320 × 50 cuando lleguen los anuncios reales.
- Aproximaciones al token más cercano (13 en vez de 12 px, 24 en vez de 22 px, radio 20 en vez de 18…).
- La barra de herramientas de Astro aparece en las capturas (solo en `npm run dev`); se puede desactivar.

## 2026-10-22 — Etapa 4: Astro, tokens y temas

**Qué hicimos:**
- Actualizamos Node de 22.19 a **24.22.1 LTS** con nvm (Astro 7 pide ≥ 22.23.4).
- Omitimos el tutorial oficial de Astro: aprendemos construyendo `web/`.
- Creamos `web/` (monorepo: `api/` + `web/`) con Astro 7, TypeScript estricto, `.nvmrc` = 24 y `npm run check`.
- Conectamos `design/tokens.css` a Tailwind 4: **quitamos todos los valores por defecto** (`bg-blue-500` ya no existe) y solo quedan los tokens (`bg-accent`, `p-5`, `rounded-lg`, `border-thick`…). Fondo de baldosa en el `body`.
- Fuentes **servidas desde nuestro sitio** con la Fonts API de Astro (Fontsource): nada de Google, funcionan sin conexión. Permitimos la licencia OFL solo para fuentes en `CLAUDE.md`.
- Tema Light/Dark antes de pintar (script en línea), cambio en vivo cada minuto y al volver a la pestaña, y tests de `resolveTheme` con Vitest.
- Corregimos `docs/THEMES.md` (`--ink`, `--panel-ink`) y `design/BRAND-BOOK.md` (fuentes propias).

**Conceptos nuevos:**
- **Gestor de versiones (nvm):** varias versiones de Node instaladas; cada terminal usa la suya. `default` solo afecta a las terminales nuevas.
- **Astro genera HTML estático:** la página llega hecha; JavaScript solo en las "islas" interactivas.
- **Rutas por archivos:** `src/pages/compress-pdf.astro` → `/compress-pdf`.
- **Tailwind (utility-first):** clases pequeñas en el HTML en vez de CSS a medida. Quitar los valores por defecto hace que la herramienta obligue a usar los tokens.
- **`@theme inline reference`:** las utilidades leen la variable en tiempo real (siguen el tema) y Tailwind no redeclara las variables (evita autorreferencias).
- **Capas de CSS:** los estilos sin capa ganan a los que están dentro de una (`@layer`).
- **Puente de fuentes:** Astro renombra las fuentes (`Bungee-e406…`), así que `--font-sign` apunta a `--font-bungee`.
- **FOUC (parpadeo):** si el tema se decide tarde, la página aparece en claro y salta a oscuro. Solución: script en línea (`is:inline`) al inicio del `<head>`.
- **`define:vars`:** Astro escribe valores de TypeScript dentro de un script en línea; así las horas viven en un solo lugar (`theme.ts`).
- **Script normal de Astro:** se procesa (TypeScript, `import`), se minimiza y, si es pequeño, se incrusta en la página.
- **Eventos del navegador:** `addEventListener("visibilitychange", …)` avisa cuando vuelves a la pestaña.
- **Tests de bordes y tautologías:** probar con valores fijos en los límites (6, 7, 18, 19); un test que copia la fórmula de la función no protege nada.

**Comandos que aprendí:**
- `nvm install --lts` / `nvm alias default 'lts/*'` / `nvm use default` → instalar, fijar y activar una versión de Node.
- `npm create astro@latest web -- --template minimal --install --no-git --no-ai --skip-houston` → crear el proyecto Astro.
- `npx astro add tailwind` → instalar una integración de Astro.
- `npm run dev` / `npm run check` / `npm run build` / `npm run preview` / `npm test` → desarrollo, tipos, sitio final, vista previa y tests.

**Errores y cómo los resolvimos:**
- `Node.js v22.19.0 is not supported by Astro!` → Causa: Astro 7 pide ≥ 22.23.4. → Solución: Node 24 LTS con nvm.
- `zsh: no matches found: lts/*` → Causa: en zsh el `*` es un comodín de archivos. → Solución: comillas: `'lts/*'`.
- El mismo error de versión en otra terminal → Causa: esa terminal se abrió antes de cambiar el `default`. → Solución: `nvm use default` o abrir una nueva.
- Fuentes con nombre cambiado (`Bungee-e406…`) → Causa: la Fonts API renombra las familias. → Solución: puente de variables en `global.css`.
- `git push` desde Claude: `could not read Username` → Causa: su terminal no puede pedir credenciales. → Solución: push con `! git push` (o configurar `gh auth login`).

**Dudas pendientes:**
- Ver el cambio en vivo a las 19:00 con la página abierta (o probarlo con el truco de la consola + cambiar de pestaña).
- `<meta name="theme-color">` que cambie con el tema: va en la etapa 6 (PWA).
- `docs/SETUP.md` dice "Node.js LTS": hoy es la 24; quizá anotar la versión.

## 2026-10-22 — Etapa 3: protecciones y Google Cloud Run

**Qué hicimos:**
- Proyecto `toolito-api` en Google Cloud (borramos el primero, `toolito-512418`, para tener un ID claro). Facturación vinculada y presupuesto de 5 USD/mes con alertas al 50/90/100/150 %, sin descontar créditos.
- Instalamos `gcloud` (Homebrew) e iniciamos sesión; región por defecto `us-central1`.
- Antes de publicar, añadimos protecciones a la API (adelantamos parte de la etapa 6):
  - Rate limiting por IP con slowapi: 20/min → `429 rate_limited` + `Retry-After`.
  - Timeout de 60 s con la compresión en un **proceso aparte** → `504 processing_timeout`.
  - `500 internal_error` sin detalles internos (el traceback solo va a los logs).
  - CORS restringido a `ALLOWED_ORIGINS`, exponiendo las cabeceras de tamaño y `Retry-After`.
  - 27 tests en total.
- Primer despliegue con `gcloud run deploy --source api`. URL: https://toolito-api-352538375764.us-central1.run.app
- Configuración: 2Gi, 1 CPU, concurrencia 2, timeout 90 s, máximo 2 instancias; variables de entorno explícitas. Todo documentado en `docs/DEPLOY.md`.
- Revisamos los logs y comprobamos que el rate limiting no se puede saltar falsificando `X-Forwarded-For`.

**Mediciones:**
- Una compresión de mi PDF usa ~241 MB de memoria; la app en reposo, 62 MB.
- El proceso aparte suma ~0,18 s por petición.
- En Cloud Run, de los ~6 s totales con mi PDF de 13 MB, casi todo es la **subida** (~2,2 MB/s); comprimir tarda menos de medio segundo.

**Conceptos nuevos:**
- **Cuenta → cuenta de facturación → proyecto:** inquilino, medidor de luz con la tarjeta, y apartamento donde vive todo.
- **La alerta de presupuesto avisa, no frena:** el freno real es `--max-instances`.
- **Hilo vs. proceso:** un hilo no se puede matar desde fuera; un proceso sí (`terminate`). Por eso el timeout usa un proceso.
- **`spawn` vuelve a importar el archivo principal:** los scripts con `multiprocessing` necesitan `if __name__ == "__main__":`.
- **IP detrás de un proxy:** en Cloud Run la conexión llega desde el proxy de Google (`169.254.x.x`); la IP real va al final de `X-Forwarded-For`.
- **CORS protege en el navegador, no frente a `curl` o bots.** El navegador pregunta antes con un *preflight* (`OPTIONS`).
- **Serverless y escalar a cero:** Google enciende el contenedor cuando llega una petición y lo apaga tras unos minutos sin uso (en los logs: `Shutting down`).
- **Revisión:** cada despliegue o cambio de configuración crea una versión nueva (`00001`, `00002`, `00003`…).
- **Concurrencia:** cuántas peticiones atiende una instancia a la vez; para trabajo pesado de CPU conviene un número bajo.
- **En Cloud Run `/tmp` vive en la RAM:** los archivos temporales cuentan para el límite de memoria.
- **Cuenta de servicio e IAM:** "usuarios robot" con roles (tarjetas de acceso). Principio de mínimo privilegio: darles solo lo que necesitan.

**Comandos que aprendí:**
- `brew install --cask gcloud-cli` → instalar la CLI de Google Cloud.
- `gcloud init` / `gcloud config list` / `gcloud config set run/region us-central1` → iniciar sesión, ver y fijar la configuración.
- `gcloud run deploy toolito-api --source api --allow-unauthenticated --max-instances 2` → construir en la nube y publicar.
- `gcloud run services update ... --memory --concurrency --timeout` → cambiar la configuración sin reconstruir.
- `--set-env-vars` (reemplaza todas) vs. `--update-env-vars` (solo las nombradas).
- `gcloud run services describe` / `gcloud run services logs read --limit 20` → ver la configuración / leer los logs.
- `gcloud billing projects describe toolito-api` → ver si la facturación está activa.
- `for i in {1..21}; do ...; done` → repetir un comando en zsh.

**Errores y cómo los resolvimos:**
- `ModuleNotFoundError: No module named 'pikepdf'` → Causa: la terminal no tenía el venv activado y se usó el `uvicorn` global (se veía en las rutas `/Library/Frameworks/...` del traceback). → Solución: `source .venv/bin/activate`.
- `curl: option -F: requires parameter` + `zsh: no such file or directory: file=@...` → Causa: el comando se partió en dos líneas al copiarlo. → Solución: versión más corta en una sola línea.
- `FileNotFoundError: .../<stdin>` al probar el timeout → Causa: `spawn` intenta reimportar el archivo principal y yo pasaba el script por stdin. → Solución: script en un archivo con `if __name__ == "__main__":`.
- El budget no mostraba "Projects" → Causa: ningún proyecto estaba vinculado a la cuenta de facturación. → Solución: así el presupuesto cubre toda la cuenta, que es suficiente.
- `PERMISSION_DENIED ... service account ...-compute@developer` en el primer despliegue → Causa: permisos IAM de un proyecto nuevo aún propagándose (la cuenta ya tenía `roles/editor`). → Solución: reintentar unos minutos después.

**Dudas pendientes:**
- Cambiar `roles/editor` de la cuenta de servicio por solo `roles/run.builder`.
- Pillow lanza `DecompressionBombError` con imágenes gigantes: hoy saldría como `500`; convertirlo en un `422` claro.
- slowapi usa una función que Python 3.16 eliminará (aviso en pytest); vigilar si sale una versión nueva.
- Las respuestas `500` no llevan cabeceras CORS: el frontend las verá como "error de red" (tenerlo en cuenta en la etapa 6).
- "Spend cap enforcement" del presupuesto aparece deshabilitado; revisar más adelante si se puede activar para Cloud Run.
- Probar con un PDF con texto real y con un escaneo.

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
