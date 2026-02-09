# Supervisord Permission Error Fix

## Problem
The API server was failing with repeated permission errors:
```
PermissionError: [Errno 13] Permission denied: '/var/log/supervisord.log'
```

This occurred because:
1. Docker container runs as non-root user (security best practice)
2. Supervisord was configured to write to `/var/log/` and `/var/run/` (root-owned directories)
3. Non-root user cannot write to these system directories

## Solution Applied

### Fixed: `docker/standalone/etc/supervisor/supervisord.conf`

**Changes Made:**
1. **Log output** → `/dev/stdout` (Docker standard, captured by Railway logs)
2. **PID file** → `/tmp/supervisord.pid` (writable by non-root users)
3. **Socket file** → `/tmp/supervisor.sock` (writable by non-root users)

**Before:**
```ini
[supervisord]
logfile=/var/log/supervisord.log        # ❌ Permission denied
pidfile=/var/run/supervisord.pid        # ❌ Permission denied

[unix_http_server]
file=/var/run/supervisor.sock           # ❌ Permission denied

[supervisorctl]
serverurl=unix:///var/run/supervisor.sock
```

**After:**
```ini
[supervisord]
logfile=/dev/stdout                     # ✅ Railway captures this
logfile_maxbytes=0
pidfile=/tmp/supervisord.pid            # ✅ /tmp is writable

[unix_http_server]
file=/tmp/supervisor.sock               # ✅ /tmp is writable

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock
```

### Already Correct

The service-specific configs are fine:
- ✅ `conf.d/horizon.conf` → logs to `/var/www/html/storage/logs/`
- ✅ `conf.d/scheduler.conf` → logs to `/var/www/html/storage/logs/`
- ✅ `conf.d/ssr.conf` → logs to `/var/www/html/storage/logs/`

## Benefits

1. **Logs visible in Railway dashboard** - stdout/stderr captured automatically
2. **No permission errors** - `/tmp` is writable by all users
3. **Docker best practices** - doesn't require root privileges
4. **Railway compatible** - follows 12-factor app logging principles

## Next Steps

1. **Commit the change:**
   ```bash
   git add docker/standalone/etc/supervisor/supervisord.conf
   git commit -m "Fix supervisord permission errors for Railway deployment"
   ```

2. **Deploy to Railway:**
   - Railway will automatically rebuild with the fixed configuration
   - The permission errors will stop
   - Logs will appear in Railway dashboard

3. **Verify:**
   - Check Railway logs after deployment
   - Should see supervisord starting successfully
   - No more `PermissionError` spam

## Technical Details

**Why `/dev/stdout`?**
- Docker captures stdout/stderr automatically
- Railway displays these in the logs dashboard
- No disk I/O required
- `logfile_maxbytes=0` prevents rotation (not needed for stdout)

**Why `/tmp`?**
- Writable by all users
- Temporary by nature (appropriate for PID/socket files)
- Standard location for non-privileged process files

**Railway Compatibility:**
- Railway expects logs on stdout/stderr
- PID files in `/tmp` work with Railway's container orchestration
- No special permissions or volumes needed

## Verification Commands

After deployment, verify fix worked:

```bash
# Check Railway logs - should see supervisord starting
railway logs

# Should see something like:
# [inf] 2026-02-08 15:45:00 [INFO] supervisord started with pid 1
# [inf] 2026-02-08 15:45:00 [INFO] spawned: 'horizon' with pid 7
# [inf] 2026-02-08 15:45:00 [INFO] spawned: 'scheduler' with pid 8
```

## Related Files
- `docker/standalone/etc/supervisor/supervisord.conf` ✅ **FIXED**
- `docker/standalone/etc/supervisor/conf.d/horizon.conf` ✅ Already correct
- `docker/standalone/etc/supervisor/conf.d/scheduler.conf` ✅ Already correct
- `docker/standalone/etc/supervisor/conf.d/ssr.conf` ✅ Already correct
