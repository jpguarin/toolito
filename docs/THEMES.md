# Temas: modo claro y oscuro automáticos

Toolito tiene dos temas: **Light** (la lavandería de día) y **Dark** (la lavandería de noche, con letreros de neón). El tema **se elige siempre de forma automática según la hora local del visitante**. No hay interruptor: el usuario no puede cambiarlo, igual que en una lavandería real las luces las controla el local.

Referencia visual: página **"Laundromat · Light / Dark"** del lienzo de diseño (fila Auto, y las filas Light y Dark forzadas solo para revisar el diseño).

---

## 1. La regla

| Hora local del dispositivo | Tema en modo Auto |
|---|---|
| 07:00 – 18:59 | **Light** |
| 19:00 – 06:59 | **Dark** |

- La hora es la del **dispositivo del usuario** (`new Date().getHours()`), no la del servidor. Así cada visitante ve el tema de *su* día o *su* noche, esté donde esté.
- Los límites (7 y 19) son constantes en un solo lugar del código (`DAY_START = 7`, `NIGHT_START = 19`) para poder ajustarlos.

## 2. Sin interruptor de tema

- **Ninguna página** tiene control para cambiar el tema (ni en escritorio ni en móvil). La hora es la única fuente.
- No se guarda ninguna preferencia de tema (nada en `localStorage` ni cookies).
- En la cabecera se mantienen los letreros **OPEN 24/7** y **SELF-SERVICE**; en móvil, el botón de **menú**.
- La única excepción es el parámetro de pruebas `?theme=` (sección 8), que no se guarda y no se enlaza desde la interfaz.

## 3. Cambio en vivo

Si alguien deja la pestaña abierta a las 18:58, a las 19:00 la tienda "apaga las luces":

- Reevaluar la hora **cada 60 s** y cuando la pestaña vuelve a estar visible (`visibilitychange`).
- Opcional y más preciso: programar un `setTimeout` hasta el próximo límite (07:00 o 19:00).
- El cambio usa una transición suave de colores (`transition: background-color .4s, color .4s`), desactivada con `prefers-reduced-motion`.

## 4. Sin parpadeo al cargar

Para que la página no aparezca un instante en claro y luego salte a oscuro, el tema se decide **antes de pintar**, con un script pequeño en línea dentro del `<head>` del layout de Astro:

```html
<script is:inline>
  (function () {
    var DAY_START = 7, NIGHT_START = 19;
    var h = new Date().getHours();
    var theme = (h >= NIGHT_START || h < DAY_START) ? 'dark' : 'light';
    // Test-only override (never saved): ?theme=light | ?theme=dark
    var forced = new URLSearchParams(location.search).get('theme');
    if (forced === 'light' || forced === 'dark') theme = forced;
    document.documentElement.dataset.theme = theme;
  })();
</script>
```

`is:inline` le dice a Astro que no procese ni difiera ese script.

## 5. Implementación con variables CSS

Todos los componentes usan **tokens** (variables CSS), nunca colores sueltos. Solo cambian los valores:

```css
:root[data-theme="light"] { --bg: #BFE6DA; --ink: #12233D; /* … */ }
:root[data-theme="dark"]  { --bg: #0F1630; --ink: #F4F1EA; /* … */ }
```

### Tokens

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--bg` | `#BFE6DA` | `#0F1630` | Fondo (baldosa) |
| `--grid` | `#A5D8C8` | `#1A2448` | Juntas de la baldosa |
| `--ink` | `#12233D` | `#F4F1EA` | Texto principal |
| `--muted` | `#33445E` | `#C9CEE0` | Texto secundario |
| `--line` | `#12233D` | `#F4F1EA` | Bordes de máquinas y tarjetas |
| `--paper` | `#FFF4EA` | `#1A2347` | Paneles crema / tarjetas |
| `--surface` | `#F2F6F7` | `#1A2347` | Cuerpo de las máquinas |
| `--card` | `#FFFFFF` | `#141C3B` | Listas y formularios |
| `--panel` | `#12233D` | `#070B1C` | Cabecera y panel de control |
| `--panel-ink` | `#FFF4EA` | `#F4F1EA` | Texto sobre el panel |
| `--led-bg` / `--led` | `#08121F` / `#5CF2C2` | `#000000` / `#3DE8F5` | Pantallas LED |
| `--accent` / `--on-accent` | `#FF4F5E` / `#12233D` | `#FF5E6C` / `#0F1630` | Acción principal (Start, Fold, Split) |
| `--accent-2` / `--on-accent-2` | `#5CF2C2` / `#12233D` | `#3DE8F5` / `#0F1630` | Selección (ciclo elegido, página marcada) |
| `--hot` / `--on-hot` | `#FF4F5E` / `#12233D` | `#FFE45E` / `#0F1630` | La secadora (único proceso en servidor) |
| `--heading` | `#C81D3B` | `#FFE45E` | Títulos de aviso ("House rules") |
| `--rim` | `#C5D0D6` | `#8C96B8` | Aro cromado del ojo de buey |
| `--btn` / `--on-btn` | `#12233D` / `#FFF4EA` | `#FFE45E` / `#0F1630` | Botón de descarga |
| `--glow` | `none` | `0 0 10px …` | Brillo de neón (solo oscuro) |

Ojos de buey por máquina (vidrio / icono):

| Máquina | Light | Dark |
|---|---|---|
| No.1 Imagen | `#6FD3E0` / tinta | `#12304A` / `#3DE8F5` |
| No.2 Convertir | `#FF9AA4` / tinta | `#3E1A34` / `#FF5E6C` |
| No.3 Secadora | `#FFD166` / tinta | `#3D3714` / `#FFE45E` |
| No.4 Unir | `#A99BFF` / tinta | `#2A2356` / `#B79CFF` |
| No.5 Dividir | `#7DE3B2` / tinta | `#163D33` / `#5CF2A0` |

## 6. Detalles que no hay que olvidar

- **PWA:** actualizar `<meta name="theme-color">` al cambiar de tema (`#12233D` claro, `#070B1C` oscuro), para que la barra del navegador acompañe.
- **Contraste:** todas las combinaciones texto/fondo de la tabla cumplen WCAG AA. Si se agrega un color, verificarlo antes.
- **Neón con moderación:** los brillos (`text-shadow`, `box-shadow`) solo existen en oscuro y solo en letreros, LED y la acción principal.
- **Movimiento:** el tambor que gira y las transiciones se desactivan con `prefers-reduced-motion: reduce`.
- **Imágenes del usuario:** nunca se les aplica filtro ni se oscurecen; solo cambia la interfaz alrededor.

## 7. Cómo probarlo

- Forzar un tema sin esperar a la noche: `?theme=dark` o `?theme=light` en la URL (solo para pruebas; no se guarda ni aparece en la interfaz).
- Cambiar la hora del sistema operativo y recargar.
- Test unitario de la función `resolveTheme(hour)` con las horas límite: 6, 7, 18 y 19.

## 8. Posibles mejoras (no en el MVP)

- Usar la hora real de amanecer y atardecer según la ubicación aproximada.
