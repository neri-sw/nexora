---
name: deploy-vercel
description: Configura y verifica el proyecto de Vercel de una app de nexora: carpeta raíz, Blob privado, variables, dominio y build selectivo.
---

# deploy-vercel

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

App nueva, cambio de entorno o salida a producción.

## Pasos

1. Proyecto de Vercel conectado a `neri-sw/nexora`, carpeta raíz `apps/<cliente>`.
2. "Ignored Build Step": `npx turbo-ignore` para compilar solo si cambió la app o un paquete que usa.
3. Blob privado conectado; variables `BLOB_READ_WRITE_TOKEN` y `ADMIN_PASSWORD` en producción y preview.
4. Verificá en el deploy: `/api/state` sanitizado, `/api/admin/state` 401 sin sesión, login, pedido de prueba (y borrarlo).

## Reglas

- Producción, variables y dominios solo con OK explícito de Neri.
- La clave del panel la define Neri; no se escribe en chats ni en el repo.
