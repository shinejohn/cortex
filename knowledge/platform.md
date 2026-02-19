# Our Platform Architecture

> Edit this file to describe YOUR specific platform. Cortex includes this
> in every diagnosis so Claude understands your architecture, conventions,
> and known quirks. The more detail here, the better Claude's diagnosis.

## Services Overview
<!-- List your services and what they do -->
- **Day News** — Main news publishing site (Laravel + Vue)
- **GoEventCity** — Event listing platform (Laravel)
- **Go Local Voices** — Community content platform (Laravel)
- **Downtown Guide** — Local business directory (Laravel)
- **Alphasite** — Development/staging environment
- **Horizon** — Queue worker for all Laravel apps (shared Redis)
- **Postgres** — Shared PostgreSQL database
- **Redis** — Shared cache and queue backend

## Architecture Patterns
<!-- How your services connect and communicate -->
- All Laravel apps share one Postgres instance
- All Laravel apps share one Redis instance (cache + queues)
- Horizon runs as a separate Railway service processing queues for all apps
- Each app has its own GitHub repo and Railway service
- Frontend is Vue 3 + Vite + Tailwind, bundled with Laravel (not separate SPA)

## Deployment Conventions
<!-- How you deploy, what the workflow looks like -->
- Push to main triggers Railway deploy
- Build: composer install → npm install → npm run build → artisan optimize → migrate
- No manual deployments — always through git
- PRs reviewed before merge

## Known Quirks
<!-- Things that break regularly or need special handling -->
- Redis connection sometimes drops after Railway maintenance — restart Horizon
- Postgres connection string must use Railway references, not hardcoded IPs
- Vite build occasionally fails on low-memory — may need NODE_OPTIONS=--max-old-space-size=4096
- APP_KEY rotation requires clearing all sessions

## Team Conventions
<!-- Coding patterns, naming, structure -->
- Laravel follows standard directory structure
- API routes in routes/api.php, web routes in routes/web.php
- Vue components in resources/js/components/
- Tailwind for all styling, no custom CSS unless absolutely necessary
- Environment-specific config via .env, never committed
