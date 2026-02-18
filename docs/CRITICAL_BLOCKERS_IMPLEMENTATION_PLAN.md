# Critical Blockers Implementation Plan

**Source:** Cursor Critical Blockers Instructions (Feb 18, 2026)  
**Infrastructure:** Railway (NO AWS in production)

## Priority Order

| # | Task | Time Est. | Blocks | Status |
|---|------|-----------|--------|--------|
| 1 | Security: Remove .env.bak from git history | 30 min | Everything | ✅ |
| 2 | Security: Update .gitignore + remove .DS_Store | 15 min | Everything | ✅ |
| 3 | Security: Lock down Horizon dashboard | 30 min | Production | ✅ |
| 4 | Infrastructure: Fix 502 errors | 2-3 hrs | All frontend | ✅ |
| 5 | Infrastructure: Database FK index migration | 1-2 hrs | Performance | ✅ |
| 6 | Infrastructure: SSR verification & fix | 2-3 hrs | SEO | ✅ |
| 7 | Pipeline: Build ContentRoutingService bridge | 3-4 hrs | Content flow | ✅ |

---

## Task 1: Remove .env.bak from Git History ✅

**Verification:** `git log --all --full-history -- .env.bak` returns empty

**Completed:** git filter-repo removed .env.bak and .env.testing.bak from entire history.

**Next step:** Force push when ready: `git push origin --force --all`

---

## Task 2: Update .gitignore + Remove .DS_Store ✅

**Completed:** Fixed .gitignore typo (AdvertisementPayment.php}), removed 18 .DS_Store files from tracking.

---

## Task 3: Lock Down Horizon Dashboard ✅

**Completed:** HorizonServiceProvider gate uses config('app.admin_emails'). Set ADMIN_EMAILS or APP_ADMIN_EMAILS in Railway.

---

## Task 4: Fix 502 Errors ✅

**Completed:** Config uses env() for DB/Redis. Added PDO options (timeout, persistent=false), Railway comments.

---

## Task 5: Database FK Index Migration ✅

**Completed:** Migration `2026_02_18_162057_add_missing_foreign_key_indexes.php` adds indexes for _id columns.

---

## Task 6: SSR Verification ✅

**Completed:** config/inertia.php has Railway comment. Set INERTIA_SSR_URL in Railway.

---

## Task 7: ContentRoutingService Bridge ✅

**Completed:** ContentRoutingService, ProcessClassifiedContentJob, migrations exist and are wired.

---

## Global Rules

- **Railway only** - No AWS references in production config
- **Database:** env('DB_HOST'), etc. via Railway ${{Postgres.*}}
- **Redis:** env('REDIS_HOST'), etc. via Railway ${{Valkey.*}}
- **SSR:** Railway service, not AWS ECS
