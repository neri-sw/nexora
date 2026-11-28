import type { DeliveryMethod, PaymentMethod, Settings } from "./types";

/**
 * Reglas de precios del checkout, compartidas por el carrito (para mostrar) y por POST /api/orders
 * (que recalcula todo con los precios guardados).
 */

export function shippingFor(subtotal: number, s: Settings) {
  if (s.freeShippingEnabled && subtotal >= s.freeShippingThreshold) return 0;
  return s.shippingCost;
}

export function deliveryOptions(s: Settings): DeliveryMethod[] {
  return (["retiro", "envio"] as DeliveryMethod[]).filter((d) => (d === "retiro" ? s.pickupEnabled : s.shippingEnabled));
}

/** Medios habilitados en el panel. El efectivo solo vale para retirar en el local. */
export function paymentOptions(s: Settings, delivery: DeliveryMethod): PaymentMethod[] {
  return (Object.keys(s.payments) as PaymentMethod[]).filter((m) => s.payments[m] && !(m === "efectivo" && delivery === "envio"));
}

/** Las cuotas solo se ofrecen con Mercado Pago. */
export function canInstall(s: Settings, payment: PaymentMethod) {
  return payment === "mercadopago" && s.financingEnabled && s.installments > 1;
}

export function quote(
  lines: { price: number; qty: number }[],
  delivery: DeliveryMethod,
  payment: PaymentMethod,
  installments: number,
  s: Settings,
) {
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const shipping = delivery === "envio" ? shippingFor(subtotal, s) : 0;
  const discount = payment === "transferencia" ? Math.round((subtotal * s.transferDiscount) / 100) : 0;
  const total = subtotal + shipping - discount;
  const n = canInstall(s, payment) ? Math.min(s.installments, Math.max(1, Math.floor(Number(installments) || 1))) : 1;
  return { subtotal, shipping, discount, total, installments: n };
}
