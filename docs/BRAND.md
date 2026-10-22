# Marca de Toolito

> Resumen de marca. La guía visual completa para construir (tokens, componentes, mockups) está en [`design/`](../design/README.md); el brand book detallado, en [`design/BRAND-BOOK.md`](../design/BRAND-BOOK.md).

## Nombre

**Toolito** = *tool* + el diminutivo español "-ito". Cariñoso, divertido y bilingüe; no se limita a un tipo de archivo, así que crece con el proyecto.

Pendiente: verificar dominio (`toolito.com`, `.app`, `.io`, `.tools`) y marcas registradas (USPTO, OMPI).

## Concepto visual: "Toolito Laundromat"

Toolito es una **lavandería de autoservicio para archivos**: *"We shrink your files. On purpose."*

| Herramienta | Máquina | Dónde corre |
|---|---|---|
| Comprimir imagen | Lavadora No.1 | Navegador |
| Convertir imagen | Lavadora No.2 ("Dye") | Navegador |
| Comprimir PDF | **Secadora No.3** (la única que corre en nuestro servidor) | Servidor |
| Unir PDF | Mesa de doblar No.4 | Navegador |
| Dividir PDF | Tendedero No.5 | Navegador |

Vocabulario de la interfaz (en inglés):

- *Load* (archivo), *cycle* (nivel de compresión: Delicate · Normal · Heavy duty).
- *Take it home* (descargar), *Run another load* (empezar de nuevo).
- *Care label* (resumen del resultado), *House rules* (privacidad), *Notice board* (anuncios).
- *Out of order* (errores, con una nota escrita a mano y una salida clara).

## Lemas

- Principal: **"Little tools, big results."**
- Concepto: *"We shrink your files. On purpose."*
- Privacidad: *"We never look in your basket."*

## Personalidad

- **Amigable y con humor**, nunca técnica de más: el público es general.
- **Simple:** un botón principal por pantalla.
- **Honesta:** decir claramente dónde se procesa cada archivo.

## Temas: Light (día) y Dark (noche)

El tema cambia **solo, según la hora local** del visitante (oscuro de 7 p.m. a 7 a.m.). No hay interruptor: la cabecera muestra los letreros **OPEN 24/7** y **SELF-SERVICE**, y en móvil el botón de menú. Todos los detalles técnicos y la tabla completa de tokens están en [`THEMES.md`](THEMES.md).

### Light — la lavandería de día

| Rol | Hex |
|---|---|
| Baldosa (fondo) | `#BFE6DA` |
| Tinta (texto, bordes, cabecera) | `#12233D` |
| Crema (paneles) | `#FFF4EA` |
| Coral (acción principal, toldo, secadora) | `#FF4F5E` |
| Menta (selección, LED) | `#5CF2C2` |
| Rojo aviso (títulos) | `#C81D3B` |

### Dark — la lavandería de noche (neón)

| Rol | Hex |
|---|---|
| Azul noche (fondo) | `#0F1630` |
| Panel casi negro | `#070B1C` |
| Crema (texto, bordes) | `#F4F1EA` |
| Neón coral (acción principal, letrero) | `#FF5E6C` |
| Neón cian (selección, LED) | `#3DE8F5` |
| Neón amarillo (secadora, avisos) | `#FFE45E` |

Todas las combinaciones de texto y fondo cumplen WCAG AA (verificado).

## Tipografía

- **Bungee** (Google Fonts): letreros, números de máquina, LED y botones grandes.
- **Work Sans** 400 / 600 / 800: textos y formularios.
- **Caveat** 700: solo para las notas escritas a mano de "Out of order".

## Elementos gráficos

- Toldo a rayas con festón (portada) y franja de toldo (páginas internas).
- Baldosa con juntas como fondo.
- Ojo de buey con aro cromado para cada máquina; el color del vidrio identifica la herramienta.
- Pantalla LED para estados (`READY`, `LOADING 42%`, `DRYING 0:12`, `DONE`; ver `docs/DRYER-FLOW.md`).
- Tablero de corcho para los anuncios.
- Iconos de trazo (stroke), nunca emojis.
