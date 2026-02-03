# Railway Setup Checklist
## Publishing Platform Clone: supportive-rebirth

Use this checklist to track your progress through manual setup steps.

---

## Phase 1: Run Automation Script

- [ ] Download `railway-setup.sh` to your machine
- [ ] Make executable: `chmod +x railway-setup.sh`
- [ ] Update configuration at top of script:
  - [ ] `TARGET_PROJECT_NAME` = your project name
  - [ ] `GITHUB_REPO` = your repo
  - [ ] Domain variables
- [ ] Run script: `./railway-setup.sh`
- [ ] Review output for any errors

---

## Phase 2: Database Setup (Railway Dashboard)

### Postgres (Main Database)
- [ ] Go to: Dashboard → Postgres → Settings → Source
- [ ] Set Image: `postgres:16-alpine`
- [ ] Go to: Settings → Volumes
- [ ] Add Volume:
  - Mount Path: `/var/lib/postgresql/data`
  - Size: 1GB (can expand later)
- [ ] Deploy service (click Deploy button)
- [ ] Wait for "Online" status

### Valkey (Redis)
- [ ] Go to: Dashboard → Valkey → Settings → Source
- [ ] Set Image: `valkey/valkey:7-alpine`
- [ ] Go to: Settings → Volumes
- [ ] Add Volume:
  - Mount Path: `/data`
  - Size: 512MB
- [ ] Deploy service
- [ ] Wait for "Online" status

### Listmonk DB (If using Listmonk)
- [ ] Go to: Dashboard → Listmonk DB → Settings → Source
- [ ] Set Image: `postgres:16-alpine`
- [ ] Add Volume: Mount at `/var/lib/postgresql/data`
- [ ] Deploy service

---

## Phase 3: Connect GitHub Repo (Each App Service)

### GoEventCity
- [ ] Dashboard → GoEventCity → Settings → Source
- [ ] Click "Connect GitHub"
- [ ] Select repo: `shinejohn/Community-Platform`
- [ ] Select branch: `development`
- [ ] Go to: Settings → Build
- [ ] Set Watch Paths:
  ```
  app/Http/Controllers/GoEventCity/**
  app/Http/Requests/GoEventCity/**
  app/Services/GoEventCity/**
  resources/js/Pages/GoEventCity/**
  routes/goeventcity.php
  ```
- [ ] Deploy service

### Day News
- [ ] Dashboard → Day News → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  app/Http/Controllers/DayNews/**
  app/Services/DayNews/**
  resources/js/Pages/DayNews/**
  routes/daynews.php
  day-news-app/**
  ```
- [ ] Deploy service

### Downtown Guide
- [ ] Dashboard → Downtown Guide → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  app/Http/Controllers/DowntownGuide/**
  app/Services/DowntownGuide/**
  resources/js/Pages/DowntownGuide/**
  routes/downtownguide.php
  ```
- [ ] Deploy service

### GoLocalVoices
- [ ] Dashboard → GoLocalVoices → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  app/Http/Controllers/DayNews/CreatorController.php
  app/Http/Controllers/DayNews/PodcastController.php
  resources/js/Pages/LocalVoices/**
  routes/local-voices.php
  ```
- [ ] Deploy service

### AlphaSite
- [ ] Dashboard → AlphaSite → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  app/Http/Controllers/AlphaSite/**
  app/Services/AlphaSite/**
  resources/js/Pages/AlphaSite/**
  routes/alphasite.php
  ```
- [ ] Deploy service

### Horizon
- [ ] Dashboard → Horizon → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  config/horizon.php
  app/Jobs/**
  app/Listeners/**
  ```
- [ ] Set Start Command: `php artisan horizon`
- [ ] Deploy service

### Scheduler
- [ ] Dashboard → Scheduler → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  app/Console/Kernel.php
  app/Console/Commands/**
  routes/console.php
  ```
- [ ] Set Start Command: `php artisan schedule:work`
- [ ] Deploy service

### Inertia SSR
- [ ] Dashboard → Inertia SSR → Settings → Source
- [ ] Connect GitHub → Select repo → Branch: `development`
- [ ] Set Watch Paths:
  ```
  resources/js/**
  resources/css/**
  package.json
  vite.config.js
  ```
- [ ] Set Start Command: `node bootstrap/ssr/ssr.mjs`
- [ ] (Optional) Set replicas to 2 in Scaling settings
- [ ] Deploy service

---

## Phase 4: Listmonk Setup (Optional)

- [ ] Dashboard → Listmonk → Settings → Source
- [ ] Set Image: `listmonk/listmonk:latest`
- [ ] Set environment variables:
  ```
  LISTMONK_app__address=0.0.0.0:9000
  LISTMONK_db__host=${{Listmonk DB.PGHOST}}
  LISTMONK_db__port=5432
  LISTMONK_db__user=${{Listmonk DB.PGUSER}}
  LISTMONK_db__password=${{Listmonk DB.PGPASSWORD}}
  LISTMONK_db__database=${{Listmonk DB.PGDATABASE}}
  ```
- [ ] Deploy service

---

## Phase 5: Verification

- [ ] All services show "Online" in dashboard
- [ ] Run verification script: `./railway-verify.sh`
- [ ] Test database connection:
  ```bash
  railway run php artisan db:show --service GoEventCity
  ```
- [ ] Run migrations:
  ```bash
  railway run php artisan migrate --service GoEventCity
  ```
- [ ] Check logs for errors:
  ```bash
  railway logs -f
  ```
- [ ] Visit each app URL and verify it loads

---

## Phase 6: Test Segmented Deploys

- [ ] Make a small change to `app/Http/Controllers/GoEventCity/` 
- [ ] Commit and push to `development` branch
- [ ] Verify ONLY GoEventCity redeploys (not other services)
- [ ] Check deploy logs confirm watch paths working

---

## Troubleshooting

### Service won't start
```bash
railway logs -s ServiceName --build  # Check build logs
railway logs -s ServiceName          # Check runtime logs
```

### Database connection failed
```bash
railway variables --service GoEventCity | grep DATABASE
# Verify DATABASE_URL is set correctly
```

### Redis connection failed
```bash
railway variables --service GoEventCity | grep REDIS
# Verify REDIS_URL is set correctly
```

### Build failed
- Check that `development` branch exists
- Check that branch has been pushed to GitHub
- Check build logs for specific errors

---

## Notes

Add your own notes here as you complete setup:

```




```

---

## Sign-off

- [ ] All services deployed and running
- [ ] Segmented deploys verified
- [ ] Ready for development

**Completed by:** _________________ **Date:** _________________
