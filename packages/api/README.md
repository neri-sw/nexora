# @nexora/api

Utilidades comunes de los endpoints.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `json(body, status, headers)` con `no-store`.
- `readJSONBody(request, maxBytes)`.
- `rateLimited(key, max, windowMs)`, `clientIp(request)`.
- Honeypot: campo `website`; si viene con texto se responde éxito falso y no se guarda.

## Qué garantiza

- Ningún endpoint público acepta bodies grandes ni sin límite por IP.

## Se extrae de

Titán `api/_lib.js` (json, rateLimited), `api/_blob-state.js` (readJSONBody) · Puerto Chill `src/app/api/orders/route.ts`

## Errores conocidos

- El rate limit vive en memoria por instancia: en tests, reiniciar el server entre corridas.
