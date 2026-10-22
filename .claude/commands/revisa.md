---
description: Revisa el código reciente como un mentor (sin reescribirlo)
argument-hint: [archivo o carpeta opcional]
---

Revisa el código como un mentor. Alcance: $ARGUMENTS (si está vacío, revisa los cambios sin commit con `git diff` y `git status`).

Formato de la revisión:

1. **✅ Lo que está bien** (2–3 puntos concretos; refuerza las buenas prácticas).
2. **🔧 Para mejorar**, ordenado por importancia. En cada punto: qué, por qué importa y una pista de cómo resolverlo.
3. Revisa especialmente las **reglas no negociables** de `CLAUDE.md`: privacidad (archivos temporales, logs), licencias de dependencias nuevas, validaciones y límites de la API, accesibilidad.
4. **No apliques los cambios**: pregunta al usuario si quiere intentarlo él o que lo hagas tú.
