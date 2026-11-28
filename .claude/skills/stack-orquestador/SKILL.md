---
name: stack-orquestador
description: Punto de entrada para cualquier trabajo en nexora: diagnostica en qué fase está el sitio, lee el backlog y decide qué skills usar y en qué orden.
---

# stack-orquestador

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Siempre primero, en cualquier sesión que toque nexora.

## Pasos

1. Leé `stack/BACKLOG.md` y `stack/LEARNINGS.md` (las últimas 5 entradas). Si algo pendiente toca lo de hoy, proponelo antes de arrancar.
2. Identificá el cliente y leé `clients/<cliente>.md`. Si no existe, es un sitio nuevo.
3. Diagnosticá la fase:
   - **Intake**: hay un PDF y no hay `BRIEF.md` → `pdf-a-brief`.
   - **Iteración 1**: hay brief y no hay app → `sitio-nuevo`, `replicar-diseno`, `panel-negocio`, módulos (`comercio-pedidos`, `turnos`, `fotos-media`, `whatsapp`), `qa-e2e`.
   - **Iteración 2**: hay preview y correcciones del cliente → `replicar-diseno`, datos reales, `prototipo-a-produccion`, `deploy-vercel`.
   - **Iteración 3**: solo ajustes finos y salida.
   - **Mantenimiento**: el sitio está en producción → la skill del módulo que se toca.
4. Si el pedido cambia algo general (por ejemplo "un login más robusto"), el trabajo va en `packages/`, no en la app: usá `backend-estado` o la skill del módulo.
5. Al terminar, siempre `mejorar-stack`.

## Criterios de aceptación

- Al empezar dijiste en qué fase está el sitio y qué skills vas a usar.
- Al terminar corriste `mejorar-stack`.
