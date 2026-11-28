import { beforeEach, describe, expect, it } from "vitest";
import { createAuth, createSessionHandlers } from "../src/index";

const make = () => createAuth({ cookieName: "t_admin", scope: "test-v1", maxAgeSeconds: 3600, failDelayMs: 0 });
const post = (pw: string, ip = "9.9.9.9") =>
  new Request("https://sitio.test/api/session", { method: "POST", body: JSON.stringify({ password: pw }), headers: { "x-forwarded-for": ip } });
const cookieOf = (r: Response) => (r.headers.get("set-cookie") || "").split(";")[0];

describe("auth", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "clave-de-prueba";
  });

  it("login correcto devuelve cookie HttpOnly, Secure y con Max-Age", async () => {
    const h = createSessionHandlers(make());
    const r = await h.POST(post("clave-de-prueba"));
    expect(r.status).toBe(200);
    const sc = r.headers.get("set-cookie")!;
    expect(sc).toMatch(/^t_admin=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=3600; Secure$/);
  });

  it("la cookie da acceso y renueva la sesión en GET", async () => {
    const auth = make();
    const h = createSessionHandlers(auth);
    const c = cookieOf(await h.POST(post("clave-de-prueba")));
    const req = new Request("https://sitio.test/api/session", { headers: { cookie: c } });
    expect(auth.isAdmin(req)).toBe(true);
    const g = h.GET(req);
    expect(await g.json()).toEqual({ admin: true, configured: true });
    expect(g.headers.get("set-cookie")).toContain("t_admin=");
  });

  it("cambiar la contraseña invalida las sesiones", async () => {
    const auth = make();
    const c = cookieOf(await createSessionHandlers(auth).POST(post("clave-de-prueba")));
    process.env.ADMIN_PASSWORD = "otra";
    expect(auth.isAdmin(new Request("https://x", { headers: { cookie: c } }))).toBe(false);
  });

  it("contraseña incorrecta: 401, y al quinto intento 429", async () => {
    const h = createSessionHandlers(make());
    for (let i = 0; i < 5; i++) expect((await h.POST(post("mal", "5.5.5.5"))).status).toBe(401);
    expect((await h.POST(post("clave-de-prueba", "5.5.5.5"))).status).toBe(429);
    expect((await h.POST(post("clave-de-prueba", "6.6.6.6"))).status).toBe(200);
  });

  it("sin contraseña configurada nadie entra", async () => {
    delete process.env.ADMIN_PASSWORD;
    const auth = make();
    expect(auth.isConfigured()).toBe(false);
    expect(auth.checkPassword("")).toBe(false);
    expect(auth.isAdminToken("")).toBe(false);
    expect((await createSessionHandlers(auth).POST(post(""))).status).toBe(500);
  });

  it("cookie mal codificada no rompe", () => {
    expect(make().isAdmin(new Request("https://x", { headers: { cookie: "t_admin=%E0%A4%A" } }))).toBe(false);
  });
});
