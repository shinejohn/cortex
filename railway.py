"""
railway.py — All Railway API operations.

Every interaction with Railway goes through this file:
    - Get services, variables, domains, volumes
    - Check health (HTTP ping)
    - Restart services (redeploy)
    - Set variables
    - Get logs
    - Get deploy history
    - Rollback to previous deploy
"""

import os
import httpx

RAILWAY_TOKEN = os.getenv("RAILWAY_TOKEN", "")
RAILWAY_API = "https://backboard.railway.app/graphql/v2"


def _headers():
    return {
        "Authorization": f"Bearer {RAILWAY_TOKEN}",
        "Content-Type": "application/json",
    }


async def _gql(query: str, variables: dict = None) -> dict | None:
    """Run a GraphQL query against Railway."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(RAILWAY_API, json=payload, headers=_headers())
            if r.status_code != 200:
                body = r.text[:500] if r.text else "(no body)"
                print(f"  Railway API {r.status_code}: {body}")
                return None
            data = r.json()
            if "errors" in data:
                for e in data["errors"]:
                    print(f"  Railway API error: {e.get('message', 'Unknown')}")
                return None
            return data.get("data")
    except Exception as e:
        print(f"  Railway request failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

async def get_services(project_id: str) -> list[dict]:
    """Get all services in a project with instance details."""
    if not RAILWAY_TOKEN:
        print("  RAILWAY_TOKEN not set — cannot fetch services")
        return []
    if not project_id or not project_id.strip():
        print("  RAILWAY_PROJECT_ID is empty — cannot fetch services")
        return []
    data = await _gql("""
        query($projectId: String!) {
            project(id: $projectId) {
                services {
                    edges {
                        node {
                            id
                            name
                            icon
                            serviceInstances {
                                edges {
                                    node {
                                        source { repo }
                                        domains {
                                            serviceDomains { domain }
                                            customDomains { domain }
                                        }
                                        startCommand
                                        buildCommand
                                        healthcheckPath
                                        numReplicas
                                        region
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    """, {"projectId": project_id})

    if not data:
        return []

    services = []
    for edge in data.get("project", {}).get("services", {}).get("edges", []):
        services.append(edge["node"])
    return services


async def get_variables(service_id: str, environment_id: str) -> dict:
    """Get all environment variables for a service."""
    data = await _gql("""
        query($serviceId: String!, $environmentId: String!) {
            variables(serviceId: $serviceId, environmentId: $environmentId)
        }
    """, {"serviceId": service_id, "environmentId": environment_id})

    return data.get("variables", {}) if data else {}


async def get_service_logs(service_name: str, kb) -> str:
    """Pull recent logs for a service."""
    svc = kb.get_service(service_name)
    if not svc:
        return ""

    data = await _gql("""
        query($serviceId: String!, $environmentId: String!) {
            deployments(
                input: { serviceId: $serviceId, environmentId: $environmentId }
                first: 1
            ) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    """, {"serviceId": svc["service_id"], "environmentId": svc["environment_id"]})

    if not data:
        return ""

    edges = data.get("deployments", {}).get("edges", [])
    if not edges:
        return ""

    deploy_id = edges[0]["node"]["id"]

    log_data = await _gql("""
        query($deploymentId: String!) {
            deploymentLogs(deploymentId: $deploymentId, limit: 500) {
                message
                timestamp
                severity
            }
        }
    """, {"deploymentId": deploy_id})

    if not log_data:
        return ""

    lines = log_data.get("deploymentLogs", [])
    return "\n".join(
        f"[{l.get('severity', 'INFO')}] {l.get('message', '')}"
        for l in lines
    )


async def get_recent_deploys(service_id: str, environment_id: str, limit: int = 10) -> list[dict]:
    """Get recent deployments for a service."""
    data = await _gql("""
        query($serviceId: String!, $environmentId: String!, $limit: Int!) {
            deployments(
                input: { serviceId: $serviceId, environmentId: $environmentId }
                first: $limit
            ) {
                edges {
                    node {
                        id
                        status
                        createdAt
                        meta
                    }
                }
            }
        }
    """, {"serviceId": service_id, "environmentId": environment_id, "limit": limit})

    if not data:
        return []

    return [
        {
            "id": e["node"]["id"],
            "status": e["node"].get("status", "unknown"),
            "created_at": e["node"].get("createdAt", ""),
            "meta": e["node"].get("meta", {}),
        }
        for e in data.get("deployments", {}).get("edges", [])
    ]


# ---------------------------------------------------------------------------
# Health checks
# ---------------------------------------------------------------------------

async def check_health(service_name: str, kb) -> bool:
    """Ping a service's health URL."""
    svc = kb.get_service(service_name)
    if not svc:
        return False

    url = svc.get("health_url", "")
    if not url:
        return True  # No health URL = assume ok

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            r = await client.get(url)
            return r.status_code < 500
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

async def restart(service_name: str, kb) -> bool:
    """Trigger a redeploy for a service."""
    svc = kb.get_service(service_name)
    if not svc:
        return False

    data = await _gql("""
        mutation($serviceId: String!, $environmentId: String!) {
            serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
        }
    """, {"serviceId": svc["service_id"], "environmentId": svc["environment_id"]})

    return data is not None


async def set_variable(service_name: str, variable: str, value: str, kb) -> bool:
    """Set an environment variable on a service."""
    svc = kb.get_service(service_name)
    if not svc:
        return False

    data = await _gql("""
        mutation($input: VariableCollectionUpsertInput!) {
            variableCollectionUpsert(input: $input)
        }
    """, {
        "input": {
            "serviceId": svc["service_id"],
            "environmentId": svc["environment_id"],
            "variables": {variable: value},
        }
    })

    return data is not None


async def get_vars(service_name: str, kb) -> dict:
    """Convenience: get variables by service name."""
    svc = kb.get_service(service_name)
    if not svc:
        return {}
    return await get_variables(svc["service_id"], svc["environment_id"])


async def rollback(service_name: str, kb) -> bool:
    """Rollback to the previous successful deployment."""
    svc = kb.get_service(service_name)
    if not svc:
        return False

    deploys = await get_recent_deploys(svc["service_id"], svc["environment_id"], limit=5)

    # Find last successful deploy that isn't the current one
    for deploy in deploys[1:]:
        if deploy.get("status", "").upper() == "SUCCESS":
            data = await _gql("""
                mutation($deploymentId: String!) {
                    deploymentRollback(id: $deploymentId)
                }
            """, {"deploymentId": deploy["id"]})
            return data is not None

    return False
