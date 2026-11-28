/** Forma canónica de comercio para sitios nuevos (la de Puerto Chill). Cada app extiende Product. */

export type DeliveryMethod = "retiro" | "envio";
export type PaymentMethod = "mercadopago" | "transferencia" | "efectivo";
export type OrderStatus = "pendiente" | "preparando" | "listo" | "enviado" | "entregado" | "cancelado";

/** Lo mínimo que commerce necesita de un producto. La app agrega lo suyo (categoría, fotos, etc.). */
export interface CommerceProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  visible: boolean;
}

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  createdAt: string;
  customer: { name: string; email: string; phone?: string; address?: string; city?: string };
  lines: OrderLine[];
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  installments: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  /** Nota interna del dueño (no la ve el cliente) */
  note?: string;
}

export interface Settings {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupEnabled: boolean;
  shippingEnabled: boolean;
  financingEnabled: boolean;
  installments: number;
  payments: Record<PaymentMethod, boolean>;
  transferDiscount: number;
  lowStockThreshold: number;
}

/** La parte del estado del sitio que maneja commerce. */
export interface CommerceState<P extends CommerceProduct = CommerceProduct> {
  products: P[];
  orders: Order[];
  settings: Settings;
}
