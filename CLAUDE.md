# Gestión de proyectos

Web local para gestionar todos los proyectos en curso de Neri. La usan Neri (desde el navegador) y Claude Code (editando los archivos). Todo responde en español.

## Cómo correrla

```
node server.js     # http://localhost:3000
```

Sin dependencias para correrla local. Node 18+.

## Versión online (Vercel)

La app está desplegada en Vercel desde el repo `neri-sw/nexora`. Ahí:

- Los datos viven en un store privado de **Vercel Blob** (no en `data/`), con la misma estructura: `projects/<slug>/project.json` y `projects/<slug>/vision.md`. `storage.js` elige Blob cuando existe `BLOB_READ_WRITE_TOKEN`; si no, usa los archivos locales.
- La entrada es `api/index.js` (reusa `server.js`); `vercel.json` sirve `public/` como estático y reescribe `/api/*` a la función.
- El acceso pide contraseña: variable `APP_PASSWORD` en Vercel. Sin esa variable (uso local) no hay login.
- **La fuente de verdad es la versión online.** `data/` del repo queda como copia local/semilla. Para editar datos online desde Claude Code, usar la API con `Authorization: Bearer <APP_PASSWORD>` (por ejemplo `curl -H "Authorization: Bearer $APP_PASSWORD" https://<dominio>/api/projects`).

## Dónde viven los datos

Cada proyecto es una carpeta en `data/projects/<slug>/`:

- `project.json`: metadatos y tareas.
- `vision.md`: la visión completa del proyecto, en Markdown libre.

Formato de `project.json`:

```json
{
  "name": "Nombre visible",
  "description": "Una línea",
  "status": "activo | pausado | terminado",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "tasks": [
    {
      "id": "t1",
      "title": "Texto de la tarea",
      "status": "todo | done",
      "createdBy": "neri | claude",
      "createdAt": "ISO-8601",
      "doneAt": "ISO-8601 (solo si status es done)",
      "notes": "opcional"
    }
  ]
}
```

## Reglas para Claude Code

- El `slug` es el nombre de la carpeta: minúsculas, números y guiones. La URL del proyecto es `/p/<slug>`.
- Al crear tareas desde Claude Code, usar `"createdBy": "claude"` y un `id` nuevo (`t` + el siguiente número más alto del proyecto).
- No borrar tareas hechas: marcarlas `done` con `doneAt`.
- Actualizar `updatedAt` al modificar un proyecto.
- Mantener el JSON con 2 espacios de indentación.
- Cada pedido nuevo de Neri se resuelve primero a mano desde Claude Code. Si se repite, evaluar convertirlo en una feature del front (`public/app.js`) y su endpoint en `server.js`.

## API (la usa el front)

- `GET/POST/DELETE /api/session` (estado del login, entrar con `{ password }`, salir)
- `GET/POST /api/projects`
- `GET/PATCH /api/projects/<slug>` (name, description, status, vision)
- `POST /api/projects/<slug>/tasks` (title, createdBy)
- `PATCH/DELETE /api/projects/<slug>/tasks/<id>` (title, status, notes)

## Próximos pasos posibles

Colaboradores, costos e ingresos por proyecto.
