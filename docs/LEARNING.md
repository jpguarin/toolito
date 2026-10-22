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

---

<!-- Las entradas de cada sesión van debajo de esta línea, la más reciente arriba. -->

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
