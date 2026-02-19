"""
brain.py — Iterative diagnosis with Claude.

NOT a one-shot prompt. A conversation:
    1. Cortex sends symptoms + context + relevant docs
    2. Claude asks for specific data (logs, variables, file content)
    3. Cortex fetches what Claude asked for
    4. Claude reasons and asks for more, or reaches a diagnosis
    5. If fix is possible + autonomy allows it → Cortex acts
    6. Incident gets saved so Claude learns next time

The key insight: IDEs stuff docs into prompts. That's all MCP does at
delivery time. Cortex does the same — loads markdown reference docs
based on the service's stack, includes them in the system prompt.
Claude API + docs = same capability as any IDE integration.
"""

import os
import json
import uuid
from datetime import datetime, timezone

import httpx

import railway
import github
import docs
import config
from knowledge import Knowledge

CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
CLAUDE_API = "https://api.anthropic.com/v1/messages"
MAX_TURNS = int(os.getenv("CORTEX_MAX_DIAGNOSIS_TURNS", "8"))


# ---------------------------------------------------------------------------
# Tool definitions — what Claude can ask Cortex to do during diagnosis
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "name": "get_logs",
        "description": "Get recent deployment logs for a service. Use when you need to see error messages, stack traces, or runtime output.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"}
            },
            "required": ["service"]
        }
    },
    {
        "name": "get_variables",
        "description": "Get all environment variables for a service. Use to check database URLs, API keys, config values.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"}
            },
            "required": ["service"]
        }
    },
    {
        "name": "get_file",
        "description": "Read a specific file from the service's GitHub repo. Use to inspect config, routes, database config, etc.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"},
                "path": {"type": "string", "description": "File path in the repo (e.g. config/database.php)"}
            },
            "required": ["service", "path"]
        }
    },
    {
        "name": "get_deploys",
        "description": "Get recent deploy history for a service. Use to check if a recent deploy caused the issue.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"}
            },
            "required": ["service"]
        }
    },
    {
        "name": "get_commits",
        "description": "Get recent git commits for a service. Use to see what changed recently.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"},
                "limit": {"type": "integer", "description": "Number of commits (default 10)"}
            },
            "required": ["service"]
        }
    },
    {
        "name": "check_health",
        "description": "Ping a service's health endpoint. Use to verify if a service is responding.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"}
            },
            "required": ["service"]
        }
    },
    {
        "name": "get_dependency_status",
        "description": "Check the status of all services this service depends on. Use when the issue might be a downstream dependency.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Service name"}
            },
            "required": ["service"]
        }
    },
    {
        "name": "diagnose_complete",
        "description": "Call this when you've reached a diagnosis. Include your findings and recommended actions.",
        "input_schema": {
            "type": "object",
            "properties": {
                "diagnosis": {"type": "string", "description": "What's wrong and why"},
                "severity": {"type": "string", "enum": ["critical", "high", "medium", "low"]},
                "actions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {"type": "string", "enum": [
                                "restart", "set_variable", "rollback", "propose_fix", "notify_only"
                            ]},
                            "details": {"type": "object", "description": "Action-specific parameters"}
                        },
                        "required": ["type"]
                    },
                    "description": "Recommended actions in priority order"
                }
            },
            "required": ["diagnosis", "severity", "actions"]
        }
    }
]


# ---------------------------------------------------------------------------
# Tool execution — Cortex responds to Claude's requests
# ---------------------------------------------------------------------------

async def _execute_tool(tool_name: str, tool_input: dict, kb: Knowledge) -> str:
    """Execute a tool call from Claude during diagnosis."""
    try:
        if tool_name == "get_logs":
            logs = await railway.get_service_logs(tool_input["service"], kb)
            return logs if logs else "No logs available."

        elif tool_name == "get_variables":
            variables = await railway.get_vars(tool_input["service"], kb)
            if not variables:
                return "No variables found or service not recognized."
            # Mask sensitive values
            masked = {}
            for k, v in variables.items():
                if any(s in k.upper() for s in ("SECRET", "PASSWORD", "KEY", "TOKEN")):
                    masked[k] = f"{str(v)[:4]}...{str(v)[-4:]}" if len(str(v)) > 8 else "***"
                else:
                    masked[k] = v
            return json.dumps(masked, indent=2)

        elif tool_name == "get_file":
            svc = kb.get_service(tool_input["service"])
            if not svc or not svc.get("repo"):
                return "No repo linked to this service."
            owner, repo = svc["repo"].split("/", 1)
            branch = svc.get("branch", "main")
            content = await github.get_file_content(owner, repo, tool_input["path"], branch)
            return content if content else f"File not found: {tool_input['path']}"

        elif tool_name == "get_deploys":
            svc = kb.get_service(tool_input["service"])
            if not svc:
                return "Service not found."
            deploys = await railway.get_recent_deploys(svc["service_id"], svc["environment_id"])
            return json.dumps(deploys, indent=2, default=str)

        elif tool_name == "get_commits":
            svc = kb.get_service(tool_input["service"])
            if not svc or not svc.get("repo"):
                return "No repo linked."
            owner, repo = svc["repo"].split("/", 1)
            branch = svc.get("branch", "main")
            limit = tool_input.get("limit", 10)
            commits = await github.get_recent_commits(owner, repo, branch, limit)
            return json.dumps(commits, indent=2)

        elif tool_name == "check_health":
            healthy = await railway.check_health(tool_input["service"], kb)
            return f"Health check: {'HEALTHY' if healthy else 'UNHEALTHY / NOT RESPONDING'}"

        elif tool_name == "get_dependency_status":
            deps = kb.get_dependencies(tool_input["service"])
            if not deps:
                return "No known dependencies."
            results = []
            for dep in deps:
                healthy = await railway.check_health(dep, kb)
                results.append(f"  {dep}: {'healthy' if healthy else 'UNHEALTHY'}")
            return "\n".join(results)

        elif tool_name == "diagnose_complete":
            return json.dumps(tool_input)

        return f"Unknown tool: {tool_name}"

    except Exception as e:
        return f"Tool error ({tool_name}): {e}"


# ---------------------------------------------------------------------------
# System prompt builder
# ---------------------------------------------------------------------------

def _build_system_prompt(service_name: str, kb: Knowledge) -> str:
    """Build Claude's system prompt with context + relevant docs."""

    svc = kb.get_service(service_name) or {}
    stack = svc.get("stack", "unknown")

    # Core identity
    prompt_parts = [
        "You are Cortex, a platform diagnostics AI. You diagnose issues with "
        "services running on Railway by methodically investigating symptoms.",
        "",
        "APPROACH: Use the scientific method.",
        "  1. Observe symptoms (you've been given initial context below)",
        "  2. Form a hypothesis about what's wrong",
        "  3. Use tools to gather evidence (logs, variables, files, deploys)",
        "  4. Refine your hypothesis based on evidence",
        "  5. When confident, call diagnose_complete with your diagnosis and recommended actions",
        "",
        "Be methodical. Don't guess — investigate. Ask for specific data.",
        "Don't request everything at once. Follow the trail.",
        "",
    ]

    # Business context
    biz = config.get_business_context_prompt(service_name)
    if biz:
        prompt_parts.append(biz)
        prompt_parts.append("")

    # Autonomy rules
    forbidden = config.get_forbidden_actions()
    prompt_parts.append(f"FORBIDDEN ACTIONS (never recommend): {', '.join(forbidden)}")
    prompt_parts.append(f"Max repair attempts: {config.get_max_attempts(service_name)}")
    prompt_parts.append("")

    # Available services (so Claude knows what exists)
    all_services = kb.get_all_services()
    svc_list = ", ".join(f"{s['name']} ({s['type']}/{s['stack']})" for s in all_services)
    prompt_parts.append(f"KNOWN SERVICES: {svc_list}")
    prompt_parts.append("")

    # Reference documentation — this is the IDE-equivalent knowledge injection
    reference_docs = docs.get_relevant_docs(stack=stack, service_type=svc.get("type", ""))
    if reference_docs:
        prompt_parts.append(reference_docs)
        prompt_parts.append("")

    return "\n".join(prompt_parts)


# ---------------------------------------------------------------------------
# Initial context message
# ---------------------------------------------------------------------------

def _build_initial_message(service_name: str, trigger: str, kb: Knowledge) -> str:
    """Build the first user message with symptoms and known context."""
    ctx = kb.get_deep_context(service_name)
    svc = ctx.get("service", {})

    parts = [
        f"SERVICE: {service_name}",
        f"TYPE: {svc.get('type', 'unknown')} | STACK: {svc.get('stack', 'unknown')}",
        f"REPO: {svc.get('repo', 'none')}:{svc.get('branch', '')}",
        f"TRIGGER: {trigger}",
        "",
    ]

    # Dependencies
    deps = ctx.get("dependencies", [])
    if deps:
        parts.append("DEPENDENCIES:")
        for d in deps:
            parts.append(f"  → {d['depends_on']} ({d.get('dep_type', '')})")
        parts.append("")

    # Known issues already flagged
    flags = ctx.get("flags", [])
    if flags:
        parts.append("KNOWN ISSUES (from last discovery):")
        for f in flags:
            parts.append(f"  ⚠ [{f.get('flag_type', '')}] {f.get('message', '')}")
        parts.append("")

    # Variable issues
    var_issues = ctx.get("variable_issues", [])
    if var_issues:
        parts.append("VARIABLE CONCERNS:")
        for vi in var_issues:
            parts.append(f"  ⚠ {vi['variable']}: {vi['issue']}")
        parts.append("")

    # Recent deploys (just last 3)
    deploys = ctx.get("recent_deploys", [])[:3]
    if deploys:
        parts.append("RECENT DEPLOYS:")
        for d in deploys:
            parts.append(f"  {d.get('created_at', '')[:19]} — {d.get('status', 'unknown')}")
        parts.append("")

    # Recent commits (just last 5)
    commits = ctx.get("recent_commits", [])[:5]
    if commits:
        parts.append("RECENT COMMITS:")
        for c in commits:
            parts.append(f"  {c.get('sha', '')} {c.get('message', '')}")
        parts.append("")

    # Past incidents for this service
    incidents = ctx.get("recent_incidents", [])[:3]
    if incidents:
        parts.append("PAST INCIDENTS (similar issues resolved before):")
        for inc in incidents:
            d = inc.get("diagnosis", {})
            if isinstance(d, dict):
                parts.append(f"  • {d.get('diagnosis', 'No details')[:200]}")
        parts.append("")

    parts.append("Investigate this issue. Start by checking what seems most relevant.")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Main diagnosis loop
# ---------------------------------------------------------------------------

async def diagnose(service_name: str, trigger: str, kb: Knowledge) -> dict:
    """
    Run iterative diagnosis.

    Returns an incident dict with the full conversation and outcome.
    """
    incident_id = str(uuid.uuid4())[:12]
    started = datetime.now(timezone.utc).isoformat()

    kb.log("diagnosis_start", f"Starting diagnosis for {service_name}", service_name,
           {"trigger": trigger, "incident_id": incident_id})

    system_prompt = _build_system_prompt(service_name, kb)
    initial_message = _build_initial_message(service_name, trigger, kb)

    messages = [{"role": "user", "content": initial_message}]
    diagnosis_result = None
    conversation_log = [{"role": "context", "content": initial_message}]
    actions_taken = []

    for turn in range(MAX_TURNS):
        print(f"  [Turn {turn + 1}/{MAX_TURNS}] Calling Claude...")

        response = await _call_claude(system_prompt, messages)
        if not response:
            kb.log("diagnosis_error", "Claude API call failed", service_name)
            break

        # Process response blocks
        assistant_content = response.get("content", [])
        messages.append({"role": "assistant", "content": assistant_content})

        # Check for tool use
        tool_uses = [b for b in assistant_content if b.get("type") == "tool_use"]
        text_blocks = [b for b in assistant_content if b.get("type") == "text"]

        # Log any text Claude said
        for tb in text_blocks:
            print(f"    Claude: {tb['text'][:200]}")
            conversation_log.append({"role": "claude", "content": tb["text"]})

        if not tool_uses:
            # Claude responded with just text, no tools — conversation done
            print("    Claude finished without tool call.")
            break

        # Process each tool call
        tool_results = []
        for tool_use in tool_uses:
            tool_name = tool_use["name"]
            tool_input = tool_use.get("input", {})
            tool_id = tool_use["id"]

            print(f"    Tool: {tool_name}({json.dumps(tool_input)[:100]})")
            conversation_log.append({"role": "tool_call", "tool": tool_name, "input": tool_input})

            # Check if diagnosis is complete
            if tool_name == "diagnose_complete":
                diagnosis_result = tool_input
                result_text = "Diagnosis recorded."
                conversation_log.append({"role": "diagnosis", "content": tool_input})
            else:
                result_text = await _execute_tool(tool_name, tool_input, kb)
                conversation_log.append({"role": "tool_result", "tool": tool_name,
                                         "content": result_text[:500]})

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_id,
                "content": result_text,
            })

        messages.append({"role": "user", "content": tool_results})

        if diagnosis_result:
            print(f"    Diagnosis complete: {diagnosis_result.get('diagnosis', '')[:200]}")
            break

    # ---------------------------------------------------------------------------
    # Execute recommended actions (if autonomy allows)
    # ---------------------------------------------------------------------------

    if diagnosis_result and diagnosis_result.get("actions"):
        actions_taken = await _execute_actions(
            service_name, diagnosis_result["actions"], diagnosis_result, kb
        )

    # Save incident
    incident = {
        "incident_id": incident_id,
        "service": service_name,
        "trigger": trigger,
        "started": started,
        "finished": datetime.now(timezone.utc).isoformat(),
        "diagnosis": diagnosis_result,
        "actions_taken": actions_taken,
        "turns": len([m for m in messages if m["role"] == "assistant"]),
        "conversation": conversation_log,
    }
    kb.save_incident(incident)

    # Learn from this incident for next time
    if diagnosis_result:
        docs.add_incident_learning(
            service_name,
            (kb.get_service(service_name) or {}).get("stack", "unknown"),
            trigger,
            diagnosis_result.get("diagnosis", ""),
            f"Resolved in {incident['turns']} turns. Actions: {[a['type'] for a in actions_taken]}"
        )

    kb.log("diagnosis_complete", f"Diagnosis done for {service_name}", service_name,
           {"incident_id": incident_id, "turns": incident["turns"],
            "actions": len(actions_taken), "severity": (diagnosis_result or {}).get("severity", "unknown")})

    return incident


# ---------------------------------------------------------------------------
# Action execution
# ---------------------------------------------------------------------------

async def _execute_actions(service_name: str, actions: list[dict],
                           diagnosis: dict, kb: Knowledge) -> list[dict]:
    """Execute Claude's recommended actions, respecting autonomy rules."""
    taken = []

    for action in actions:
        action_type = action.get("type", "")
        details = action.get("details", {})

        if not config.can_do(service_name, action_type.replace("propose_fix", "create_pr")):
            print(f"    Action blocked by autonomy: {action_type}")
            taken.append({"type": action_type, "status": "blocked_by_autonomy", "details": details})
            continue

        try:
            if action_type == "restart":
                ok = await railway.restart(service_name, kb)
                taken.append({"type": "restart", "status": "success" if ok else "failed"})
                print(f"    Restart: {'success' if ok else 'failed'}")

            elif action_type == "set_variable":
                var = details.get("variable", "")
                val = details.get("value", "")
                if var and val:
                    ok = await railway.set_variable(service_name, var, val, kb)
                    taken.append({"type": "set_variable", "variable": var,
                                  "status": "success" if ok else "failed"})
                    print(f"    Set {var}: {'success' if ok else 'failed'}")

            elif action_type == "rollback":
                ok = await railway.rollback(service_name, kb)
                taken.append({"type": "rollback", "status": "success" if ok else "failed"})
                print(f"    Rollback: {'success' if ok else 'failed'}")

            elif action_type == "propose_fix":
                svc = kb.get_service(service_name)
                if svc and svc.get("repo"):
                    owner, repo = svc["repo"].split("/", 1)
                    changes = details.get("changes", [])
                    title = details.get("title", f"Cortex fix: {service_name}")
                    pr = await github.propose_fix(owner, repo, changes, title,
                                                   diagnosis.get("diagnosis", ""))
                    if pr:
                        taken.append({"type": "propose_fix", "status": "pr_created", "pr": pr})
                        print(f"    PR created: {pr.get('url', '')}")
                    else:
                        taken.append({"type": "propose_fix", "status": "failed"})

            elif action_type == "notify_only":
                taken.append({"type": "notify_only", "status": "ok", "message": details.get("message", "")})

        except Exception as e:
            taken.append({"type": action_type, "status": "error", "error": str(e)})
            print(f"    Action error ({action_type}): {e}")

    return taken


# ---------------------------------------------------------------------------
# Claude API call
# ---------------------------------------------------------------------------

async def _call_claude(system: str, messages: list[dict]) -> dict | None:
    """Call Claude's API with tools."""
    if not CLAUDE_API_KEY:
        print("    ERROR: ANTHROPIC_API_KEY not set")
        return None

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                CLAUDE_API,
                headers={
                    "x-api-key": CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": CLAUDE_MODEL,
                    "max_tokens": 4096,
                    "system": system,
                    "messages": messages,
                    "tools": TOOLS,
                }
            )

            if r.status_code != 200:
                print(f"    Claude API error {r.status_code}: {r.text[:300]}")
                return None

            return r.json()

    except Exception as e:
        print(f"    Claude API request failed: {e}")
        return None
