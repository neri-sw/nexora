# Decisiones de arquitectura

Una entrada por decisión: contexto, decisión, consecuencias. No se borran; si cambian, se agrega una nueva que la reemplaza.

## D1 · 2026-11-28 · Monorepo privado

- Contexto: dos sitios con la misma lógica copiada y adaptada a mano.
- Decisión: un monorepo privado `neri-sw/nexora` con `apps/` y `packages/`. Todas las apps importan los mismos paquetes.
- Consecuencias: un cambio de paquete afecta a todas las apps; por eso cada PR corre tests de paquetes y build de todas las apps.

## D1b · 2026-11-28 · nexora reúne todo

- `neri-sw/nexora` ya tenía la app de gestión de proyectos. Neri eligió sumar el monorepo de sitios al mismo repo: la app de gestión pasa a ser una app más (`apps/gestion`).
- La mudanza de la app de gestión espera a que se mergee su PR de despliegue, para no romperlo.

## D2 · 2026-11-28 · Las skills apuntan a contratos

- Decisión: cada paquete documenta su contrato en `README.md`. Las skills dicen qué paquete usar y cuándo, y remiten al README; no describen la implementación.
- Consecuencias: un cambio interno de un paquete (por ejemplo un login más robusto) obliga a actualizar su README, no las skills.

## D3 · 2026-11-28 · Estado en un JSON por entorno en Vercel Blob privado (propuesta, pendiente de aprobación)

- Heredado de Titán y Puerto Chill: `<VERCEL_ENV>/state.json` con `rev` y escritura condicional `ifMatch`.
- Se revisa en Fase 5 detrás de una interfaz `StateStore`.

## D4 · Stack único Next.js 16 (propuesta, pendiente de aprobación)
