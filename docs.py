"""
docs.py — Knowledge resource loader.

This is how Cortex gives Claude the same advantage IDE integrations give:
reference documentation alongside live data.

When Claude diagnoses a Laravel service, it gets the Laravel troubleshooting
guide. When it's a Postgres issue, it gets the Postgres reference. When it's
a Railway deployment problem, it gets Railway-specific patterns.

IDEs like Cursor do this with MCP servers. The mechanism is identical:
fetch relevant docs, stuff them into the prompt. MCP is just a protocol
for fetching. The delivery is always text in the context window.

Cortex does it simpler: markdown files in knowledge/, selected by
service stack and problem type, concatenated into Claude's system prompt.

Files in knowledge/:
    railway.md              Railway deployment patterns, common issues
    laravel.md              Laravel debugging, artisan commands, config
    postgres.md             Connection issues, performance, Railway Postgres
    redis.md                Cache/queue issues, connection patterns
    vue-vite-tailwind.md    Frontend stack reference
    node.md                 Node.js common issues
    python.md               Python deployment patterns
    platform.md             YOUR specific architecture (user-editable)
    incidents.md            Auto-generated from past resolved incidents
"""

import os
import glob

KNOWLEDGE_DIR = os.getenv("CORTEX_KNOWLEDGE_DIR", "/app/knowledge")

# Map service stacks/types to relevant doc files
STACK_DOCS = {
    "laravel":    ["railway.md", "laravel.md", "postgres.md", "redis.md"],
    "php":        ["railway.md", "laravel.md", "postgres.md"],
    "node":       ["railway.md", "node.md"],
    "nextjs":     ["railway.md", "node.md"],
    "nuxt":       ["railway.md", "node.md", "vue-vite-tailwind.md"],
    "python":     ["railway.md", "python.md"],
    "django":     ["railway.md", "python.md", "postgres.md"],
    "postgres":   ["railway.md", "postgres.md"],
    "postgresql":  ["railway.md", "postgres.md"],
    "redis":      ["railway.md", "redis.md"],
    "unknown":    ["railway.md"],
}

# Always include these
ALWAYS_INCLUDE = ["platform.md", "incidents.md"]

# Max total characters to include (keep context window manageable)
MAX_DOCS_CHARS = 30000


def get_relevant_docs(stack: str = "unknown", service_type: str = "",
                       extra_topics: list[str] = None) -> str:
    """
    Load relevant knowledge docs for a service's stack.

    Returns a formatted string ready to inject into Claude's system prompt.
    Picks docs based on the service's detected stack, always includes
    platform.md (your architecture) and incidents.md (past solutions).
    """
    # Which files to load
    doc_files = set(STACK_DOCS.get(stack, STACK_DOCS["unknown"]))

    # Type-specific additions
    if service_type in ("database",):
        doc_files.add("postgres.md")
    elif service_type in ("cache", "cache-and-queue"):
        doc_files.add("redis.md")
    elif service_type in ("worker", "queue-worker"):
        doc_files.add("redis.md")  # Workers usually use Redis queues

    # Extra topics if Claude asks for specific docs
    if extra_topics:
        for topic in extra_topics:
            candidate = f"{topic.lower().replace(' ', '-')}.md"
            if os.path.exists(os.path.join(KNOWLEDGE_DIR, candidate)):
                doc_files.add(candidate)

    # Always include platform-specific and incident history
    for f in ALWAYS_INCLUDE:
        doc_files.add(f)

    # Load and concatenate
    sections = []
    total_chars = 0

    for filename in sorted(doc_files):
        filepath = os.path.join(KNOWLEDGE_DIR, filename)
        if not os.path.exists(filepath):
            continue

        try:
            with open(filepath, "r") as f:
                content = f.read().strip()

            if not content:
                continue

            # Respect the char limit
            if total_chars + len(content) > MAX_DOCS_CHARS:
                remaining = MAX_DOCS_CHARS - total_chars
                if remaining > 500:
                    content = content[:remaining] + "\n\n[... truncated for context length ...]"
                else:
                    break

            sections.append(f"=== {filename} ===\n{content}")
            total_chars += len(content)

        except Exception as e:
            print(f"  Warning: Could not read {filepath}: {e}")

    if not sections:
        return ""

    return (
        "REFERENCE DOCUMENTATION (use for diagnosis):\n\n"
        + "\n\n".join(sections)
    )


def list_available_docs() -> list[dict]:
    """List all knowledge docs with their sizes."""
    docs = []
    if not os.path.exists(KNOWLEDGE_DIR):
        return docs

    for filepath in sorted(glob.glob(os.path.join(KNOWLEDGE_DIR, "*.md"))):
        filename = os.path.basename(filepath)
        size = os.path.getsize(filepath)
        docs.append({"file": filename, "size_kb": round(size / 1024, 1)})

    return docs


def add_incident_learning(service_name: str, stack: str, error_summary: str,
                           resolution: str, conversation_summary: str):
    """
    Append a resolved incident to incidents.md so Claude learns from it.
    Next time a similar error happens, Claude has the solution in context.
    """
    filepath = os.path.join(KNOWLEDGE_DIR, "incidents.md")

    entry = f"""
### {service_name} ({stack})
**Error:** {error_summary}
**Resolution:** {resolution}
**Key insight:** {conversation_summary}

---
"""
    try:
        os.makedirs(KNOWLEDGE_DIR, exist_ok=True)
        with open(filepath, "a") as f:
            f.write(entry)
    except Exception as e:
        print(f"  Warning: Could not write incident learning: {e}")
