/**
 * Panel escondido: la ruta del panel y su API privada solo existen bajo una ruta secreta.
 *
 * Con `ADMIN_PATH=panel-x7k2…` (variable de entorno, nunca en el repo):
 *   /panel-x7k2…              → muestra el panel (`/admin` por dentro)
 *   /panel-x7k2…/api/<algo>   → /api/<algo> (sesión, estado completo, fotos)
 *   /admin, /admin/*          → 404 igual a cualquier ruta inexistente
 *   /api/admin/*, /api/session, /api/upload directos → 404 igual a cualquier ruta inexistente
 * Sin `ADMIN_PATH` (desarrollo, pruebas) todo queda como siempre en `/admin` y `/api/*`.
 *
 * Es una función pura para poder probarla; `@nexora/auth/proxy` la conecta con Next.
 */
export interface GateOptions {
  /** Ruta real de la página del panel en `app/`. */
  panelPage?: string;
  /** Rutas de API que solo usa el panel. Directas dan 404 cuando hay ruta secreta. */
  privateApi?: string[];
  /** Valor de la ruta secreta (sin barras). Por defecto `process.env.ADMIN_PATH`. */
  secret?: string | null;
}

export type GateDecision = { action: "next" } | { action: "notFound" } | { action: "rewrite"; pathname: string };

export const DEFAULT_PRIVATE_API = ["/api/admin", "/api/session", "/api/upload"];
const SECRET_RE = /^[A-Za-z0-9_-]{12,}$/;

export function panelSecret(raw = process.env.ADMIN_PATH): string | null {
  const s = (raw || "").trim().replace(/^\/+|\/+$/g, "");
  if (!s) return null;
  // una ruta corta se adivina: se exige un valor largo y sin caracteres raros
  if (!SECRET_RE.test(s)) throw new Error("ADMIN_PATH tiene que tener al menos 12 letras, números, - o _");
  return s;
}

const under = (p: string, base: string) => p === base || p.startsWith(base + "/");

export function gate(pathname: string, o: GateOptions = {}): GateDecision {
  const page = o.panelPage ?? "/admin";
  const priv = o.privateApi ?? DEFAULT_PRIVATE_API;
  const secret = o.secret === undefined ? panelSecret() : o.secret;
  // decodificar para que /%61dmin no esquive el bloqueo
  let p = pathname;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    return { action: "notFound" };
  }
  p = p.replace(/\/{2,}/g, "/");
  const base = "/" + (secret ?? page.replace(/^\//, ""));

  if (secret) {
    if (p === base) return { action: "rewrite", pathname: page };
    if (p.startsWith(base + "/api/")) return { action: "rewrite", pathname: p.slice(base.length) };
    if (under(p, base)) return { action: "notFound" };
    if (under(p.toLowerCase(), page.toLowerCase())) return { action: "notFound" };
    if (priv.some((a) => under(p.toLowerCase(), a.toLowerCase()))) return { action: "notFound" };
    return { action: "next" };
  }
  // sin ruta secreta: el panel en /admin y su API también en /admin/api/* (así el navegador usa siempre la misma forma)
  if (p.startsWith(base + "/api/")) return { action: "rewrite", pathname: p.slice(base.length) };
  return { action: "next" };
}
