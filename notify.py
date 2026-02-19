"""
notify.py — Notifications with severity routing.

Routes alerts to different channels based on severity:
    critical → all channels immediately
    high     → Slack + email
    medium   → Slack only
    low      → log only (unless configured otherwise)

Channels: Slack webhook, email (via SMTP or API), generic webhook.
"""

import os
import json

import httpx

SLACK_WEBHOOK = os.getenv("CORTEX_SLACK_WEBHOOK", "")
NOTIFY_EMAIL = os.getenv("CORTEX_NOTIFY_EMAIL", "")
NOTIFY_WEBHOOK = os.getenv("CORTEX_NOTIFY_WEBHOOK", "")

# Which channels fire for each severity
ROUTING = {
    "critical": ["slack", "email", "webhook"],
    "high":     ["slack", "email"],
    "medium":   ["slack"],
    "low":      [],  # Just logged
}


async def send(service: str, severity: str, title: str, message: str,
               incident: dict = None):
    """Send notification through appropriate channels based on severity."""
    channels = ROUTING.get(severity, ["slack"])

    emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🔵"}.get(severity, "⚪")
    full_title = f"{emoji} [{severity.upper()}] {service}: {title}"

    sent_to = []

    if "slack" in channels and SLACK_WEBHOOK:
        ok = await _send_slack(full_title, message, severity, incident)
        if ok:
            sent_to.append("slack")

    if "email" in channels and NOTIFY_EMAIL:
        ok = await _send_email(full_title, message, incident)
        if ok:
            sent_to.append("email")

    if "webhook" in channels and NOTIFY_WEBHOOK:
        ok = await _send_webhook(service, severity, title, message, incident)
        if ok:
            sent_to.append("webhook")

    print(f"  Notify [{severity}] {service}: {title} → {sent_to or ['log only']}")
    return sent_to


async def send_incident(incident: dict):
    """Send a full incident report."""
    service = incident.get("service", "unknown")
    diag = incident.get("diagnosis") or {}
    severity = diag.get("severity", "medium")
    diagnosis_text = diag.get("diagnosis", "No diagnosis reached.")

    actions = incident.get("actions_taken", [])
    action_summary = ", ".join(
        f"{a['type']}={a.get('status', '?')}" for a in actions
    ) if actions else "none"

    message = (
        f"**Diagnosis:** {diagnosis_text}\n\n"
        f"**Actions taken:** {action_summary}\n"
        f"**Investigation turns:** {incident.get('turns', 0)}\n"
        f"**Incident ID:** {incident.get('incident_id', 'unknown')}"
    )

    return await send(service, severity, "Incident Report", message, incident)


async def _send_slack(title: str, message: str, severity: str, incident: dict = None) -> bool:
    """Post to Slack via webhook."""
    color = {"critical": "#ff0000", "high": "#ff8800", "medium": "#ffcc00", "low": "#0088ff"}.get(severity, "#cccccc")

    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": title[:150]}},
        {"type": "section", "text": {"type": "mrkdwn", "text": message[:2500]}},
    ]

    if incident and incident.get("actions_taken"):
        action_text = "\n".join(
            f"• {a['type']}: {a.get('status', '?')}" for a in incident["actions_taken"]
        )
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": f"*Actions:*\n{action_text}"}})

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(SLACK_WEBHOOK, json={
                "text": title,
                "attachments": [{"color": color, "blocks": blocks}]
            })
            return r.status_code == 200
    except Exception as e:
        print(f"  Slack error: {e}")
        return False


async def _send_email(title: str, message: str, incident: dict = None) -> bool:
    """Send email notification. Uses a generic webhook approach — configure for your provider."""
    # This is a placeholder — swap in your email provider (Postmark, SendGrid, SES, etc.)
    print(f"  Email notification would go to {NOTIFY_EMAIL}: {title}")
    return False  # Not implemented — returns false so caller knows


async def _send_webhook(service: str, severity: str, title: str, message: str,
                         incident: dict = None) -> bool:
    """Send to generic webhook endpoint."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(NOTIFY_WEBHOOK, json={
                "service": service,
                "severity": severity,
                "title": title,
                "message": message,
                "incident_id": (incident or {}).get("incident_id", ""),
            })
            return r.status_code < 300
    except Exception as e:
        print(f"  Webhook error: {e}")
        return False
