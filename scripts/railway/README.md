# Railway Setup Scripts

This directory contains scripts and documentation for setting up Railway deployment for the multisite platform.

## Files

- **railway-setup.sh** - Main setup script (executable)
  - Configures environment variables for all services
  - Links to Railway project
  - Generates Railway config files
  - Provides manual setup instructions

- **railway-verify.sh** - Verification script (executable)
  - Checks Railway CLI authentication
  - Verifies project link
  - Tests service configurations
  - Validates database and Redis connections

- **railway-setup-checklist.md** - Step-by-step checklist
  - Manual setup steps
  - Database configuration
  - GitHub repository connections
  - Watch paths for each service

- **SETUP_STATUS.md** - Current setup status
  - What's been completed automatically
  - What requires manual steps
  - Next steps

## Quick Start

### 1. Authenticate Railway CLI
```bash
railway login
```

### 2. Run Setup Script
```bash
cd scripts/railway
./railway-setup.sh
```

This will:
- Check prerequisites
- Link to the Railway project
- Set environment variables for all services
- Generate Railway configuration files
- Provide instructions for manual steps

### 3. Complete Manual Steps

Follow the instructions provided by the setup script, or refer to:
- `railway-setup-checklist.md` for detailed steps
- `SETUP_STATUS.md` for current status

### 4. Verify Setup
```bash
cd scripts/railway
./railway-verify.sh
```

## Services Configured

The setup script configures these services:

1. **GoEventCity** - Main event platform
2. **Day News** - News platform
3. **Downtown Guide** - Business directory
4. **GoLocalVoices** - Local voices/podcast platform
5. **AlphaSite** - Business page generation
6. **Horizon** - Queue worker
7. **Scheduler** - Cron jobs
8. **Inertia SSR** - Server-side rendering

## Configuration

Edit `railway-setup.sh` to update:
- `TARGET_PROJECT_NAME` - Railway project name
- `GITHUB_REPO` - GitHub repository
- `GITHUB_BRANCH` - Branch to deploy
- Domain configurations

## Troubleshooting

### Railway CLI Not Authenticated
```bash
railway login
# Follow browser authentication
```

### Service Not Found
- Verify service names match exactly (case-sensitive)
- Check Railway dashboard for actual service names

### Environment Variables Not Set
- Run setup script after authentication
- Or set manually in Railway dashboard

### Build Failures
- Check GitHub repo connection
- Verify branch exists
- Review build logs in Railway dashboard

## Related Documentation

- `RAILWAY_SETUP.md` (project root) - Comprehensive setup guide
- `railway.json` (project root) - Railway deployment configuration
