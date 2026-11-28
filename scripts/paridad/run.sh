#!/usr/bin/env bash
# Paridad: compara una app del monorepo contra el repo original del que salió.
# Levanta las dos con el mismo Blob simulado (cada una con su carpeta vacía), las mismas variables de prueba,
# y corre apps/<app>/paridad/*.cjs con REF_URL (original) y NEW_URL (monorepo). Cada script termina con
# código 1 si encuentra alguna diferencia.
# Uso: scripts/paridad/run.sh <app> <carpeta-del-repo-original>
#      scripts/paridad/run.sh puerto-chill ../tienda-chill
set -euo pipefail
APP="${1:?Uso: scripts/paridad/run.sh <app> <repo-original>}"
REF="$(cd "${2:?Falta la carpeta del repo original}" && pwd)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REF_PORT="${REF_PORT:-3321}"
NEW_PORT="${NEW_PORT:-3322}"
TMP="$(mktemp -d)"
PIDS=()

swap() { # $1 = node_modules donde está @vercel/blob
  local real="$1/@vercel/blob" backup="$1/.vercel-blob-real"
  [ -d "$backup" ] || mv "$real" "$backup"
  rm -rf "$real"; cp -r "$ROOT/scripts/e2e/blob-mock" "$real"; cp "$backup"/dist/*.d.ts "$real/dist/"
}
unswap() { local real="$1/@vercel/blob" backup="$1/.vercel-blob-real"; if [ -d "$backup" ]; then rm -rf "$real"; mv "$backup" "$real"; fi; }
cleanup() {
  for p in "${PIDS[@]:-}"; do [ -n "$p" ] && { pkill -P "$p" 2>/dev/null; kill "$p" 2>/dev/null; } || true; done
  for port in "$REF_PORT" "$NEW_PORT"; do command -v fuser > /dev/null && fuser -k "$port/tcp" > /dev/null 2>&1 || true; done
  unswap "$REF/node_modules"; unswap "$ROOT/node_modules"
  rm -rf "$TMP"
}
trap cleanup EXIT

for port in "$REF_PORT" "$NEW_PORT"; do
  if curl -s "localhost:$port" > /dev/null 2>&1; then echo "El puerto $port ya está en uso"; exit 1; fi
done
[ -d "$REF/node_modules" ] || (cd "$REF" && npm ci --no-audit --no-fund > /dev/null)
swap "$REF/node_modules"; swap "$ROOT/node_modules"

export BLOB_READ_WRITE_TOKEN=mock ADMIN_PASSWORD=clave-paridad
start() { # $1 dir, $2 port, $3 nombre
  mkdir -p "$TMP/$3"
  (cd "$1" && rm -rf .next && BLOB_MOCK_DIR="$TMP/$3/blob" npx next build > "$TMP/$3/build.log" 2>&1) || { cat "$TMP/$3/build.log"; exit 1; }
  # tabla de rutas del build (estáticas / dinámicas) para comparar
  sed -n '/^Route/,/^$/p' "$TMP/$3/build.log" | sed -E 's/[0-9.]+ ?[kM]?B//g; s/ +$//' > "$TMP/$3/routes.txt"
  (cd "$1" && BLOB_MOCK_DIR="$TMP/$3/blob" exec npx next start -p "$2" > "$TMP/$3/server.log" 2>&1) &
  PIDS+=($!)
}
start "$REF" "$REF_PORT" ref
start "$ROOT/apps/$APP" "$NEW_PORT" new
for port in "$REF_PORT" "$NEW_PORT"; do
  for _ in $(seq 1 40); do curl -s -o /dev/null "localhost:$port/" && break; sleep 1; done
done

FAIL=0
echo "== rutas del build"
if diff "$TMP/ref/routes.txt" "$TMP/new/routes.txt"; then echo "✓ mismas rutas y mismo tipo (estática/dinámica)"; else FAIL=1; fi

export REF_URL="http://localhost:$REF_PORT" NEW_URL="http://localhost:$NEW_PORT" ADMIN_PASSWORD
mkdir -p "$ROOT/apps/$APP/paridad-out"
export PARIDAD_OUT="$ROOT/apps/$APP/paridad-out"
for t in "$ROOT/apps/$APP"/paridad/*.cjs; do echo "== $(basename "$t")"; node "$t" || FAIL=1; done
if [ "$FAIL" = 0 ]; then echo "PARIDAD OK"; else echo "HAY DIFERENCIAS (ver arriba y $PARIDAD_OUT)"; fi
exit "$FAIL"
