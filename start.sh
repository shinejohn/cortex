#!/bin/sh
set -e
# Use Railway's PORT (default 8080) — domain target port must match in Settings → Networking
PORT="${PORT:-8080}"
echo "Starting Cortex on 0.0.0.0:${PORT}"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
