# scripts/

- `e2e/run.sh <app>`: recorrido de punta a punta con Blob simulado (ver skill `qa-e2e`).
- `paridad/run.sh <app> <repo-original>`: compara la app de nexora contra el sitio del que salió, respuesta por respuesta y captura por captura (ver skill `qa-e2e`).

Pendientes de la Fase 1:

- `new-app <cliente>`: copia `templates/app` a `apps/<cliente>`, crea `clients/<cliente>.md` y deja el checklist de la skill `sitio-nuevo`.
- `check`: `npm run check` (tests de paquetes + build y lint de todas las apps).
