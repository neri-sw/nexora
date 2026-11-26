# Gestión de proyectos

Web propia y local para tener en un solo lugar todos los proyectos en curso.

```
node server.js
```

Abrir http://localhost:3000. Desde ahí se crea un proyecto; cada uno tiene su URL (`/p/<slug>`) con tareas y una visión completa en Markdown.

Los datos quedan como archivos en `data/projects/`, versionados en el repo, así los puede leer y editar tanto la web como Claude Code. Ver `CLAUDE.md` para el formato.
