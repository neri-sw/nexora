---
name: panel-negocio
description: Arma el panel de negocio de una app desde los módulos activos y el esquema de contenido, sin escribir pantallas a mano por cliente.
---

# panel-negocio

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Siempre que la app tenga datos o textos editables.

## Paquetes

`packages/admin-ui`, `packages/admin-sync`, `packages/auth`. Leé sus README.

## Pasos

1. Activá las pantallas de los módulos en uso (Productos, Pedidos, Turnos, Ajustes).
2. "Textos del sitio" sale de `content.schema.ts`.
3. Si el cliente necesita una pantalla que no existe, primero evaluá si otro cliente la usaría: si sí, va a `packages/admin-ui`; si no, a la app, y anotalo en `stack/BACKLOG.md`.

## Criterios de aceptación

- El dueño puede cambiar todo lo que el brief marcó como editable y lo ve en el sitio sin deploy.
- "Restablecer demo" solo aparece fuera de producción.
