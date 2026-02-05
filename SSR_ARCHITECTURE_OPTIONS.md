# SSR Architecture Options

## Current Setup: Same Container (Supervisor)

**Architecture:**
- SSR runs via Supervisor in the SAME container as the main app
- Supervisor starts: `php artisan inertia:start-ssr`
- SSR server listens on `127.0.0.1:13714` (localhost)
- Laravel app connects to SSR via `http://127.0.0.1:13714`

**Pros:**
- ✅ Simpler setup (one container)
- ✅ Lower cost (one service)
- ✅ Faster communication (localhost)

**Cons:**
- ❌ Can't scale SSR independently
- ❌ SSR crash affects main app
- ❌ Resource sharing

**Current Config:**
```
INERTIA_SSR_URL=http://127.0.0.1:13714
```

## Alternative: Separate Railway Service

**Architecture:**
- SSR runs in a SEPARATE Railway service
- Each app service connects to SSR via Railway internal network
- SSR service name: `inertia-ssr` (or similar)
- Laravel app connects via `http://inertia-ssr.railway.internal:13714`

**Pros:**
- ✅ Can scale SSR independently
- ✅ SSR crash doesn't affect main app
- ✅ Better resource isolation

**Cons:**
- ❌ More complex setup
- ❌ Higher cost (additional service)
- ❌ Network latency (internal network)

**Alternative Config:**
```
INERTIA_SSR_URL=http://inertia-ssr.railway.internal:13714
```

## Recommendation

**For Railway deployment, keep the current setup** (`127.0.0.1:13714`) because:
1. SSR is lightweight and doesn't need separate scaling
2. Same-container setup is simpler and more cost-effective
3. Localhost communication is faster

**Only switch to separate service if:**
- You need to scale SSR independently
- SSR is resource-intensive
- You want better isolation

## Current Status

All services are configured with:
- `INERTIA_SSR_ENABLED=true`
- `INERTIA_SSR_URL=http://127.0.0.1:13714`

This is correct for the Supervisor-based same-container architecture.
