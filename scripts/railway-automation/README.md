# Railway Automation Scripts
## Complete Setup for Publishing Platform Clone

---

## Quick Start

```bash
# 1. Set your Railway API token
export RAILWAY_TOKEN="your-token-from-railway-dashboard"

# 2. Make scripts executable
chmod +x railway-*.sh

# 3. Run the master setup (does everything)
./railway-master-setup.sh supportive-rebirth

# 4. Do the ONE manual step (connect GitHub - ~5 min)
#    See: MANUAL-GITHUB-CONNECTION.md

# 5. Verify everything works
./railway-test-connections.sh
```

---

## What's In This Package

| Script | Purpose |
|--------|---------|
| `railway-master-setup.sh` | **Run this first** - orchestrates everything |
| `railway-discover.sh` | Collects project/service info via API |
| `railway-configure.sh` | Sets images, volumes, watch paths via API |
| `railway-full-setup.sh` | Sets all environment variables via CLI |
| `railway-test-connections.sh` | Verifies DB, Redis, queue connections |
| `MANUAL-GITHUB-CONNECTION.md` | Instructions for the ONE manual step |

---

## What Gets Automated

| Task | How | Script |
|------|-----|--------|
| Discover services & IDs | GraphQL API | `railway-discover.sh` |
| Set Docker images | GraphQL API | `railway-configure.sh` |
| Create volumes | GraphQL API | `railway-configure.sh` |
| Set watch paths | GraphQL API | `railway-configure.sh` |
| Set build/start commands | GraphQL API | `railway-configure.sh` |
| Set environment variables | Railway CLI | `railway-full-setup.sh` |
| Connect services (DB, Redis) | Railway CLI | `railway-full-setup.sh` |
| Verify connections | Railway CLI | `railway-test-connections.sh` |

---

## What Requires Manual Action

**ONE thing only:** Connect GitHub repo to app services

This requires browser OAuth (security feature). Takes ~5 minutes.

See `MANUAL-GITHUB-CONNECTION.md` for explicit instructions.

---

## Prerequisites

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Install jq (for JSON parsing)
brew install jq  # macOS
# or: apt-get install jq  # Ubuntu

# Get API token
# Railway Dashboard → Account → Tokens → Create Token
export RAILWAY_TOKEN="your-token"
```

---

## Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Run Master Setup Script                                    │
│  ./railway-master-setup.sh supportive-rebirth                       │
│                                                                     │
│  This runs:                                                         │
│    → railway-discover.sh    (gets project info)                     │
│    → railway-configure.sh   (sets images, volumes, watch paths)     │
│    → railway-full-setup.sh  (sets env vars, connections)            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Connect GitHub (MANUAL - ~5 min)                           │
│                                                                     │
│  For each app service:                                              │
│    Dashboard → Service → Settings → Source → Connect GitHub         │
│    Select: shinejohn/Community-Platform                             │
│    Branch: development                                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Verify                                                     │
│  ./railway-test-connections.sh                                      │
│                                                                     │
│  Checks:                                                            │
│    → Database connection                                            │
│    → Redis connection                                               │
│    → Queue connection                                               │
│    → Environment variables                                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DONE!                                                              │
│                                                                     │
│  • Push to 'development' branch                                     │
│  • Only affected services redeploy (watch paths)                    │
│  • Logs: railway logs -f                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Service Configuration Summary

### Databases
| Service | Image | Volume |
|---------|-------|--------|
| Postgres | `postgres:16-alpine` | `/var/lib/postgresql/data` |
| Valkey | `valkey/valkey:7-alpine` | `/data` |
| Listmonk DB | `postgres:16-alpine` | `/var/lib/postgresql/data` |
| Listmonk | `listmonk/listmonk:latest` | - |

### App Services (Watch Paths)
| Service | Watch Paths |
|---------|-------------|
| GoEventCity | `app/**/GoEventCity/**`, `resources/js/Pages/GoEventCity/**`, `routes/goeventcity.php` |
| Day News | `app/**/DayNews/**`, `resources/js/Pages/DayNews/**`, `routes/daynews.php`, `day-news-app/**` |
| Downtown Guide | `app/**/DowntownGuide/**`, `resources/js/Pages/DowntownGuide/**`, `routes/downtownguide.php` |
| Horizon | `config/horizon.php`, `app/Jobs/**`, `app/Listeners/**` |
| Scheduler | `app/Console/**`, `routes/console.php` |
| Inertia SSR | `resources/js/**`, `resources/css/**`, `package.json`, `vite.config.js` |

---

## Files Generated

After running the scripts:

```
./
├── railway-discovery.json      # Project/service info (from discover)
├── railway-watch-paths.txt     # Watch paths reference (from full-setup)
└── .github/
    └── workflows/
        └── railway-deploy.yml  # GitHub Actions workflow (from full-setup)
```

---

## Troubleshooting

### API Token Issues
```bash
# Test your token
curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { email } }"}' | jq '.'
```

### Service Not Found
```bash
# Check exact service names (case-sensitive)
jq '.services[].name' railway-discovery.json
```

### Connection Failed
```bash
# Check environment variables are set
railway variables --service "GoEventCity" | grep DATABASE
railway variables --service "GoEventCity" | grep REDIS

# Check database is running
railway logs --service Postgres
```

### Deploy Issues
```bash
# Check build logs
railway logs --service "GoEventCity" --build

# Check runtime logs  
railway logs --service "GoEventCity"
```

---

## Support

If scripts fail, check:
1. `RAILWAY_TOKEN` is valid and not expired
2. Project name matches exactly
3. Service names match exactly (case-sensitive)
4. jq is installed
5. Railway CLI is logged in

Re-run discovery if service structure changed:
```bash
./railway-discover.sh supportive-rebirth
```
