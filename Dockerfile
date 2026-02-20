FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py .
COPY knowledge/ knowledge/
COPY config/ config/
COPY start.sh .

RUN mkdir -p /app/data && chmod +x start.sh

ENV PYTHONUNBUFFERED=1
ENV CORTEX_KNOWLEDGE_DIR=/app/knowledge
ENV CORTEX_CONFIG_DIR=/app/config
ENV CORTEX_DB_PATH=/app/data/cortex.db

EXPOSE 8080

CMD ["./start.sh"]
