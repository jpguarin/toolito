# Toolito Laundromat

**Little tools, big results.** Toolito es una lavandería de autoservicio para archivos: *"We shrink your files. On purpose."* Cada herramienta es una máquina, la privacidad son las reglas de la casa y los errores son letreros de "Out of order".

Este sistema reúne los tokens (colores en dos temas, tipografía, espaciado, radios, bordes y sombras) y los componentes base de la interfaz. Todo lo que se construya para Toolito parte de aquí.

---

## 1. Principios

1. **Una lavandería, no una app genérica.** Cada pantalla es un lugar del local: lavadoras, secadora, mesa de doblar, tendedero.
2. **Una acción principal por pantalla**, siempre con `accent` y texto `on-accent`.
3. **Honestidad sobre dónde corre cada cosa.** Solo la secadora (`hot`) usa el servidor y se nota: tiene su propio color.
4. **Contornos gruesos, sin sombras suaves.** Todo se dibuja con `line` y `border-thick` / `border-md`, como un electrodoméstico de caricatura.
5. **El tema lo pone el reloj.** Light de 7:00 a 18:59 y Dark de 19:00 a 6:59, según la hora local del visitante. **No existe interruptor de tema.**

## 2. Las máquinas

| Herramienta | Máquina | Tag LED | Vidrio / icono | Corre en |
|---|---|---|---|---|
| Comprimir imagen | Washer No.1 | `IMG` | `glass-image` / `icon-image` | Navegador |
| Convertir imagen | Washer No.2 | `DYE` | `glass-convert` / `icon-convert` | Navegador |
| Comprimir PDF | **Dryer No.3** | `DRYER` | `glass-dryer` / `icon-dryer` + `hot` | **Servidor** |
| Unir PDF | Folding table No.4 | `FOLD` | `glass-fold` / `icon-fold` | Navegador |
| Dividir PDF | Clothesline No.5 | `SORT` | `glass-sort` / `icon-sort` | Navegador |

## 3. Voz y textos

La interfaz está en **inglés**, con frases cortas y humor de lavandería que nunca tapa el significado.

| Concepto | Texto |
|---|---|
| Archivo | *load* |
| Nivel de compresión | *cycle*: **Delicate** · **Normal** · **Heavy duty** |
| Descargar | **Take it home** / **Take all home (ZIP)** |
| Empezar otra vez | **Run another load** |
| Resumen del resultado | **Care label** (*Text: Still selectable · Original: Removed from the dryer*) |
| Privacidad | **House rules** (*We never look in your basket.*) |
| Anuncios | **Notice board** |
| Errores | **Out of order** + una nota corta escrita a mano + un botón para salir del problema |

Reglas: verbos directos; números siempre con unidad (`12.4 MB → 4.6 MB`); el ahorro en porcentaje negativo (`−63%`); nunca culpar al usuario en un error.

## 4. Color

Dos temas con **los mismos nombres de token**: solo cambian los valores.

- **Light — la lavandería de día:** baldosa menta (`bg`), tinta azul marino (`ink`, `line`, `panel`), crema (`paper`), coral (`accent`) y menta brillante (`accent-2`, `led`).
- **Dark — la lavandería de noche:** azul noche (`bg`), panel casi negro (`panel`), crema (`ink`, `line`) y neones: coral (`accent`), cian (`accent-2`, `led`) y amarillo (`hot`, `heading`).

Reglas:
- Texto principal siempre `ink`; secundario `muted`. Sobre `panel`, `panel-ink`.
- Rellenos de acción con su pareja: `accent`+`on-accent`, `accent-2`+`on-accent-2`, `hot`+`on-hot`, `btn`+`on-btn`, `ok`+`on-ok`. Nunca texto blanco sobre coral.
- `hot` es exclusivo de la secadora.
- `note` y `tape` son papel: iguales en ambos temas, siempre con `on-note`.
- Todas las parejas de texto y fondo cumplen WCAG AA en los dos temas.

## 5. Tipografía

Tres familias de Google Fonts: cárgalas con
`https://fonts.googleapis.com/css2?family=Bungee&family=Work+Sans:wght@400;600;800&family=Caveat:wght@700&display=swap`.

- **Bungee** (`font-sign`): letreros, números de máquina, LED, botones principales. Solo mayúsculas cortas o palabras sueltas.
- **Work Sans** (`font-sans`): todo el texto de lectura y los formularios, en 400 / 600 / 800.
- **Caveat** (`font-hand`): **solo** en las notas de "Out of order".

## 6. Forma y espacio

- Fondo de baldosa: `bg` con líneas `grid` de 2px cada `tile` (56px).
- Radios: `radius-lg` para máquinas, `radius-pill` para botones, pasos y ojos de buey, `radius-sm` para LED y etiquetas.
- Bordes: `border-thick` (4px) en máquinas y botones principales; `border-md` (3px) en filas y tarjetas; `border-thin` (2px) en piezas pequeñas.
- Sombras: `shadow-press` para lo seleccionado, `shadow-hot` para la secadora. Los brillos (`glow-*`) solo existen de noche.
- Gutter de página `space-5`; separación entre columnas `space-6`; entre secciones `space-7`.

## 7. Elementos gráficos

- **Toldo** a rayas `awning-a` / `awning-b` (franjas de 56px) con festón en la portada; franja de 26px en las páginas internas.
- **Letrero TOOLITO / LAUNDROMAT** en `panel`, con `accent` y `sign-sub` (y `glow-sign` de noche).
- **Letreros OPEN 24/7 y SELF-SERVICE** en la cabecera, en lugar de cualquier control de tema.
- **Ojo de buey** con aro `rim` y vidrio `glass-*`; el color del vidrio identifica la máquina.
- **Iconos de trazo** (2px, puntas redondeadas) en el color `icon-*` de su máquina. Nunca emojis.
- **Tablero de corcho** (`cork`, `cork-frame`) para la publicidad, siempre fuera del camino de los botones.
- **Mesa de doblar** de madera (`wood`) en la herramienta de unir PDF.
- **Iconos:** 17 iconos de trazo en el grupo de assets *Icons* (también en `design/icons/` del repositorio); en el producto se insertan en línea con `stroke="currentColor"`.

## 8. Accesibilidad

- Objetivos táctiles de al menos 44px.
- Animaciones (tambor que gira, progreso) desactivadas con `prefers-reduced-motion`.
- Botones reales (`<button>`, `<a href>`), `aria-pressed` en opciones, `role="progressbar"` en el secado.

## 9. Componentes

| Grupo | Componente | Para qué |
|---|---|---|
| Shop | ShopHeader | Toldo, letrero y letreros OPEN 24/7 / SELF-SERVICE (escritorio) |
| Shop | MobileHeader | Cabecera de teléfono con botón de menú |
| Shop | Storefront | Héroe de la portada: toldo con festón, letrero grande y titular |
| Shop | MachineCard | Cada herramienta en la portada |
| Shop | Porthole | El ojo de buey con su vidrio e icono |
| Shop | LedDisplay | Estados y etiquetas de máquina |
| Shop | Footer | Pie con enlaces legales |
| Actions | Button | Acción principal, descarga, secundaria e icono |
| Actions | CycleOption | Elegir Delicate / Normal / Heavy duty |
| Actions | WasherControls | Formato, calidad y redimensionar en la lavadora |
| Actions | SegmentedTabs | Modos de una herramienta (Pick pages · Ranges · Every page) |
| Files | Dropzone | Soltar o elegir archivos |
| Files | FileRow | Un archivo: cargado, lavándose, listo o con error |
| Files | FoldStack | Mesa de doblar: reordenar PDFs y la pila |
| Files | Clothesline | Tendedero: elegir páginas para dividir |
| Forms | FormField | Campo de texto, radios y casillas |
| Feedback | StepIndicator | Load · Cycle · Dry · Take home |
| Feedback | ProgressBar | Progreso grande y pequeño |
| Feedback | OutOfOrder | Tarjeta de error con nota escrita a mano |
| Results | CareLabel | Resumen del resultado y etiqueta de cuidado |
| Content | Badge | Ahorro, máquina, privacidad, servidor, error |
| Content | HouseRules | La promesa de privacidad como reglas del local |
| Content | NoticeBoard | Espacios de publicidad |

## 10. Cómo se arma cada pantalla

| Pantalla | Componentes |
|---|---|
| Portada | ShopHeader (fila de navegación) · Storefront · MachineCard ×5 · HouseRules · NoticeBoard · Footer |
| Washer No.1 | ShopHeader · Badge · WasherControls · Porthole · Dropzone (compacto) · CareLabel (resumen) · FileRow · NoticeBoard |
| Dryer No.3 | ShopHeader · Badge · StepIndicator · LedDisplay · Porthole · FileRow (cargado) · CycleOption · Button · ProgressBar · CareLabel |
| Folding table No.4 | ShopHeader · Badge · FoldStack · Dropzone (compacto) · Button · NoticeBoard |
| Clothesline No.5 | ShopHeader · Badge · SegmentedTabs · Clothesline · FormField · Button · NoticeBoard |
| Errores | ShopHeader · OutOfOrder ×6 |
| Móvil | MobileHeader · CareLabel · Button · NoticeBoard (320 × 50) |

Las vistas completas de cada pantalla (Auto, Light y Dark) están en el lienzo de diseño **"Toolito — Mockups"**, página *Laundromat · Light / Dark*.
