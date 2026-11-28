---
name: deploy-vercel
description: Configura y verifica el proyecto de Vercel de una app de nexora: carpeta raíz, Blob privado, variables, dominio y build selectivo.
---

# deploy-vercel

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

App nueva, cambio de entorno o salida a producción.

## Pasos

1. Proyecto de Vercel conectado a `neri-sw/nexora`, carpeta raíz `apps/<cliente>`, framework Next.js. Vercel instala desde la raíz del monorepo (workspaces) aunque la carpeta raíz sea la app.
2. "Ignored Build Step": `npx turbo-ignore` para compilar solo si cambió la app o un paquete que usa.
3. Blob privado conectado; variables `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD` y `ADMIN_PATH` (ruta secreta del panel, generala con `node -e "console.log('panel-'+require('crypto').randomBytes(12).toString('base64url'))"`) en producción y preview. Pasale a Neri la URL del panel por el chat, nunca en el repo ni en la memoria.
4. Verificá en el deploy: `/api/state` sanitizado, `/api/admin/state` 401 sin sesión, login, pedido de prueba (y borrarlo).

## Reglas

- Producción, variables y dominios solo con OK explícito de Neri.
- La clave del panel la define Neri; no se escribe en chats ni en el repo.
