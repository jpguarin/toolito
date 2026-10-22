# Flujo de la secadora (Dryer No.3 · Compress PDF)

Cómo funciona por dentro la pantalla `/compress-pdf`: sus fases, qué muestra la interfaz en cada una, cómo se calcula el progreso, qué pasa con cada error y cómo se cancela. Se implementa en la **Etapa 6** de `PLAN.md`.

> El mockup `design/mockups/TlDryer.dc.html` muestra todas las fases (`READY` → `LOADING n%` → `DRYING 0:ss` → `DONE`, con "Stop the dryer"), pero los tiempos son **simulados**: úsalo para el aspecto de cada fase y la lógica de este documento para el comportamiento real.

---

## 1. El problema: el servidor no avisa cuánto lleva

La API es **síncrona** (`docs/ARCHITECTURE.md`): recibe el PDF, lo comprime y responde al final. Mientras comprime no envía nada, así que **no existe un porcentaje real de compresión**. Lo único que sí se puede medir es la **subida** del archivo.

Por eso la secadora tiene dos tramos con progreso distinto:

| Tramo | Qué pasa | ¿Se puede medir? | Qué muestra la barra |
|---|---|---|---|
| Subida | El navegador envía el PDF | **Sí** (`xhr.upload.onprogress`) | Porcentaje real |
| Secado | El servidor comprime | **No** | Franja animada (indeterminada) + tiempo transcurrido |

Regla: **nunca inventar un porcentaje**. Un 64 % falso que se queda congelado genera más desconfianza que una franja animada honesta.

### Por qué `XMLHttpRequest` y no `fetch`

`fetch` no informa del progreso de subida en los navegadores actuales. `XMLHttpRequest` sí, con el evento `upload.onprogress`. Para todas las demás peticiones del proyecto se sigue usando `fetch`; esta es la excepción y conviene dejar un comentario en el código explicando por qué.

---

## 2. Fases

```
empty ──soltar PDF──▶ loaded ──START DRYER──▶ uploading ──subida completa──▶ drying ──respuesta OK──▶ done
  ▲                     ▲  │                      │                           │                          │
  │                     │  └─cambiar archivo      ├──STOP──┐                  ├──STOP──┐                 │
  │                     └─────────────────────────┴────────┴──────────────────┴────────┘                 │
  │                     ▲                                                                                │
  │                     └──────────── error (out-of-order) ◀── cualquier fallo en uploading/drying       │
  └──────────────────────────────────────────── RUN ANOTHER LOAD ◀───────────────────────────────────────┘
```

| Fase | LED | Paso activo (StepIndicator) | Ojo de buey | Barra | Botón principal | Otros |
|---|---|---|---|---|---|---|
| `empty` | `READY` | 1 Load | vacío (`glass-dryer` apagado) | — | START DRYER deshabilitado | Dropzone activa |
| `loaded` | `READY` | 2 Cycle | papeles quietos | — | START DRYER | CycleOption elegible; FileRow con "Change file" |
| `uploading` | `LOADING 42%` | 3 Dry | papeles entrando | **determinada** (real) | oculto | Botón secundario **Stop the dryer**; CycleOption y Dropzone deshabilitados |
| `drying` | `DRYING 0:12` | 3 Dry | tambor girando | **indeterminada** (franja) | oculto | **Stop the dryer**; texto "Please don't open the door…" |
| `done` | `DONE` | 4 Take home | papeles doblados (`glass-sort`) | — | TAKE IT HOME | CareLabel con resultado; **Run another load** |
| `error` | código (`E-413`…) | se queda en el paso donde falló | apagado | — | según el error (ver §5) | Tarjeta OutOfOrder |

Notas:
- `DRYING 0:12` es el **tiempo transcurrido** (mm:ss), no un porcentaje. Se actualiza cada segundo.
- Si `drying` pasa de **8 s**, cambia el texto a: *"Heavy load. Still drying — big PDFs can take up to a minute."*
- Si el archivo pesa poco, `uploading` puede durar menos de un instante: no pasa nada, la interfaz salta directo a `drying`.

### Estado en TypeScript

Un solo objeto con la fase como discriminante evita combinaciones imposibles (por ejemplo, "terminado" y "con error" a la vez):

```ts
type Cycle = 'low' | 'recommended' | 'extreme';

type DryerState =
  | { phase: 'empty' }
  | { phase: 'loaded'; file: File; cycle: Cycle }
  | { phase: 'uploading'; file: File; cycle: Cycle; percent: number }
  | { phase: 'drying'; file: File; cycle: Cycle; startedAt: number }
  | { phase: 'done'; file: File; cycle: Cycle; result: Blob; originalSize: number; compressedSize: number; alreadyOptimized: boolean }
  | { phase: 'error'; file: File | null; code: DryerErrorCode };
```

Los niveles de la interfaz se traducen así a la API: Delicate → `low`, Normal → `recommended`, Heavy duty → `extreme`.

---

## 3. La petición

Referencia de la forma (no es código final; se construye paso a paso en la Etapa 6):

```ts
function startDryer(file: File, level: Cycle, handlers: {
  onUploadProgress: (percent: number) => void;
  onUploadDone: () => void;
}): { promise: Promise<XMLHttpRequest>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<XMLHttpRequest>((resolve, reject) => {
    xhr.open('POST', `${import.meta.env.PUBLIC_API_URL}/v1/compress-pdf`);
    xhr.responseType = 'blob';
    xhr.timeout = 90_000; // 60 s del servidor + margen para subir y bajar

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) handlers.onUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.upload.onload = () => handlers.onUploadDone(); // empieza el secado
    xhr.onload = () => resolve(xhr);                    // llegó respuesta (OK o error HTTP)
    xhr.onerror = () => reject(new Error('network'));   // sin conexión / CORS / servidor caído
    xhr.ontimeout = () => reject(new Error('timeout'));
    xhr.onabort = () => reject(new Error('aborted'));

    const body = new FormData();
    body.append('file', file);
    body.append('level', level);
    xhr.send(body);
  });
  return { promise, abort: () => xhr.abort() };
}
```

Al recibir la respuesta:
- **2xx:** leer `X-Original-Size`, `X-Compressed-Size` y `X-Already-Optimized` (la API debe incluirlas en `Access-Control-Expose-Headers`), crear la URL de descarga con `URL.createObjectURL(xhr.response)` y pasar a `done`.
- **4xx / 5xx:** la respuesta es JSON aunque `responseType` sea `blob`: leerla con `await xhr.response.text()` y `JSON.parse`, tomar `error.code` y pasar a `error`.

---

## 4. Resultado (`done`)

- **Reducción normal:** CareLabel con `12.4 MB → 4.6 MB`, `−63%`, *Text: Still selectable · Original: Removed from the dryer*. Botón **TAKE IT HOME**.
- **`X-Already-Optimized: true`:** no es un error. CareLabel con *"Already as light as it gets — we gave you back the original."* y la descarga igual disponible. Sugerir probar **Heavy duty** si el nivel era otro.
- **Nombre de descarga:** el original con sufijo, `informe.pdf` → `informe-compressed.pdf`.
- **Liberar memoria:** `URL.revokeObjectURL(url)` al hacer **Run another load** o al salir de la página.

---

## 5. Errores → letrero "Out of order"

Cada fallo termina en una tarjeta **OutOfOrder** (`design/components/OutOfOrder.md`). Nunca se muestra el mensaje técnico ni el código HTTP; solo el código corto del LED.

| Origen | `code` | LED | Título | Acción |
|---|---|---|---|---|
| Validación en el navegador o 413 | `file_too_large` | `E-413` | This load is too heavy | Go to Split PDF |
| 422 | `too_many_pages` | `E-413` | This load is too heavy | Go to Split PDF |
| 415 | `not_a_pdf` | `E-415` | That's not laundry | Go to Washer No.1 |
| 422 | `encrypted_pdf` | `LOCKED` | This basket is locked | Choose another file |
| 422 | `corrupted_pdf` | `E-422` | This one's torn | Choose another file |
| 429 | `rate_limited` | `COOLING` | Machine cooling down | Ready again in 0:42 (cuenta regresiva con `Retry-After`) |
| 504 o `timeout` del navegador | `processing_timeout` | `E-504` | This load took too long | Go to Split PDF |
| `onerror` (sin conexión, CORS, servidor caído) | `offline` | `NO POWER` | You're offline | Try again |
| 500, 400 u otro inesperado | `internal_error` | `E-500` | Something jammed the drum | Try again |

- Las 8 tarjetas están dibujadas en `design/mockups/TlErrors.dc.html` (incluidas `E-504` y `E-500`).
- "Try again" reenvía **el mismo archivo y nivel** sin pedir que lo suelte de nuevo.
- Para distinguir *offline* de *servidor caído*: si `navigator.onLine === false`, es offline; si no, tratarlo como `internal_error`.
- `rate_limited`: la API debe enviar la cabecera `Retry-After` (en slowapi, `headers_enabled=True`) y exponerla por CORS. Si no viene, usar 60 s.

---

## 6. Cancelar ("Stop the dryer")

- Botón secundario visible en `uploading` y `drying`.
- Llama a `abort()`; el `reject('aborted')` **no** muestra error: vuelve a `loaded` con el mismo archivo y nivel.
- El servidor puede seguir procesando ese archivo hasta terminar, pero descarta el resultado al cerrarse la conexión y borra el temporal (`finally`). No hay nada que limpiar en el navegador.

## 7. Protecciones

- **Doble clic:** START DRYER desaparece al pasar a `uploading`; además la función ignora llamadas si la fase no es `loaded`.
- **Cambiar de nivel o archivo a mitad:** CycleOption y Dropzone quedan deshabilitados en `uploading`/`drying`.
- **Salir de la página a mitad:** advertencia con `beforeunload` solo en `uploading`/`drying`; se quita al terminar.
- **Validar antes de subir:** tamaño ≤ 30 MB y cabecera `%PDF-` (leer los primeros 5 bytes con `file.slice(0, 5)`). Ahorra una subida inútil; la API valida de todas formas.

## 8. Arranque en frío de Cloud Run

Si nadie ha usado la API en un rato, Cloud Run apaga el contenedor y la primera petición tarda unos segundos más en arrancarlo.

- **Precalentar:** al pasar a `loaded` (el usuario ya soltó un PDF), enviar `GET /health` sin esperar la respuesta. Mientras el usuario elige el nivel, el contenedor arranca. Costo prácticamente nulo.
- El texto de los 8 s (§2) cubre también este caso.

## 9. Accesibilidad

- El LED tiene `role="status"`, pero **no** debe anunciar cada porcentaje ni cada segundo: anuncia solo los cambios de fase (*Loading*, *Drying*, *Done*, el error). Usar un texto aparte, visualmente oculto, para el anuncio; el LED visible se marca `aria-hidden="true"`.
- Barra determinada: `aria-valuenow` con el porcentaje. Barra indeterminada: **sin** `aria-valuenow` y con `aria-valuetext="Drying"`.
- Al llegar a `done`, mover el foco al botón **TAKE IT HOME**; al llegar a `error`, al título de la tarjeta OutOfOrder.
- Con `prefers-reduced-motion: reduce`: tambor quieto, franja quieta (se ve "Working…"), el tiempo transcurrido sigue contando.

## 10. Cómo probarlo

- **Subida lenta:** DevTools → Network → *Slow 3G* para ver `LOADING n%`.
- **Secado largo:** un PDF grande lleno de fotos, o un `asyncio.sleep` temporal en la API local.
- **Cada error:** PDF de 31 MB, un `.jpg` renombrado a `.pdf`, un PDF con contraseña, un PDF truncado, 25 peticiones seguidas (rate limit), API apagada (offline/servidor caído).
- **Cancelar** en cada tramo y comprobar que vuelve a `loaded` sin tarjeta de error.
- **Light y Dark** (`?theme=light` / `?theme=dark`) y con *reduced motion* activado en el sistema.
