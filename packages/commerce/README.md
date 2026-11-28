# @nexora/commerce

Catálogo, precios, pedidos, stock y estados.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `quote(lines, delivery, payment, installments, settings)`: módulo puro, lo usan el carrito y el servidor.
- `parseRequest(body)` y `placeOrder(data, request, now)`: validan, calculan con datos guardados y descuentan stock.
- Handler `POST /api/orders` → 201 `{ order }` · 400 `{ error, field? }` · 409 `{ error: "stock", items }` · 429.
- `GET /api/orders/status?id=&phone=` → `{ id, status }`.
- Variantes opcionales (talle, color) con stock por variante.
- Transiciones de estado: cancelar devuelve stock; salir de cancelado lo descuenta.

## Qué garantiza

- El navegador nunca manda precios ni totales: solo ids y cantidades.
- Un pedido nunca deja stock negativo.

## Se extrae de

Titán `api/_order.js`, `api/orders/*` · Puerto Chill `src/lib/orders.ts`, `src/lib/pricing.ts`, `src/lib/types.ts`, `src/app/api/orders/route.ts`

## Errores conocidos

- Titán y Puerto Chill guardan formas distintas de `Order`; las apps migradas se adaptan con un mapeador, sin renombrar datos guardados.
