# SSR Setup for Railway

## Overview
SSR (Server-Side Rendering) is enabled and configured to run in the same container as the Laravel application using Supervisor.

## Configuration

### 1. Environment Variables ✅ **SET**

All services have:
- `INERTIA_SSR_ENABLED=true`
- `INERTIA_SSR_URL=http://127.0.0.1:13714`

### 2. Supervisor Configuration ✅ **ADDED**

Created `docker/standalone/etc/supervisor/conf.d/inertia-ssr.conf`:
- Runs `php artisan inertia:start-ssr`
- Auto-starts and auto-restarts
- Logs to `storage/logs/inertia-ssr.log`
- Runs as `www-data` user

### 3. Dockerfile Build ✅ **FIXED**

- Builds both client and SSR bundles: `bun run build:ssr`
- SSR bundle is required (build will fail if SSR build fails)
- SSR directory is copied to final image

## How It Works

1. **Build Time:**
   - `bun run build:ssr` builds both client and SSR bundles
   - SSR bundle is created in `bootstrap/ssr/`

2. **Runtime:**
   - Supervisor starts the SSR server: `php artisan inertia:start-ssr`
   - SSR server listens on `http://127.0.0.1:13714`
   - Laravel connects to SSR server for server-side rendering
   - Both run in the same container

## Process Management

Supervisor manages:
- **Horizon** - Queue worker
- **Inertia SSR** - SSR server

Both processes run alongside PHP-FPM/Nginx in the same container.

## Monitoring

SSR logs are available at:
- `storage/logs/inertia-ssr.log`

Check SSR status:
```bash
supervisorctl status inertia-ssr
```

## Troubleshooting

If SSR fails to start:
1. Check logs: `tail -f storage/logs/inertia-ssr.log`
2. Verify SSR bundle exists: `ls -la bootstrap/ssr/`
3. Check supervisor status: `supervisorctl status`
4. Restart SSR: `supervisorctl restart inertia-ssr`

## Expected Behavior

- ✅ SSR server starts automatically
- ✅ SSR server restarts if it crashes
- ✅ Laravel can connect to SSR server
- ✅ Pages are server-side rendered
- ✅ SEO benefits from SSR
