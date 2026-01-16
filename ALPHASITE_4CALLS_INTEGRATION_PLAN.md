# AlphaSite + 4calls.ai Integration Plan

## Executive Summary

This document outlines the integration of **4calls.ai** (coordinator-web) AI services with **AlphaSite** to create sellable AI-powered business services. The integration will enable AlphaSite businesses to purchase and use AI virtual assistants (Coordinators) for call handling, appointment scheduling, contact management, and more.

---

## 1. Understanding 4calls.ai Services

### Core Services Available

1. **AI Virtual Assistants (Coordinators)**
   - Role-based AI assistants (receptionist, sales, support, etc.)
   - Customizable personas and scripts
   - Voice capabilities
   - Multi-channel communication

2. **Call Management**
   - Inbound/outbound call handling
   - Call logging and transcripts
   - AI-powered call summaries
   - Call analytics and statistics

3. **Contact Management (CRM)**
   - Contact database
   - Tagging and segmentation
   - Interaction history
   - Custom fields

4. **Appointment Scheduling**
   - Calendar management
   - Availability checking
   - Automated booking
   - Appointment reminders

5. **Campaign Management**
   - Outbound campaigns
   - Lead generation
   - Follow-up automation

6. **Real-Time Operations**
   - Availability checking
   - Customer lookup
   - Booking creation
   - Lead creation

---

## 2. Integration Architecture

### High-Level Flow

```
AlphaSite Business
    ↓
AlphaSite Subscription (tier: standard/premium/enterprise)
    ↓
4calls.ai Organization (auto-created)
    ↓
4calls.ai Coordinator (AI assistant)
    ↓
4calls.ai Services (calls, appointments, contacts, campaigns)
```

### Key Integration Points

1. **Business → Organization Mapping**
   - Each AlphaSite business gets a 4calls.ai organization
   - Auto-create organization when business subscribes to AI services
   - Sync business data (name, phone, address) to organization

2. **Subscription → Service Mapping**
   - Map AlphaSite subscription tiers to 4calls.ai service packages
   - Track usage and billing
   - Enable/disable services based on subscription

3. **Service Access**
   - AlphaSite CRM dashboard integrates 4calls.ai data
   - Business owners see calls, contacts, appointments in AlphaSite UI
   - AI chat widget on business pages connects to Coordinator

---

## 3. Sellable AI Service Packages

### Package 1: **AI Receptionist** ($49/month)
**Target:** Small businesses needing basic call handling

**Includes:**
- 1 Coordinator (Receptionist role)
- 500 inbound call minutes/month
- Basic call logging
- Contact management (up to 500 contacts)
- Appointment scheduling (basic)
- AI call summaries

**Use Cases:**
- Answering basic questions
- Taking messages
- Scheduling appointments
- Forwarding urgent calls

### Package 2: **AI Sales Assistant** ($99/month)
**Target:** Sales-focused businesses

**Includes:**
- 1 Coordinator (Sales role)
- 1,000 inbound + 500 outbound call minutes/month
- Advanced call analytics
- Lead management
- Contact management (unlimited)
- Appointment scheduling (advanced)
- Campaign management (basic)
- AI-powered lead qualification

**Use Cases:**
- Lead qualification
- Follow-up calls
- Appointment booking
- Sales campaigns

### Package 3: **AI Business Suite** ($199/month)
**Target:** Growing businesses needing full CRM

**Includes:**
- 2 Coordinators (any roles)
- 2,000 inbound + 1,000 outbound call minutes/month
- Full call analytics and reporting
- Advanced CRM features
- Unlimited contacts
- Advanced appointment scheduling
- Campaign management (advanced)
- Multi-channel support (calls, SMS, email)
- AI-powered customer insights

**Use Cases:**
- Full customer lifecycle management
- Multi-channel communication
- Advanced campaigns
- Business intelligence

### Package 4: **AI Enterprise** ($399/month)
**Target:** Large businesses with high call volume

**Includes:**
- 5 Coordinators (any roles)
- 5,000 inbound + 2,500 outbound call minutes/month
- Enterprise analytics and reporting
- Custom integrations
- Priority support
- Dedicated account manager
- All features from Business Suite
- Custom AI training

**Use Cases:**
- High-volume call handling
- Enterprise CRM
- Custom workflows
- Advanced integrations

---

## 4. Implementation Plan

### Phase 1: Core Integration Service (Week 1-2)

**Files to Create:**

1. **`app/Services/AlphaSite/FourCallsIntegrationService.php`**
   - API client for 4calls.ai
   - Organization management
   - Service provisioning
   - Usage tracking

2. **`app/Http/Controllers/AlphaSite/FourCallsController.php`**
   - Endpoints for AlphaSite to interact with 4calls.ai
   - Service activation/deactivation
   - Usage reporting

3. **`config/fourcalls.php`**
   - API configuration
   - Service package definitions
   - Rate limits and quotas

4. **Database Migration:**
   - `alphasite_fourcalls_integrations` table
   - Link businesses to 4calls.ai organizations
   - Track service subscriptions
   - Store API credentials

### Phase 2: Service Packages & Billing (Week 2-3)

**Files to Create:**

1. **`app/Services/AlphaSite/AIServicePackageService.php`**
   - Package definitions
   - Package activation
   - Feature gating
   - Usage tracking

2. **Update `app/Services/AlphaSite/SubscriptionLifecycleService.php`**
   - Add AI service package selection
   - Handle package upgrades/downgrades
   - Sync with 4calls.ai

3. **Update `app/Http/Controllers/AlphaSite/ClaimController.php`**
   - Add AI service package selection during claiming
   - Show package options
   - Handle Stripe subscription for AI services

### Phase 3: CRM Integration (Week 3-4)

**Files to Create:**

1. **Update `app/Services/AlphaSite/SMBCrmService.php`**
   - Integrate 4calls.ai contacts
   - Sync call logs
   - Sync appointments
   - Unified customer view

2. **Update `app/Http/Controllers/AlphaSite/SMBCrmController.php`**
   - Add 4calls.ai data to dashboard
   - Show calls, contacts, appointments from 4calls.ai
   - Unified interface

3. **Frontend Updates:**
   - Update CRM dashboard to show 4calls.ai data
   - Add call log viewer
   - Add appointment calendar integration

### Phase 4: AI Chat Widget Integration (Week 4-5)

**Files to Create:**

1. **`app/Http/Controllers/AlphaSite/AIChatController.php`**
   - Handle chat messages from business pages
   - Route to 4calls.ai Coordinator
   - Return AI responses

2. **Update `app/Http/Controllers/AlphaSite/BusinessPageController.php`**
   - Connect AI chat to 4calls.ai
   - Handle chat sessions
   - Store chat history

3. **Frontend Updates:**
   - Update AI chat widget to use real API
   - Add typing indicators
   - Add chat history

### Phase 5: Advanced Features (Week 5-6)

**Files to Create:**

1. **`app/Services/AlphaSite/CampaignService.php`**
   - Integrate 4calls.ai campaigns
   - Campaign creation and management
   - Campaign analytics

2. **`app/Http/Controllers/AlphaSite/CampaignController.php`**
   - Campaign CRUD operations
   - Campaign execution
   - Campaign reporting

---

## 5. Database Schema

### New Tables

```sql
-- Link AlphaSite businesses to 4calls.ai organizations
CREATE TABLE alphasite_fourcalls_integrations (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id),
    organization_id VARCHAR(255) NOT NULL, -- 4calls.ai organization ID
    coordinator_id VARCHAR(255), -- Default coordinator ID
    api_key VARCHAR(255) NOT NULL, -- Encrypted API key for 4calls.ai
    service_package VARCHAR(50) NOT NULL, -- ai_receptionist, ai_sales, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    activated_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(business_id)
);

-- Track AI service usage for billing
CREATE TABLE alphasite_ai_service_usage (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id),
    service_type VARCHAR(50) NOT NULL, -- calls, appointments, contacts, etc.
    usage_count INTEGER NOT NULL DEFAULT 0,
    usage_limit INTEGER NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Store AI service package definitions
CREATE TABLE alphasite_ai_service_packages (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    features JSONB NOT NULL, -- Package features and limits
    coordinator_count INTEGER NOT NULL DEFAULT 1,
    call_minutes_inbound INTEGER NOT NULL DEFAULT 0,
    call_minutes_outbound INTEGER NOT NULL DEFAULT 0,
    contact_limit INTEGER,
    campaign_limit INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 6. API Integration Details

### 4calls.ai API Endpoints to Use

**Base URL:** `{4CALLS_API_URL}/api/coordinator`

**Key Endpoints:**

1. **Organizations**
   - `POST /organizations` - Create organization
   - `GET /organizations/{id}` - Get organization
   - `PUT /organizations/{id}` - Update organization

2. **Coordinators**
   - `POST /organizations/{orgId}/coordinators` - Create coordinator
   - `GET /organizations/{orgId}/coordinators` - List coordinators
   - `PUT /coordinators/{id}` - Update coordinator

3. **Contacts**
   - `GET /organizations/{orgId}/contacts` - List contacts
   - `POST /organizations/{orgId}/contacts` - Create contact
   - `PUT /organizations/{orgId}/contacts/{id}` - Update contact

4. **Calls**
   - `GET /organizations/{orgId}/calls` - Get call history
   - `GET /organizations/{orgId}/calls/stats` - Get call statistics

5. **Appointments**
   - `GET /organizations/{orgId}/appointments` - List appointments
   - `POST /organizations/{orgId}/appointments` - Create appointment
   - `GET /organizations/{orgId}/appointments/today` - Today's appointments

6. **Real-Time Operations**
   - `POST /real-time/availability` - Check availability
   - `POST /real-time/customer-lookup` - Lookup customer
   - `POST /real-time/booking` - Create booking
   - `POST /real-time/lead` - Create lead

---

## 7. Configuration

### Environment Variables

```env
# 4calls.ai API Configuration
FOURCALLS_API_URL=https://api.4calls.ai
FOURCALLS_API_KEY=your_api_key_here
FOURCALLS_WEBHOOK_SECRET=your_webhook_secret_here

# Service Package Defaults
AI_RECEPTIONIST_PRICE=49.00
AI_SALES_PRICE=99.00
AI_BUSINESS_SUITE_PRICE=199.00
AI_ENTERPRISE_PRICE=399.00
```

### Config File: `config/fourcalls.php`

```php
return [
    'api_url' => env('FOURCALLS_API_URL', 'https://api.4calls.ai'),
    'api_key' => env('FOURCALLS_API_KEY'),
    'webhook_secret' => env('FOURCALLS_WEBHOOK_SECRET'),
    
    'packages' => [
        'ai_receptionist' => [
            'name' => 'AI Receptionist',
            'price' => env('AI_RECEPTIONIST_PRICE', 49.00),
            'features' => [
                'coordinator_count' => 1,
                'call_minutes_inbound' => 500,
                'call_minutes_outbound' => 0,
                'contact_limit' => 500,
                'appointment_scheduling' => true,
                'campaigns' => false,
            ],
        ],
        // ... other packages
    ],
];
```

---

## 8. Service Implementation Details

### FourCallsIntegrationService Methods

```php
class FourCallsIntegrationService
{
    // Organization Management
    public function createOrganization(Business $business): array
    public function getOrganization(string $organizationId): array
    public function updateOrganization(string $organizationId, array $data): array
    
    // Coordinator Management
    public function createCoordinator(string $organizationId, array $config): array
    public function listCoordinators(string $organizationId): array
    public function updateCoordinator(string $coordinatorId, array $data): array
    
    // Service Provisioning
    public function provisionService(Business $business, string $packageSlug): array
    public function deprovisionService(Business $business): bool
    public function upgradeService(Business $business, string $newPackageSlug): array
    
    // Usage Tracking
    public function getUsage(Business $business, string $period = 'current'): array
    public function checkUsageLimit(Business $business, string $serviceType): bool
    
    // Real-Time Operations
    public function checkAvailability(Business $business, array $params): array
    public function lookupCustomer(Business $business, string $phone): ?array
    public function createBooking(Business $business, array $data): array
    public function createLead(Business $business, array $data): array
}
```

---

## 9. Frontend Integration

### CRM Dashboard Updates

**File:** `resources/js/pages/alphasite/crm/dashboard.tsx`

**New Sections:**
- Call statistics widget (from 4calls.ai)
- Recent calls list
- Today's appointments (from 4calls.ai)
- AI assistant status
- Usage meters (calls, contacts, etc.)

### AI Chat Widget Updates

**File:** `resources/js/pages/alphasite/business/show.tsx`

**Updates:**
- Connect to real API endpoint
- Handle streaming responses
- Show typing indicators
- Store chat history
- Route to 4calls.ai Coordinator

---

## 10. Testing Strategy

### Unit Tests
- Test FourCallsIntegrationService methods
- Test API client error handling
- Test service package activation
- Test usage tracking

### Integration Tests
- Test organization creation flow
- Test coordinator provisioning
- Test call log syncing
- Test appointment syncing

### E2E Tests
- Test business claiming with AI service selection
- Test AI chat widget functionality
- Test CRM dashboard integration
- Test service upgrade flow

---

## 11. Security Considerations

1. **API Key Storage**
   - Encrypt API keys in database
   - Use Laravel's encryption
   - Rotate keys periodically

2. **Webhook Security**
   - Verify webhook signatures
   - Validate webhook payloads
   - Rate limit webhook endpoints

3. **Access Control**
   - Only business owners can access their 4calls.ai data
   - Validate business ownership before API calls
   - Use middleware for authorization

---

## 12. Monitoring & Analytics

### Metrics to Track

1. **Service Adoption**
   - Number of businesses with AI services
   - Package distribution
   - Upgrade/downgrade rates

2. **Usage Metrics**
   - Total call minutes used
   - Average calls per business
   - Appointment booking rates
   - Contact creation rates

3. **Revenue Metrics**
   - Monthly recurring revenue (MRR)
   - Average revenue per user (ARPU)
   - Churn rate
   - Lifetime value (LTV)

---

## 13. Rollout Plan

### Phase 1: Beta (Week 1-2)
- Deploy to 5-10 beta businesses
- Test core functionality
- Gather feedback
- Fix critical issues

### Phase 2: Limited Release (Week 3-4)
- Deploy to 50 businesses
- Monitor usage and performance
- Optimize based on data
- Prepare marketing materials

### Phase 3: General Availability (Week 5+)
- Full rollout to all businesses
- Marketing campaign
- Support documentation
- Training materials

---

## 14. Success Metrics

### Key Performance Indicators (KPIs)

1. **Adoption Rate**
   - Target: 20% of premium businesses adopt AI services in first 3 months
   - Measure: Businesses with active AI services / Total premium businesses

2. **Revenue**
   - Target: $10,000 MRR from AI services in first 6 months
   - Measure: Sum of all AI service subscriptions

3. **Usage**
   - Target: Average 100+ calls per business per month
   - Measure: Total calls / Active businesses

4. **Satisfaction**
   - Target: 4.5+ star rating for AI services
   - Measure: Customer feedback surveys

---

## 15. Next Steps

1. **Review and Approve Plan**
   - Get stakeholder approval
   - Prioritize features
   - Set timeline

2. **Set Up Development Environment**
   - Configure 4calls.ai API access
   - Set up test accounts
   - Create development database

3. **Begin Implementation**
   - Start with Phase 1 (Core Integration Service)
   - Follow implementation plan
   - Test incrementally

4. **Documentation**
   - Create API documentation
   - Write user guides
   - Create training materials

---

## Conclusion

This integration will enable AlphaSite to offer powerful AI services to businesses, creating a new revenue stream while providing value to customers. The modular approach allows for incremental rollout and testing, ensuring a smooth launch.

