# Aprendizajes

Qué se cambió en el stack y por qué. Una entrada por sesión que tocó paquetes o skills. Lo más nuevo arriba.

Formato:

```
## AAAA-MM-DD · <cliente o "stack"> · <tema>
- Qué pasó: …
- Qué se cambió: paquete/skill + archivo
- Por qué: …
```

## 2026-11-28 · stack · Origen

- Qué pasó: dos MVP (Titán Studios en HTML + JS, Puerto Chill en Next.js) resolvieron lo mismo dos veces: estado en Blob, sesión del panel, pedidos calculados por el servidor, fotos.
- Qué se cambió: se crea nexora como monorepo con paquetes compartidos y skills.
- Por qué: que ningún agente vuelva a redescubrir esa lógica.

Aprendizajes técnicos heredados de esos dos sitios (ya deben estar en los README y skills):

- Leer el Blob con `accept-encoding: identity`: con gzip el ETag llega débil (`W/`) y toda escritura con `ifMatch` falla.
- Leer con `useCache: false` antes de escribir: la caché de Blob demora hasta ~60 s.
- Fechas y horarios en hora de Buenos Aires, nunca en la del servidor (UTC).
- El rate limit en memoria hace fallar corridas de tests repetidas: reiniciar el server entre corridas.
