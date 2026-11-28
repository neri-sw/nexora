import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@vercel/blob", () => import("../../state/test/blob-memory"));
import * as blob from "../../state/test/blob-memory";
import { createBlobState } from "@nexora/state";
import { OrderError, parseRequest, placeOrder, quote, setOrderStatus, type CommerceState, type Settings } from "../src/index";
import { createOrderHandler } from "../src/server";

const settings: Settings = {
  freeShippingEnabled: true,
  freeShippingThreshold: 50000,
  shippingCost: 5000,
  pickupEnabled: true,
  shippingEnabled: true,
  financingEnabled: true,
  installments: 6,
  payments: { mercadopago: true, transferencia: true, efectivo: true },
  transferDiscount: 10,
  lowStockThreshold: 3,
};
const fresh = (): CommerceState => ({
  settings: structuredClone(settings),
  orders: [],
  products: [
    { id: "jarra", name: "Jarra", price: 10000, stock: 5, visible: true },
    { id: "bolso", name: "Bolso", price: 30000, stock: 1, visible: true },
    { id: "oculto", name: "Oculto", price: 1, stock: 9, visible: false },
  ],
});
const req = (over: Record<string, unknown> = {}) => ({
  items: [{ productId: "jarra", qty: 2 }],
  customer: { name: "Ana", phone: "11 5555 5555", email: "ana@mail.com", address: "Calle 1", city: "CABA" },
  delivery: "envio",
  payment: "transferencia",
  website: "",
  ...over,
});

describe("pricing", () => {
  it("envío gratis desde el umbral, descuento por transferencia y cuotas solo con Mercado Pago", () => {
    expect(quote([{ price: 10000, qty: 2 }], "envio", "transferencia", 6, settings)).toEqual({ subtotal: 20000, shipping: 5000, discount: 2000, total: 23000, installments: 1 });
    expect(quote([{ price: 30000, qty: 2 }], "envio", "mercadopago", 6, settings)).toEqual({ subtotal: 60000, shipping: 0, discount: 0, total: 60000, installments: 6 });
    expect(quote([{ price: 1, qty: 1 }], "retiro", "mercadopago", 99, settings).installments).toBe(6);
  });
});

describe("pedidos", () => {
  it("parseRequest valida nombre, teléfono, dirección y cantidades", () => {
    const err = (b: unknown) => {
      try {
        parseRequest(b);
      } catch (e) {
        return (e as OrderError).body.field;
      }
    };
    expect(err(req({ customer: { name: "", phone: "11 5555 5555" } }))).toBe("name");
    expect(err(req({ customer: { name: "A", phone: "123" } }))).toBe("phone");
    expect(err(req({ customer: { name: "A", phone: "11 5555 5555" } }))).toBe("address");
    expect(err(req({ items: [{ productId: "jarra", qty: 0 }] }))).toBe("items");
    expect(err(req({ items: [] }))).toBe("items");
  });

  it("usa los precios guardados, no los del navegador, y descuenta stock", () => {
    const data = fresh();
    const r = parseRequest(req({ items: [{ productId: "jarra", qty: 1, price: 1 }, { productId: "jarra", qty: 1 }] }));
    const { order, receipt } = placeOrder(data, r, new Date("2026-11-28T12:00:00Z"));
    expect(receipt).toMatchObject({ id: 1, subtotal: 20000, shipping: 5000, discount: 2000, total: 23000 });
    expect(order.status).toBe("pendiente");
    expect(data.products[0].stock).toBe(3);
    expect(data.orders).toHaveLength(1);
  });

  it("sin stock: 409 con las líneas afectadas, sin tocar nada", () => {
    const data = fresh();
    try {
      placeOrder(data, parseRequest(req({ items: [{ productId: "bolso", qty: 2 }] })));
      throw new Error("no lanzó");
    } catch (e) {
      expect((e as OrderError).status).toBe(409);
      expect((e as OrderError).body).toEqual({ error: "stock", items: [{ productId: "bolso", name: "Bolso", requested: 2, available: 1 }] });
    }
    expect(data.products[1].stock).toBe(1);
    expect(data.orders).toHaveLength(0);
  });

  it("producto oculto, medio de pago apagado y efectivo con envío se rechazan", () => {
    const data = fresh();
    expect(() => placeOrder(data, parseRequest(req({ items: [{ productId: "oculto", qty: 1 }] })))).toThrow(OrderError);
    data.settings.payments.transferencia = false;
    expect(() => placeOrder(data, parseRequest(req()))).toThrow(/medio de pago/);
    expect(() => placeOrder(data, parseRequest(req({ payment: "efectivo" })))).toThrow(/medio de pago/);
  });

  it("cancelar devuelve stock y reactivar lo vuelve a descontar", () => {
    let data = fresh();
    placeOrder(data, parseRequest(req()));
    data = setOrderStatus(data, 1, "cancelado");
    expect(data.products[0].stock).toBe(5);
    data = setOrderStatus(data, 1, "preparando");
    expect(data.products[0].stock).toBe(3);
    expect(setOrderStatus(data, 1, "preparando")).toBe(data);
  });
});

describe("POST /api/orders", () => {
  const state = createBlobState<CommerceState>({ path: "t/state.json" });
  const post = (b: unknown, ip = "1.1.1.1") => new Request("https://x/api/orders", { method: "POST", body: JSON.stringify(b), headers: { "x-forwarded-for": ip } });
  beforeEach(async () => {
    blob.__reset();
    await state.writeState(await state.readState(true), fresh());
  });

  it("201 y queda guardado con el stock descontado", async () => {
    const POST = createOrderHandler({ state });
    const r = await POST(post(req()));
    expect(r.status).toBe(201);
    expect(((await r.json()) as { order: { total: number } }).order.total).toBe(23000);
    const saved = (await state.readState(true)).data!;
    expect(saved.orders).toHaveLength(1);
    expect(saved.products[0].stock).toBe(3);
  });

  it("honeypot: 201 falso y no guarda", async () => {
    const r = await createOrderHandler({ state })(post(req({ website: "http://spam" })));
    expect(r.status).toBe(201);
    expect((await state.readState(true)).data!.orders).toHaveLength(0);
  });

  it("400 con el campo, 409 sin stock y 429 después de 8 pedidos por IP", async () => {
    const POST = createOrderHandler({ state });
    expect(await (await POST(post(req({ customer: { name: "", phone: "1" } })))).json()).toMatchObject({ field: "name" });
    for (let i = 0; i < 8; i++) expect((await POST(post(req({ items: [{ productId: "bolso", qty: 5 }] }), "2.2.2.2"))).status).toBe(409);
    expect((await POST(post(req(), "2.2.2.2"))).status).toBe(429);
    expect((await POST(post(req(), "3.3.3.3"))).status).toBe(201);
  });

  it("sin datos guardados: 503", async () => {
    blob.__reset();
    expect((await createOrderHandler({ state })(post(req()))).status).toBe(503);
  });
});
