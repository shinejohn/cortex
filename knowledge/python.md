# Python Deployment Reference

## Railway Python
- Detected via requirements.txt, pyproject.toml, or Pipfile
- Nixpacks installs dependencies automatically
- Start command: typically `uvicorn main:app --host 0.0.0.0 --port $PORT` or `gunicorn`

## Common Issues

### "ModuleNotFoundError"
- Package missing from requirements.txt
- Using dev dependency in production
- Virtual env not activated (Railway handles this via Nixpacks)

### "Address already in use"
- Bind to 0.0.0.0 and use $PORT from environment

### "Worker timeout" (Gunicorn)
- Increase timeout: `--timeout 120`
- Or switch to uvicorn for async apps
- Check for blocking I/O in async context

## FastAPI Specifics
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Workers: `--workers 4` for production (CPU-bound)
- Async: use `async def` for I/O-bound endpoints
- Background tasks: use FastAPI BackgroundTasks or Celery

## Django Specifics
- Start: `gunicorn project.wsgi --bind 0.0.0.0:$PORT`
- Static files: `python manage.py collectstatic --noinput` in build
- Migrations: `python manage.py migrate` in build or deploy hook
- ALLOWED_HOSTS must include Railway domain
