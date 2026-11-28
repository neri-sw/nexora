# @nexora/bookings

Turnos y horarios.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- Configuración de agenda (horario, duración del turno, pausa, días).
- `POST /api/appointments` con horario libre validado en el servidor; `POST /api/appointments/cancel` con `{ id, phone }`.
- Vista pública: solo `busy: [{ date, time, resourceId }]`.

## Qué garantiza

- Nunca dos turnos en el mismo horario y recurso.
- El público nunca ve nombres ni teléfonos.

## Se extrae de

Titán `api/appointments/*`, `api/_blob-state.js` (slotTimes, localNow)

## Errores conocidos

- Calcular "hoy" y "ahora" en hora de Buenos Aires.
