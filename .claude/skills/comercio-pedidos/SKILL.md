---
name: comercio-pedidos
description: Tienda: carrito, checkout, pedido calculado por el servidor, stock y estados de pedido.
---

# comercio-pedidos

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

La app vende productos.

## Paquetes

`packages/commerce` (+ `notify` para WhatsApp, `payments` para el medio de pago). Leé sus README.

## Pasos

1. Configurá en `site.config.ts`: entregas, medios de pago, descuentos, cuotas, variantes, estados.
2. El carrito usa `quote()` del paquete para mostrar; el pedido va por `POST /api/orders`, que recalcula todo.
3. Mensaje de confirmación y siguiente paso (WhatsApp, link de pago) según config.

## Criterios de aceptación

- Un pedido con precios alterados en el navegador se registra con los precios del servidor.
- Sin stock → 409 con las líneas afectadas y mensaje claro.
