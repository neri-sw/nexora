/* Reemplazo de @vercel/blob en archivos locales, solo para pruebas de punta a punta (scripts/e2e/run.sh). */
const fs = require("node:fs");
const path = require("node:path");
const DIR = process.env.BLOB_MOCK_DIR || path.join(require("node:os").tmpdir(), "nexora-blob");
fs.mkdirSync(DIR, { recursive: true });
class BlobPreconditionFailedError extends Error {}
const file = (p) => path.join(DIR, encodeURIComponent(p));
let n = Date.now();
async function get(p) {
  const f = file(p);
  if (!fs.existsSync(f)) return null;
  const meta = JSON.parse(fs.readFileSync(f + ".meta", "utf8"));
  return { statusCode: 200, stream: new Response(fs.readFileSync(f)).body, blob: { etag: `"${meta.etag}"`, contentType: meta.contentType, pathname: p } };
}
async function put(p, body, o = {}) {
  if (o.addRandomSuffix) p = p.replace(/(\.[^.]+)?$/, `-${(++n).toString(36)}$1`);
  const f = file(p);
  const exists = fs.existsSync(f);
  if (exists && !o.allowOverwrite) throw new Error("This blob already exists");
  if (o.ifMatch) {
    const cur = exists ? JSON.parse(fs.readFileSync(f + ".meta", "utf8")).etag : null;
    if (`"${cur}"` !== o.ifMatch) throw new BlobPreconditionFailedError("precondition failed");
  }
  const buf = typeof body === "string" ? Buffer.from(body) : Buffer.from(body instanceof ArrayBuffer ? body : await new Response(body).arrayBuffer());
  fs.writeFileSync(f, buf);
  fs.writeFileSync(f + ".meta", JSON.stringify({ etag: "e" + ++n, contentType: o.contentType }));
  return { pathname: p, url: "https://blob.test/" + p };
}
module.exports = { get, put, BlobPreconditionFailedError };
