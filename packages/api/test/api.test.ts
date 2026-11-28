import { describe, expect, it, vi } from "vitest";
import { clientIp, createRateLimiter, isBot, json, readJSONBody } from "../src/index";

describe("api", () => {
  it("json responde sin caché y con el status pedido", async () => {
    const r = json({ ok: 1 }, 201);
    expect(r.status).toBe(201);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(await r.json()).toEqual({ ok: 1 });
  });

  it("clientIp toma la primera IP de x-forwarded-for", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" } }))).toBe("1.1.1.1");
    expect(clientIp(new Request("http://x"))).toBe("local");
  });

  it("readJSONBody rechaza arrays, JSON roto y bodies grandes", async () => {
    const req = (b: string) => new Request("http://x", { method: "POST", body: b });
    expect(await readJSONBody(req('{"a":1}'))).toEqual({ a: 1 });
    expect(await readJSONBody(req("[1]"))).toBeNull();
    expect(await readJSONBody(req("{"))).toBeNull();
    expect(await readJSONBody(req(JSON.stringify({ a: "x".repeat(50) })), 20)).toBeNull();
  });

  it("rate limiter: hit corta después del máximo y la ventana vence", () => {
    vi.useFakeTimers();
    const rl = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(rl.hit("a")).toBe(false);
    expect(rl.hit("a")).toBe(false);
    expect(rl.hit("a")).toBe(true);
    expect(rl.hit("b")).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rl.hit("a")).toBe(false);
    vi.useRealTimers();
  });

  it("rate limiter: blocked/record para intentos fallidos", () => {
    const rl = createRateLimiter({ max: 2, windowMs: 60_000 });
    expect(rl.blocked("ip")).toBe(false);
    rl.record("ip");
    rl.record("ip");
    expect(rl.blocked("ip")).toBe(true);
  });

  it("honeypot", () => {
    expect(isBot({ website: "spam" })).toBe(true);
    expect(isBot({ website: "" })).toBe(false);
    expect(isBot({})).toBe(false);
  });
});
