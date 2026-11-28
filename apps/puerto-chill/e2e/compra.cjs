const { chromium } = require("playwright");
const B = process.env.E2E_URL || "http://localhost:3311";
// el panel vive en la ruta secreta (ADMIN_PATH) y su API privada bajo ella; sin ADMIN_PATH, en /admin
const P = "/" + (process.env.ADMIN_PATH || "admin");
const ok = (c, m) => { if (!c) throw new Error("FALLÓ: " + m); console.log("✓ " + m); };
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // 1. panel: login
  await page.goto(B + P);
  const pw = page.locator('input[type="password"]');
  ok(await pw.count() === 1, "el panel sin sesión muestra el login");
  await pw.fill("mal");
  await pw.press("Enter");
  await page.waitForTimeout(1200);
  ok(await page.locator("text=Contraseña incorrecta").count() > 0, "contraseña incorrecta muestra el error");
  await pw.fill("clave-e2e");
  await pw.press("Enter");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2500);
  ok(await page.locator('input[type="password"]').count() === 0, "con la clave correcta entra al panel");

  // 2. el panel guardó los datos de ejemplo
  let st = await (await fetch(B + "/api/state?fresh=1")).json();
  ok(st.rev >= 1 && st.data && st.data.products.length > 0, `el panel guardó los datos iniciales (rev ${st.rev})`);
  ok(!("orders" in st.data), "la API pública no trae pedidos");
  const p = st.data.products.find((x) => x.visible && x.stock > 1);

  // 3. tienda: se ven productos
  const shop = await browser.newPage();
  await shop.goto(B + "/");
  ok(await shop.locator(`text=${p.name}`).first().isVisible(), "la tienda muestra los productos guardados");

  // 4. pedido con precio adulterado: el servidor usa el suyo
  const body = { items: [{ productId: p.id, qty: 1, price: 1 }], customer: { name: "Prueba E2E", phone: "11 5555 5555", email: "e2e@test.com" }, delivery: "retiro", payment: "transferencia", website: "" };
  const r = await shop.evaluate(async (b) => { const r = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }); return { s: r.status, j: await r.json() }; }, body);
  ok(r.s === 201 && r.j.order.subtotal === p.price, `pedido registrado con el precio del servidor (${r.j.order.subtotal})`);
  st = await (await fetch(B + "/api/state?fresh=1")).json();
  ok(st.data.products.find((x) => x.id === p.id).stock === p.stock - 1, "el stock se descontó");

  // 5. el pedido aparece en el panel
  await page.goto(B + P + "?tab=pedidos");
  await page.waitForTimeout(2000);
  ok(await page.locator("text=Prueba E2E").count() > 0, "el pedido aparece en el panel");

  // 6. cambio desde el panel con la sesión: precio nuevo visible en la API pública
  const adminState = await page.evaluate(async () => (await fetch(location.pathname + "/api/admin/state")).json());
  ok(adminState.data.orders.length === 1, "la API del panel trae el pedido");
  adminState.data.products[0].price = 12345;
  const put = await page.evaluate(async (s) => (await fetch(location.pathname + "/api/admin/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ baseRev: s.rev, data: s.data }) })).status, adminState);
  ok(put === 200, "el panel guarda con baseRev");
  const stale = await page.evaluate(async (s) => (await fetch(location.pathname + "/api/admin/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ baseRev: s.rev, data: s.data }) })).status, adminState);
  ok(stale === 409, "un guardado con revisión vieja da 409");
  st = await (await fetch(B + "/api/state?fresh=1")).json();
  ok(st.data.products[0].price === 12345, "el sitio ve el cambio sin deploy");

  // 7. fotos
  const up = await page.evaluate(async () => { const r = await fetch(location.pathname + "/api/upload", { method: "POST", headers: { "content-type": "image/jpeg" }, body: new Uint8Array([255, 216, 255, 1, 2]) }); return { s: r.status, j: await r.json() }; });
  ok(up.s === 201, "sube una foto con sesión");
  const img = await fetch(B + up.j.url);
  ok(img.status === 200, "la foto se sirve por /api/img");
  ok((await fetch(B + P + "/api/upload", { method: "POST", headers: { "content-type": "image/jpeg" }, body: "x" })).status === 401, "sin sesión no se suben fotos");

  // 8. honeypot
  const bot = await (await fetch(B + "/api/orders", { method: "POST", body: JSON.stringify({ ...body, website: "spam" }) })).status;
  st = await (await fetch(B + P + "/api/admin/state", { headers: { cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ") } })).json();
  ok(bot === 201 && st.data.orders.length === 1, "el honeypot responde 201 y no guarda");

  ok(errors.length === 0, "sin errores de JavaScript en las páginas" + (errors.length ? ": " + errors.join(" | ") : ""));
  await shop.screenshot({ path: "./e2e-out/tienda.png" });
  await page.screenshot({ path: "./e2e-out/panel.png" });
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
