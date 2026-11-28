# Plan (resumen)

Documento completo: https://claude.ai/artifact/2Y9fuyF8pa5rtGx9CGqbhF

1. Stack único para sitios nuevos: Next.js 16 + TypeScript + Tailwind 4 + Vercel Blob privado.
2. Monorepo privado `neri-sw/nexora`: `apps/<cliente>` (solo pantallas, marca y config) + `packages/*` (lógica de negocio compartida).
3. Un proyecto de Vercel por app, carpeta raíz `apps/<cliente>`, preview por PR.
4. Las skills apuntan al README de cada paquete (el contrato); no explican cómo está hecho por dentro.
5. El stack aprende entre sesiones: cada sesión cierra con `mejorar-stack` (LEARNINGS, BACKLOG, DECISIONS, corrección de skills y paquetes).
6. Proceso PDF → sitio en 1 a 3 iteraciones: intake (`pdf-a-brief`), iteración 1 sitio completo en preview, iteración 2 correcciones + datos reales + checklist `prototipo-a-produccion`, iteración 3 opcional.

## Fases

| Fase | Qué | Pase |
| --- | --- | --- |
| 0 | Plan + este esqueleto | Neri aprueba el plan |
| 1 | Extraer `state`, `auth`, `api`, `commerce`, `media`, `admin-sync` desde Puerto Chill con tests; mudar Puerto Chill a `apps/puerto-chill` | Puerto Chill en producción desde nexora sin cambios visibles |
| 2 | Skills completas + piloto con un PDF nuevo | Sitio en producción en ≤ 3 iteraciones |
| 3 | Pagos: interfaz `PaymentProvider`, Mercado Pago Checkout Pro | Un cliente cobra 2 semanas sin intervención |
| 4 | WhatsApp y avisos: wa.me → mail al dueño → WhatsApp Cloud API | El dueño se entera de pedidos sin abrir el panel |
| 5 | Estabilidad: backups, alertas, rate limit compartido, `StateStore` | Un mes sin pérdida de datos |
| 6 | Titán: migrar o dejar como legado | Decisión de Neri |
