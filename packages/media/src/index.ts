/**
 * @nexora/media: fotos subidas desde el panel al Blob privado. Contrato en ../README.md.
 *   POST /api/upload (panel; cuerpo = la imagen ya achicada en el navegador) → 201 { url }
 *   GET  /api/img?p=<entorno>/img/<archivo> → la foto, cacheada un año (cada nombre es único)
 */
import { get, put } from "@vercel/blob";
import { json } from "@nexora/api";

export const ENV = process.env.VERCEL_ENV || "development";
export const IMG_PREFIX = `${ENV}/img/`;
/** Lo único que sirve /api/img: `<entorno>/img/<archivo>`. */
export const IMG_PATH = /^[a-z]+\/img\/[\w.-]+$/;

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function createMediaHandlers(o: { isAdmin(request: Request): boolean; maxBytes?: number; prefix?: string }) {
  const max = o.maxBytes ?? 4 * 1024 * 1024;
  const mb = Math.round(max / 1024 / 1024);
  const prefix = o.prefix ?? IMG_PREFIX;
  return {
    async uploadPOST(request: Request) {
      if (!o.isAdmin(request)) return json({ error: "Iniciá sesión en el panel para subir fotos" }, 401);
      const type = (request.headers.get("content-type") || "").split(";")[0].trim();
      if (!TYPES[type]) return json({ error: "Formato no admitido (usá JPG, PNG o WebP)" }, 415);
      if (Number(request.headers.get("content-length") || 0) > max) return json({ error: `La imagen pesa más de ${mb} MB` }, 413);
      const buf = await request.arrayBuffer();
      if (!buf.byteLength) return json({ error: "Archivo vacío" }, 400);
      if (buf.byteLength > max) return json({ error: `La imagen pesa más de ${mb} MB` }, 413);
      const blob = await put(`${prefix}foto.${TYPES[type]}`, buf, { access: "private", contentType: type, addRandomSuffix: true });
      return json({ url: `/api/img?p=${encodeURIComponent(blob.pathname)}` }, 201);
    },
    async imgGET(request: Request) {
      const p = new URL(request.url).searchParams.get("p") || "";
      if (!IMG_PATH.test(p)) return new Response("Not found", { status: 404 });
      const r = await get(p, { access: "private" }).catch(() => null);
      if (!r || r.statusCode !== 200) return new Response("Not found", { status: 404 });
      return new Response(r.stream, {
        headers: {
          "content-type": r.blob.contentType || "image/jpeg",
          "cache-control": "public, max-age=31536000, immutable",
          "x-content-type-options": "nosniff",
        },
      });
    },
  };
}
