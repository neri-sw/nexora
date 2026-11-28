import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSyncedStore } from "../src/index";

type S = { version: number; items: string[]; orders: string[] };
const seed: S = { version: 1, items: ["seed"], orders: [] };

// servidor falso de /api/admin/state con revisión
let server: { rev: number; data: S | null };
let puts: number;
function fakeFetch() {
  return vi.fn(async (url: string, init: RequestInit = {}) => {
    if (init.method === "PUT") {
      puts++;
      const body = JSON.parse(String(init.body)) as { baseRev: number; data: S };
      if (body.baseRev !== server.rev) return new Response(JSON.stringify(server), { status: 409 });
      server = { rev: server.rev + 1, data: body.data };
      return new Response(JSON.stringify({ rev: server.rev }));
    }
    return new Response(JSON.stringify(server));
  });
}

describe("admin-sync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    puts = 0;
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { addEventListener() {}, location: { reload() {} } });
    vi.stubGlobal("localStorage", { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v) });
    vi.stubGlobal("fetch", fakeFetch());
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  const make = () => createSyncedStore<S>({ seed, storeKey: "t:s", localKey: "t:c", emptyLocal: {}, normalize: (d) => ({ ...d, orders: d.orders ?? [] }) });

  it("el panel guarda en cola con baseRev", async () => {
    server = { rev: 3, data: { version: 1, items: ["a"], orders: [] } };
    const st = make();
    st.primeStore({ scope: "admin", rev: 3, data: server.data });
    st.setState((s) => ({ ...s, items: [...s.items, "b"] }));
    await vi.advanceTimersByTimeAsync(700);
    expect(server).toEqual({ rev: 4, data: { version: 1, items: ["a", "b"], orders: [] } });
  });

  it("ante 409 trae lo nuevo y re-aplica los cambios pendientes encima", async () => {
    server = { rev: 1, data: { version: 1, items: ["a"], orders: [] } };
    const st = make();
    st.primeStore({ scope: "admin", rev: 1, data: server.data });
    // otro dispositivo guardó mientras tanto
    server = { rev: 2, data: { version: 1, items: ["a", "otro"], orders: [] } };
    st.setState((s) => ({ ...s, items: [...s.items, "mio"] }));
    await vi.advanceTimersByTimeAsync(700);
    expect(server.data!.items).toEqual(["a", "otro", "mio"]);
    expect(st.getState().items).toEqual(["a", "otro", "mio"]);
    expect(puts).toBe(2);
  });

  it("sin nada guardado, el panel guarda los datos de ejemplo", async () => {
    server = { rev: 0, data: null };
    const st = make();
    st.primeStore({ scope: "admin", rev: 0, data: null });
    await vi.advanceTimersByTimeAsync(10);
    expect(server).toEqual({ rev: 1, data: seed });
  });

  it("el sitio público nunca guarda el estado", async () => {
    server = { rev: 1, data: { version: 1, items: ["a"], orders: [] } };
    const st = make();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    st.primeStore({ scope: "public", rev: 1, data: server.data });
    st.setState((s) => ({ ...s, items: [] }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(puts).toBe(0);
  });

  it("modo local: sin servidor queda en localStorage", () => {
    const st = make();
    st.setState((s) => ({ ...s, items: ["local"] }));
    expect(st.getMode()).toBe("local");
    expect(JSON.parse(localStorage.getItem("t:s")!).items).toEqual(["local"]);
    st.setLocal((c) => ({ ...c, x: 2 }));
    expect(st.getLocal()).toEqual({ x: 2 });
  });
});
