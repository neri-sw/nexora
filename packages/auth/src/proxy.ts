/**
 * @nexora/auth/proxy: conecta `gate` con el `proxy.ts` de Next 16.
 * En la app, `src/proxy.ts`:
 *   export { proxy } from "@nexora/auth/proxy";
 *   export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
 */
import { NextResponse, type NextRequest } from "next/server";
import { gate } from "./gate";

/** Ruta que no existe: su 404 es el mismo que el de cualquier URL inventada. */
const NOT_FOUND = "/__nexora_404";
const HOP = /^(connection|keep-alive|transfer-encoding|content-encoding|content-length|x-middleware-.*)$/i;

let cached: { body: ArrayBuffer; headers: [string, string][] } | null = null;

/**
 * 404 idéntico al de una URL inventada. Un rewrite dejaría el encabezado `x-middleware-rewrite` y delataría
 * que la ruta es especial; por eso se pide el 404 real una vez y se devuelve una copia exacta.
 */
async function notFound(request: NextRequest): Promise<Response> {
  if (!cached) {
    try {
      const r = await fetch(new URL(NOT_FOUND, request.url), { headers: { "accept-encoding": "identity" }, redirect: "manual" });
      if (r.status !== 404) throw new Error(String(r.status));
      cached = { body: await r.arrayBuffer(), headers: [...r.headers].filter(([k]) => !HOP.test(k)) };
    } catch {
      return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
  }
  const headers = new Headers(cached.headers);
  headers.set("content-length", String(cached.body.byteLength));
  return new Response(cached.body.slice(0), { status: 404, headers });
}

export async function proxy(request: NextRequest) {
  const d = gate(request.nextUrl.pathname);
  if (d.action === "next") return NextResponse.next();
  if (d.action === "notFound") return notFound(request);
  const url = request.nextUrl.clone();
  url.pathname = d.pathname;
  const res = NextResponse.rewrite(url);
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}
