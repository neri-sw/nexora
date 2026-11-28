---
name: prototipo-a-produccion
description: Checklist obligatorio que separa un prototipo de un sitio listo para usar; bloquea la salida a producción si falta algo.
---

# prototipo-a-produccion

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Antes de cada salida a producción.

## Checklist (cada ítem con evidencia: captura, request o test)

- [ ] Datos reales del cliente en Blob; el seed solo carga fuera de producción.
- [ ] Panel con login (`ADMIN_PASSWORD`), cookie HttpOnly, límite de intentos.
- [ ] Panel escondido: `ADMIN_PATH` cargada y `src/proxy.ts` de `@nexora/auth/proxy`. `/admin` tiene que dar el mismo 404 que una URL inventada.
- [ ] `GET /api/state` sin pedidos, clientes ni datos personales.
- [ ] Precios, stock y totales calculados por el servidor.
- [ ] Sin escritura pública del estado completo; solo pedidos/turnos por sus endpoints.
- [ ] Honeypot, límite por IP y límite de tamaño de body en endpoints públicos.
- [ ] Ningún texto de demo ("precio ilustrativo", "compra de prueba").
- [ ] "Restablecer demo" oculto en producción.
- [ ] Fotos reales.
- [ ] Medio de pago claro: registro sin cobro con aviso, o proveedor real con webhook.
- [ ] Legales Argentina publicados (`legal-ar`).
- [ ] WhatsApp, dirección y horarios reales y editables.
- [ ] Producción y preview con datos separados y variables cargadas en los dos.
- [ ] Título, descripción, favicon e imagen para compartir del cliente.
- [ ] `qa-e2e` verde.
- [ ] El dueño entró al panel, cargó un producto y vio un pedido de prueba (después borrado).

## Referencia

Salida a producción de Puerto Chill: commit `ce90deb` en `neri-sw/tienda-chill`.
