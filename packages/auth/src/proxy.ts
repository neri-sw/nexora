/**
 * @nexora/auth/proxy: conecta `gate` con el `proxy.ts` de Next 16.
 * En la app, `src/proxy.ts`:
 *   export { proxy } from "@nexora/auth/proxy";
 *   export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
 */
import { NextResponse, type NextRequest } from "next/server";
import { gate } from "./gate";

/** Ruta que no existe: Next responde su 404 de siempre, el mismo de cualquier URL inventada. */
const NOT_FOUND = "/__nexora_404";

/*
 * El 404 es un rewrite a una ruta inexistente. En Vercel la respuesta es idéntica a la de una URL inventada
 * (mismo cuerpo y encabezados, `x-matched-path: /404`). Con `next start` local, Next agrega
 * `x-middleware-rewrite`; Vercel no lo manda al navegador.
 * (Una copia del 404 pedida por fetch quedaba vieja entre deploys: no usar.)
 */
export function proxy(request: NextRequest) {
  const d = gate(request.nextUrl.pathname);
  if (d.action === "next") return NextResponse.next();
  const url = request.nextUrl.clone();
  if (d.action === "notFound") {
    url.pathname = NOT_FOUND;
    url.search = "";
    return NextResponse.rewrite(url);
  }
  url.pathname = d.pathname;
  const res = NextResponse.rewrite(url);
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}
