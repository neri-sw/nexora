# @nexora/commerce

Catálogo, precios, pedidos, stock y estados.

> Versión 0.1.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Tipos: `CommerceProduct`, `CommerceState<P>`, `Order`, `OrderLine`, `Settings`, `DeliveryMethod`, `PaymentMethod`, `OrderStatus`.
- Precios (puros, carrito y servidor): `quote`, `shippingFor`, `deliveryOptions`, `paymentOptions`, `canInstall`.
- Pedidos: `parseRequest`, `placeOrder`, `setOrderStatus` (cancelar devuelve stock), `OrderError`, `OrderRequest`, `OrderReceipt`.
- `@nexora/commerce/server`: `createOrderHandler({ state, limiter? })` → `POST /api/orders` (8 pedidos cada 10 min por IP por defecto).
- Pendiente: variantes (talle, color) con stock por variante, para migrar Titán.

## Qué garantiza

- El navegador nunca manda precios ni totales: solo ids y cantidades.
- Un pedido nunca deja stock negativo.

## Se extrae de

Titán `api/_order.js`, `api/orders/*` · Puerto Chill `src/lib/orders.ts`, `src/lib/pricing.ts`, `src/lib/types.ts`, `src/app/api/orders/route.ts`

## Errores conocidos

- Titán y Puerto Chill guardan formas distintas de `Order`; las apps migradas se adaptan con un mapeador, sin renombrar datos guardados.
