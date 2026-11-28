---
name: pagos
description: Activa o cambia un medio de pago (manual, Mercado Pago u otro) a través de la interfaz común de packages/payments.
---

# pagos

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Un cliente quiere cobrar online o cambiar cómo cobra.

## Paquetes

`packages/payments`. Leé su README.

## Pasos

1. Si el proveedor no existe en el paquete, se agrega ahí (con test de webhook), no en la app.
2. Credenciales solo como variables en Vercel. Nunca en el repo.
3. Probá en modo sandbox del proveedor en preview antes de producción.

## Criterios de aceptación

- El pedido pasa a pagado solo por webhook verificado o por el dueño.

Estado: Fase 3. Hoy solo existe el modo `manual`.
