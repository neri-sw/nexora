---
name: replicar-diseno
description: Replica fielmente las pantallas de un PDF aprobado en la app del cliente y lo verifica comparando capturas contra cada página.
---

# replicar-diseno

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Iteraciones 1 y 2, para las pantallas públicas.

## Pasos

1. Una página del PDF a la vez, en orden.
2. Usá los tokens de `DESIGN.md` como variables CSS y los componentes de `packages/ui`. No inventes colores ni tipografías.
3. Todo texto que esté en `content.schema.ts` se lee del estado, no se escribe en el componente.
4. Compará: captura del sitio (Playwright) al mismo ancho que la página del PDF, lado a lado. Corregí hasta que la diferencia sea solo de contenido real.
5. Revisá móvil (375 px) aunque el PDF sea de escritorio.

## Criterios de aceptación

- Cada página del PDF tiene su pantalla y su captura comparada.
- Ningún texto editable quedó fijo en el código.

## Referencia

Puerto Chill `src/components/shop/` (Storefront, CartDrawer, ProductSheet).
