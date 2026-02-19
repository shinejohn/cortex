"""
github.py — GitHub read + write operations.

READING: repos, file trees, file content, recent commits
WRITING: create branches, commit files, open pull requests

When Claude recommends a code fix, Cortex creates a branch,
commits the change, and opens a PR. Your normal review workflow
stays intact. Cortex participates in it, not bypasses it.
"""

import os
import base64
from datetime import datetime, timezone

import httpx

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_API = "https://api.github.com"


def _headers():
    h = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"token {GITHUB_TOKEN}"
    return h


async def _get(url: str) -> dict | list | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, headers=_headers())
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()
    except Exception as e:
        print(f"  GitHub GET error: {e}")
        return None


async def _post(url: str, data: dict) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, json=data, headers=_headers())
            r.raise_for_status()
            return r.json()
    except Exception as e:
        print(f"  GitHub POST error: {e}")
        return None


async def _put(url: str, data: dict) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.put(url, json=data, headers=_headers())
            if r.status_code in (200, 201):
                return r.json()
            print(f"  GitHub PUT {r.status_code}: {r.text[:200]}")
            return None
    except Exception as e:
        print(f"  GitHub PUT error: {e}")
        return None


# ---------------------------------------------------------------------------
# Reading
# ---------------------------------------------------------------------------

async def get_repo(owner: str, repo: str) -> dict | None:
    return await _get(f"{GITHUB_API}/repos/{owner}/{repo}")


async def get_file_tree(owner: str, repo: str, branch: str = "main") -> list[str]:
    data = await _get(f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1")
    if not data:
        return []
    return [item["path"] for item in data.get("tree", []) if item.get("type") == "blob"]


async def get_file_content(owner: str, repo: str, path: str, branch: str = "main") -> str | None:
    data = await _get(f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}?ref={branch}")
    if not data or "content" not in data:
        return None
    try:
        return base64.b64decode(data["content"]).decode("utf-8", errors="replace")
    except Exception:
        return None


async def get_file_sha(owner: str, repo: str, path: str, branch: str = "main") -> str | None:
    """Get a file's SHA (needed for updates)."""
    data = await _get(f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}?ref={branch}")
    if not data:
        return None
    return data.get("sha")


async def get_recent_commits(owner: str, repo: str, branch: str = "main", limit: int = 10) -> list[dict]:
    data = await _get(f"{GITHUB_API}/repos/{owner}/{repo}/commits?sha={branch}&per_page={limit}")
    if not data or not isinstance(data, list):
        return []
    return [
        {
            "sha": c["sha"][:8],
            "message": c.get("commit", {}).get("message", "").split("\n")[0],
            "author": c.get("commit", {}).get("author", {}).get("name", ""),
            "date": c.get("commit", {}).get("author", {}).get("date", ""),
        }
        for c in data
    ]


# ---------------------------------------------------------------------------
# Writing — branches, commits, pull requests
# ---------------------------------------------------------------------------

async def create_branch(owner: str, repo: str, branch_name: str, from_branch: str = "main") -> bool:
    """Create a new branch. Cortex NEVER pushes to main."""
    data = await _get(f"{GITHUB_API}/repos/{owner}/{repo}/git/refs/heads/{from_branch}")
    if not data:
        return False

    sha = data.get("object", {}).get("sha")
    if not sha:
        return False

    result = await _post(f"{GITHUB_API}/repos/{owner}/{repo}/git/refs", {
        "ref": f"refs/heads/{branch_name}",
        "sha": sha,
    })
    return result is not None


async def commit_file(owner: str, repo: str, branch: str, path: str,
                      content: str, message: str) -> bool:
    """Create or update a file on a branch."""
    encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")

    payload = {
        "message": message,
        "content": encoded,
        "branch": branch,
    }

    # Check if file exists to get its SHA
    existing_sha = await get_file_sha(owner, repo, path, branch)
    if existing_sha:
        payload["sha"] = existing_sha

    result = await _put(f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}", payload)
    return result is not None


async def create_pull_request(owner: str, repo: str, branch: str,
                               title: str, body: str, base: str = "main") -> dict | None:
    """Open a pull request with Cortex's diagnosis."""
    result = await _post(f"{GITHUB_API}/repos/{owner}/{repo}/pulls", {
        "title": title,
        "body": body,
        "head": branch,
        "base": base,
    })

    if not result:
        return None

    return {
        "number": result.get("number"),
        "url": result.get("html_url"),
        "title": title,
        "branch": branch,
    }


async def propose_fix(owner: str, repo: str, changes: list[dict],
                       title: str, diagnosis: str) -> dict | None:
    """
    Full workflow: branch → commit changes → open PR.

    changes: [{"path": "config/database.php", "content": "...", "message": "Fix db config"}]
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    safe = title.lower().replace(" ", "-")[:40]
    branch = f"cortex/{safe}-{timestamp}"

    if not await create_branch(owner, repo, branch):
        return None

    for change in changes:
        ok = await commit_file(owner, repo, branch, change["path"],
                               change["content"], change["message"])
        if not ok:
            print(f"  Failed to commit {change['path']}")
            return None

    body = f"""## Cortex Automated Fix

{diagnosis}

---
*This PR was created by Cortex based on Claude's diagnosis. Review before merging.*
"""

    return await create_pull_request(owner, repo, branch, title, body)
