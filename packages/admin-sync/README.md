# @nexora/admin-sync

Store del panel: cambios en cola y reconciliación con el servidor.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Cada cambio es una función que queda en cola y se guarda con `PUT /api/admin/state` y `baseRev`.
- Ante 409 trae los datos nuevos y re-aplica la cola encima.
- Refresco automático cada 45 s sin pisar cambios sin guardar.
- Modo local (`localStorage`) cuando no hay servidor.

## Qué garantiza

- Dos personas editando a la vez no se pisan.

## Se extrae de

Titán `assets/js/store.js` · Puerto Chill `src/lib/store.ts`, `src/components/StoreHydrator.tsx`
