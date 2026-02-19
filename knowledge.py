"""
knowledge.py — Everything Cortex knows, stored in SQLite.

Tables:
    services            — Every service: type, stack, role, repo, health_url
    dependencies        — Who depends on what
    service_variables   — Environment variables with reference detection
    service_files       — Key config files (actual content)
    service_commits     — Recent git commits
    service_deploys     — Deploy history
    service_info        — File tree, framework, language, capabilities
    flags               — Issues discovered during analysis
    incidents           — Full incident reports with Claude conversations
    event_log           — Everything that happened
"""

import os
import json
import sqlite3
from datetime import datetime, timezone


class Knowledge:

    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = os.getenv("CORTEX_DB_PATH", "/data/cortex.db")
        os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else ".", exist_ok=True)
        self.db = sqlite3.connect(db_path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self._init_tables()

    def _init_tables(self):
        c = self.db.cursor()

        c.execute("""CREATE TABLE IF NOT EXISTS services (
            name TEXT PRIMARY KEY,
            service_id TEXT DEFAULT '',
            environment_id TEXT DEFAULT '',
            type TEXT DEFAULT 'app',
            stack TEXT DEFAULT 'unknown',
            role TEXT DEFAULT 'application',
            repo TEXT DEFAULT '',
            branch TEXT DEFAULT '',
            health_url TEXT DEFAULT '',
            status TEXT DEFAULT 'unknown',
            updated_at TEXT DEFAULT ''
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS dependencies (
            service TEXT,
            depends_on TEXT,
            dep_type TEXT DEFAULT '',
            PRIMARY KEY (service, depends_on)
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS service_variables (
            service TEXT,
            variable TEXT,
            value TEXT DEFAULT '',
            is_reference INTEGER DEFAULT 0,
            references_service TEXT DEFAULT '',
            PRIMARY KEY (service, variable)
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS service_files (
            service TEXT,
            path TEXT,
            content TEXT DEFAULT '',
            updated_at TEXT DEFAULT '',
            PRIMARY KEY (service, path)
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS service_commits (
            service TEXT,
            sha TEXT,
            message TEXT DEFAULT '',
            author TEXT DEFAULT '',
            date TEXT DEFAULT '',
            PRIMARY KEY (service, sha)
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS service_deploys (
            service TEXT,
            deploy_id TEXT,
            status TEXT DEFAULT '',
            created_at TEXT DEFAULT '',
            meta TEXT DEFAULT '{}',
            PRIMARY KEY (service, deploy_id)
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS service_info (
            service TEXT PRIMARY KEY,
            file_tree TEXT DEFAULT '[]',
            framework TEXT DEFAULT 'unknown',
            language TEXT DEFAULT 'unknown',
            capabilities TEXT DEFAULT '{}'
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS flags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service TEXT,
            flag_type TEXT,
            message TEXT,
            created_at TEXT DEFAULT ''
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS incidents (
            incident_id TEXT PRIMARY KEY,
            service TEXT,
            data TEXT DEFAULT '{}',
            created_at TEXT DEFAULT ''
        )""")

        c.execute("""CREATE TABLE IF NOT EXISTS event_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT,
            message TEXT,
            service TEXT DEFAULT '',
            details TEXT DEFAULT '{}',
            created_at TEXT DEFAULT ''
        )""")

        self.db.commit()

    # ---------------------------------------------------------------------------
    # Services
    # ---------------------------------------------------------------------------

    def upsert_service(self, name: str, **kwargs):
        kwargs["updated_at"] = datetime.now(timezone.utc).isoformat()
        existing = self.get_service(name)

        if existing:
            sets = ", ".join(f"{k} = ?" for k in kwargs)
            vals = list(kwargs.values()) + [name]
            self.db.execute(f"UPDATE services SET {sets} WHERE name = ?", vals)
        else:
            kwargs["name"] = name
            cols = ", ".join(kwargs.keys())
            phs = ", ".join("?" * len(kwargs))
            self.db.execute(f"INSERT INTO services ({cols}) VALUES ({phs})", list(kwargs.values()))

        self.db.commit()

    def get_service(self, name: str) -> dict | None:
        row = self.db.execute("SELECT * FROM services WHERE name = ?", (name,)).fetchone()
        return dict(row) if row else None

    def get_all_services(self) -> list[dict]:
        return [dict(r) for r in self.db.execute("SELECT * FROM services").fetchall()]

    # ---------------------------------------------------------------------------
    # Dependencies
    # ---------------------------------------------------------------------------

    def set_dependency(self, service: str, depends_on: str, dep_type: str = ""):
        self.db.execute(
            "INSERT OR REPLACE INTO dependencies (service, depends_on, dep_type) VALUES (?, ?, ?)",
            (service, depends_on, dep_type))
        self.db.commit()

    def get_dependencies(self, service: str) -> list[str]:
        rows = self.db.execute("SELECT depends_on FROM dependencies WHERE service = ?", (service,)).fetchall()
        return [r["depends_on"] for r in rows]

    def get_dependents(self, service: str) -> list[str]:
        rows = self.db.execute("SELECT service FROM dependencies WHERE depends_on = ?", (service,)).fetchall()
        return [r["service"] for r in rows]

    def get_dependency_details(self, service: str) -> list[dict]:
        rows = self.db.execute("SELECT * FROM dependencies WHERE service = ?", (service,)).fetchall()
        return [dict(r) for r in rows]

    # ---------------------------------------------------------------------------
    # Variables
    # ---------------------------------------------------------------------------

    def store_variables(self, service: str, variables: dict):
        import re
        for key, value in variables.items():
            val = str(value)
            is_ref = 1 if "${{" in val else 0
            refs_service = ""
            if is_ref:
                matches = re.findall(r'\$\{\{([^.]+)\.', val)
                if matches:
                    refs_service = matches[0]

            self.db.execute(
                "INSERT OR REPLACE INTO service_variables VALUES (?, ?, ?, ?, ?)",
                (service, key, val, is_ref, refs_service))
        self.db.commit()

    def get_variables(self, service: str) -> dict:
        rows = self.db.execute("SELECT variable, value FROM service_variables WHERE service = ?",
                               (service,)).fetchall()
        return {r["variable"]: r["value"] for r in rows}

    def get_variable_issues(self, service: str) -> list[dict]:
        rows = self.db.execute(
            "SELECT * FROM service_variables WHERE service = ? AND is_reference = 0",
            (service,)).fetchall()
        issues = []
        for r in rows:
            val = r["value"]
            key = r["variable"]
            kup = key.upper()
            if any(x in kup for x in ("DATABASE", "DB_HOST", "PGHOST", "REDIS_HOST")):
                if "." in val or ":" in val:
                    issues.append({"variable": key, "value": val,
                                   "issue": "Looks hardcoded. Should be a Railway reference?"})
        return issues

    # ---------------------------------------------------------------------------
    # Files, commits, deploys, info, flags
    # ---------------------------------------------------------------------------

    def store_file(self, service: str, path: str, content: str):
        self.db.execute(
            "INSERT OR REPLACE INTO service_files VALUES (?, ?, ?, ?)",
            (service, path, content, datetime.now(timezone.utc).isoformat()))
        self.db.commit()

    def get_files(self, service: str) -> dict[str, str]:
        rows = self.db.execute("SELECT path, content FROM service_files WHERE service = ?",
                               (service,)).fetchall()
        return {r["path"]: r["content"] for r in rows}

    def store_commits(self, service: str, commits: list[dict]):
        for c in commits:
            self.db.execute(
                "INSERT OR REPLACE INTO service_commits VALUES (?, ?, ?, ?, ?)",
                (service, c.get("sha", ""), c.get("message", ""),
                 c.get("author", ""), c.get("date", "")))
        self.db.commit()

    def get_recent_commits(self, service: str, limit: int = 10) -> list[dict]:
        rows = self.db.execute(
            "SELECT * FROM service_commits WHERE service = ? ORDER BY date DESC LIMIT ?",
            (service, limit)).fetchall()
        return [dict(r) for r in rows]

    def store_deploys(self, service: str, deploys: list[dict]):
        for d in deploys:
            self.db.execute(
                "INSERT OR REPLACE INTO service_deploys VALUES (?, ?, ?, ?, ?)",
                (service, d.get("id", ""), d.get("status", ""),
                 d.get("created_at", ""), json.dumps(d.get("meta", {}))))
        self.db.commit()

    def get_recent_deploys(self, service: str, limit: int = 5) -> list[dict]:
        rows = self.db.execute(
            "SELECT * FROM service_deploys WHERE service = ? ORDER BY created_at DESC LIMIT ?",
            (service, limit)).fetchall()
        return [dict(r) for r in rows]

    def store_file_tree(self, service: str, tree: list[str]):
        self.db.execute(
            "INSERT OR REPLACE INTO service_info (service, file_tree) VALUES (?, ?)"
            " ON CONFLICT(service) DO UPDATE SET file_tree = ?",
            (service, json.dumps(tree), json.dumps(tree)))
        self.db.commit()

    def store_project_info(self, service: str, info: dict):
        caps = json.dumps({k: v for k, v in info.items() if k.startswith("has_")})
        self.db.execute("""
            INSERT INTO service_info (service, framework, language, capabilities) VALUES (?, ?, ?, ?)
            ON CONFLICT(service) DO UPDATE SET framework=?, language=?, capabilities=?
        """, (service, info.get("framework", "unknown"), info.get("language", "unknown"), caps,
              info.get("framework", "unknown"), info.get("language", "unknown"), caps))
        self.db.commit()

    def get_project_info(self, service: str) -> dict:
        row = self.db.execute("SELECT * FROM service_info WHERE service = ?", (service,)).fetchone()
        if not row:
            return {}
        d = dict(row)
        d["capabilities"] = json.loads(d.get("capabilities", "{}"))
        return d

    def add_flag(self, service: str, flag_type: str, message: str):
        self.db.execute(
            "INSERT INTO flags (service, flag_type, message, created_at) VALUES (?, ?, ?, ?)",
            (service, flag_type, message, datetime.now(timezone.utc).isoformat()))
        self.db.commit()

    def get_flags(self, service: str = None) -> list[dict]:
        if service:
            rows = self.db.execute("SELECT * FROM flags WHERE service = ?", (service,)).fetchall()
        else:
            rows = self.db.execute("SELECT * FROM flags").fetchall()
        return [dict(r) for r in rows]

    def clear_flags(self, service: str = None):
        if service:
            self.db.execute("DELETE FROM flags WHERE service = ?", (service,))
        else:
            self.db.execute("DELETE FROM flags")
        self.db.commit()

    # ---------------------------------------------------------------------------
    # Incidents
    # ---------------------------------------------------------------------------

    def save_incident(self, incident: dict):
        self.db.execute(
            "INSERT OR REPLACE INTO incidents VALUES (?, ?, ?, ?)",
            (incident["incident_id"], incident.get("service", ""),
             json.dumps(incident, default=str), datetime.now(timezone.utc).isoformat()))
        self.db.commit()

    def get_incident(self, incident_id: str) -> dict | None:
        row = self.db.execute("SELECT data FROM incidents WHERE incident_id = ?",
                              (incident_id,)).fetchone()
        return json.loads(row["data"]) if row else None

    def get_recent_incidents(self, service: str = None, limit: int = 20) -> list[dict]:
        if service:
            rows = self.db.execute(
                "SELECT data FROM incidents WHERE service = ? ORDER BY created_at DESC LIMIT ?",
                (service, limit)).fetchall()
        else:
            rows = self.db.execute(
                "SELECT data FROM incidents ORDER BY created_at DESC LIMIT ?",
                (limit,)).fetchall()
        return [json.loads(r["data"]) for r in rows]

    # ---------------------------------------------------------------------------
    # Event log
    # ---------------------------------------------------------------------------

    def log(self, event_type: str, message: str, service: str = "", details: dict = None):
        self.db.execute(
            "INSERT INTO event_log (event_type, message, service, details, created_at) VALUES (?, ?, ?, ?, ?)",
            (event_type, message, service, json.dumps(details or {}),
             datetime.now(timezone.utc).isoformat()))
        self.db.commit()

    # ---------------------------------------------------------------------------
    # Deep context — everything Cortex knows about a service
    # ---------------------------------------------------------------------------

    def get_deep_context(self, service_name: str) -> dict:
        """Return EVERYTHING known about a service. This is what Claude sees."""
        svc = self.get_service(service_name) or {}
        info = self.get_project_info(service_name)

        return {
            "service": svc,
            "dependencies": self.get_dependency_details(service_name),
            "dependents": self.get_dependents(service_name),
            "variables": self.get_variables(service_name),
            "variable_issues": self.get_variable_issues(service_name),
            "project_info": info,
            "key_files": self.get_files(service_name),
            "recent_commits": self.get_recent_commits(service_name),
            "recent_deploys": self.get_recent_deploys(service_name),
            "recent_incidents": self.get_recent_incidents(service_name, limit=5),
            "flags": self.get_flags(service_name),
        }
