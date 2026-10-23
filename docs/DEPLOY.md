# Despliegue de la API en Cloud Run

Cómo está publicada la API y por qué tiene esta configuración. Si cambias algo en Google Cloud, actualiza este archivo.

## Datos del servicio

| Dato | Valor |
|---|---|
| Proyecto | `toolito-api` |
| Región | `us-central1` |
| Servicio | `toolito-api` |
| URL | https://toolito-api-352538375764.us-central1.run.app |
| Presupuesto | "$5 Monthly Budget Alert": 5 USD/mes, alertas al 50/90/100/150 %, sin descontar créditos (*Savings* desmarcado) |

> La alerta de presupuesto **avisa, no corta el gasto**. El freno real es `--max-instances`.

## Desplegar una nueva versión del código

Desde la raíz del repositorio:

```bash
gcloud run deploy toolito-api --source api --region us-central1
```

Cloud Build construye la imagen con `api/Dockerfile` y crea una nueva revisión. La configuración de abajo se conserva entre despliegues.

## Configuración y por qué

```bash
gcloud run services update toolito-api --region us-central1 \
  --memory 2Gi --cpu 1 --concurrency 2 --timeout 90 --max-instances 2
```

| Ajuste | Valor | Por qué |
|---|---|---|
| `--memory` | `2Gi` | Una compresión del PDF de prueba (13 MB, foto de 12 MP) usa ~241 MB en el proceso hijo + 62 MB de la app. En Cloud Run `/tmp` vive en RAM, así que los archivos temporales también cuentan. Margen para 2 trabajos de ~500 MB. |
| `--cpu` | `1` | Suficiente para empezar; comprimir ese PDF tarda ~0,3 s. |
| `--concurrency` | `2` | Comprimir usa mucha CPU; con 1 CPU, más peticiones a la vez solo serían más lentas y gastarían memoria. |
| `--timeout` | `90` s | La API corta a los 60 s (`504`); los 30 s extra son para subir 30 MB con conexiones lentas. |
| `--max-instances` | `2` | Freno de costo: como mucho 4 compresiones simultáneas en total. |
| `--allow-unauthenticated` | (en el primer despliegue) | API pública; la protegen el rate limiting y los límites de tamaño, páginas y tiempo. |

## Variables de entorno

```bash
gcloud run services update toolito-api --region us-central1 \
  --set-env-vars "ALLOWED_ORIGINS=http://localhost:4321,MAX_FILE_MB=30,MAX_PAGES=500,PROCESSING_TIMEOUT_S=60,RATE_LIMIT=20/minute"
```

- `--set-env-vars` reemplaza la lista completa; `--update-env-vars` solo cambia las que nombres.
- `PORT` lo define Cloud Run; no se configura.
- `ALLOWED_ORIGINS` solo permite el sitio local mientras no haya dominio (etapa 7). Con varios dominios, la coma choca con el separador de gcloud; usa otro separador: `"^##^ALLOWED_ORIGINS=https://toolito.jpgstudio.net,http://localhost:4321##MAX_FILE_MB=30##..."`.

## Permisos (IAM)

- La cuenta de servicio por defecto `352538375764-compute@developer.gserviceaccount.com` es la que usa Cloud Build para construir la imagen. Tiene `roles/editor`.
- El primer despliegue falló con `PERMISSION_DENIED` aunque ya tenía ese rol: los permisos de un proyecto recién creado tardan unos minutos en propagarse. Al reintentar funcionó.
- Pendiente: cambiar `roles/editor` (demasiado amplio) por solo `roles/run.builder` (mínimo privilegio).

## Comprobar el servicio

```bash
gcloud run services describe toolito-api --region us-central1
curl https://toolito-api-352538375764.us-central1.run.app/health
```
