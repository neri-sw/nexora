# @nexora/admin-ui

Pantallas base del panel de negocio.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Resumen, Productos, Pedidos, Ajustes (entrega, pagos, descuentos, cuotas), Textos del sitio, Turnos (si el módulo está activo).
- "Textos del sitio" se genera desde `content.schema.ts` de la app.
- Botón "Escribir por WhatsApp" al cliente en el detalle del pedido.

## Qué garantiza

- El tema visual sale de la app; los componentes no traen colores propios.

## Se extrae de

Puerto Chill `src/components/admin/Admin.tsx`, `src/components/admin/ui.tsx` · Titán `assets/js/admin.js`
