# Railway Deployment Reference

## How Railway Works
- Railway runs your code in Docker containers on shared infrastructure
- Each service gets its own container, networking, and environment variables
- Services communicate via private networking (servicename.railway.internal)
- Deployments are triggered by git push or manual redeploy

## Environment Variables
- Railway auto-injects: RAILWAY_PUBLIC_DOMAIN, RAILWAY_PRIVATE_DOMAIN, RAILWAY_ENVIRONMENT, PORT
- Use Railway references to share variables: `${{ServiceName.VARIABLE_NAME}}`
- NEVER hardcode connection strings — always use references
- PORT must be respected: Railway sets it, your app must listen on it

## Common Railway Issues

### "Service won't start"
1. Check PORT — app must bind to $PORT, not a hardcoded port
2. Check build logs — dependency install failures are common
3. Check start command — Railway uses Nixpacks to detect, but explicit is better
4. Check health check — if configured, Railway will kill containers that fail it

### "Service crashes after deploy"
1. Check if environment variables changed or were removed
2. Check recent commits for breaking changes
3. Check memory usage — Railway has memory limits per plan
4. Look at deploy logs for OOM kills or signal errors

### "Database connection refused"
1. Use Railway reference variables: `${{Postgres.DATABASE_URL}}`
2. Don't hardcode IPs — Railway internal IPs change on redeploy
3. Check if database service is actually running
4. For Postgres: ensure PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE are set correctly
5. Connection string format: `postgresql://user:pass@host:port/dbname`

### "Redis connection failed"
1. Use `${{Redis.REDIS_URL}}` reference
2. Redis on Railway uses default port 6379 on private network
3. Check if Redis service exists and is deployed
4. For Laravel: set REDIS_HOST to `${{Redis.RAILWAY_PRIVATE_DOMAIN}}`

### "502 Bad Gateway / Service unavailable"
1. App isn't listening on the right PORT
2. App crashed during startup (check deploy logs)
3. Health check is failing
4. App is taking too long to start (increase start timeout)

### "Build failed"
1. Missing system dependencies — add a nixpacks.toml or Dockerfile
2. Lock file conflicts — delete lock file and regenerate
3. Node: check node version in package.json engines field
4. PHP: check composer.json php version constraint

## Railway Private Networking
- Services reach each other via: `servicename.railway.internal`
- Port is the service's internal port (not 443)
- Example: `http://api.railway.internal:3000`
- Private networking only works between services in the same project+environment

## Railway Volumes
- Persistent storage that survives redeploys
- Mount path must be configured in service settings
- If a service expects persistent files (uploads, SQLite), it needs a volume
- Volumes are per-environment, not shared across environments

## Deployment Strategies
- Railway deploys on every git push to the connected branch
- Rollback = redeploy a previous successful deployment
- Zero-downtime: Railway starts new container, health checks it, then stops old one
- If health check isn't configured, Railway just swaps immediately

## Railway CLI
- `railway login` — authenticate
- `railway link` — connect to a project
- `railway up` — deploy from local
- `railway logs` — stream logs
- `railway variables` — manage env vars
- `railway run <command>` — run command with Railway env vars injected
