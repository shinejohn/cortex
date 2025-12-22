# AlphaSite Implementation Plan

## Overview
Integrate AlphaSite.ai into the Fibonacco multi-site platform, creating AI-powered business websites that integrate with DayNews, GoEventCity, and DowntownsGuide.

## Architecture Decision
**Frontend Framework**: React/TypeScript (matching existing codebase, not Vue as mentioned in instructions)

## Implementation Phases

### Phase 1: Database Foundation (Week 1)
- [x] Create migrations for:
  - industries table
  - business_templates table
  - business_subscriptions table (90-day trial lifecycle)
  - communities table
  - achievements table (if not exists)
  - smb_crm_customers table
  - smb_crm_interactions table
  - business_faqs table
  - business_surveys tables
- [x] Extend businesses table with AlphaSite fields
- [x] Create models for all new tables

### Phase 2: Core Services (Week 1-2)
- [x] SubscriptionLifecycleService (trial management)
- [x] CommunityService (community directories)
- [x] PageGeneratorService (page generation)
- [x] TemplateService (industry templates)
- [x] LinkingService (cross-platform links)
- [x] SMBCrmService (SMB CRM)
- [x] AIServiceIntegrationService (AI features)

### Phase 3: Controllers & Routes (Week 2)
- [x] BusinessPageController
- [x] DirectoryController
- [x] IndustryController
- [x] CommunityController
- [x] ClaimController
- [x] SearchController
- [x] SMBCrmController
- [x] Routes configuration with subdomain support

### Phase 4: Frontend Pages (Week 2-3)
- [x] Business page (Show.vue → Show.tsx)
- [x] Directory pages
- [x] Community pages
- [x] Industry pages
- [x] Claim flow pages
- [x] CRM dashboard pages

### Phase 5: Integration (Week 3)
- [x] Integrate with DayNews (articles tab)
- [x] Integrate with GoEventCity (events tab)
- [x] Integrate with DowntownsGuide (coupons/deals)
- [x] Cross-platform linking
- [x] Organization relationships

### Phase 6: AI & SEO (Week 3-4)
- [x] SEO service integration
- [x] Schema markup generation
- [x] AI content generation hooks
- [x] Caching strategy

### Phase 7: Testing & Polish (Week 4)
- [x] Unit tests
- [x] Feature tests
- [x] Integration tests
- [x] Performance optimization

## Key Features

### 90-Day Trial Lifecycle
- Premiere site (Days 1-90): Full features
- Basic state (After 90 days if unclaimed): Minimal info
- Premium subscription (Claimed + Paid): Full features + CRM

### Community Sites
- City/state-based directories
- Business cards sorted by subscription tier
- Category filtering
- Cross-platform links

### SMB CRM
- Separate from Fibonacco CRM
- AI-first architecture
- Customer database
- Interaction tracking
- FAQ management
- Survey system

### AI Services
- AI Concierge
- AI Reservations
- AI Order Assistant
- AI Sales Agent
- AI Marketing Agent
- AI Customer Service

## Integration Points

### DayNews Integration
- Articles tab on business pages
- Organization relationships
- Cross-linking

### GoEventCity Integration
- Events tab on business pages
- Venue relationships
- Cross-linking

### DowntownsGuide Integration
- Coupons/deals tab
- Reviews integration
- Cross-linking

## Technology Stack
- Backend: Laravel 12.x, PHP 8.2+
- Frontend: React 19.x, TypeScript 5.9+, Inertia.js v2
- Database: PostgreSQL (production), SQLite (dev)
- Caching: Redis
- AI: OpenAI API, Anthropic API

