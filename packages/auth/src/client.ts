"use client";
/** @nexora/auth/client: login del panel desde el navegador y rutas del panel. */

/**
 * Ruta del panel tal como la ve el navegador: `/admin` o la ruta secreta (`ADMIN_PATH`).
 * Se lee de la URL en el momento de usarla, así la ruta secreta nunca queda escrita en el JavaScript público.
 * Llamarla solo desde el panel y dentro de eventos o efectos (no al renderizar).
 */
export function panelBase(): string {
  if (typeof location === "undefined") return "/admin";
  const seg = location.pathname.split("/")[1];
  return "/" + (seg || "admin");
}

/** URL de una API privada vista desde el panel: `panelApi("/api/session")` → `/<panel>/api/session`. */
export function panelApi(path: string): string {
  return panelBase() + path;
}

export async function login(password: string, endpoint?: string): Promise<void> {
  const res = await fetch(endpoint ?? panelApi("/api/session"), {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status !== 200) throw new Error(data.error || "No se pudo iniciar sesión");
}

/** Renueva la cookie de sesión (sesión deslizante). Llamarla al abrir el panel. */
export function keepSession(endpoint?: string): void {
  fetch(endpoint ?? panelApi("/api/session"), { credentials: "same-origin", cache: "no-store" }).catch(() => {});
}
