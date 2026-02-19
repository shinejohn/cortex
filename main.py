"""
main.py — Cortex API and monitoring loop.

Endpoints:
    GET  /health                    — Is Cortex running
    GET  /status                    — Full platform status
    GET  /services                  — All known services
    GET  /services/{name}           — Deep context for one service
    GET  /services/{name}/diagnose  — Trigger manual diagnosis
    GET  /incidents                 — Recent incidents
    GET  /incidents/{id}            — Specific incident
    GET  /docs                      — Available knowledge docs
    POST /webhooks/railway          — Railway deploy webhook
    POST /discover                  — Trigger full rediscovery

Auth: Bearer token via CORTEX_API_TOKEN.
Monitoring: Background loop checks health every N seconds.
"""

import os
import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse

import config
import discover
import brain
import notify
from knowledge import Knowledge

CORTEX_API_TOKEN = os.getenv("CORTEX_API_TOKEN", "")
MONITOR_INTERVAL = int(os.getenv("CORTEX_MONITOR_INTERVAL", "300"))  # 5 min default
DISCOVERY_INTERVAL = int(os.getenv("CORTEX_DISCOVERY_INTERVAL", "3600"))  # 1 hour default

kb: Knowledge = None


# ---------------------------------------------------------------------------
# Auth middleware
# ---------------------------------------------------------------------------

async def verify_token(request: Request):
    if not CORTEX_API_TOKEN:
        return  # No token configured = open (dev mode)

    auth = request.headers.get("Authorization", "")
    if auth != f"Bearer {CORTEX_API_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid or missing token")


# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    global kb
    print("Cortex V6 starting...")

    # Load config
    config.load()

    # Init knowledge base
    kb = Knowledge()
    print("  Knowledge base initialized")

    # Run initial discovery in background (don't block startup — healthcheck needs /health within 30s)
    async def _run_initial_discovery():
        try:
            await discover.discover_all(kb)
        except Exception as e:
            print(f"  Initial discovery failed: {e}")

    discover_task = asyncio.create_task(_run_initial_discovery())

    # Start background tasks
    monitor_task = asyncio.create_task(_monitor_loop())
    discovery_task = asyncio.create_task(_discovery_loop())

    print("Cortex V6 ready.")
    yield

    discover_task.cancel()
    monitor_task.cancel()
    discovery_task.cancel()


app = FastAPI(title="Cortex", version="6.0", lifespan=lifespan)


# ---------------------------------------------------------------------------
# Background loops
# ---------------------------------------------------------------------------

async def _monitor_loop():
    """Periodically check service health and trigger diagnosis if needed."""
    await asyncio.sleep(30)  # Let startup finish

    while True:
        try:
            services = kb.get_all_services()
            for svc in services:
                if svc.get("type") in ("database", "cache"):
                    continue  # Can't HTTP-check these directly

                from railway import check_health
                healthy = await check_health(svc["name"], kb)

                if not healthy and svc.get("health_url"):
                    print(f"  UNHEALTHY: {svc['name']}")
                    kb.log("health_check_failed", f"{svc['name']} is unhealthy", svc["name"])

                    # Trigger diagnosis
                    incident = await brain.diagnose(
                        svc["name"],
                        f"Health check failed for {svc['name']}",
                        kb
                    )

                    # Notify
                    await notify.send_incident(incident)

        except Exception as e:
            print(f"  Monitor error: {e}")

        await asyncio.sleep(MONITOR_INTERVAL)


async def _discovery_loop():
    """Periodically rediscover the platform."""
    await asyncio.sleep(DISCOVERY_INTERVAL)

    while True:
        try:
            print("  Scheduled rediscovery...")
            await discover.discover_all(kb)
        except Exception as e:
            print(f"  Discovery error: {e}")

        await asyncio.sleep(DISCOVERY_INTERVAL)


# ---------------------------------------------------------------------------
# Health & status
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "version": "6.0", "time": datetime.now(timezone.utc).isoformat()}


@app.get("/status", dependencies=[Depends(verify_token)])
async def status():
    services = kb.get_all_services()
    flags = kb.get_flags()
    incidents = kb.get_recent_incidents(limit=5)

    return {
        "status": "ok",
        "services": len(services),
        "flags": len(flags),
        "recent_incidents": len(incidents),
        "services_summary": [
            {"name": s["name"], "type": s["type"], "stack": s["stack"], "status": s["status"]}
            for s in services
        ],
        "open_flags": [
            {"service": f["service"], "type": f["flag_type"], "message": f["message"]}
            for f in flags[:10]
        ],
    }


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------

@app.get("/services", dependencies=[Depends(verify_token)])
async def list_services():
    return {"services": kb.get_all_services()}


@app.get("/services/{name}", dependencies=[Depends(verify_token)])
async def get_service(name: str):
    svc = kb.get_service(name)
    if not svc:
        raise HTTPException(404, f"Service '{name}' not found")
    return kb.get_deep_context(name)


@app.get("/services/{name}/diagnose", dependencies=[Depends(verify_token)])
async def trigger_diagnosis(name: str, trigger: str = "Manual diagnosis requested"):
    svc = kb.get_service(name)
    if not svc:
        raise HTTPException(404, f"Service '{name}' not found")

    incident = await brain.diagnose(name, trigger, kb)
    await notify.send_incident(incident)

    return {
        "incident_id": incident["incident_id"],
        "diagnosis": incident.get("diagnosis"),
        "actions_taken": incident.get("actions_taken", []),
        "turns": incident.get("turns", 0),
    }


# ---------------------------------------------------------------------------
# Incidents
# ---------------------------------------------------------------------------

@app.get("/incidents", dependencies=[Depends(verify_token)])
async def list_incidents(service: str = None, limit: int = 20):
    return {"incidents": kb.get_recent_incidents(service, limit)}


@app.get("/incidents/{incident_id}", dependencies=[Depends(verify_token)])
async def get_incident(incident_id: str):
    inc = kb.get_incident(incident_id)
    if not inc:
        raise HTTPException(404, "Incident not found")
    return inc


# ---------------------------------------------------------------------------
# Knowledge docs
# ---------------------------------------------------------------------------

@app.get("/docs", dependencies=[Depends(verify_token)])
async def list_docs():
    from docs import list_available_docs
    return {"docs": list_available_docs()}


# ---------------------------------------------------------------------------
# Webhooks
# ---------------------------------------------------------------------------

@app.post("/webhooks/railway")
async def railway_webhook(request: Request):
    """Handle Railway deploy webhooks. Triggers diagnosis on failed deploys."""
    try:
        body = await request.json()
    except Exception:
        return {"status": "ignored", "reason": "invalid json"}

    event_type = body.get("type", "")
    status = body.get("status", "")
    service_name = body.get("service", {}).get("name", "") or body.get("meta", {}).get("serviceName", "")

    kb.log("webhook", f"Railway webhook: {event_type} {status}", service_name, body)

    # Trigger diagnosis on deploy failure
    if status in ("FAILED", "CRASHED", "ERROR"):
        if service_name and kb.get_service(service_name):
            incident = await brain.diagnose(
                service_name,
                f"Deploy {event_type} with status {status}",
                kb
            )
            await notify.send_incident(incident)
            return {"status": "diagnosed", "incident_id": incident["incident_id"]}

    return {"status": "logged"}


# ---------------------------------------------------------------------------
# Discovery
# ---------------------------------------------------------------------------

@app.post("/discover", dependencies=[Depends(verify_token)])
async def trigger_discovery():
    await discover.discover_all(kb)
    services = kb.get_all_services()
    flags = kb.get_flags()
    return {
        "status": "complete",
        "services": len(services),
        "flags": len(flags),
    }
