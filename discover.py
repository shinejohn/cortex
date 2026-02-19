"""
discover.py — Deep platform learning.

Interrogates Railway API and GitHub to build complete knowledge:
    Railway  → services, variables, deploys, volumes, domains
    GitHub   → repos, code, commits, file trees, configs
    Analysis → dependency maps, variable validation, topology checks
"""

import os
import re

import railway
import github
from knowledge import Knowledge

PROJECT_ID = os.getenv("RAILWAY_PROJECT_ID", "")
ENVIRONMENT_ID = os.getenv("RAILWAY_ENVIRONMENT_ID", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")


async def discover_all(kb: Knowledge):
    if not PROJECT_ID:
        print("  RAILWAY_PROJECT_ID not set — skipping discovery")
        return

    print("  Phase 1: Railway services...")
    services = await railway.get_services(PROJECT_ID)
    print(f"  Found {len(services)} services")

    for svc in services:
        name = svc.get("name", "")
        service_id = svc.get("id", "")
        if not name:
            continue

        instances = svc.get("serviceInstances", {}).get("edges", [])
        instance = instances[0].get("node", {}) if instances else {}

        source = instance.get("source", {})
        repo = source.get("repo", "")
        branch = source.get("branch", "")

        domains_info = instance.get("domains", {})
        service_domains = [d.get("domain", "") for d in domains_info.get("serviceDomains", [])]
        custom_domains = [d.get("domain", "") for d in domains_info.get("customDomains", [])]

        start_command = instance.get("startCommand", "")
        build_command = instance.get("buildCommand", "")

        stype = _detect_type(name)
        stack = _detect_stack(name, start_command, build_command)
        role = _detect_role(name, stype)

        kb.upsert_service(
            name,
            service_id=service_id,
            environment_id=ENVIRONMENT_ID,
            type=stype,
            stack=stack,
            role=role,
            repo=repo,
            branch=branch,
            health_url=_build_health_url(service_domains, custom_domains),
        )

        if ENVIRONMENT_ID:
            variables = await railway.get_variables(service_id, ENVIRONMENT_ID)
            if variables:
                kb.store_variables(name, variables)
                _detect_dependencies(name, variables, kb)
                _validate_variables(name, variables, stype, stack, kb)

        deploys = await railway.get_recent_deploys(service_id, ENVIRONMENT_ID)
        if deploys:
            kb.store_deploys(name, deploys)

        print(f"    {name}: type={stype} stack={stack} repo={repo}:{branch}")

    if GITHUB_TOKEN:
        print("  Phase 2: GitHub code...")
        await _discover_code(kb)
    else:
        print("  GITHUB_TOKEN not set — skipping code discovery")

    print("  Phase 3: Topology validation...")
    kb.clear_flags()
    _validate_topology(kb)
    _cross_validate_variables(kb)

    summary = kb.get_all_services()
    flags = kb.get_flags()
    print(f"  Discovery complete: {len(summary)} services, {len(flags)} issues found")
    kb.log("discovery", f"Full discovery: {len(summary)} services, {len(flags)} flags")


# ---------------------------------------------------------------------------
# GitHub code discovery
# ---------------------------------------------------------------------------

async def _discover_code(kb: Knowledge):
    services = kb.get_all_services()
    repos = {}
    for svc in services:
        repo = svc.get("repo", "")
        if repo and repo not in repos:
            repos[repo] = []
        if repo:
            repos[repo].append(svc["name"])

    for repo_full, svc_names in repos.items():
        parts = repo_full.split("/")
        if len(parts) != 2:
            continue
        owner, repo_name = parts

        repo_info = await github.get_repo(owner, repo_name)
        if not repo_info:
            print(f"    Could not access {repo_full}")
            continue

        for svc_name in svc_names:
            svc = kb.get_service(svc_name)
            branch = svc.get("branch", "") or repo_info.get("default_branch", "main")

            tree = await github.get_file_tree(owner, repo_name, branch)
            if tree:
                kb.store_file_tree(svc_name, tree)
                project_info = _analyze_file_tree(tree)
                if project_info:
                    kb.store_project_info(svc_name, project_info)

            commits = await github.get_recent_commits(owner, repo_name, branch, limit=10)
            if commits:
                kb.store_commits(svc_name, commits)

            key_files = _identify_key_files(tree or [])
            for file_path in key_files:
                content = await github.get_file_content(owner, repo_name, file_path, branch)
                if content:
                    kb.store_file(svc_name, file_path, content)

            print(f"    {svc_name}: {len(tree or [])} files, {len(commits or [])} commits")


def _identify_key_files(tree: list[str]) -> list[str]:
    key_patterns = [
        "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
        "railway.toml", "railway.json", "nixpacks.toml", "Procfile",
        "composer.json", "artisan", ".env.example",
        "config/database.php", "config/queue.php", "config/cache.php",
        "config/horizon.php", "config/app.php",
        "routes/web.php", "routes/api.php",
        "package.json", "tsconfig.json", "vite.config.ts", "vite.config.js",
        "tailwind.config.js", "tailwind.config.ts",
        "requirements.txt", "pyproject.toml",
        "README.md",
    ]
    matches = []
    for f in tree:
        for pattern in key_patterns:
            if f == pattern or f.endswith("/" + pattern):
                matches.append(f)
                break
    return matches[:20]


def _analyze_file_tree(tree: list[str]) -> dict:
    info = {
        "framework": "unknown", "language": "unknown",
        "has_dockerfile": False, "has_tests": False, "has_ci": False,
        "has_migrations": False, "has_api_routes": False, "has_queue_workers": False,
    }
    for f in tree:
        fl = f.lower()
        if "artisan" in fl:
            info["framework"] = "laravel"; info["language"] = "php"
        elif "manage.py" in fl:
            info["framework"] = "django"; info["language"] = "python"
        elif "next.config" in fl:
            info["framework"] = "nextjs"; info["language"] = "javascript"
        elif "nuxt.config" in fl:
            info["framework"] = "nuxt"; info["language"] = "javascript"
        if info["language"] == "unknown":
            if "composer.json" in fl: info["language"] = "php"
            elif "package.json" in fl: info["language"] = "javascript"
            elif "requirements.txt" in fl: info["language"] = "python"
        if "dockerfile" in fl: info["has_dockerfile"] = True
        if "/tests/" in fl or "/test/" in fl: info["has_tests"] = True
        if ".github/workflows" in fl: info["has_ci"] = True
        if "/migrations/" in fl: info["has_migrations"] = True
        if "routes/api" in fl: info["has_api_routes"] = True
        if "horizon" in fl or "queue" in fl: info["has_queue_workers"] = True
    return info


# ---------------------------------------------------------------------------
# Dependency and variable detection
# ---------------------------------------------------------------------------

def _detect_dependencies(name: str, variables: dict, kb: Knowledge):
    for key, value in variables.items():
        val = str(value)
        if "${{" in val:
            refs = re.findall(r'\$\{\{([^.]+)\.', val)
            for ref in refs:
                dep_type = _classify_dependency(key)
                kb.set_dependency(name, ref, dep_type)
        if any(k in key.upper() for k in ("DATABASE", "DB_HOST", "PGHOST")):
            if "${{" not in val and val and ("." in val or ":" in val):
                kb.add_flag(name, "hardcoded_db",
                    f"{key} appears hardcoded ({val[:40]}...) — should be a Railway reference")


def _classify_dependency(var_name: str) -> str:
    vn = var_name.upper()
    if any(k in vn for k in ("DATABASE", "DB_", "PG", "MYSQL", "MONGO")): return "database"
    if any(k in vn for k in ("REDIS", "CACHE", "MEMCACHE")): return "cache"
    if any(k in vn for k in ("QUEUE", "AMQP", "RABBIT")): return "queue"
    if any(k in vn for k in ("API_URL", "SERVICE_URL", "ENDPOINT")): return "api"
    return "service"


def _validate_variables(name: str, variables: dict, stype: str, stack: str, kb: Knowledge):
    if stack == "laravel" or stype == "app":
        for var in ["APP_KEY", "APP_ENV"]:
            if var not in variables:
                kb.add_flag(name, "missing_variable", f"Expected {var} but it's not set")
        db_vars = [k for k in variables if any(x in k.upper() for x in ("DATABASE", "DB_", "PG"))]
        if not db_vars and stype == "app":
            kb.add_flag(name, "no_database_config", "No database variables found")


def _validate_topology(kb: Knowledge):
    all_services = {s["name"]: s for s in kb.get_all_services()}
    for name in all_services:
        deps = kb.get_dependencies(name)
        for dep in deps:
            if dep not in all_services:
                kb.add_flag(name, "missing_dependency",
                    f"Depends on '{dep}' but that service doesn't exist")


def _cross_validate_variables(kb: Knowledge):
    """Check for same variable with different values across services."""
    all_vars = {}
    for svc in kb.get_all_services():
        variables = kb.get_variables(svc["name"])
        for key, value in variables.items():
            if key not in all_vars:
                all_vars[key] = []
            all_vars[key].append((svc["name"], value))

    skip = {"PORT", "RAILWAY_PUBLIC_DOMAIN", "RAILWAY_PRIVATE_DOMAIN", "RAILWAY_ENVIRONMENT_ID"}
    for key, occurrences in all_vars.items():
        if len(occurrences) > 1 and key not in skip:
            values = set(v for _, v in occurrences if isinstance(v, str))
            if len(values) > 1:
                svcs = [n for n, _ in occurrences]
                for s in svcs:
                    kb.add_flag(s, "inconsistent_variable",
                        f"'{key}' has different values across: {', '.join(svcs)}")


# ---------------------------------------------------------------------------
# Detection helpers
# ---------------------------------------------------------------------------

def _detect_type(name: str) -> str:
    n = name.lower()
    if any(x in n for x in ("postgres", "mysql", "mariadb", "mongo", "database")): return "database"
    if any(x in n for x in ("redis", "memcache", "cache", "valkey")): return "cache"
    if any(x in n for x in ("horizon", "worker", "queue", "celery")): return "worker"
    if any(x in n for x in ("cron", "scheduler", "schedule")): return "scheduler"
    return "app"

def _detect_stack(name: str, start_cmd: str, build_cmd: str) -> str:
    combined = f"{name} {start_cmd} {build_cmd}".lower()
    if "artisan" in combined or "php" in combined or "laravel" in combined: return "laravel"
    if "node" in combined or "npm" in combined or "next" in combined: return "node"
    if "python" in combined or "uvicorn" in combined or "gunicorn" in combined: return "python"
    if "postgres" in combined: return "postgres"
    if "redis" in combined: return "redis"
    return "unknown"

def _detect_role(name: str, stype: str) -> str:
    n = name.lower()
    if stype == "database": return "data_store"
    if stype == "cache": return "cache_store"
    if stype == "worker": return "background_processing"
    if any(x in n for x in ("api", "backend")): return "api_server"
    if any(x in n for x in ("frontend", "web", "app", "site")): return "web_frontend"
    return "application"

def _build_health_url(service_domains: list, custom_domains: list) -> str:
    domain = (custom_domains or service_domains or [""])[0]
    return f"https://{domain}/health" if domain else ""
