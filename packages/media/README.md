# @nexora/media

Fotos subidas desde el panel.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Cliente: `shrink(file, maxPx, quality)` y `uploadImage(file)`.
- `POST /api/upload` (panel; JPG, PNG, WebP; ≤ 4 MB) → 201 `{ url }`.
- `GET /api/img?p=` sirve desde el Blob privado.

## Qué garantiza

- Solo el panel sube. Las rutas servidas se validan contra `<entorno>/img/`.

## Se extrae de

Titán `api/upload.js`, `api/img.js` · Puerto Chill `src/app/api/upload/route.ts`, `src/app/api/img/route.ts`, `src/lib/admin-client.ts`

## Errores conocidos

- Achicar en el navegador antes de subir: las funciones de Vercel tienen límite de tamaño de body.
