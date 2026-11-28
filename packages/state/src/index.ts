/**
 * @nexora/state: estado del sitio en Vercel Blob privado. Contrato en ../README.md.
 *
 * Un JSON por entorno de Vercel (`<VERCEL_ENV>/state.json`) con número de revisión (`rev`) y
 * escritura condicional (`ifMatch`): ninguna escritura pisa a otra.
 */
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { json } from "@nexora/api";

/** production | preview | development. Cada uno con sus propios datos dentro del mismo store. */
export const ENV = process.env.VERCEL_ENV || "development";

export interface Stored<T> {
  rev: number;
  data: T | null;
  etag: string | null;
}

/** Otro request guardó entre la lectura y la escritura. */
export class ConflictError extends Error {}

export interface BlobState<T> {
  path: string;
  /** `fresh` = directo del origen, sin la caché de Blob (que demora hasta ~60 s). Usalo antes de escribir. */
  readState(fresh: boolean): Promise<Stored<T>>;
  /** Guarda `data` como la revisión siguiente a `cur`. Lanza ConflictError si otro escribió entre medio. */
  writeState(cur: Stored<T>, data: T): Promise<number>;
  /**
   * Lee fresco, aplica `fn` y guarda; ante conflicto relee y repite (hasta `tries`).
   * `fn` devuelve `{ data, result }` para guardar, o solo `{ result }` para responder sin escribir.
   */
  mutateState<R>(fn: (data: T | null) => { data?: T; result: R } | Promise<{ data?: T; result: R }>, tries?: number): Promise<R>;
}

export function createBlobState<T>({ path = `${ENV}/state.json` }: { path?: string } = {}): BlobState<T> {
  async function readState(fresh: boolean): Promise<Stored<T>> {
    // Sin compresión: con gzip la respuesta trae un ETag débil (W/"…") que no sirve para ifMatch
    // y toda escritura termina en conflicto.
    const r = await get(path, { access: "private", useCache: !fresh, headers: { "accept-encoding": "identity" } });
    if (!r || r.statusCode !== 200 || !r.stream) return { rev: 0, data: null, etag: null };
    const doc = JSON.parse(await new Response(r.stream).text()) as { rev?: number; data?: T | null };
    const etag = r.blob.etag ? String(r.blob.etag).replace(/^W\//, "") : null;
    return { rev: doc.rev || 0, data: doc.data ?? null, etag };
  }

  async function writeState(cur: Stored<T>, data: T): Promise<number> {
    const rev = cur.rev + 1;
    try {
      await put(path, JSON.stringify({ rev, data, savedAt: new Date().toISOString() }), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: Boolean(cur.etag),
        cacheControlMaxAge: 60,
        ...(cur.etag ? { ifMatch: cur.etag } : {}),
      });
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError || /exist|precondition/i.test(String((e as Error)?.message))) {
        const latest = await readState(true);
        if (latest.rev !== cur.rev) throw new ConflictError("conflict");
        console.error("[state] ifMatch rechazado sin cambios", { etag: cur.etag, latest: latest.etag });
      }
      throw e;
    }
    return rev;
  }

  async function mutateState<R>(fn: (data: T | null) => { data?: T; result: R } | Promise<{ data?: T; result: R }>, tries = 3): Promise<R> {
    for (let i = 0; i < tries; i++) {
      const cur = await readState(true);
      const out = await fn(cur.data ? (structuredClone(cur.data) as T) : null);
      if (!out.data) return out.result;
      try {
        await writeState(cur, out.data);
        return out.result;
      } catch (e) {
        if (!(e instanceof ConflictError)) throw e;
      }
    }
    throw new ConflictError("demasiados intentos");
  }

  return { path, readState, writeState, mutateState };
}

/** Quita claves privadas (pedidos, clientes…) de lo que ve cualquiera. */
export function omitKeys<T extends object, K extends keyof T>(data: T | null, keys: readonly K[]): Omit<T, K> | null {
  if (!data) return null;
  const out = { ...data };
  for (const k of keys) delete out[k];
  return out;
}

export interface StateHandlerOptions<T, P> {
  state: BlobState<T>;
  isAdmin(request: Request): boolean;
  /** Lo que puede ver cualquiera. Nunca datos personales. */
  publicView(data: T | null): P | null;
  /** Chequeo mínimo de forma antes de guardar lo que manda el panel. */
  validate(data: unknown): data is T;
  /** Tamaño máximo del PUT del panel (por defecto 3 MB). */
  maxBytes?: number;
}

/**
 * Handlers de estado:
 *   GET /api/state              → { rev, data } sanitizado. Cacheable unos segundos; `?fresh` lee del origen.
 *   GET /api/admin/state        → { rev, data } completo. 401 sin sesión.
 *   PUT /api/admin/state        { baseRev, data } → 200 { rev } · 409 { rev, data } si otro guardó antes · 401 · 400 · 413
 */
export function createStateHandlers<T, P>(o: StateHandlerOptions<T, P>) {
  const max = o.maxBytes ?? 3 * 1024 * 1024;
  const denied = () => json({ error: "Iniciá sesión en el panel" }, 401);
  return {
    async publicGET(request: Request) {
      const fresh = new URL(request.url).searchParams.has("fresh");
      const { rev, data } = await o.state.readState(fresh);
      return json(
        { rev, data: o.publicView(data) },
        200,
        fresh ? {} : { "cache-control": "public, max-age=0, s-maxage=5, stale-while-revalidate=10" },
      );
    },
    async adminGET(request: Request) {
      if (!o.isAdmin(request)) return denied();
      const { rev, data } = await o.state.readState(true);
      return json({ rev, data });
    },
    async adminPUT(request: Request) {
      if (!o.isAdmin(request)) return denied();
      const text = await request.text();
      if (text.length > max) return json({ error: "Los datos superan el tamaño permitido" }, 413);
      let body: { baseRev?: number; data?: unknown };
      try {
        body = JSON.parse(text);
      } catch {
        return json({ error: "JSON inválido" }, 400);
      }
      if (!o.validate(body?.data)) return json({ error: "Faltan datos" }, 400);
      const cur = await o.state.readState(true);
      if (Number(body.baseRev) !== cur.rev) return json({ rev: cur.rev, data: cur.data }, 409);
      try {
        return json({ rev: await o.state.writeState(cur, body.data) });
      } catch (e) {
        if (e instanceof ConflictError) {
          const latest = await o.state.readState(true);
          return json({ rev: latest.rev, data: latest.data }, 409);
        }
        console.error("[admin/state] error al guardar", e);
        return json({ error: "No se pudo guardar" }, 503);
      }
    },
  };
}

/**
 * Datos iniciales para que la página hidrate el store del navegador.
 * Sin BLOB_READ_WRITE_TOKEN (por ejemplo `next dev` sin configurar) devuelve null: modo demo local.
 */
export function createInitialLoader<T, P>(o: { state: BlobState<T>; publicView(data: T | null): P | null }) {
  return async function initialFor(scope: "public" | "admin"): Promise<{ scope: "public" | "admin"; rev: number; data: T | P | null } | null> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    try {
      const { rev, data } = await o.state.readState(scope === "admin");
      return { scope, rev, data: scope === "admin" ? data : o.publicView(data) };
    } catch (e) {
      console.error("[initial] no se pudieron leer los datos", e);
      return null;
    }
  };
}
