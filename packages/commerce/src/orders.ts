/**
 * Reglas de pedidos (puras, sin E/S): validación, precios y stock. Las usa POST /api/orders con los
 * datos guardados, y el navegador solo cuando el sitio corre sin servidor (demo local).
 * Los precios que mande el navegador no se usan nunca.
 */
import { deliveryOptions, paymentOptions, quote } from "./pricing";
import type { CommerceProduct, CommerceState, DeliveryMethod, Order, PaymentMethod } from "./types";

export interface OrderRequest {
  items: { productId: string; qty: number }[];
  customer: { name: string; phone: string; email?: string; address?: string; city?: string };
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  installments?: number;
  /** Honeypot: tiene que venir vacío. */
  website?: string;
}

/** Respuesta del contrato, más las líneas con el precio cobrado (para la pantalla de confirmación). */
export type OrderReceipt = Pick<Order, "id" | "total" | "subtotal" | "shipping" | "discount" | "delivery" | "payment" | "installments" | "lines">;

export class OrderError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super(String(body.error));
  }
}

const bad = (error: string, field?: string): never => {
  throw new OrderError(400, field ? { error, field } : { error });
};
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const digits = (s: string) => s.replace(/\D/g, "");

/** Valida la forma del pedido (sin mirar los datos guardados). */
export function parseRequest(body: unknown): OrderRequest & { website: string } {
  if (!body || typeof body !== "object") bad("Pedido inválido");
  const b = body as Record<string, unknown>;
  const c = (b.customer || {}) as Record<string, unknown>;
  const customer = {
    name: str(c.name, 120),
    phone: str(c.phone, 40),
    email: str(c.email, 160),
    address: str(c.address, 240),
    city: str(c.city, 120),
  };
  if (!customer.name) bad("Escribí tu nombre y apellido.", "name");
  if (digits(customer.phone).length < 8) bad("Revisá el teléfono: necesitamos al menos 8 números.", "phone");
  if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) bad("Revisá el correo.", "email");
  const delivery = b.delivery;
  if (delivery !== "envio" && delivery !== "retiro") bad("Elegí envío o retiro.", "delivery");
  if (delivery === "envio" && !customer.address) bad("Necesitamos la dirección para el envío.", "address");
  const items = Array.isArray(b.items) ? b.items : [];
  if (items.length < 1 || items.length > 20) bad("El pedido tiene que tener entre 1 y 20 productos.", "items");
  const lines = items.map((it) => {
    const x = (it || {}) as Record<string, unknown>;
    const qty = Number(x.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) bad("Cantidad inválida.", "items");
    return { productId: str(x.productId, 80), qty };
  });
  return {
    items: lines,
    customer,
    delivery: delivery as DeliveryMethod,
    payment: str(b.payment, 40) as PaymentMethod,
    installments: Number(b.installments) || 1,
    website: str(b.website),
  };
}

/** Arma el pedido sobre `data` (que se modifica: agrega el pedido y descuenta stock). */
export function placeOrder<P extends CommerceProduct, S extends CommerceState<P>>(
  data: S,
  req: OrderRequest,
  now = new Date(),
): { order: Order; receipt: OrderReceipt } {
  const s = data.settings;
  if (!deliveryOptions(s).includes(req.delivery)) bad("Ese tipo de entrega no está disponible.", "delivery");
  if (!paymentOptions(s, req.delivery).includes(req.payment)) bad("Ese medio de pago no está disponible.", "payment");

  // se juntan líneas repetidas para controlar bien el stock
  const merged = new Map<string, number>();
  for (const l of req.items) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.qty);

  const lines: Order["lines"] = [];
  const short: { productId: string; name: string; requested: number; available: number }[] = [];
  for (const [id, qty] of merged) {
    const p = data.products.find((x) => x.id === id);
    if (!p || !p.visible) bad("Un producto del carrito ya no está disponible.", "items");
    const available = Math.max(0, Number(p!.stock) || 0);
    if (qty > available) short.push({ productId: p!.id, name: p!.name, requested: qty, available });
    lines.push({ productId: p!.id, name: p!.name, price: p!.price, qty });
  }
  if (short.length) throw new OrderError(409, { error: "stock", items: short });

  const q = quote(lines, req.delivery, req.payment, req.installments ?? 1, s);
  data.products = data.products.map((p) => {
    const n = merged.get(p.id);
    return n ? { ...p, stock: Math.max(0, p.stock - n) } : p;
  });
  const id = data.orders.reduce((m, o) => Math.max(m, Number(o.id) || 0), 0) + 1;
  const c = req.customer;
  const order: Order = {
    id,
    createdAt: now.toISOString(),
    customer: {
      name: c.name,
      email: c.email || "",
      phone: c.phone,
      ...(req.delivery === "envio" ? { address: c.address, city: c.city } : {}),
    },
    lines,
    delivery: req.delivery,
    payment: req.payment,
    ...q,
    status: "pendiente",
  };
  data.orders = [order, ...data.orders];
  const receipt: OrderReceipt = {
    id,
    total: q.total,
    subtotal: q.subtotal,
    shipping: q.shipping,
    discount: q.discount,
    delivery: req.delivery,
    payment: req.payment,
    installments: q.installments,
    lines,
  };
  return { order, receipt };
}

/**
 * Cambia el estado de un pedido. Pasar a "cancelado" devuelve el stock; salir de "cancelado"
 * lo vuelve a descontar. Devuelve un estado nuevo (no modifica `s`).
 */
export function setOrderStatus<P extends CommerceProduct, S extends CommerceState<P>>(s: S, id: number, status: Order["status"]): S {
  const o = s.orders.find((x) => x.id === id);
  if (!o || o.status === status) return s;
  const sign = status === "cancelado" ? 1 : o.status === "cancelado" ? -1 : 0;
  const products = sign
    ? s.products.map((p) => {
        const qty = o.lines.filter((l) => l.productId === p.id).reduce((a, l) => a + l.qty, 0);
        return qty ? { ...p, stock: Math.max(0, p.stock + sign * qty) } : p;
      })
    : s.products;
  return { ...s, products, orders: s.orders.map((x) => (x.id === id ? { ...x, status } : x)) };
}
