# Capturas de pantalla

Capturas PNG exportadas del lienzo de diseño (página *Laundromat · Light / Dark*), una por pantalla y tema. Claude Code las abre como imágenes y las compara con lo que construye.

| Pantalla | Light | Dark | Mockup |
|---|---|---|---|
| Portada | `Light · Home.png` | `Dark · Home.png` | `../mockups/TlHome.dc.html` |
| Comprimir imagen | `Light · Washer No.1.png` | `Dark · Washer No.1.png` | `../mockups/TlWasher.dc.html` |
| Comprimir PDF | `Light · Dryer No.3.png` | `Dark · Dryer No.3.png` | `../mockups/TlDryer.dc.html` |
| Unir PDF | `Light · Folding table No.4.png` | `Dark · Folding table No.4.png` | `../mockups/TlFold.dc.html` |
| Dividir PDF | `Light · Clothesline No.5.png` | `Dark · Clothesline No.5.png` | `../mockups/TlLine.dc.html` |
| Errores | `Light · Out of order.png` | `Dark · Out of order.png` | `../mockups/TlErrors.dc.html` |
| Móvil (resultado) | `Light · Mobile.png` | `Dark · Mobile.png` | `../mockups/TlMobile.dc.html` |

Los nombres llevan espacios y el carácter `·`: al citarlos en la terminal o en un mensaje a Claude Code, ponlos entre comillas, por ejemplo `"design/screens/Light · Dryer No.3.png"`.

## Al actualizar el diseño

Si una pantalla cambia en el lienzo, vuelve a exportar sus dos capturas (Light y Dark) con el mismo nombre para reemplazarlas, y actualiza su mockup en `../mockups/`.

## Comportamiento del loading para DRYER No.3

La referencia del loading para DRYER No.3 es `design/screens/Light · Dryer No.3-html`.