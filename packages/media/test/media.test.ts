import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@vercel/blob", () => import("../../state/test/blob-memory"));
import * as blob from "../../state/test/blob-memory";
import { createMediaHandlers } from "../src/index";

const h = createMediaHandlers({ isAdmin: (r) => r.headers.get("cookie") === "a=1", maxBytes: 100 });
const up = (body: BodyInit, type = "image/jpeg", cookie = "a=1") =>
  new Request("https://x/api/upload", { method: "POST", headers: { cookie, "content-type": type }, body });

describe("media", () => {
  beforeEach(() => blob.__reset());

  it("sube y sirve la foto", async () => {
    const r = await h.uploadPOST(up(new Uint8Array([1, 2, 3])));
    expect(r.status).toBe(201);
    const { url } = (await r.json()) as { url: string };
    expect(url).toMatch(/^\/api\/img\?p=development%2Fimg%2Ffoto-\w+\.jpg$/);
    const img = await h.imgGET(new Request("https://x" + url));
    expect(img.status).toBe(200);
    expect(img.headers.get("cache-control")).toContain("immutable");
    expect(new Uint8Array(await img.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("sin sesión 401, formato raro 415, vacío 400, grande 413", async () => {
    expect((await h.uploadPOST(up("x", "image/jpeg", ""))).status).toBe(401);
    expect((await h.uploadPOST(up("x", "image/gif"))).status).toBe(415);
    expect((await h.uploadPOST(up(new Uint8Array([])))).status).toBe(400);
    expect((await h.uploadPOST(up(new Uint8Array(200)))).status).toBe(413);
  });

  it("/api/img solo sirve rutas de fotos", async () => {
    expect((await h.imgGET(new Request("https://x/api/img?p=development/state.json"))).status).toBe(404);
    expect((await h.imgGET(new Request("https://x/api/img?p=../x"))).status).toBe(404);
  });
});
