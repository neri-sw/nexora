/* Ayudas para los scripts de paridad (apps/<app>/paridad/*.cjs). */
const REF = process.env.REF_URL;
const NEW = process.env.NEW_URL;
if (!REF || !NEW) throw new Error("Faltan REF_URL y NEW_URL (correr con scripts/paridad/run.sh)");

/** Cliente HTTP con su propia cookie, como un navegador. */
function client(base, ip) {
  let cookie = "";
  async function req(method, path, { body, headers = {}, raw } = {}) {
    const h = { ...headers };
    if (cookie) h.cookie = cookie;
    if (ip) h["x-forwarded-for"] = ip;
    let payload = body;
    if (body !== undefined && !raw && typeof body !== "string") { payload = JSON.stringify(body); h["content-type"] ??= "application/json"; }
    const r = await fetch(base + path, { method, headers: h, body: payload, redirect: "manual" });
    const sc = r.headers.get("set-cookie");
    if (sc) { const kv = sc.split(";")[0]; cookie = kv.endsWith("=") ? "" : kv; }
    const ct = r.headers.get("content-type") || "";
    const buf = Buffer.from(await r.arrayBuffer());
    let out;
    if (ct.includes("json")) { try { out = JSON.parse(buf.toString()); } catch { out = buf.toString(); } }
    else if (ct.startsWith("text/")) out = buf.toString().length;
    else out = { bytes: buf.length, sha: require("node:crypto").createHash("sha1").update(buf).digest("hex") };
    return { status: r.status, ct: ct.split(";")[0], cc: r.headers.get("cache-control"), setCookie: sc, location: r.headers.get("location"), body: out };
  }
  return { req, setCookie: (c) => (cookie = c), get cookie() { return cookie; } };
}

/** Reemplaza fechas y valores que cambian solos (hora del servidor, sufijos aleatorios) para poder comparar. */
function normalize(v, key) {
  if (Array.isArray(v)) return v.map((x) => normalize(x, key));
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, normalize(v[k], k)]));
  if (typeof v === "string") {
    if (/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(v)) return "<fecha>";
    return v.replace(/-[0-9a-z]{6,12}(\.[a-z]+)$/, "-<sufijo>$1");
  }
  if (typeof v === "number" && /^(date|createdAt|savedAt|at|ts)$/.test(key || "")) return "<fecha>";
  return v;
}

/** Compara dos listas de registros paso por paso e imprime las diferencias. `accepted`: nombre → motivo de una diferencia buscada. Devuelve la cantidad de diferencias no aceptadas. */
function compare(ref, neu, accepted = {}) {
  let bad = 0;
  for (const [name, a] of Object.entries(ref)) {
    const b = neu[name];
    const A = JSON.stringify(normalize(a)), B = JSON.stringify(normalize(b));
    if (A === B) console.log("✓ " + name);
    else if (accepted[name]) console.log("≈ " + name + " (diferencia aceptada: " + accepted[name] + ")");
    else { bad++; console.log("✗ " + name + "\n   original: " + A.slice(0, 600) + "\n   nexora:   " + B.slice(0, 600)); }
  }
  return bad;
}

module.exports = { REF, NEW, client, normalize, compare };
