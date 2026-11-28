"use client";

import { createSyncedStore, type Initial as SyncInitial } from "@nexora/admin-sync";
import { seed } from "./seed";
import { OrderError, parseRequest, placeOrder as placeOrderOn, setOrderStatus, type OrderReceipt, type OrderRequest } from "./orders";
import type { Content, Order, Product, Settings, StoreState } from "./types";

/**
 * Store de la tienda sobre @nexora/admin-sync (sincronización con el servidor, cola de cambios del
 * panel, modo local sin servidor). Acá quedan solo las acciones propias de Puerto Chill.
 * El carrito siempre es de cada navegador.
 */

export type Cart = Record<string, number>;
type Snapshot = Omit<StoreState, "orders"> & { orders?: Order[] };
/** Lo que la página trae del servidor. null = no hay servidor de datos: modo local. */
export type Initial = SyncInitial<Snapshot>;

const store = createSyncedStore<StoreState, Snapshot, Cart>({
  seed,
  storeKey: "puerto-chill:store",
  localKey: "puerto-chill:cart",
  emptyLocal: {},
  normalize: (d) => ({ ...d, orders: d.orders ?? [] }),
});

export const primeStore = store.primeStore;
export const startSync = store.startSync;
export const useStore = store.useStore;
export const useCart = store.useLocal;
const setState = store.setState;
const setCart = store.setLocal;

/* ---------- acciones: productos ---------- */

export function updateProduct(id: string, patch: Partial<Product>) {
  setState((s) => ({
    ...s,
    products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
}

export function addProduct(p: Omit<Product, "id">) {
  const base = p.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  setState((s) => {
    let id = base || "producto";
    let n = 2;
    while (s.products.some((x) => x.id === id)) id = `${base}-${n++}`;
    return { ...s, products: [{ ...p, id }, ...s.products] };
  });
}

export function removeProduct(id: string) {
  setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  setCart((c) => {
    const next = { ...c };
    delete next[id];
    return next;
  });
}

/* ---------- acciones: ajustes y contenido ---------- */

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function updateContent(patch: Partial<Content>) {
  setState((s) => ({ ...s, content: { ...s.content, ...patch } }));
}

/* ---------- acciones: carrito ---------- */

export function addToCart(id: string, qty = 1) {
  const p = store.getState().products.find((x) => x.id === id);
  if (!p) return;
  setCart((c) => ({ ...c, [id]: Math.min(p.stock, (c[id] ?? 0) + qty) }));
}

export function setCartQty(id: string, qty: number) {
  const p = store.getState().products.find((x) => x.id === id);
  setCart((c) => {
    const next = { ...c };
    const max = p?.stock ?? 0;
    const q = Math.max(0, Math.min(max, qty));
    if (q === 0) delete next[id];
    else next[id] = q;
    return next;
  });
}

export function clearCart() {
  setCart(() => ({}));
}

/* ---------- acciones: pedidos ---------- */

export type PlaceResult =
  | { ok: true; order: OrderReceipt }
  | { ok: false; status: number; error: string; field?: string; items?: { productId: string; name: string; requested: number; available: number }[] };

/**
 * Registra el pedido. Online lo valida y calcula el servidor (precios, envío, descuento y stock);
 * sin servidor se calcula igual en el navegador. No se cobra nada.
 */
export async function submitOrder(req: OrderRequest): Promise<PlaceResult> {
  if (store.getMode() === "local") {
    try {
      const data = structuredClone(store.getState());
      const { receipt } = placeOrderOn(data, parseRequest(req));
      setState(() => data);
      clearCart();
      return { ok: true, order: receipt };
    } catch (e) {
      if (e instanceof OrderError) return { ok: false, status: e.status, ...(e.body as { error: string }) };
      throw e;
    }
  }
  let r: Awaited<ReturnType<typeof store.api>>;
  try {
    r = await store.api("POST", "/api/orders", req);
  } catch {
    return { ok: false, status: 0, error: "Sin conexión. Probá de nuevo." };
  }
  if (r.status !== 201) {
    return { ...(r.body as object), ok: false, status: r.status, error: String(r.body.error || "No se pudo registrar el pedido") };
  }
  clearCart();
  store.pull(true); // stock actualizado
  return { ok: true, order: r.body.order as OrderReceipt };
}

/** Cambia el estado. Pasar a "cancelado" devuelve el stock; salir de "cancelado" lo vuelve a descontar. */
export function updateOrderStatus(id: number, status: Order["status"]) {
  setState((s) => setOrderStatus(s, id, status));
}

/** Nota interna del pedido, solo para el panel. */
export function updateOrderNote(id: number, note: string) {
  setState((s) => ({ ...s, orders: s.orders.map((x) => (x.id === id ? { ...x, note } : x)) }));
}

export function resetDemo() {
  setState(() => seed);
  clearCart();
}
