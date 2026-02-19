#!/bin/sh
set -e
PORT="${PORT:-8000}"
echo "Starting Cortex on 0.0.0.0:${PORT}"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
