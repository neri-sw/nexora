# Aprendizajes

Qué se cambió en el stack y por qué. Una entrada por sesión que tocó paquetes o skills. Lo más nuevo arriba.

Formato:

```
## AAAA-MM-DD · <cliente o "stack"> · <tema>
- Qué pasó: …
- Qué se cambió: paquete/skill + archivo
- Por qué: …
```

## 2026-11-28 · puerto-chill · Panel escondido

- Qué pasó: Neri pidió que sea muy difícil encontrar el panel probando URLs.
- Qué se cambió: `@nexora/auth` 0.2.0 (`gate`, `proxy`, `panelBase`, `panelApi`); `media` y `admin-sync` llaman la API privada bajo la ruta del panel; `apps/puerto-chill/src/proxy.ts`; `e2e/panel-oculto.cjs` (24 controles). Variable nueva `ADMIN_PATH`.
- Por qué: con la ruta secreta, `/admin` y la API privada directa responden el mismo 404 que una URL inventada.
- Para la próxima: con `next start` local un `rewrite` del proxy deja `x-middleware-rewrite`, pero Vercel no lo manda: en producción el 404 por rewrite es idéntico al de una URL inventada. Probé devolver una copia del 404 pedida por fetch y quedó vieja entre deploys (la pidió al deploy anterior durante el cambio): no usar. `config.matcher` de Next tiene que ser un literal en el `proxy.ts` de la app: no se puede reexportar.

## 2026-11-28 · puerto-chill · Paridad con el original

- Qué pasó: Neri pidió asegurar que Puerto Chill funcione igual en nexora que en `neri-sw/tienda-chill`.
- Qué se cambió: `scripts/paridad/` (levanta las dos versiones con el mismo Blob simulado) y `apps/puerto-chill/paridad/{api,ui}.cjs`. Resultado: 103 de 103 respuestas de la API iguales, las 22 pantallas idénticas en texto y captura (celu y compu), compra y panel iguales.
- Única diferencia, buscada: `@nexora/commerce` corta con 413 los pedidos de más de 20 KB; el original los aceptaba recortando los campos.
- Encontrado en las dos versiones (no es regresión, va al backlog): error de hidratación de React #418 en el panel (resumen y pedidos); `qty: "2"` (texto) se acepta como 2; `/api/upload` no revisa que los bytes sean de verdad la imagen declarada.
- Para la próxima: al mover Titán, escribir su `paridad/` antes de tocar código y correrlo en cada paso.

## 2026-11-28 · puerto-chill · Fase 1: paquetes extraídos

- Qué pasó: se extrajeron `api`, `auth`, `state`, `media`, `commerce` y `admin-sync` desde Puerto Chill y la app pasó a `apps/puerto-chill` usándolos, sin cambios visibles.
- Qué se cambió: 6 paquetes con 37 tests; la app quedó con `src/site/server.ts` (configuración) y rutas de una línea; `scripts/e2e/run.sh` con simulador de Blob en disco.
- Por qué: que la próxima app arranque con todo esto resuelto.
- Para la próxima: un `next-server` viejo en el puerto hace que el recorrido vea datos de otra corrida. `run.sh` ahora corta si el puerto está ocupado.

## 2026-11-28 · stack · Origen

- Qué pasó: dos MVP (Titán Studios en HTML + JS, Puerto Chill en Next.js) resolvieron lo mismo dos veces: estado en Blob, sesión del panel, pedidos calculados por el servidor, fotos.
- Qué se cambió: se crea nexora como monorepo con paquetes compartidos y skills.
- Por qué: que ningún agente vuelva a redescubrir esa lógica.

Aprendizajes técnicos heredados de esos dos sitios (ya deben estar en los README y skills):

- Leer el Blob con `accept-encoding: identity`: con gzip el ETag llega débil (`W/`) y toda escritura con `ifMatch` falla.
- Leer con `useCache: false` antes de escribir: la caché de Blob demora hasta ~60 s.
- Fechas y horarios en hora de Buenos Aires, nunca en la del servidor (UTC).
- El rate limit en memoria hace fallar corridas de tests repetidas: reiniciar el server entre corridas.
