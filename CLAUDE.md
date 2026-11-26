# Gestión de proyectos

Web local para gestionar todos los proyectos en curso de Neri. La usan Neri (desde el navegador) y Claude Code (editando los archivos). Todo responde en español.

## Cómo correrla

```
node server.js     # http://localhost:3000
```

Sin dependencias. Node 18+.

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

## API local (la usa el front)

- `GET/POST /api/projects`
- `GET/PATCH /api/projects/<slug>` (name, description, status, vision)
- `POST /api/projects/<slug>/tasks` (title, createdBy)
- `PATCH/DELETE /api/projects/<slug>/tasks/<id>` (title, status, notes)

## Próximos pasos posibles

Colaboradores, costos e ingresos por proyecto.
