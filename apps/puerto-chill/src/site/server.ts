/**
 * Configuración de servidor de Puerto Chill sobre los paquetes de nexora.
 * Acá solo se eligen opciones: la lógica vive en packages/. Ver CLAUDE.md de la raíz.
 */
import { createAuth, createSessionHandlers } from "@nexora/auth";
import { createOrderHandler } from "@nexora/commerce/server";
import { createMediaHandlers } from "@nexora/media";
import { createBlobState, createInitialLoader, createStateHandlers, omitKeys } from "@nexora/state";
import type { Initial } from "@/lib/store";
import type { Product, StoreState } from "@/lib/types";

// Sesión persistente: el dueño entra una vez y queda adentro. Dura 1 año y se renueva en cada visita al panel.
// Para revocar todas las sesiones, cambiar ADMIN_PASSWORD en Vercel y volver a deployar.
export const auth = createAuth({ cookieName: "pc_admin", scope: "puerto-chill-admin-v1", maxAgeSeconds: 60 * 60 * 24 * 365 });

export const state = createBlobState<StoreState>();

/** Lo que ve cualquiera: todo menos los pedidos (con los datos de los clientes). */
export type PublicState = Omit<StoreState, "orders">;
export const publicView = (data: StoreState | null): PublicState | null => omitKeys(data, ["orders"]);

export const sessionHandlers = createSessionHandlers(auth);

export const stateHandlers = createStateHandlers<StoreState, PublicState>({
  state,
  isAdmin: auth.isAdmin,
  publicView,
  validate: (d): d is StoreState => {
    const x = d as StoreState | null;
    return Boolean(x && typeof x === "object" && !Array.isArray(x) && Array.isArray(x.products) && Array.isArray(x.orders));
  },
});

export const ordersPOST = createOrderHandler<Product, StoreState>({ state });

export const mediaHandlers = createMediaHandlers({ isAdmin: auth.isAdmin });

const loader = createInitialLoader<StoreState, PublicState>({ state, publicView });
export const initialFor = loader as (scope: "public" | "admin") => Promise<Initial>;
