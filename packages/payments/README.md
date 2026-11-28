# @nexora/payments

Medios de pago.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Interfaz `PaymentProvider`: crear cobro, verificar webhook, mapear estado.
- Proveedor `manual` (hoy): se registra el pedido y el dueño coordina el pago.
- Fase 3: `mercadopago` (Checkout Pro + webhook firmado → estado `pagado`).

## Qué garantiza

- Un pedido solo pasa a pagado por un webhook verificado o por el dueño en el panel.

## Se extrae de

Contrato MVP, sección Pagos (sin dinero real)
