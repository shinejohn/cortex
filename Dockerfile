FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py .
COPY knowledge/ knowledge/
COPY config/ config/

RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV CORTEX_KNOWLEDGE_DIR=/app/knowledge
ENV CORTEX_CONFIG_DIR=/app/config
ENV CORTEX_DB_PATH=/app/data/cortex.db

EXPOSE 8080

# Bind 0.0.0.0:8080 — Railway routes to this port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
