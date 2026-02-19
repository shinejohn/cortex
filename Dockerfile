FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py .
COPY knowledge/ knowledge/
COPY config/ config/

ENV CORTEX_KNOWLEDGE_DIR=/app/knowledge
ENV CORTEX_CONFIG_DIR=/app/config
ENV CORTEX_DB_PATH=/data/cortex.db

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
