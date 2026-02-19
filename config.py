"""
config.py — Load business context and autonomy rules.

Two config files:
    services.json   — Business context per service (priority, users, consequences)
    autonomy.json   — What Cortex can do without asking, per service

These are what Cortex can't discover on its own. Discovery learns the
infrastructure. Config tells Cortex what matters to the business.
"""

import os
import json

CONFIG_DIR = os.getenv("CORTEX_CONFIG_DIR", "/app/config")

_services_config = {}
_autonomy_config = {}


def load():
    """Load config files. Call on startup."""
    global _services_config, _autonomy_config

    _services_config = _load_json("services.json", {})
    _autonomy_config = _load_json("autonomy.json", {
        "defaults": {
            "can_restart": True,
            "can_set_variables": True,
            "can_rollback": False,
            "can_create_pr": True,
            "max_repair_attempts": 3,
        },
        "forbidden_actions": [
            "database_migration", "database_rollback",
            "delete_data", "drop_table", "modify_schema", "truncate"
        ],
    })

    print(f"  Config: {len(_services_config)} service configs, autonomy loaded")


def _load_json(filename: str, default: dict) -> dict:
    filepath = os.path.join(CONFIG_DIR, filename)
    if not os.path.exists(filepath):
        return default
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"  Warning: Could not load {filepath}: {e}")
        return default


# ---------------------------------------------------------------------------
# Business context
# ---------------------------------------------------------------------------

def get_service_context(service_name: str) -> dict:
    """
    Get business context for a service.

    Returns things like:
        priority: "critical" | "high" | "medium" | "low"
        product_name: "Day News"
        users: "50K daily readers"
        failure_impact: "News site goes offline, readers can't access content"
        notes: "Most important product. Has event launching this weekend."
    """
    return _services_config.get(service_name, {})


def get_priority(service_name: str) -> str:
    ctx = get_service_context(service_name)
    return ctx.get("priority", "medium")


def get_business_context_prompt(service_name: str) -> str:
    """Format business context for Claude's prompt."""
    ctx = get_service_context(service_name)
    if not ctx:
        return ""

    lines = ["BUSINESS CONTEXT:"]
    if ctx.get("product_name"):
        lines.append(f"  Product: {ctx['product_name']}")
    if ctx.get("priority"):
        lines.append(f"  Priority: {ctx['priority']}")
    if ctx.get("users"):
        lines.append(f"  Users: {ctx['users']}")
    if ctx.get("failure_impact"):
        lines.append(f"  If this breaks: {ctx['failure_impact']}")
    if ctx.get("notes"):
        lines.append(f"  Notes: {ctx['notes']}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Autonomy rules
# ---------------------------------------------------------------------------

def can_do(service_name: str, action: str) -> bool:
    """Check if Cortex is allowed to perform an action on a service."""
    # Check forbidden list first
    forbidden = _autonomy_config.get("forbidden_actions", [])
    if action in forbidden:
        return False

    # Check service-specific overrides
    svc_rules = _autonomy_config.get("services", {}).get(service_name, {})
    if action in svc_rules:
        return svc_rules[action]

    # Fall back to defaults
    defaults = _autonomy_config.get("defaults", {})
    action_key = f"can_{action}"
    return defaults.get(action_key, False)


def get_max_attempts(service_name: str) -> int:
    svc_rules = _autonomy_config.get("services", {}).get(service_name, {})
    return svc_rules.get("max_repair_attempts",
                         _autonomy_config.get("defaults", {}).get("max_repair_attempts", 3))


def get_forbidden_actions() -> list[str]:
    return _autonomy_config.get("forbidden_actions", [])
