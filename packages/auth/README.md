# @nexora/auth

Sesión del panel de administración.

> Versión 0.2.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `createAuth({ cookieName, scope, maxAgeSeconds, failMax?, failWindowMs?, passwordEnv?, failDelayMs? })` → `isConfigured`, `checkPassword`, `isAdminToken` (Server Components), `isAdmin` (route handlers), `sessionCookie`, `tooManyFailures`, `recordFailure`, `cookieName`.
- `createSessionHandlers(auth)` → `GET`, `POST`, `DELETE` de `/api/session` (GET renueva la cookie: sesión deslizante).
- `@nexora/auth/client`: `login(password)`, `keepSession()`, `panelBase()` (ruta del panel según la URL del navegador) y `panelApi(path)` (API privada bajo esa ruta). `@nexora/media/client` y `@nexora/admin-sync` ya los usan por defecto.
- `@nexora/auth/proxy`: `proxy` para `src/proxy.ts` de la app (panel escondido, ver abajo).
- `@nexora/auth/gate`: `gate(pathname)` y `panelSecret()`, la regla pura que usa el proxy.

## Panel escondido (`ADMIN_PATH`)

Con la variable `ADMIN_PATH` (al menos 12 letras, números, `-` o `_`; se carga en Vercel, nunca en el repo):

- El panel se abre en `/<ADMIN_PATH>` y su API privada vive en `/<ADMIN_PATH>/api/*`.
- `/admin`, `/api/admin/*`, `/api/session` y `/api/upload` directos responden **exactamente** el 404 de una URL inventada (mismo cuerpo y encabezados), con o sin sesión. Así no se puede saber probando que hay un panel.
- La ruta secreta no queda en ningún JavaScript ni HTML público: el panel la lee de la URL del navegador.
- Sin `ADMIN_PATH` (desarrollo, pruebas, paridad) todo queda en `/admin` como siempre.
- Para cambiarla: nueva `ADMIN_PATH` en Vercel y redeploy. La sesión no se pierde.

En la app, `src/proxy.ts`:

```ts
export { proxy } from "@nexora/auth/proxy";
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] }; // Next exige el literal acá
```


## Qué garantiza

- Cookie `HttpOnly; SameSite=Lax; Secure` en https.
- Cambiar `ADMIN_PASSWORD` y redeployar invalida todas las sesiones.
- Comparación en tiempo constante.

## Se extrae de

Titán `api/_lib.js`, `api/session.js` · Puerto Chill `src/lib/server/session.ts`, `src/app/api/session/route.ts`, `src/components/admin/Login.tsx`

## Errores conocidos

- Hoy la cookie es un HMAC de la contraseña (sin usuarios ni expiración por servidor). Candidato a mejora: ver `stack/BACKLOG.md`.
