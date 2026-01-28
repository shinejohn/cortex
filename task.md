# Project Tasks

## Phase 1: Stability & Testing (Completed)
- [x] Fix `RegionControllerTest` failures.
- [x] Fix `TenantControllerTest` failures.
- [x] Implement missing Policy logic.
- [x] Implement missing Routes (Delete Tenant).

## Phase 2: Production Readiness & Documentation (Completed)
- [x] Verify Production deployment Configuration.
    - [x] Review `.env.example` and `config/app.php`: Good defaults found (debug=false, env=production).
    - [x] Queue/Cache: Horizon and Redis configured.
    - [x] Admin Panel: Filament v4 detected.
- [x] Migrate/Generate API documentation.
    - [x] Scribe configured.
    - [x] Documentation generated successfully at `public/docs`.

## Phase 3: Frontend-Backend Integration Assessment (Completed)
- [x] Detailed Frontend-BACKEND Crud assessment.
    - [x] **Client Frontend (Inertia/React)**:
        - Used for public-facing sites (`day-news`, `event-city`).
        - "Workspace" concept maps to user teams.
        - `select-regions.tsx` confirms Region selection exists.
        - No Tenant management in React (expected).
    - [x] **Admin Backend (Filament)**:
        - `Tenant` and `Region` management likely handled here (Backend-rendered).
        - Filament dependencies present in `composer.json`.
    - [x] **API Consistency**:
        - `TenantController` is API-only, likely for external integrations or Super Admin API access.
        - `RegionController` provides necessary endpoints for frontend selection.

## Phase 4: Newsroom Re-Architecture (In Progress)
- [x] Create Architecture Strategy.
- [x] **Phase 1: Foundation (Clean Up)**
    - [x] Define `Signal` Data Structure (DTO).
    - [x] Create Database Migrations (`signals`, `influencers`).
    - [x] Implement `Signal` Pipeline/Processor.
- [x] **Phase 2: Unification (Connect)**
    - [x] Refactor RSS Ingestion to use `RssScanner`.
    - [x] Refactor Email Ingestion to use `EmailScanner`.
    - [x] Implement `SocialScanner` & `WebScanner`.
- [x] **Phase 3: Intelligence (Empower)**
    - [x] Implement `InfluencerProfiler`.
    - [x] Implement `QuotePursuitManager`.
    - [x] Implement `CommunityHistorian`.

## Phase 5: AI Platform Integration (In Progress)
- [x] **Step 1: Shared Packages (Local)**
    - [x] Scaffold `packages/fibonacco/ai-tools-core` structure.
    - [x] Implement `ai-tools-core` (Contracts, BaseTool, Registry, Infrastructure Tools).
    - [x] Scaffold `packages/fibonacco/ai-gateway-client` structure.
    - [x] Implement `ai-gateway-client` (Client, Facade).
    - [x] Update root `composer.json` to include local packages.
- [x] **Step 2: Configuration & Service Providers**
    - [x] Publish and configure `ai-tools-core.php`.
    - [x] Publish and configure `ai-gateway-client.php`.
    - [x] Register Service Providers in `app.php`.
- [x] **Step 3: Day.News Domain Tools**
    - [x] Implement `BusinessTool`.
    - [x] Implement `ArticleTool`.
    - [x] Implement `PollTool`.
    - [x] Implement `OpportunityTool`.
    - [x] Implement `NewsroomTool` (New).
    - [x] Register tools in `AiToolsServiceProvider`.
- [x] **Step 4: Verification**
    - [x] Test local tool execution via Tinker.


