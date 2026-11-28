"use client";
/** @nexora/auth/client: login del panel desde el navegador. */

export async function login(password: string, endpoint = "/api/session"): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status !== 200) throw new Error(data.error || "No se pudo iniciar sesión");
}
