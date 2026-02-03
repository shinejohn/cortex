# GitHub Connection Instructions
## The ONLY Manual Step

Everything else has been automated. This one step requires browser OAuth and **cannot be automated** by any script, CLI, or API.

**Time required: ~5 minutes total**

---

## Why This Can't Be Automated

GitHub OAuth requires:
1. Browser redirect to GitHub
2. User clicks "Authorize"
3. GitHub redirects back to Railway

This is a security feature. No API token can bypass it.

---

## Step-by-Step Instructions

### Open Railway Dashboard
```
https://railway.app/project/[your-project-id]
```

Or via CLI:
```bash
railway open
```

---

### For Each Service Below, Do This:

**Services to connect:**
- [ ] GoEventCity
- [ ] Day News
- [ ] Downtown Guide
- [ ] Horizon
- [ ] Scheduler
- [ ] Inertia SSR

**For each service:**

1. **Click the service** in the Railway dashboard

2. **Go to Settings → Source**

3. **Click "Connect GitHub"**
   - If you haven't connected GitHub to Railway before, you'll authorize the Railway GitHub App

4. **Select Repository**
   ```
   Repository: shinejohn/Community-Platform
   Branch: development
   ```

5. **Click Connect** or **Save**

6. **Service will auto-deploy** once connected

---

## Fastest Method (6 browser tabs)

1. Open 6 browser tabs, one for each service:
   - `https://railway.app/project/[project-id]/service/[goeventcity-id]/settings`
   - `https://railway.app/project/[project-id]/service/[daynews-id]/settings`
   - `https://railway.app/project/[project-id]/service/[downtown-id]/settings`
   - `https://railway.app/project/[project-id]/service/[horizon-id]/settings`
   - `https://railway.app/project/[project-id]/service/[scheduler-id]/settings`
   - `https://railway.app/project/[project-id]/service/[ssr-id]/settings`

2. In each tab:
   - Click Source section
   - Connect GitHub
   - Select repo + branch
   - Save

3. Done in ~5 minutes

---

## Service IDs (from discovery)

After running `railway-discover.sh`, check `railway-discovery.json` for service IDs:

```bash
jq '.services[] | "\(.name): \(.id)"' railway-discovery.json
```

---

## Verification

After connecting all services:

```bash
# Check services are deploying
railway status

# Watch logs
railway logs -f

# Run connection test
./railway-test-connections.sh
```

---

## Troubleshooting

### "Repository not found"
- Make sure the repo is public OR
- Make sure Railway GitHub App has access to the repo
- Check: GitHub → Settings → Applications → Railway → Configure

### "Branch not found"
- Create the branch first:
  ```bash
  git checkout -b development
  git push -u origin development
  ```

### "Permission denied"
- Disconnect and reconnect Railway GitHub App
- GitHub → Settings → Applications → Railway → Revoke → Reconnect

---

## That's It

Once GitHub is connected to all 6 services:
- ✓ Everything is fully configured
- ✓ Services will auto-deploy on push
- ✓ Watch paths enable segmented deploys
- ✓ All connections are working

No more manual steps ever. Push to `development` branch and only affected services redeploy.
