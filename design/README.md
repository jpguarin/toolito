# Diseño de Toolito — guía para construir

Esta carpeta es **la fuente de verdad visual** dentro del repositorio. Claude Code (y tú) la usan como guía al construir cualquier pantalla.

## Qué hay aquí

| Ruta | Qué es | Cómo se usa |
|---|---|---|
| `BRAND-BOOK.md` | Principios, voz, colores, tipografía, formas, máquinas | Leer antes de diseñar o escribir textos de interfaz |
| `tokens.json` | Todos los tokens (colores Light/Dark, tipografía, espaciado, radios, bordes, sombras y medidas de layout) | Fuente de datos; **no se edita a mano en otro lugar** |
| `tokens.css` | Los mismos tokens como variables CSS (`--bg`, `--accent`…) por tema (`[data-theme]`) | Se copia a `web/src/styles/tokens.css` e importa en el layout |
| `components/<Nombre>.md` | Especificación de cada uno de los 23 componentes (anatomía, variantes, estados, accesibilidad) | Leer antes de construir ese componente |
| `components/<Nombre>.html` | Vista previa estática del componente usando `tokens.css` (cambia `data-theme="light"` por `"dark"` en el `<html>` para ver el tema nocturno) | Abrir en el navegador para comparar con lo construido |
| `icons/*.svg` | 17 iconos de trazo (24 × 24) y su guía `icons/README.md` | Insertarlos en línea con `stroke="currentColor"` |
| `mockups/*.dc.html` | Código fuente de las 7 pantallas del lienzo de diseño | **Referencia** de estructura, textos y medidas; no es código de producción ni se ejecuta solo |
| `screens/` | Capturas PNG de las pantallas (Light y Dark) | Comparación visual pantalla por pantalla |

## Fuentes en Claude (originales)

- **Lienzo "Toolito — Mockups"**, página *Laundromat · Light / Dark*: las 7 pantallas en Auto, Light y Dark.
- **Design system "Toolito Laundromat"**: tokens, brand book y vistas de componentes.

Si cambias algo en esos originales, actualiza también esta carpeta (ver "Mantenerla al día").

## Pantallas y su referencia

| Pantalla | Mockup | Capturas (`screens/`) | Componentes |
|---|---|---|---|
| Portada | `mockups/TlHome.dc.html` | `Light · Home.png` · `Dark · Home.png` | ShopHeader, Storefront, MachineCard, Porthole, HouseRules, NoticeBoard, Footer |
| Comprimir imagen | `mockups/TlWasher.dc.html` | `Light · Washer No.1.png` · `Dark · Washer No.1.png` | ShopHeader, Badge, WasherControls, Porthole, Dropzone, CareLabel, FileRow, NoticeBoard |
| Comprimir PDF | `mockups/TlDryer.dc.html` | `Light · Dryer No.3.png` · `Dark · Dryer No.3.png` | ShopHeader, Badge, StepIndicator, LedDisplay, Porthole, FileRow, CycleOption, Button, ProgressBar, CareLabel |
| Unir PDF | `mockups/TlFold.dc.html` | `Light · Folding table No.4.png` · `Dark · Folding table No.4.png` | ShopHeader, Badge, FoldStack, Dropzone, Button, NoticeBoard |
| Dividir PDF | `mockups/TlLine.dc.html` | `Light · Clothesline No.5.png` · `Dark · Clothesline No.5.png` | ShopHeader, Badge, SegmentedTabs, Clothesline, FormField, Button, NoticeBoard |
| Errores | `mockups/TlErrors.dc.html` | `Light · Out of order.png` · `Dark · Out of order.png` | ShopHeader, OutOfOrder, LedDisplay |
| Móvil (resultado) | `mockups/TlMobile.dc.html` | `Light · Mobile.png` · `Dark · Mobile.png` | MobileHeader, CareLabel, Button, NoticeBoard |

### Orden sugerido para construir los componentes

1. Base: tokens + fuentes + fondo de baldosa → **Button**, **Badge**, **LedDisplay**, **Porthole**.
2. Estructura: **ShopHeader**, **MobileHeader**, **Footer**, **Storefront**.
3. Portada: **MachineCard**, **HouseRules**, **NoticeBoard**.
4. Archivos: **Dropzone**, **FileRow**, **ProgressBar**, **CareLabel**.
5. Por herramienta: **WasherControls** · **StepIndicator** + **CycleOption** · **FoldStack** · **SegmentedTabs** + **Clothesline** + **FormField**.
6. Errores: **OutOfOrder**.

### Cómo leer un mockup `.dc.html`

Son archivos del lienzo de diseño: HTML con estilos en línea y huecos `{{ t.algo }}`. Cada `{{ t.nombre }}` corresponde a un token: `t.text` → `--ink`, `t.bg` → `--bg`, `t.accent` → `--accent`, `t.panel` → `--panel`, etc. El bloque `palette()` del final muestra los valores exactos de Light y Dark. Úsalos para copiar estructura, textos y medidas, y reemplaza los huecos por `var(--token)`.

## Cómo pedirle a Claude Code que construya con esta guía

Ejemplos de mensajes:

- "Construye el componente **MachineCard** en Astro siguiendo `design/components/MachineCard.md`. Compáralo con `design/components/MachineCard.html`."
- "Haz la página `/compress-pdf` igual a `design/mockups/TlDryer.dc.html` y `"design/screens/Light · Dryer No.3.png"`, usando solo variables de `tokens.css`."
- "Revisa que `/merge-pdf` se vea bien en Dark: compara con `"design/screens/Dark · Folding table No.4.png"`."

Claude Code puede **ver imágenes**: si le das la ruta de una captura, la compara con lo que construye.

## Mantenerla al día

1. Cambias tokens o componentes en el design system de Claude → actualiza `tokens.json` (y los `.md` / `.html` de componentes que cambien).
2. Regeneras `tokens.css` desde `tokens.json` (pídele a Claude Code: "regenera `design/tokens.css` desde `tokens.json`").
3. Cambias una pantalla en el lienzo → vuelve a exportar su captura a `screens/` y reemplaza su `.dc.html` en `mockups/`.
4. Commit: `docs(design): update tokens and screens`.
