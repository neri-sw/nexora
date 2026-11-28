---
name: mejorar-stack
description: Cierre obligatorio de toda sesión: registra lo aprendido, corrige skills y paquetes y deja anotado lo pendiente para la próxima sesión.
---

# mejorar-stack

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Al final de cada sesión que tocó nexora, aunque la tarea haya sido chica.

## Pasos

Respondé estas cuatro preguntas y dejá cada respuesta escrita en el mismo PR que el trabajo:

1. **¿Qué se cambió en `packages/` y por qué?** → entrada en `stack/LEARNINGS.md` (fecha, cliente, qué, por qué). Actualizá README y CHANGELOG del paquete.
2. **¿Alguna skill quedó desactualizada, o el agente tuvo que redescubrir algo?** → corregí el `SKILL.md` ahora y agregá el caso en sus Errores conocidos.
3. **¿Se hizo algo a mano en una app que otra app va a necesitar?** → ítem en `stack/BACKLOG.md` con origen y prioridad.
4. **¿Se tomó una decisión de arquitectura?** → entrada en `stack/DECISIONS.md`.

Si el usuario pidió un cambio general (por ejemplo "un login más robusto") y no se terminó, dejalo en `BACKLOG.md` con lo que falta.

## Criterios de aceptación

- El PR incluye los cambios en `stack/` y en las skills afectadas, o dice explícitamente "sin aprendizajes".
