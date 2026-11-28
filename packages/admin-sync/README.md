# @nexora/admin-sync

Store del panel: cambios en cola y reconciliación con el servidor.

> Versión 0.1.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `createSyncedStore({ seed, storeKey, localKey, emptyLocal, normalize, endpoints?, refreshMs? })` → `primeStore`, `startSync`, `useStore`, `useLocal`, `setState`, `setLocal`, `pull`, `getState`, `getLocal`, `getMode`, `api`.
- Tipo `Initial<Snap>` para lo que la página trae del servidor.

## Qué garantiza

- Dos personas editando a la vez no se pisan.

## Se extrae de

Titán `assets/js/store.js` · Puerto Chill `src/lib/store.ts`, `src/components/StoreHydrator.tsx`
