#!/bin/sh
set -e
# Always use 8000 — matches EXPOSE and Railway public domain target port
PORT=8000
echo "Starting Cortex on 0.0.0.0:${PORT}"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
