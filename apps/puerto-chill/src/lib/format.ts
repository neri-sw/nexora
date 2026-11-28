import type { Content, OrderStatus, PaymentMethod, Settings } from "./types";

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const money = (n: number) => ars.format(Math.round(n)).replace(/\s/g, "");

export const categoryLabel = { bazar: "Bazar", bolsos: "Bolsos y carteras" } as const;

export const paymentLabel: Record<PaymentMethod, string> = {
  mercadopago: "Mercado Pago (te enviamos el link de pago)",
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo al retirar",
};

export const statusLabel: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  listo: "Listo para retirar",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function installmentLine(price: number, s: Settings) {
  if (!s.financingEnabled || s.installments < 2) return null;
  return `${s.installments} cuotas sin interés de ${money(price / s.installments)}`;
}

export { shippingFor } from "./pricing";

export function mapsUrl(c: Content) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.address}, ${c.city}`)}`;
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Link de WhatsApp para escribirle a un teléfono argentino (agrega 549 si falta el código de país). */
export function whatsappTo(phone: string, text: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("54")) d = "549" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
