/* Paridad de lo que ve la gente: texto y capturas de cada pantalla, y los recorridos de compra y del panel. */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const sharp = require("sharp");
const { REF, NEW, client, compare, normalize } = require("../../../scripts/paridad/lib.cjs");
const PW = process.env.ADMIN_PASSWORD;
const OUT = process.env.PARIDAD_OUT || path.join(__dirname, "../paridad-out");
const VIEWPORTS = { celu: { width: 390, height: 844 }, compu: { width: 1366, height: 860 } };
const PAGES = ["/", "/tienda", "/terminos", "/arrepentimiento", "/admin", "/no-existe"];
const TABS = ["resumen", "productos", "pedidos", "ventas", "contenido"];
// textos que cambian con la hora (fechas y horas en el panel)
const clean = (t) => t.replace(/\d{1,2}\/\d{1,2}(\/\d{2,4})?,? ?(\d{1,2}:\d\d)?/g, "<fecha>").replace(/\d{1,2}:\d\d( ?h| hs)?/g, "<hora>").replace(/hace \d+ \w+/g, "hace <n>");

async function shot(page, file) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return page.screenshot({ path: file, fullPage: true, animations: "disabled", caret: "hide" });
}

async function scenario(base, tag) {
  const rec = {}, shots = {};
  const errors = [];
  const browser = await chromium.launch();
  const watch = (page) => {
    page.on("pageerror", (e) => errors.push(new URL(page.url()).pathname + new URL(page.url()).search + " · " + e.message.slice(0, 60)));
    page.on("console", (m) => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errors.push(new URL(page.url()).pathname + " · console " + m.text().slice(0, 80)); });
  };
  const view = async (ctx, url, key) => {
    const page = await ctx.newPage(); watch(page);
    const res = await page.goto(base + url, { waitUntil: "load" });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);
    rec[key + " · estado"] = res.status();
    rec[key + " · título"] = await page.title();
    rec[key + " · texto"] = clean(await page.locator("body").innerText());
    rec[key + " · enlaces"] = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    rec[key + " · meta"] = await page.$$eval("head meta[name], head meta[property], head link[rel~=icon]", (ms) => ms.map((m) => (m.getAttribute("name") || m.getAttribute("property") || m.getAttribute("rel")) + "=" + (m.getAttribute("content") || m.getAttribute("href"))).sort());
    const file = path.join(OUT, `${tag}-${key.replace(/[^\w]+/g, "_")}.png`);
    await shot(page, file); shots[key] = file;
    await page.close();
  };

  // pantallas públicas y login, en celu y compu
  for (const [vn, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: vp, locale: "es-AR", timezoneId: "America/Buenos_Aires" });
    for (const p of PAGES) await view(ctx, p, `${vn} ${p}`);
    await ctx.close();
  }

  // panel con sesión: cada pestaña
  const api = client(base, "10.6.6.6");
  await api.req("POST", "/api/session", { body: { password: PW } });
  const [cn, cv] = api.cookie.split("=");
  for (const [vn, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: vp, locale: "es-AR", timezoneId: "America/Buenos_Aires" });
    await ctx.addCookies([{ name: cn, value: cv, url: base }]);
    for (const t of TABS) await view(ctx, `/admin?tab=${t}`, `${vn} panel ${t}`);
    await ctx.close();
  }

  // compra completa desde la interfaz
  const ctx = await browser.newContext({ viewport: VIEWPORTS.celu, locale: "es-AR" });
  const shop = await ctx.newPage(); watch(shop);
  await shop.goto(base + "/", { waitUntil: "load" });
  await shop.waitForTimeout(1500);
  await shop.locator('button:has-text("Agregar al carrito")').first().click();
  await shop.waitForTimeout(600);
  await shop.locator('button:has([aria-label$="productos"])').first().click();
  await shop.waitForTimeout(600);
  rec["carrito · texto"] = clean(await shop.locator('[role="dialog"]').last().innerText());
  await shop.locator('button[aria-label^="Sumar uno de"]').first().click();
  await shop.locator('button:has-text("Continuar compra")').click();
  await shop.waitForTimeout(600);
  await shop.locator('button:has-text("Confirmar pedido")').click(); // vacío: errores de validación
  await shop.waitForTimeout(600);
  rec["checkout vacío · texto"] = clean(await shop.locator('[role="dialog"]').last().innerText());
  await shop.getByLabel("Nombre y apellido").fill("Cliente UI");
  await shop.getByLabel("Teléfono / WhatsApp").fill("11 6666 7777");
  await shop.getByLabel("Correo electrónico (opcional)").fill("ui@test.com");
  const envio = shop.locator('input[name="delivery"]').nth(1);
  if (await envio.count()) await envio.check();
  await shop.waitForTimeout(300);
  if (await shop.getByLabel("Dirección").count()) { await shop.getByLabel("Dirección").fill("Calle UI 123"); await shop.getByLabel("Localidad").fill("Morón"); }
  rec["checkout completo · texto"] = clean(await shop.locator('[role="dialog"]').last().innerText());
  shots["checkout"] = path.join(OUT, `${tag}-checkout.png`); await shop.screenshot({ path: shots["checkout"] });
  await shop.locator('button:has-text("Confirmar pedido")').click();
  await shop.waitForSelector("text=quedó registrado", { timeout: 10000 }).catch(() => {});
  rec["compra confirmada · texto"] = clean(await shop.locator('[role="dialog"]').last().innerText());
  rec["localStorage después de comprar"] = await shop.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));
  await ctx.close();

  // panel: cancelar el pedido devuelve el stock, y el refresco automático trae pedidos nuevos
  const actx = await browser.newContext({ viewport: VIEWPORTS.compu, locale: "es-AR" });
  await actx.addCookies([{ name: cn, value: cv, url: base }]);
  const panel = await actx.newPage(); watch(panel);
  await panel.goto(base + "/admin?tab=pedidos", { waitUntil: "load" });
  await panel.waitForTimeout(1500);
  const before = (await api.req("GET", "/api/admin/state")).body;
  const last = before.data.orders[before.data.orders.length - 1] ?? before.data.orders[0];
  rec["pedido de la UI guardado"] = before.data.orders.filter((o) => o.customer?.name === "Cliente UI" || o.name === "Cliente UI");
  await panel.locator(`text=Cliente UI`).first().click().catch(() => {});
  await panel.waitForTimeout(600);
  const sel = panel.locator("select").filter({ has: panel.locator('option[value="cancelado"]') }).first();
  await sel.selectOption("cancelado");
  await panel.waitForTimeout(3500);
  const after = (await api.req("GET", "/api/admin/state")).body;
  rec["cancelar desde el panel · stock"] = after.data.products.map((p) => [p.id, p.stock]);
  rec["cancelar desde el panel · estados"] = after.data.orders.map((o) => [o.id, o.status]);
  await sel.selectOption("pendiente");
  await panel.waitForTimeout(3500);
  rec["descancelar · stock"] = (await api.req("GET", "/api/admin/state")).body.data.products.map((p) => [p.id, p.stock]);
  // pedido que entra con el panel abierto
  const prod = after.data.products.find((p) => p.visible && p.stock > 0);
  const o = await client(base, "10.5.5.5").req("POST", "/api/orders", { body: { items: [{ productId: prod.id, qty: 1 }], customer: { name: "Llega Sola", phone: "11 2222 3333", address: "Av 1" }, delivery: "envio", payment: "transferencia", website: "" } });
  rec["pedido con panel abierto"] = o.status;
  const t0 = Date.now();
  await panel.waitForSelector("text=Llega Sola", { timeout: 60000 }).catch(() => {});
  rec["refresco automático trae el pedido (≤ 50 s)"] = (await panel.locator("text=Llega Sola").count()) > 0 && Date.now() - t0 < 50000;
  rec["panel con pedido nuevo · texto"] = clean(await panel.locator("main").innerText().catch(() => panel.locator("body").innerText()));
  await actx.close();

  rec["errores de consola"] = errors;
  await browser.close();
  return { rec, shots };
}

async function pixelDiff(a, b) {
  const [A, B] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer({ resolveWithObject: true })]);
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) return `tamaño distinto ${A.info.width}x${A.info.height} vs ${B.info.width}x${B.info.height}`;
  let diff = 0;
  for (let i = 0; i < A.data.length; i += A.info.channels) if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 24) diff++;
  return diff;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const a = await scenario(REF, "original");
  const b = await scenario(NEW, "nexora");
  fs.writeFileSync(path.join(OUT, "ui.json"), JSON.stringify({ original: a.rec, nexora: b.rec }, null, 1));
  let bad = compare(a.rec, b.rec);
  for (const k of Object.keys(a.shots)) {
    const d = await pixelDiff(a.shots[k], b.shots[k]);
    // Tolerancia: el panel muestra fechas y horas (≤ 0,2 % de los píxeles); en el resto solo el suavizado de
    // bordes que varía entre corridas (≤ 0,05 %). Un cambio de diseño real mueve mucho más que eso.
    const total = (await sharp(a.shots[k]).metadata()); const px = total.width * total.height;
    const okd = typeof d === "number" && d / px <= (/panel|checkout/.test(k) ? 0.002 : 0.0005);
    if (okd) console.log(`✓ captura ${k}${d ? ` (${d} px de suavizado o fecha/hora)` : ""}`);
    else { bad++; console.log(`✗ captura ${k}: ${typeof d === "number" ? d + " px distintos" : d}`); }
  }
  console.log(bad ? `${bad} diferencias` : "sin diferencias");
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
