/**
 * @nexora/auth: sesión del panel de administración. Contrato en ../README.md.
 *
 * La cookie guarda un HMAC de la contraseña del panel (variable de entorno). Cambiar la contraseña
 * y volver a deployar invalida todas las sesiones: es la forma de revocar el acceso.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { clientIp, createRateLimiter, json } from "@nexora/api";

export interface AuthOptions {
  /** Nombre de la cookie, propio de cada sitio (por ejemplo "pc_admin"). */
  cookieName: string;
  /** Texto fijo que entra en el HMAC, propio de cada sitio (por ejemplo "puerto-chill-admin-v1"). */
  scope: string;
  /** Duración de la sesión en segundos. Se renueva en cada GET /api/session con sesión válida. */
  maxAgeSeconds: number;
  /** Intentos fallidos permitidos por IP dentro de `failWindowMs` (por defecto 5 por minuto). */
  failMax?: number;
  failWindowMs?: number;
  /** Variable de entorno con la contraseña (por defecto ADMIN_PASSWORD). */
  passwordEnv?: string;
  /** Demora ante una contraseña incorrecta, en ms (frena fuerza bruta). */
  failDelayMs?: number;
}

export interface Auth {
  cookieName: string;
  isConfigured(): boolean;
  checkPassword(pw: unknown): boolean;
  /** Valida el valor de la cookie (para Server Components con `cookies()`). */
  isAdminToken(value: string | undefined): boolean;
  /** ¿El request trae una sesión válida? (para route handlers) */
  isAdmin(request: Request): boolean;
  sessionCookie(request: Request, on: boolean): string;
  tooManyFailures(ip: string): boolean;
  recordFailure(ip: string): void;
  failDelayMs: number;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function createAuth(o: AuthOptions): Auth {
  const env = o.passwordEnv || "ADMIN_PASSWORD";
  const fails = createRateLimiter({ max: o.failMax ?? 5, windowMs: o.failWindowMs ?? 60_000 });
  const token = () => {
    const pw = process.env[env];
    return pw ? createHmac("sha256", pw).update(o.scope).digest("hex") : null;
  };
  const isAdminToken = (value: string | undefined) => {
    const t = token();
    return Boolean(t && value) && safeEqual(value!, t!);
  };
  return {
    cookieName: o.cookieName,
    isConfigured: () => Boolean(process.env[env]),
    checkPassword(pw) {
      const real = process.env[env];
      return Boolean(real) && typeof pw === "string" && safeEqual(pw, real!);
    },
    isAdminToken,
    isAdmin(request) {
      const raw = request.headers.get("cookie") || "";
      const m = raw.split(/;\s*/).find((c) => c.startsWith(o.cookieName + "="));
      if (!m) return false;
      try {
        return isAdminToken(decodeURIComponent(m.slice(o.cookieName.length + 1)));
      } catch {
        return false;
      }
    },
    sessionCookie(request, on) {
      const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
      return on
        ? `${o.cookieName}=${token()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${o.maxAgeSeconds}${secure}`
        : `${o.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
    },
    tooManyFailures: (ip) => fails.blocked(ip),
    recordFailure: (ip) => fails.record(ip),
    failDelayMs: o.failDelayMs ?? 600,
  };
}

/**
 * Handlers de /api/session:
 *   GET    → { admin, configured } (con sesión válida renueva la cookie: sesión deslizante)
 *   POST   { password } → 200 + cookie · 401 · 429 (demasiados intentos) · 500 (sin contraseña configurada)
 *   DELETE → cierra la sesión
 */
export function createSessionHandlers(auth: Auth) {
  return {
    GET(request: Request) {
      const admin = auth.isAdmin(request);
      return json({ admin, configured: auth.isConfigured() }, 200, admin ? { "set-cookie": auth.sessionCookie(request, true) } : {});
    },
    async POST(request: Request) {
      const ip = clientIp(request);
      if (auth.tooManyFailures(ip)) return json({ error: "Demasiados intentos. Esperá un minuto y probá de nuevo." }, 429);
      let pw: unknown = "";
      try {
        pw = ((await request.json()) as { password?: unknown }).password;
      } catch {
        /* body vacío */
      }
      if (!auth.isConfigured()) return json({ error: "Falta configurar la contraseña del panel en Vercel" }, 500);
      if (!auth.checkPassword(pw)) {
        auth.recordFailure(ip);
        if (auth.failDelayMs) await new Promise((r) => setTimeout(r, auth.failDelayMs));
        return json({ error: "Contraseña incorrecta" }, 401);
      }
      return json({ admin: true }, 200, { "set-cookie": auth.sessionCookie(request, true) });
    },
    DELETE(request: Request) {
      return json({ admin: false }, 200, { "set-cookie": auth.sessionCookie(request, false) });
    },
  };
}
