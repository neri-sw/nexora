---
name: pdf-a-brief
description: Convierte un PDF de diseño aprobado en un brief accionable: pantallas, tokens de diseño, textos editables, módulos necesarios y preguntas al cliente.
---

# pdf-a-brief

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Llega un PDF de diseño aprobado para un cliente nuevo o una sección nueva.

## Entradas

El PDF. Si son imágenes, mirá cada página.

## Pasos

1. Listá páginas y secciones en orden, con su propósito.
2. Extraé tokens: colores (hex), tipografías, radios, espaciados. Escribilos en `DESIGN.md`.
3. Clasificá cada elemento visible:
   - **Fijo del diseño** (no cambia).
   - **Texto editable** por el dueño → va a `content.schema.ts`.
   - **Dato** (producto, precio, turno, horario) → va al estado.
4. Elegí módulos (`packages/`) según lo que el diseño muestra: carrito → commerce; agenda → bookings; botón de WhatsApp → notify; checkout con pago → payments.
5. Armá las preguntas estándar que el PDF casi nunca responde y mandalas de una sola vez: medios de pago, envío y costo, retiro, cuotas, horarios, WhatsApp, dominio, quién carga el catálogo, estados de pedido que usa el negocio, razón social para legales.
6. Escribí `apps/<cliente>/BRIEF.md` con todo lo anterior y borradores de `site.config.ts` y `content.schema.ts`.

## Criterios de aceptación

- Cada elemento del PDF quedó clasificado.
- Las preguntas al cliente están en una sola lista.

## Referencia

Puerto Chill: `DESIGN.md` y `PRODUCT.md` en `neri-sw/tienda-chill` (ejemplo de tokens y producto).
