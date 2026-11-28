/* Paridad de la API: el mismo recorrido contra el original y contra nexora, respuesta por respuesta. */
const { chromium } = require("playwright");
const { REF, NEW, client, compare } = require("../../../scripts/paridad/lib.cjs");
const PW = process.env.ADMIN_PASSWORD;
/** Diferencias buscadas a propósito, con el motivo. Todo lo demás tiene que dar igual. */
const ACEPTADAS = {
  "pedido gigante": "nexora corta con 413 los pedidos de más de 20 KB; el original los aceptaba recortando cada campo a 200 caracteres. Un pedido real (20 líneas como máximo) pesa menos de 3 KB.",
};
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array(200).fill(7)]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Array(200).fill(3)]);

async function scenario(base) {
  const rec = {};
  const ipN = (() => { let i = 0; return () => `10.0.0.${++i}`; })();
  const anon = () => client(base, ipN());
  const step = async (name, fn) => { try { rec[name] = await fn(); } catch (e) { rec[name] = { threw: String(e) }; } };
  const order = (extra = {}) => ({ items: [{ productId: "combo-jarra-hielera", qty: 1 }], customer: { name: "Ana Pérez", phone: "11 5555 5555" }, delivery: "retiro", payment: "transferencia", website: "", ...extra });

  // 1. tienda recién creada (Blob vacío)
  await step("vacío: GET /api/state", () => anon().req("GET", "/api/state"));
  await step("vacío: GET /api/admin/state sin sesión", () => anon().req("GET", "/api/admin/state"));
  await step("vacío: GET /api/session", () => anon().req("GET", "/api/session"));
  await step("vacío: POST /api/orders", () => anon().req("POST", "/api/orders", { body: order() }));
  await step("PUT /api/state público", () => anon().req("PUT", "/api/state", { body: { data: {} } }));
  await step("POST /api/state", () => anon().req("POST", "/api/state", { body: {} }));
  await step("GET /api/orders", () => anon().req("GET", "/api/orders"));

  // 2. login
  const brute = client(base, "10.9.9.9");
  for (let i = 1; i <= 6; i++) await step(`login fallido ${i}`, () => brute.req("POST", "/api/session", { body: { password: "mal" + i } }));
  await step("login correcto desde IP bloqueada", () => brute.req("POST", "/api/session", { body: { password: PW } }));
  await step("login sin password", () => anon().req("POST", "/api/session", { body: {} }));
  await step("login JSON inválido", () => anon().req("POST", "/api/session", { body: "{no", headers: { "content-type": "application/json" } }));
  await step("login password no string", () => anon().req("POST", "/api/session", { body: { password: 123 } }));
  const admin = client(base, "10.8.8.8");
  await step("login correcto", () => admin.req("POST", "/api/session", { body: { password: PW } }));
  await step("GET /api/session con sesión", () => admin.req("GET", "/api/session"));
  await step("GET /api/admin/state vacío con sesión", () => admin.req("GET", "/api/admin/state"));
  const fake = client(base, ipN()); fake.setCookie("pc_admin=abc123");
  await step("cookie falsa", () => fake.req("GET", "/api/admin/state"));

  // 3. el panel crea los datos iniciales (como en la vida real: primera visita del dueño)
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const [name, value] = admin.cookie.split("=");
  await ctx.addCookies([{ name, value, url: base }]);
  const page = await ctx.newPage();
  await page.goto(base + "/admin");
  for (let i = 0; i < 30; i++) { const s = await admin.req("GET", "/api/admin/state"); if (s.body.rev >= 1) break; await page.waitForTimeout(500); }
  await browser.close();
  await step("estado inicial (panel)", () => admin.req("GET", "/api/admin/state"));
  await step("estado inicial público", () => anon().req("GET", "/api/state?fresh=1"));

  // 4. validaciones de pedidos
  const bad = {
    "sin nombre": order({ customer: { name: "  ", phone: "11 5555 5555" } }),
    "teléfono corto": order({ customer: { name: "Ana", phone: "123-45" } }),
    "sin customer": order({ customer: undefined }),
    "entrega inválida": order({ delivery: "dron" }),
    "pago inválido": order({ payment: "bitcoin" }),
    "sin líneas": order({ items: [] }),
    "21 líneas": order({ items: Array.from({ length: 21 }, () => ({ productId: "combo-jarra-hielera", qty: 1 })) }),
    "qty 0": order({ items: [{ productId: "combo-jarra-hielera", qty: 0 }] }),
    "qty 21": order({ items: [{ productId: "combo-jarra-hielera", qty: 21 }] }),
    "qty decimal": order({ items: [{ productId: "combo-jarra-hielera", qty: 1.5 }] }),
    "qty string": order({ items: [{ productId: "combo-jarra-hielera", qty: "2" }] }),
    "items no array": order({ items: "x" }),
    "producto inexistente": order({ items: [{ productId: "nope", qty: 1 }] }),
    "envío sin dirección": order({ delivery: "envio" }),
    "sin stock (stock 0)": order({ items: [{ productId: "billetera-ecocuero", qty: 1 }] }),
    "más que el stock": order({ items: [{ productId: "combo-jarra-hielera", qty: 1 }, { productId: "combo-jarra-hielera", qty: 20 }] }),
    "body array": [],
    "body null": null,
  };
  for (const [k, b] of Object.entries(bad)) await step("pedido inválido: " + k, () => anon().req("POST", "/api/orders", { body: b }));
  await step("pedido JSON roto", () => anon().req("POST", "/api/orders", { body: "{x", headers: { "content-type": "application/json" } }));
  await step("honeypot", async () => { const r = await anon().req("POST", "/api/orders", { body: order({ website: "spam.com" }) }); if (r.body?.order) r.body.order.id = typeof r.body.order.id; return r; });

  // 5. pedidos válidos
  const good = {
    "retiro + transferencia (descuento)": order(),
    "retiro + efectivo, 2 líneas": order({ payment: "efectivo", items: [{ productId: "bolso-urbano-negro", qty: 2 }, { productId: "set-matero", qty: 1 }] }),
    "envío bajo el mínimo + mercadopago 3 cuotas": order({ delivery: "envio", payment: "mercadopago", installments: 3, customer: { name: "Bo", phone: "(011) 4444-4444", address: "Calle 1", city: "CABA", email: "b@b.com" } }),
    "envío sobre el mínimo (gratis)": order({ delivery: "envio", payment: "mercadopago", installments: 6, items: [{ productId: "cartera-negra-tachas", qty: 2 }], customer: { name: "Ce", phone: "1144444444", address: "Calle 2" } }),
    "transferencia con cuotas (se ignoran)": order({ installments: 3 }),
    "precio adulterado": order({ items: [{ productId: "combo-jarra-hielera", qty: 1, price: 1 }], total: 1 }),
    "campos de más": order({ status: "entregado", id: 999, customer: { name: "D", phone: "11 5555 5555", extra: "x" } }),
  };
  for (const [k, b] of Object.entries(good)) await step("pedido: " + k, () => anon().req("POST", "/api/orders", { body: b }));
  await step("estado después de los pedidos", () => admin.req("GET", "/api/admin/state"));

  // 6. límite: 8 pedidos cada 10 minutos por IP
  const spam = client(base, "10.7.7.7");
  for (let i = 1; i <= 9; i++) await step(`pedido seguido ${i}`, () => spam.req("POST", "/api/orders", { body: order({ items: [{ productId: "combo-cocina-4", qty: 1 }] }) }));
  await step("honeypot desde IP limitada", async () => { const r = await spam.req("POST", "/api/orders", { body: order({ website: "x" }) }); if (r.body?.order) r.body.order.id = typeof r.body.order.id; return r; });

  // 7. guardado del panel
  let st = (await admin.req("GET", "/api/admin/state")).body;
  await step("PUT sin sesión", () => anon().req("PUT", "/api/admin/state", { body: { baseRev: st.rev, data: st.data } }));
  await step("PUT sin baseRev", () => admin.req("PUT", "/api/admin/state", { body: { data: st.data } }));
  await step("PUT sin data", () => admin.req("PUT", "/api/admin/state", { body: { baseRev: st.rev } }));
  await step("PUT data inválida", () => admin.req("PUT", "/api/admin/state", { body: { baseRev: st.rev, data: { products: "x" } } }));
  await step("PUT JSON roto", () => admin.req("PUT", "/api/admin/state", { body: "{", headers: { "content-type": "application/json" } }));
  await step("PUT revisión vieja", () => admin.req("PUT", "/api/admin/state", { body: { baseRev: st.rev - 1, data: st.data } }));
  await step("PUT gigante", () => admin.req("PUT", "/api/admin/state", { body: { baseRev: st.rev, data: { ...st.data, junk: "x".repeat(5_000_000) } } }));
  const hidden = structuredClone(st.data);
  hidden.products.find((p) => p.id === "combo-jarra-hielera").visible = false;
  hidden.settings.payments.efectivo = false;
  hidden.settings.pickupEnabled = false;
  await step("PUT válido (ocultar producto, sin efectivo, sin retiro)", () => admin.req("PUT", "/api/admin/state", { body: { baseRev: st.rev, data: hidden } }));
  await step("pedido de producto oculto", () => anon().req("POST", "/api/orders", { body: order({ delivery: "envio", customer: { name: "E", phone: "11 5555 5555", address: "X" } }) }));
  const other = st.data.products.find((p) => p.visible && p.stock > 0 && p.id !== "combo-jarra-hielera").id;
  await step("pedido con pago deshabilitado", () => anon().req("POST", "/api/orders", { body: order({ payment: "efectivo", delivery: "envio", items: [{ productId: other, qty: 1 }], customer: { name: "E", phone: "11 5555 5555", address: "X" } }) }));
  await step("pedido con retiro deshabilitado", () => anon().req("POST", "/api/orders", { body: order({ items: [{ productId: other, qty: 1 }] }) }));
  await step("pedido envío ok con settings nuevos", () => anon().req("POST", "/api/orders", { body: order({ delivery: "envio", items: [{ productId: other, qty: 1 }], customer: { name: "E", phone: "11 5555 5555", address: "X" } }) }));
  await step("público después del PUT", () => anon().req("GET", "/api/state?fresh=1"));

  // 8. fotos
  await step("upload sin sesión", () => anon().req("POST", "/api/upload", { body: jpeg, raw: true, headers: { "content-type": "image/jpeg" } }));
  await step("upload tipo no permitido", () => admin.req("POST", "/api/upload", { body: Buffer.from("GIF89a....."), raw: true, headers: { "content-type": "image/gif" } }));
  await step("upload vacío", () => admin.req("POST", "/api/upload", { body: Buffer.alloc(0), raw: true, headers: { "content-type": "image/jpeg" } }));
  await step("upload > 4 MB", () => admin.req("POST", "/api/upload", { body: Buffer.alloc(4 * 1024 * 1024 + 10, 1), raw: true, headers: { "content-type": "image/jpeg" } }));
  await step("upload bytes que no son la imagen declarada", () => admin.req("POST", "/api/upload", { body: Buffer.from("hola mundo, no soy una foto"), raw: true, headers: { "content-type": "image/png" } }));
  let urls = [];
  for (const [t, buf] of [["image/jpeg", jpeg], ["image/png", png], ["image/webp", Buffer.concat([Buffer.from("RIFF0000WEBP"), Buffer.alloc(100, 5)])]]) {
    await step("upload " + t, async () => { const r = await admin.req("POST", "/api/upload", { body: buf, raw: true, headers: { "content-type": t } }); urls.push(r.body?.url); return r; });
  }
  for (const u of urls) await step("GET foto subida " + urls.indexOf(u), () => anon().req("GET", u ? u.replace(/^https?:\/\/[^/]+/, "") : "/api/img"));
  await step("GET /api/img sin p", () => anon().req("GET", "/api/img"));
  await step("GET /api/img inexistente", () => anon().req("GET", "/api/img?p=" + encodeURIComponent("production/uploads/nope.jpg")));
  await step("GET /api/img fuera de la carpeta", () => anon().req("GET", "/api/img?p=" + encodeURIComponent("production/state.json")));
  await step("GET /api/img path traversal", () => anon().req("GET", "/api/img?p=" + encodeURIComponent("uploads/../state.json")));

  // 9. cerrar sesión
  await step("DELETE /api/session", () => admin.req("DELETE", "/api/session"));
  await step("admin después de cerrar", () => admin.req("GET", "/api/admin/state"));

  // 10. páginas
  for (const p of ["/", "/tienda", "/admin", "/terminos", "/arrepentimiento", "/no-existe", "/robots.txt", "/icon.png", "/favicon.ico", "/opengraph-image.jpg"]) await step("página " + p, async () => { const r = await anon().req("GET", p); delete r.body; return r; });

  // 11. estado final completo
  const again = client(base, "10.8.8.9");
  await again.req("POST", "/api/session", { body: { password: PW } });
  await step("estado final", () => again.req("GET", "/api/admin/state"));
  // al final, para no correr los números de pedido si difiere
  await step("pedido gigante", () => anon().req("POST", "/api/orders", { body: order({ customer: { name: "A".repeat(60000), phone: "11 5555 5555" } }) }));
  return rec;
}

(async () => {
  const fs = require("node:fs");
  const a = await scenario(REF);
  const b = await scenario(NEW);
  if (process.env.PARIDAD_OUT) fs.writeFileSync(process.env.PARIDAD_OUT + "/api.json", JSON.stringify({ original: a, nexora: b }, null, 1));
  const bad = compare(a, b, ACEPTADAS);
  console.log(`${Object.keys(a).length - bad}/${Object.keys(a).length} respuestas iguales`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
