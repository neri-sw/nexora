/**
 * Reemplazo en memoria de @vercel/blob para tests: get/put con ETag fuerte e ifMatch.
 * Uso: vi.mock("@vercel/blob", () => import("./blob-memory")).
 */
export class BlobPreconditionFailedError extends Error {}

const files = new Map<string, { body: string | ArrayBuffer; etag: string; contentType?: string }>();
let n = 0;

export function __reset() {
  files.clear();
}
export function __peek(path: string) {
  return files.get(path);
}

export async function get(path: string, _opts?: unknown) {
  const f = files.get(path);
  if (!f) return null;
  return {
    statusCode: 200,
    stream: new Response(f.body as BodyInit).body,
    blob: { etag: `"${f.etag}"`, contentType: f.contentType, pathname: path },
  };
}

export async function put(
  path: string,
  body: string | ArrayBuffer,
  opts: { allowOverwrite?: boolean; ifMatch?: string; addRandomSuffix?: boolean; contentType?: string } = {},
) {
  let p = path;
  if (opts.addRandomSuffix) p = path.replace(/(\.[^.]+)?$/, `-${(++n).toString(36)}$1`);
  const cur = files.get(p);
  if (cur && !opts.allowOverwrite) throw new Error("This blob already exists");
  if (opts.ifMatch && (!cur || `"${cur.etag}"` !== opts.ifMatch)) throw new BlobPreconditionFailedError("precondition failed");
  files.set(p, { body, etag: `e${++n}`, contentType: opts.contentType });
  return { pathname: p, url: `https://blob.test/${p}` };
}
