---
name: turnos
description: Reservas de turnos con agenda configurable y horarios libres validados en el servidor.
---

# turnos

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

La app ofrece reservas (barbería, consultorio, clases).

## Paquetes

`packages/bookings`. Leé su README.

## Criterios de aceptación

- Dos reservas al mismo horario y recurso: la segunda recibe 409.
- La API pública muestra solo horarios ocupados.

## Errores conocidos

- "Hoy" y "ahora" se calculan en hora de Buenos Aires.

## Referencia

Titán `api/appointments/*`.
