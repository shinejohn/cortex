# Fibonacco AI Gateway
## Complete Implementation Guide

**Version:** 1.0  
**Date:** January 2026  
**Document Type:** Master Implementation Specification

---

# Table of Contents

1. [Overview](#1-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Implementation Phases](#3-implementation-phases)
4. [Who Does What](#4-who-does-what)
5. [Related Documents](#5-related-documents)

---

# 1. Overview

## What We're Building

A centralized AI system that connects all Fibonacco platforms:

- **Day.News** - Hyperlocal news publishing
- **TaskJuggler** - Task and project management
- **Operations Center** - Multi-community management

## Why We Need It

Currently, each platform operates in isolation. The AI Gateway enables:

1. **Cross-platform queries** - "Find businesses in Day.News that have overdue tasks in TaskJuggler"
2. **Cross-platform actions** - "Create TaskJuggler tasks for articles needing images"
3. **Unified workflows** - One button creates articles, social posts, tasks, and calendar appointments across all systems

## The Components

| Component | Type | Purpose |
|-----------|------|---------|
| `fibonacco/ai-tools-core` | Composer Package | Shared base classes, infrastructure tools |
| `fibonacco/ai-gateway-client` | Composer Package | HTTP client for calling the Gateway |
| `ai-gateway` | Laravel Application | Central AI service with multi-database access |
| Platform Domain Tools | Per-platform code | Platform-specific AI tools |

---

# 2. Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI GATEWAY SERVICE                                      │
│                         (Separate Laravel Application)                               │
│                                                                                      │
│   Database Connections:           Tools:                    APIs:                    │
│   ├── daynews_db (read)          ├── platform_database     ├── POST /api/ai/query   │
│   ├── taskjuggler_db (read)      ├── platform_schema       ├── POST /api/ai/agent   │
│   ├── opscenter_db (read)        ├── daynews_api           ├── POST /api/ai/workflow│
│   └── gateway_db (read/write)    ├── taskjuggler_api       └── GET /api/ai/tools    │
│                                  └── opscenter_api                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│        DAY.NEWS           │ │      TASKJUGGLER          │ │     OPS CENTER            │
│                           │ │                           │ │                           │
│  Packages:                │ │  Packages:                │ │  Packages:                │
│  • ai-tools-core          │ │  • ai-tools-core          │ │  • ai-tools-core          │
│  • ai-gateway-client      │ │  • ai-gateway-client      │ │  • ai-gateway-client      │
│                           │ │                           │ │                           │
│  Domain Tools:            │ │  Domain Tools:            │ │  Domain Tools:            │
│  • ArticleTool            │ │  • TaskTool               │ │  • CommunityTool          │
│  • BusinessTool           │ │  • ProjectTool            │ │  • MetricsTool            │
│  • PollTool               │ │  • TeamTool               │ │  • DeploymentTool         │
│  • OpportunityTool        │ │  • TimeTool               │ │  • AlertTool              │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

---

# 3. Implementation Phases

## Phase 1: Shared Packages (Week 1)
**Owner:** Lead Developer / Day.News Team

1. Create `fibonacco/ai-tools-core` GitHub repo
2. Create `fibonacco/ai-gateway-client` GitHub repo
3. Test in Day.News

**Document:** `2_SHARED_PACKAGES_SPEC.md`

## Phase 2: AI Gateway Service (Week 2)
**Owner:** Infrastructure / DevOps

1. Create new Laravel application
2. Configure multi-database connections
3. Build cross-platform tools
4. Deploy as service

**Document:** `3_AI_GATEWAY_SPEC.md`

## Phase 3: Platform Integration (Week 3)
**Owner:** Each Platform Team

1. Install packages
2. Configure for platform
3. Build domain-specific tools

**Documents:**
- `4_DAYNEWS_INTEGRATION.md`
- `5_TASKJUGGLER_INTEGRATION.md`
- `6_OPSCENTER_INTEGRATION.md`

## Phase 4: Workflows (Week 4)
**Owner:** Operations Center Team

1. Build workflow orchestrator
2. Create standard workflows
3. Test end-to-end

---

# 4. Who Does What

## Lead Developer / Cursor (Day.News)

- [ ] Create `ai-tools-core` package
- [ ] Create `ai-gateway-client` package
- [ ] Test packages in Day.News
- [ ] Build Day.News domain tools
- [ ] Create AI Gateway service (or delegate)

## TaskJuggler Team / Antigravity

- [ ] Install packages in TaskJuggler
- [ ] Build TaskJuggler domain tools
- [ ] Create internal API endpoints for Gateway
- [ ] Test cross-platform queries

## Operations Center Team

- [ ] Install packages in Ops Center
- [ ] Build Ops Center domain tools
- [ ] Build workflow orchestrator
- [ ] Create campaign workflows

## DevOps / Infrastructure

- [ ] Create read-only database users
- [ ] Deploy AI Gateway service
- [ ] Configure networking between services
- [ ] Set up API authentication

---

# 5. Related Documents

| Document | Purpose | Who Needs It |
|----------|---------|--------------|
| `2_SHARED_PACKAGES_SPEC.md` | Complete code for ai-tools-core and ai-gateway-client | Lead developer building packages |
| `3_AI_GATEWAY_SPEC.md` | AI Gateway Laravel app specification | Gateway developer |
| `4_DAYNEWS_INTEGRATION.md` | Day.News integration guide | Day.News team |
| `5_TASKJUGGLER_INTEGRATION.md` | TaskJuggler integration guide | TaskJuggler team |
| `6_OPSCENTER_INTEGRATION.md` | Ops Center integration guide | Ops Center team |

---

# Quick Start Checklist

```
□ Week 1: Packages
  □ Create ai-tools-core repo
  □ Create ai-gateway-client repo
  □ Tag v1.0.0 releases
  □ Test in Day.News

□ Week 2: Gateway
  □ Create ai-gateway Laravel app
  □ Create read-only DB users
  □ Deploy Gateway service
  □ Test /api/ai/query endpoint

□ Week 3: Platforms
  □ Day.News: Install packages, build tools
  □ TaskJuggler: Install packages, build tools
  □ Ops Center: Install packages, build tools

□ Week 4: Workflows
  □ Build WorkflowOrchestrator
  □ Create "Business Event Campaign" workflow
  □ Test end-to-end
```
