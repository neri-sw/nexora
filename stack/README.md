# Nexora: monorepo de sitios

Monorepo privado de los sitios de clientes de Neri. Las páginas de cada cliente viven en `apps/`; la lógica de negocio que todas comparten vive en `packages/`; las skills que saben usar esos paquetes viven en `.claude/skills/`. La app de gestión de proyectos (raíz del repo) se muda a `apps/gestion` en un paso posterior.

- Plan completo: https://claude.ai/artifact/2Y9fuyF8pa5rtGx9CGqbhF (copia resumida en `PLAN.md`).
- Estado: **Fase 0** (esqueleto). Los paquetes todavía son contratos en README; el código se extrae en la Fase 1, después de que Neri apruebe el plan.

## Estructura

| Carpeta | Qué hay |
| --- | --- |
| `apps/<cliente>/` | Un sitio Next.js por cliente: pantallas, marca, `site.config.ts`, `content.schema.ts`. Sin lógica de negocio propia. |
| `packages/<modulo>/` | Lógica de negocio compartida. Cada uno con `README.md` (contrato), `CHANGELOG.md` y tests. |
| `.claude/skills/` | Skills orquestadas. Empezar siempre por `stack-orquestador`. |
| `stack/` | Memoria del producto entre sesiones: `LEARNINGS.md`, `BACKLOG.md`, `DECISIONS.md`. |
| `templates/app/` | Punto de partida de una app nueva. |
| `clients/` | Ficha por cliente: proyecto de Vercel, URLs, módulos, personalizaciones, iteraciones. |
| `scripts/` | `new-app`, `check`. |

## Deploy

Un proyecto de Vercel por app, conectado a este repo con carpeta raíz `apps/<cliente>` e "Ignored Build Step" (`npx turbo-ignore`) para compilar solo si cambió esa app o un paquete que usa. Preview en cada PR; producción al mergear a `main`, con OK de Neri.
