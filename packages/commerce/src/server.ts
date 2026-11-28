/**
 * @nexora/commerce/server: handler de POST /api/orders.
 *   OrderRequest → 201 { order: OrderReceipt } · 400 { error, field? } · 409 { error: "stock", items } · 429 · 503
 * Precios, envío, descuento y stock salen de los datos guardados. No se cobra nada: el pedido queda
 * registrado y el dueño coordina el pago (hasta que haya un proveedor de @nexora/payments).
 */
import { clientIp, createRateLimiter, json, type RateLimiter } from "@nexora/api";
import { ConflictError, type BlobState } from "@nexora/state";
import { OrderError, parseRequest, placeOrder, type OrderReceipt } from "./orders";
import type { CommerceProduct, CommerceState } from "./types";

export function createOrderHandler<P extends CommerceProduct, S extends CommerceState<P>>(o: {
  state: BlobState<S>;
  /** Por defecto 8 pedidos cada 10 minutos por IP. */
  limiter?: RateLimiter;
}) {
  const limiter = o.limiter ?? createRateLimiter({ max: 8, windowMs: 10 * 60_000 });
  return async function POST(request: Request) {
    const text = await request.text();
    if (text.length > 20_000) return json({ error: "Pedido demasiado grande" }, 413);
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    try {
      const req = parseRequest(body);
      // honeypot: si el campo oculto viene completo es un bot; se responde como si nada y no se guarda
      if (req.website) {
        const fake: OrderReceipt = { id: 1000 + Math.floor(Math.random() * 9000), total: 0, subtotal: 0, shipping: 0, discount: 0, delivery: req.delivery, payment: req.payment, installments: 1, lines: [] };
        return json({ order: fake }, 201);
      }
      if (limiter.hit(clientIp(request))) return json({ error: "Hiciste muchos pedidos seguidos. Probá en unos minutos." }, 429);
      const receipt = await o.state.mutateState((data) => {
        if (!data) throw new OrderError(503, { error: "La tienda todavía no está lista para recibir pedidos." });
        const { receipt } = placeOrder<P, S>(data, req);
        return { data, result: receipt };
      });
      return json({ order: receipt }, 201);
    } catch (e) {
      if (e instanceof OrderError) return json(e.body, e.status);
      if (e instanceof ConflictError) return json({ error: "Hay mucho movimiento en la tienda. Probá de nuevo en unos segundos." }, 503);
      console.error("[orders] error", e);
      return json({ error: "No se pudo registrar el pedido" }, 500);
    }
  };
}
