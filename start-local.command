#!/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  codex_runtime="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
  if [ -x "$codex_runtime/node/bin/node" ]; then
    export PATH="$codex_runtime/node/bin:$codex_runtime/bin/fallback:$PATH"
  fi
fi
if command -v pnpm >/dev/null 2>&1; then
  if [ ! -d node_modules/vite ]; then pnpm install --frozen-lockfile; fi
  exec pnpm dev --port 5173
elif command -v npm >/dev/null 2>&1; then
  if [ ! -d node_modules/vite ]; then npm install; fi
  exec npm run dev -- --port 5173
else
  echo 'Cần Node.js và pnpm hoặc npm để chạy website.'
  read -r -p 'Nhấn Enter để đóng.'
fi
