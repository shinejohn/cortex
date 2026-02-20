# Cortex V6

Platform intelligence for Railway. Monitors your services, diagnoses problems using Claude, and fixes what it can.

## What It Does

1. **Discovers** your entire Railway project — services, variables, code, dependencies, topology
2. **Monitors** health endpoints on a loop
3. **Diagnoses** failures using iterative conversation with Claude (not one-shot prompts)
4. **Acts** within configured autonomy — restarts, variable fixes, rollbacks, pull requests
5. **Learns** from every incident so the same problem gets solved faster next time

## How Knowledge Docs Work

When Claude diagnoses an issue via the API, it doesn't have web search or IDE integrations. IDEs like Cursor solve this by stuffing documentation into the prompt — that's literally what MCP does at delivery time.

Cortex does the same thing. The `knowledge/` directory contains markdown reference docs. When a Laravel service breaks, Cortex includes `laravel.md`, `postgres.md`, and `redis.md` in Claude's system prompt. Claude gets the same reference material it would get in an IDE.

**Files you should edit:**
- `knowledge/platform.md` — Your specific architecture, conventions, quirks
- `config/services.json` — Business context (priority, users, failure impact)
- `config/autonomy.json` — What Cortex can do without asking

**Files that auto-update:**
- `knowledge/incidents.md` — Grows as Cortex resolves issues

## Architecture

```
main.py         FastAPI app, webhooks, monitoring loop, auth
railway.py      All Railway API operations (read + write)
github.py       GitHub read + write (branches, commits, PRs)
knowledge.py    SQLite storage — everything Cortex knows
discover.py     Deep platform learning (Railway + GitHub)
brain.py        Iterative diagnosis loop with Claude
docs.py         Knowledge doc loader (the IDE-equivalent)
config.py       Business context + autonomy rules
notify.py       Severity-routed notifications

knowledge/      Reference docs injected into Claude's context
config/         Business context + permissions
```

## Install

```bash
# Fresh install
./install.sh /path/to/cortex

# Upgrade from V5 (preserves database + .env)
./install.sh /path/to/existing/cortex

# Upgrade from V4 (preserves config, removes old structure)
./install.sh /path/to/existing/cortex
```

## Deploy to Railway

1. Push to a GitHub repo
2. Create a Railway service connected to that repo
3. Set environment variables (see below)
4. Cortex auto-discovers your project on startup

**502 fix:** Cortex listens on port 8080. If you get 502:
1. **Settings → Networking → Public Networking** — click the pencil icon next to your domain
2. Set **Target Port** to `8080`, save
3. If that doesn't work: remove the domain (trash icon), redeploy, then **Generate Domain** again so Railway auto-detects port 8080

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RAILWAY_TOKEN` | Yes | Railway API token |
| `RAILWAY_PROJECT_ID` | Yes | Your Railway project ID |
| `RAILWAY_ENVIRONMENT_ID` | Yes | Environment to monitor |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `GITHUB_TOKEN` | Recommended | GitHub token (repo scope) for code analysis + PRs |
| `CORTEX_API_TOKEN` | Recommended | Auth token for Cortex's own API |
| `CORTEX_SLACK_WEBHOOK` | Optional | Slack webhook for notifications |

**Railway API 400:** Ensure `RAILWAY_TOKEN` is a valid token from [railway.app/account/tokens](https://railway.app/account/tokens). Use an **Account** or **Project** token. Copy `RAILWAY_PROJECT_ID` and `RAILWAY_ENVIRONMENT_ID` from the Railway dashboard (Cmd+K → "Copy Project ID").

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Is Cortex running |
| `GET /status` | Full platform overview |
| `GET /services` | All known services |
| `GET /services/{name}` | Deep context for one service |
| `GET /services/{name}/diagnose` | Trigger manual diagnosis |
| `GET /incidents` | Recent incidents |
| `POST /webhooks/railway` | Railway deploy webhook |
| `POST /discover` | Trigger full rediscovery |

## How Diagnosis Works

Not a one-shot prompt. An iterative conversation:

```
Cortex → Claude: "Day News health check failed. Here's what I know..."
Claude → Cortex: [calls get_logs tool] "Let me see the logs"
Cortex → Claude: "[ERROR] SQLSTATE connection refused..."
Claude → Cortex: [calls get_variables tool] "Show me the database variables"
Cortex → Claude: "DB_HOST=10.0.0.5, DB_PORT=5432..."
Claude → Cortex: [calls diagnose_complete] "DB_HOST is hardcoded. Should use Railway reference."
Cortex: [sets variable, restarts service, notifies Slack]
```

Claude has 7 investigation tools and calls `diagnose_complete` when it has an answer. Max 8 turns per diagnosis.
