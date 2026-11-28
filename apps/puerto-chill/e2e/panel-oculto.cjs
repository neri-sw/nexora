/* Panel escondido: con ADMIN_PATH, /admin y la API privada directa responden igual que una URL inventada. */
const { chromium } = require("playwright");
const B = process.env.E2E_URL || "http://localhost:3311";
const SECRET = process.env.ADMIN_PATH;
const ok = (c, m) => { if (!c) throw new Error("FALLÓ: " + m); console.log("✓ " + m); };
if (!SECRET) { console.log("(sin ADMIN_PATH: se saltea)"); process.exit(0); }
const P = "/" + SECRET;

// lo que se compara: estado, tipo, largo del cuerpo y encabezados (sin los que cambian solos)
async function sig(path, init = {}) {
  const r = await fetch(B + path, { redirect: "manual", ...init });
  const body = await r.text();
  // x-middleware-rewrite solo aparece con `next start` local: Vercel no lo manda (ver @nexora/auth/proxy)
  const skip = /^(date|etag|x-nextjs-(stale-time|prerender|postponed)|vary|set-cookie|content-length|keep-alive|connection|transfer-encoding|x-middleware-rewrite)$/;
  const headers = [...r.headers.keys()].filter((h) => !skip.test(h)).sort();
  return { status: r.status, type: r.headers.get("content-type"), headers: headers.join(","), body: require("node:crypto").createHash("sha1").update(body).digest("hex") };
}

(async () => {
  const fake = await sig("/zz-no-existe-" + Date.now());
  const fakeApi = await sig("/api/zz-no-existe");
  ok(fake.status === 404, "una URL inventada da 404");
  const same = (a, b) => { const eq = JSON.stringify(a) === JSON.stringify(b); if (!eq) console.log("   ", JSON.stringify(a), "\n    ", JSON.stringify(b)); return eq; };

  for (const p of ["/admin", "/admin?tab=pedidos", "/ADMIN", "/%61dmin", "/admin/api/session"]) {
    const s = await sig(p);
    ok(same(s, fake), `${p} responde igual que una URL inventada (${s.status})`);
  }
  for (const [p, init] of [["/api/admin/state", {}], ["/api/admin/state", { method: "PUT", body: "{}" }], ["/api/session", {}], ["/api/session", { method: "POST", body: '{"password":"x"}' }], ["/api/upload", { method: "POST", body: "x" }]]) {
    const s = await sig(p, init);
    const ref = init.method ? await sig("/api/zz-no-existe", init) : fakeApi;
    ok(same(s, ref), `${init.method || "GET"} ${p} responde igual que una API inventada (${s.status})`);
  }

  // login por la ruta secreta
  const login = await fetch(B + P + "/api/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }) });
  ok(login.status === 200, "el login funciona por la ruta secreta");
  const cookie = login.headers.get("set-cookie").split(";")[0];
  ok((await fetch(B + "/api/admin/state", { headers: { cookie } })).status === 404, "con sesión, la API directa igual da 404");
  ok((await fetch(B + "/admin", { headers: { cookie } })).status === 404, "con sesión, /admin igual da 404");
  ok((await fetch(B + P + "/api/admin/state", { headers: { cookie } })).status === 200, "con sesión, la API bajo la ruta secreta responde");
  ok((await fetch(B + P + "/otra-cosa")).status === 404, "otra ruta bajo la secreta da 404");
  ok((await fetch(B + P.slice(0, -1))).status === 404, "una ruta parecida a la secreta da 404");

  // la ruta secreta no aparece en nada público: HTML, JavaScript ni respuestas de la API
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const seen = new Set();
  page.on("response", async (r) => { if (/\.(js|css|json)(\?|$)|\/api\/state|\/$|tienda|terminos/.test(r.url())) seen.add(r.url()); });
  for (const p of ["/", "/tienda", "/terminos", "/arrepentimiento"]) await page.goto(B + p, { waitUntil: "networkidle" });
  let leaks = [];
  for (const u of seen) { const t = await (await fetch(u)).text(); if (t.includes(SECRET)) leaks.push(u); }
  ok(leaks.length === 0, `la ruta secreta no aparece en ${seen.size} archivos públicos` + (leaks.length ? ": " + leaks.join(", ") : ""));

  // el panel completo anda bajo la ruta secreta (pestañas, guardado y fotos)
  const ctx = await browser.newContext();
  const [n, v] = cookie.split("=");
  await ctx.addCookies([{ name: n, value: v, url: B }]);
  const panel = await ctx.newPage();
  const errors = [];
  const reqs = [];
  panel.on("pageerror", (e) => errors.push(e.message));
  panel.on("request", (r) => reqs.push(new URL(r.url()).pathname));
  await panel.goto(B + P, { waitUntil: "load" });
  await panel.waitForTimeout(2500);
  await panel.getByRole("button", { name: /^Pedidos/ }).first().click();
  await panel.waitForTimeout(1500);
  ok(new URL(panel.url()).pathname === P && panel.url().includes("tab=pedidos"), "las pestañas quedan bajo la ruta secreta");
  await panel.reload({ waitUntil: "load" });
  await panel.waitForTimeout(2500);
  ok(await panel.locator("text=Prueba E2E").count() > 0, "al recargar una pestaña sigue en el panel");
  ok(!reqs.some((p) => /^\/(api\/(admin|session|upload)|admin)/.test(p)), "el panel nunca pide rutas privadas directas");
  ok(errors.length === 0, "sin errores de JavaScript en el panel" + (errors.length ? ": " + errors.join(" | ") : ""));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
