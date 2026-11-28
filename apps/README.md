# apps/

Un sitio Next.js por cliente. Cada app contiene solo:

- Pantallas que replican el diseño aprobado (`src/app/`, `src/components/`).
- Tema: colores y tipografías (`DESIGN.md` + variables CSS).
- `site.config.ts`: módulos activos, medios de pago y entrega, zona horaria, nombre de cookie, claves privadas del estado.
- `content.schema.ts`: textos del diseño que el dueño puede editar desde el panel.
- `src/app/api/*/route.ts`: una línea que reexporta el handler del paquete correspondiente.

Nada de lógica de negocio acá. Ver `CLAUDE.md`.

Apps previstas: `gestion` (la app de gestión de proyectos que hoy está en la raíz, después de su PR de despliegue), `puerto-chill` (Fase 1, desde `neri-sw/tienda-chill`), `titan-studios` (Fase 6, si se migra).
