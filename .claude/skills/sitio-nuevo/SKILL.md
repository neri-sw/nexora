---
name: sitio-nuevo
description: Crea una app de cliente nueva en apps/ desde la plantilla, con todos los módulos cableados y en preview desde el primer día.
---

# sitio-nuevo

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Hay `BRIEF.md` y todavía no existe `apps/<cliente>`.

## Pasos

1. `scripts/new-app <cliente>` (o copiar `templates/app`).
2. Completá `site.config.ts` y `content.schema.ts` desde el brief.
3. Creá `clients/<cliente>.md`.
4. Cargá el seed con los productos o datos del PDF (solo desarrollo y preview).
5. Pedile a Neri que cree el proyecto de Vercel (carpeta raíz `apps/<cliente>`, Blob privado, `ADMIN_PASSWORD`). Ver `deploy-vercel`.

## Paquetes

Todos los activos en `site.config.ts`. Leé el README de cada uno antes de configurarlo.

## Criterios de aceptación

- `npm run check` verde.
- Login del panel, pedido de prueba y fotos funcionan en preview.
