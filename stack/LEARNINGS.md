# Aprendizajes

Qué se cambió en el stack y por qué. Una entrada por sesión que tocó paquetes o skills. Lo más nuevo arriba.

Formato:

```
## AAAA-MM-DD · <cliente o "stack"> · <tema>
- Qué pasó: …
- Qué se cambió: paquete/skill + archivo
- Por qué: …
```

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
