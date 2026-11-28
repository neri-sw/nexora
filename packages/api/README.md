# @nexora/api

Utilidades comunes de los endpoints.

> Versión 0.1.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `json(body, status?, headers?)`, `clientIp(request)`, `readJSONBody(request, maxBytes?)`.
- `createRateLimiter({ max, windowMs })` → `hit`, `blocked`, `record`, `count`, `reset`.
- `isBot(body)`: honeypot del campo `website`.

## Qué garantiza

- Ningún endpoint público acepta bodies grandes ni sin límite por IP.

## Se extrae de

Titán `api/_lib.js` (json, rateLimited), `api/_blob-state.js` (readJSONBody) · Puerto Chill `src/app/api/orders/route.ts`

## Errores conocidos

- El rate limit vive en memoria por instancia: en tests, reiniciar el server entre corridas.
