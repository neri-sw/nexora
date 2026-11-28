# @nexora/notify

Avisos y contacto: WhatsApp y mail.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Hoy: `waLink(phone, template, vars)` con plantillas estándar (pedido, turno, contacto).
- Fase 4: aviso al dueño por mail en cada pedido/turno; después WhatsApp Cloud API con plantillas aprobadas.

## Qué garantiza

- Nunca se manda un mensaje al cliente sin que el dueño lo haya configurado.

## Se extrae de

Titán `assets/js/public.js` (apertura de WhatsApp después del pedido)
