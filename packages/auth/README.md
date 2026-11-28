# @nexora/auth

Sesión del panel de administración.

> Versión 0.1.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `createAuth({ cookieName, scope, maxAgeSeconds, failMax?, failWindowMs?, passwordEnv?, failDelayMs? })` → `isConfigured`, `checkPassword`, `isAdminToken` (Server Components), `isAdmin` (route handlers), `sessionCookie`, `tooManyFailures`, `recordFailure`, `cookieName`.
- `createSessionHandlers(auth)` → `GET`, `POST`, `DELETE` de `/api/session` (GET renueva la cookie: sesión deslizante).
- `@nexora/auth/client`: `login(password)`.

## Qué garantiza

- Cookie `HttpOnly; SameSite=Lax; Secure` en https.
- Cambiar `ADMIN_PASSWORD` y redeployar invalida todas las sesiones.
- Comparación en tiempo constante.

## Se extrae de

Titán `api/_lib.js`, `api/session.js` · Puerto Chill `src/lib/server/session.ts`, `src/app/api/session/route.ts`, `src/components/admin/Login.tsx`

## Errores conocidos

- Hoy la cookie es un HMAC de la contraseña (sin usuarios ni expiración por servidor). Candidato a mejora: ver `stack/BACKLOG.md`.
