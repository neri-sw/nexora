# @nexora/auth

Sesión del panel de administración.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `checkPassword(pw)`, `isAdmin(request)`, `isAdminToken(value)` (Server Components), `sessionCookie(request, on)`.
- Handler `POST/GET/DELETE /api/session`.
- Límite de intentos fallidos por IP.
- Config: nombre de cookie, duración, intentos por minuto.

## Qué garantiza

- Cookie `HttpOnly; SameSite=Lax; Secure` en https.
- Cambiar `ADMIN_PASSWORD` y redeployar invalida todas las sesiones.
- Comparación en tiempo constante.

## Se extrae de

Titán `api/_lib.js`, `api/session.js` · Puerto Chill `src/lib/server/session.ts`, `src/app/api/session/route.ts`, `src/components/admin/Login.tsx`

## Errores conocidos

- Hoy la cookie es un HMAC de la contraseña (sin usuarios ni expiración por servidor). Candidato a mejora: ver `stack/BACKLOG.md`.
