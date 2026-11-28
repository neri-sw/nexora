import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@vercel/blob", () => import("./blob-memory"));
import * as blob from "./blob-memory";
import { ConflictError, createBlobState, createInitialLoader, createStateHandlers, omitKeys } from "../src/index";

type S = { items: number[]; secret?: string };
const state = createBlobState<S>({ path: "test/state.json" });
const handlers = createStateHandlers<S, Omit<S, "secret">>({
  state,
  isAdmin: (r) => r.headers.get("cookie") === "admin=1",
  publicView: (d) => omitKeys(d, ["secret"]),
  validate: (d): d is S => Boolean(d && typeof d === "object" && Array.isArray((d as S).items)),
});
const admin = (method: string, body?: unknown) =>
  new Request("https://x/api/admin/state", { method, headers: { cookie: "admin=1" }, body: body === undefined ? undefined : JSON.stringify(body) });

describe("state", () => {
  beforeEach(() => blob.__reset());

  it("sin datos devuelve rev 0", async () => {
    expect(await state.readState(true)).toEqual({ rev: 0, data: null, etag: null });
  });

  it("escribe revisiones sucesivas", async () => {
    let cur = await state.readState(true);
    expect(await state.writeState(cur, { items: [1] })).toBe(1);
    cur = await state.readState(true);
    expect(cur.data).toEqual({ items: [1] });
    expect(await state.writeState(cur, { items: [1, 2] })).toBe(2);
  });

  it("dos escrituras sobre la misma revisión: la segunda es ConflictError", async () => {
    await state.writeState(await state.readState(true), { items: [] });
    const a = await state.readState(true);
    const b = await state.readState(true);
    await state.writeState(a, { items: [1] });
    await expect(state.writeState(b, { items: [2] })).rejects.toBeInstanceOf(ConflictError);
  });

  it("mutateState reintenta ante conflicto y no pierde cambios", async () => {
    await state.writeState(await state.readState(true), { items: [] });
    let first = true;
    const r = await state.mutateState(async (d) => {
      if (first) {
        first = false;
        // otro request escribe entre la lectura y la escritura
        await state.writeState(await state.readState(true), { items: [...d!.items, 99] });
      }
      return { data: { items: [...d!.items, 1] }, result: "ok" };
    });
    expect(r).toBe("ok");
    expect((await state.readState(true)).data).toEqual({ items: [99, 1] });
  });

  it("GET público sanitiza; GET/PUT del panel exigen sesión", async () => {
    await state.writeState(await state.readState(true), { items: [1], secret: "x" });
    const pub = await (await handlers.publicGET(new Request("https://x/api/state"))).json();
    expect(pub).toEqual({ rev: 1, data: { items: [1] } });
    expect((await handlers.adminGET(new Request("https://x"))).status).toBe(401);
    expect((await handlers.adminPUT(new Request("https://x", { method: "PUT", body: "{}" }))).status).toBe(401);
    expect(await (await handlers.adminGET(admin("GET"))).json()).toEqual({ rev: 1, data: { items: [1], secret: "x" } });
  });

  it("PUT del panel: 200 con baseRev correcto, 409 con la versión nueva si no, 400 si la forma no sirve", async () => {
    expect((await handlers.adminPUT(admin("PUT", { baseRev: 0, data: { items: [1] } }))).status).toBe(200);
    const stale = await handlers.adminPUT(admin("PUT", { baseRev: 0, data: { items: [2] } }));
    expect(stale.status).toBe(409);
    expect(await stale.json()).toEqual({ rev: 1, data: { items: [1] } });
    expect((await handlers.adminPUT(admin("PUT", { baseRev: 1, data: { nope: 1 } }))).status).toBe(400);
  });

  it("initialFor: sin token es modo local (null)", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const initialFor = createInitialLoader({ state, publicView: (d: S | null) => omitKeys(d, ["secret"]) });
    expect(await initialFor("public")).toBeNull();
    process.env.BLOB_READ_WRITE_TOKEN = "x";
    await state.writeState(await state.readState(true), { items: [3], secret: "s" });
    expect(await initialFor("public")).toEqual({ scope: "public", rev: 1, data: { items: [3] } });
    expect(await initialFor("admin")).toEqual({ scope: "admin", rev: 1, data: { items: [3], secret: "s" } });
  });
});
