/** Panel escondido bajo ADMIN_PATH: /admin y la API privada directa dan 404. Ver @nexora/auth (gate). */
export { proxy } from "@nexora/auth/proxy";

// Next exige que `config` sea un literal en este archivo
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
