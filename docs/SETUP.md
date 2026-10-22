# Preparación del entorno

Guía de la **etapa 0**. Instala todo y verifica con los comandos de la última columna. Si alguno falla, pégale el error a Claude Code y lo resolvemos.

## Herramientas

| Herramienta | Para qué | Dónde | Verificar |
|---|---|---|---|
| **Git** | Control de versiones | git-scm.com | `git --version` |
| **Cuenta de GitHub** | Guardar el código y publicar en Cloudflare | github.com | — |
| **Python 3.12+** | La API | python.org | `python --version` (o `python3 --version`) |
| **Node.js LTS** | Astro y el frontend | nodejs.org | `node --version` y `npm --version` |
| **Docker Desktop** | Contenedores (etapa 2) | docker.com | `docker --version` |
| **Google Cloud CLI** | Desplegar en Cloud Run (etapa 3) | cloud.google.com/sdk | `gcloud --version` |
| **VS Code** | Editor | code.visualstudio.com | — |
| **Claude Code** | Tu mentor y copiloto | — | `claude --version` |

> Docker y Google Cloud CLI pueden esperar hasta las etapas 2 y 3.

### Extensiones de VS Code recomendadas

- Python (Microsoft)
- Ruff
- Astro
- Tailwind CSS IntelliSense
- Docker

## Configurar Git (una sola vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
git config --global init.defaultBranch main
```

## Crear el repositorio

1. En GitHub, crea un repositorio vacío llamado `toolito` (sin README; ya tenemos uno).
2. En tu computador, dentro de la carpeta con estos documentos:

```bash
git init
git add .
git commit -m "docs: add project documentation"
git remote add origin https://github.com/TU-USUARIO/toolito.git
git push -u origin main
```

**Qué hace cada comando:**
- `git init` → convierte la carpeta en un repositorio.
- `git add .` → prepara todos los archivos para el próximo commit.
- `git commit -m "..."` → guarda una "foto" del proyecto con un mensaje.
- `git remote add origin ...` → le dice a Git dónde está tu repositorio en GitHub.
- `git push -u origin main` → sube los commits a GitHub.

## Abrir Claude Code

```bash
cd toolito
claude
```

Primer mensaje sugerido: **`/siguiente`**

## Comandos personalizados

| Comando | Qué hace |
|---|---|
| `/siguiente` | Revisa `PLAN.md` y arranca el próximo paso, explicándolo |
| `/explica <tema>` | Explica un concepto o archivo con analogías y ejemplos del proyecto |
| `/revisa` | Revisa tu código como un mentor: qué está bien, qué mejorar y por qué |
| `/cierre` | Cierra la sesión: actualiza `PLAN.md`, `docs/LEARNING.md` y propone commit |

Y puedes decir **"modo rápido"** o **"modo detallado"** en cualquier momento.
