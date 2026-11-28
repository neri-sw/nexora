#!/usr/bin/env bash
# Recorrido de punta a punta de una app con Blob simulado en disco.
# Uso: scripts/e2e/run.sh <app>        (por ejemplo: scripts/e2e/run.sh puerto-chill)
# Requiere Playwright con Chromium disponible. Corre apps/<app>/e2e/*.cjs contra `next start`.
set -euo pipefail
APP="${1:?Uso: scripts/e2e/run.sh <app>}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REAL="$ROOT/node_modules/@vercel/blob"
BACKUP="$ROOT/node_modules/.vercel-blob-real"
DATA="$(mktemp -d)"
PORT="${PORT:-3311}"

restore() {
  [ -n "${PID:-}" ] && { pkill -P "$PID" 2>/dev/null; kill "$PID" 2>/dev/null; } || true
  # next start deja un proceso next-server hijo: se corta por el puerto
  command -v fuser > /dev/null && fuser -k "$PORT/tcp" > /dev/null 2>&1 || pkill -f "next-server" 2>/dev/null || true
  if [ -d "$BACKUP" ]; then rm -rf "$REAL"; mv "$BACKUP" "$REAL"; fi
  rm -rf "$DATA"
}
trap restore EXIT

if curl -s "localhost:$PORT" > /dev/null 2>&1; then echo "El puerto $PORT ya está en uso"; exit 1; fi

# 1. Blob simulado (con los tipos reales para que compile)
mv "$REAL" "$BACKUP"
cp -r "$ROOT/scripts/e2e/blob-mock" "$REAL"
cp "$BACKUP"/dist/*.d.ts "$REAL/dist/"

# 2. Build y servidor con variables de prueba (nunca las reales)
export BLOB_READ_WRITE_TOKEN=mock ADMIN_PASSWORD=clave-e2e BLOB_MOCK_DIR="$DATA" E2E_URL="http://localhost:$PORT"
# panel escondido como en producción (ver @nexora/auth gate); ADMIN_PATH= vacío para probar sin esconder
export ADMIN_PATH="${ADMIN_PATH-panel-e2e-k3x9q2m7}"
cd "$ROOT/apps/$APP"
rm -rf .next
npx next build > /dev/null
npx next start -p "$PORT" > "$DATA/server.log" 2>&1 &
PID=$!
for _ in $(seq 1 30); do curl -sf "localhost:$PORT/api/state" > /dev/null && break; sleep 1; done

# 3. Recorridos
mkdir -p e2e-out
for t in e2e/*.cjs; do echo "== $t"; node "$t"; done
