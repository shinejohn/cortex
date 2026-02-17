# ALPHASITE.AI — COMPLETE CURSOR PROJECT PLAN
## Zero-Deferred-Maintenance Implementation Guide
### February 2026 | Version 1.0

---

## TABLE OF CONTENTS

1. [Architecture Context](#1-architecture-context)
2. [Phase 1: Critical Quick Wins (Week 1–2)](#2-phase-1)
3. [Phase 2: CRM Frontend & Business Claiming (Week 3–5)](#3-phase-2)
4. [Phase 3: AI Concierge & Chat System (Week 6–7)](#4-phase-3)
5. [Phase 4: Cross-Platform Content Integration (Week 8–9)](#5-phase-4)
6. [Phase 5: Executive Command Center (Week 10–13)](#6-phase-5)
7. [Phase 6: AI Employee Interfaces (Week 14–19)](#7-phase-6)
8. [Phase 7: Analytics & Reporting Suite (Week 20–22)](#8-phase-7)
9. [Phase 8: Industry-Specific Modules (Week 23–25)](#9-phase-8)
10. [Phase 9: Third-Party Integrations (Week 26–28)](#10-phase-9)
11. [Phase 10: AI Component Builder (Week 29–30)](#11-phase-10)
12. [Phase 11: Hardening, Testing & Launch (Week 31–33)](#12-phase-11)
13. [Master Route Registry](#13-master-route-registry)
14. [Master Migration Registry](#14-master-migration-registry)
15. [Master Model Registry](#15-master-model-registry)
16. [TypeScript Interface Registry](#16-typescript-interface-registry)

---

## CURSOR AGENT CONFIGURATION

### Agent Hierarchy for This Project

**Use Claude Code (claude-sonnet-4-5) as the primary agent. Escalate complex architecture decisions to Opus.**

```
AGENT TIERS:
├── Tier 1: Single-File Tasks (Sonnet via Cursor Tab/Composer)
│   ├── Individual migration files
│   ├── Single model creation
│   ├── Individual Vue/TSX page components
│   ├── Single service method additions
│   └── Config file changes
│
├── Tier 2: Multi-File Coordinated Tasks (Claude Code Agent Mode)
│   ├── Full feature slices (migration + model + service + controller + page)
│   ├── Route registration + middleware + controller wiring
│   ├── Cross-platform content integration (multiple services)
│   └── Test suites for feature groups
│
└── Tier 3: Architecture & Complex Logic (Opus via Chat or Code Review)
    ├── AI employee personality/behavior system design
    ├── Real-time dashboard data pipeline architecture
    ├── Stripe subscription lifecycle edge cases
    └── Cross-domain SSO token flow debugging
```

### Tech Stack Reminder (CRITICAL)

```
FRAMEWORK:     Laravel 11 + Inertia.js
FRONTEND:      Vue 3 Composition API with TypeScript (.tsx files using React-style JSX)
               ⚠️ Files are .tsx but use REACT patterns (not Vue SFCs)
               ⚠️ Inertia renders React components via @inertiajs/react
ROUTING:       React Router (NOT Vue Router) via Inertia
STYLING:       Tailwind CSS
DATABASE:      PostgreSQL (UUID primary keys via HasUuid concern)
AUTH:          Laravel Sanctum + Cross-Domain Auth Tokens
PAYMENTS:      Stripe (direct API, not Laravel Cashier)
AI:            OpenAI GPT-4 + Anthropic Claude (dual-provider with failover)
STATE:         Inertia page props (server-driven, no client-side store)
MODELS:        Always `final class`, always `declare(strict_types=1)`
```

---

## 1. ARCHITECTURE CONTEXT {#1-architecture-context}

### Existing Database Tables (AlphaSite-Specific)

These tables ALREADY EXIST — do not recreate:

| Table | Status | Key Fields |
|-------|--------|------------|
| `businesses` | ✅ EXISTS | alphasite_subdomain, template_id, industry_id, subscription_tier, ai_services_enabled, premium_enrolled_at, premium_expires_at, homepage_content, seo_metadata, claimed_at, claimed_by_id |
| `business_subscriptions` | ✅ EXISTS | business_id, tier, status, trial_started_at, trial_expires_at, trial_converted_at, stripe_subscription_id, stripe_customer_id, monthly_amount, ai_services_enabled (JSON), downgraded_at |
| `smb_crm_customers` | ✅ EXISTS | business_id, first_name, last_name, email, phone, source, status, health_score, lifetime_value, predicted_churn_risk, ai_notes, preferences (JSON), tags (JSON) |
| `smb_crm_interactions` | ✅ EXISTS | business_id, customer_id, interaction_type, channel, direction, handled_by, ai_service_used, ai_confidence_score, outcome, sentiment, metadata (JSON) |
| `business_faqs` | ✅ EXISTS | business_id, question, answer, category, variations (JSON), follow_up_questions (JSON), times_used, helpful_votes, is_active, display_order |
| `business_surveys` | ✅ EXISTS | business_id, name, questions (JSON), trigger_type, trigger_config (JSON), is_active, responses_count |
| `business_survey_responses` | ✅ EXISTS | survey_id, business_id, customer_id, responses (JSON), overall_score, sentiment, ai_summary, action_items (JSON) |
| `business_templates` | ✅ EXISTS | (minimal — needs fields added) |
| `business_hours` | ✅ EXISTS | business_id, day_of_week, open_time, close_time |
| `business_photos` | ✅ EXISTS | business_id, url, caption, type |
| `business_reviews` | ✅ EXISTS | business_id, user_id, rating, content |
| `business_attributes` | ✅ EXISTS | business_id, key, value |
| `business_domains` | ✅ EXISTS | business_id, domain, type, status, is_primary |
| `custom_domains` | ✅ EXISTS | domain, business_id, status |
| `domain_dns_checks` | ✅ EXISTS | domain_id, check_type, status |
| `alphasite_communities` | ✅ EXISTS | city, state, slug, total_businesses |
| `alphasite_fourcalls_integrations` | ✅ EXISTS | business_id, api_key, package, status |
| `industries` | ✅ EXISTS | name, slug, description, icon |
| `cross_domain_auth_tokens` | ✅ EXISTS | token, user_id, domain, expires_at |

### Existing Models (AlphaSite-Specific)

All these models EXIST — reference but do not recreate:

`Business`, `BusinessSubscription`, `SMBCrmCustomer`, `SMBCrmInteraction`, `BusinessFaq`, `BusinessSurvey`, `BusinessSurveyResponse`, `BusinessTemplate`, `BusinessHours`, `BusinessPhoto`, `BusinessReview`, `BusinessAttribute`, `BusinessDomain`, `CustomDomain`, `DomainDnsCheck`, `AlphaSiteCommunity`, `AlphaSiteFourCallsIntegration`, `Industry`, `CrossDomainAuthToken`

### Existing Services (AlphaSite-Specific)

| Service | File | Lines | Status |
|---------|------|-------|--------|
| `PageGeneratorService` | app/Services/AlphaSite/ | 669 | Functional |
| `FourCallsIntegrationService` | app/Services/AlphaSite/ | 662 | Functional |
| `FourCallsBillingService` | app/Services/AlphaSite/ | exists | Functional |
| `SMBCrmService` | app/Services/AlphaSite/ | 249 | Functional, needs extension |
| `SubscriptionLifecycleService` | app/Services/AlphaSite/ | 178 | Functional |
| `CommunityService` | app/Services/AlphaSite/ | 175 | Functional |
| `CommunityContentService` | app/Services/AlphaSite/ | exists | Functional |
| `LinkingService` | app/Services/AlphaSite/ | 76 | Minimal, needs extension |
| `TemplateService` | app/Services/AlphaSite/ | 59 | Stub, needs full build |
| `BusinessQueryService` | app/Services/AlphaSite/ | exists | Functional |
| `AIService` | app/Services/ | 201 | Functional (OpenAI + Anthropic) |
| `AIContentService` | app/Services/ | 176 | Functional |
| `SeoService` | app/Services/ | 387 | Functional |
| `BusinessService` | app/Services/ | exists | Functional |
| `DomainAvailabilityService` | app/Services/Domain/ | exists | Functional |
| `DomainPurchaseService` | app/Services/Domain/ | exists | Functional |
| `DomainSupportAiService` | app/Services/Domain/ | exists | Functional |
| `ExternalDomainService` | app/Services/Domain/ | exists | Functional |

### Existing Frontend Pages

| Page | Path | Status |
|------|------|--------|
| `alphasite/business/show.tsx` | Business detail page | 1,344 lines, functional |
| `alphasite/directory/home.tsx` | Directory home | 154 lines, functional |
| `alphasite/directory/index.tsx` | Directory listing | functional |
| `alphasite/city/show.tsx` | City page | functional |
| `alphasite/city/category.tsx` | City category | functional |
| `alphasite/county/show.tsx` | County page | functional |
| `alphasite/county/category.tsx` | County category | functional |
| `alphasite/state/show.tsx` | State page | functional |
| `alphasite/search/index.tsx` | Search results | functional |
| `alphasite/claim/start.tsx` | Claim start | exists |
| `alphasite/community/show.tsx` | Community page | exists |
| `alphasite/admin/domains/index.tsx` | Domain admin | exists |
| `alphasite/admin/service-areas.tsx` | Service areas | exists |

---

## 2. PHASE 1: CRITICAL QUICK WINS (Week 1–2) {#2-phase-1}

### Agent: Tier 1 (Sonnet) — These are single-file tasks

---

### Task 1.1: ProcessExpiredTrials Artisan Command

**File:** `app/Console/Commands/ProcessExpiredTrials.php`

```php
<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\AlphaSite\SubscriptionLifecycleService;
use Illuminate\Console\Command;

final class ProcessExpiredTrials extends Command
{
    protected $signature = 'alphasite:process-expired-trials';
    protected $description = 'Process expired 90-day trials and downgrade to basic listings';

    public function handle(SubscriptionLifecycleService $service): int
    {
        $count = $service->processExpiredTrials();
        $this->info("Processed {$count} expired trials.");
        return self::SUCCESS;
    }
}
```

**Register in scheduler — file:** `app/Console/Kernel.php` (or `routes/console.php` in Laravel 11)

```php
Schedule::command('alphasite:process-expired-trials')->dailyAt('02:00');
```

**Test file:** `tests/Feature/AlphaSite/ProcessExpiredTrialsTest.php`

Test cases:
- Trial older than 90 days gets downgraded to `basic`
- Active paid subscription is NOT affected
- Business `subscription_tier` field updates to `basic`
- `ai_services_enabled` cleared to `[]`
- `downgraded_at` timestamp set
- Business with no subscription is unaffected
- Trial exactly at 90 days boundary (edge case)

---

### Task 1.2: SendTrialExpirationReminders Command

**File:** `app/Console/Commands/SendTrialExpirationReminders.php`

```php
protected $signature = 'alphasite:send-trial-reminders';
```

**Logic:**
- Query `business_subscriptions` WHERE `tier = 'trial'` AND `status = 'active'`
- Send reminders at 30 days, 14 days, 7 days, 3 days, 1 day before expiry
- Use existing `NotificationService` or `EmailDeliveryService`
- Log each notification to `notification_logs` table

**Schedule:** `Schedule::command('alphasite:send-trial-reminders')->dailyAt('09:00');`

---

### Task 1.3: Stripe Configuration

**File:** `config/stripe.php`

```php
<?php

return [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    'products' => [
        'standard' => [
            'name' => 'AlphaSite Standard',
            'price_monthly' => env('STRIPE_PRICE_STANDARD_MONTHLY'),
            'price_annual' => env('STRIPE_PRICE_STANDARD_ANNUAL'),
            'amount' => 9900, // $99/month in cents
            'ai_services' => ['concierge'],
        ],
        'premium' => [
            'name' => 'AlphaSite Premium',
            'price_monthly' => env('STRIPE_PRICE_PREMIUM_MONTHLY'),
            'price_annual' => env('STRIPE_PRICE_PREMIUM_ANNUAL'),
            'amount' => 29900, // $299/month
            'ai_services' => ['concierge', 'reservations', 'order_assistant', 'sales_agent'],
        ],
        'enterprise' => [
            'name' => 'AlphaSite Enterprise',
            'price_monthly' => env('STRIPE_PRICE_ENTERPRISE_MONTHLY'),
            'price_annual' => env('STRIPE_PRICE_ENTERPRISE_ANNUAL'),
            'amount' => 99900, // $999/month
            'ai_services' => ['concierge', 'reservations', 'order_assistant', 'sales_agent', 'marketing', 'customer_service', 'finance', 'operations'],
        ],
    ],

    'trial_days' => 90,
];
```

---

### Task 1.4: StripeService for AlphaSite

**File:** `app/Services/AlphaSite/StripeService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessSubscription;
use App\Models\User;
use Stripe\StripeClient;
use Stripe\Checkout\Session;
use Stripe\Subscription;
use Stripe\Customer;

final class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret'));
    }

    /** Create Stripe customer for business owner */
    public function createCustomer(User $user, Business $business): Customer { ... }

    /** Create Stripe Checkout session for subscription */
    public function createCheckoutSession(
        Business $business,
        string $tier,       // 'standard' | 'premium' | 'enterprise'
        string $billingCycle, // 'monthly' | 'annual'
        string $successUrl,
        string $cancelUrl
    ): Session { ... }

    /** Handle successful checkout — called from webhook */
    public function handleCheckoutCompleted(array $event): void { ... }

    /** Handle subscription updated */
    public function handleSubscriptionUpdated(array $event): void { ... }

    /** Handle subscription deleted/cancelled */
    public function handleSubscriptionDeleted(array $event): void { ... }

    /** Handle invoice payment failed */
    public function handleInvoiceFailed(array $event): void { ... }

    /** Cancel subscription */
    public function cancelSubscription(BusinessSubscription $subscription): void { ... }

    /** Resume cancelled subscription */
    public function resumeSubscription(BusinessSubscription $subscription): void { ... }

    /** Change tier (upgrade/downgrade) */
    public function changeTier(BusinessSubscription $subscription, string $newTier): void { ... }

    /** Get subscription portal URL for self-service */
    public function getPortalUrl(Business $business, string $returnUrl): string { ... }
}
```

---

### Task 1.5: Stripe Webhook Controller

**File:** `app/Http/Controllers/AlphaSite/StripeWebhookController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Services\AlphaSite\StripeService;
use Illuminate\Http\Request;
use Stripe\Webhook;

final class StripeWebhookController extends Controller
{
    public function __construct(private readonly StripeService $stripeService) {}

    public function handle(Request $request): \Illuminate\Http\Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $event = Webhook::constructEvent($payload, $sigHeader, config('stripe.webhook_secret'));

        match ($event->type) {
            'checkout.session.completed' => $this->stripeService->handleCheckoutCompleted($event->data->object),
            'customer.subscription.updated' => $this->stripeService->handleSubscriptionUpdated($event->data->object),
            'customer.subscription.deleted' => $this->stripeService->handleSubscriptionDeleted($event->data->object),
            'invoice.payment_failed' => $this->stripeService->handleInvoiceFailed($event->data->object),
            default => null,
        };

        return response('OK', 200);
    }
}
```

**Route (add to `routes/alphasite.php`):**

```php
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->name('alphasite.webhooks.stripe')
    ->withoutMiddleware(['web', 'csrf']);
```

---

### Task 1.6: VerificationService for Business Claiming

**File:** `app/Services/AlphaSite/VerificationService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\User;
use App\Services\SmsService;
use App\Services\EmailDeliveryService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

final class VerificationService
{
    public function __construct(
        private readonly SmsService $smsService,
        private readonly EmailDeliveryService $emailService
    ) {}

    /** Send phone verification code */
    public function sendPhoneVerification(Business $business, string $phone): bool
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("claim_phone_code:{$business->id}", $code, now()->addMinutes(15));
        return $this->smsService->send($phone, "Your AlphaSite verification code is: {$code}");
    }

    /** Send email verification link */
    public function sendEmailVerification(Business $business, string $email): bool
    {
        $token = Str::random(64);
        Cache::put("claim_email_token:{$business->id}", $token, now()->addHours(24));
        $verifyUrl = route('alphasite.claim.verify.email', ['slug' => $business->slug, 'token' => $token]);
        return $this->emailService->send($email, 'Verify Business Ownership', "verify-business", ['url' => $verifyUrl, 'business' => $business]);
    }

    /** Verify phone code */
    public function verifyPhoneCode(Business $business, string $code): bool
    {
        $cached = Cache::get("claim_phone_code:{$business->id}");
        if ($cached && $cached === $code) {
            Cache::forget("claim_phone_code:{$business->id}");
            return true;
        }
        return false;
    }

    /** Verify email token */
    public function verifyEmailToken(Business $business, string $token): bool
    {
        $cached = Cache::get("claim_email_token:{$business->id}");
        if ($cached && $cached === $token) {
            Cache::forget("claim_email_token:{$business->id}");
            return true;
        }
        return false;
    }

    /** Complete claiming — assign business to user */
    public function completeClaim(Business $business, User $user): void
    {
        $business->update([
            'claimed_by_id' => $user->id,
            'claimed_at' => now(),
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);
    }
}
```

---

### Task 1.7: Add `claimed_by_id` to Business Model

**Migration:** `database/migrations/2026_02_15_000001_add_claimed_by_id_to_businesses_table.php`

```php
Schema::table('businesses', function (Blueprint $table) {
    $table->uuid('claimed_by_id')->nullable()->after('claimed_at');
    $table->index('claimed_by_id');
});
```

⚠️ **Check first** — `claimed_by_id` may already exist. Run: `grep -r "claimed_by_id" database/migrations/`

---

### Task 1.8: AI Services Enum Config

**File:** `config/alphasite.php`

```php
<?php

return [
    'ai_services' => [
        'concierge' => [
            'name' => 'AI Concierge',
            'description' => '24/7 customer Q&A powered by your FAQ database',
            'price_monthly' => 4900, // $49 in cents
            'icon' => 'message-circle',
            'tier_minimum' => 'standard',
        ],
        'reservations' => [
            'name' => 'AI Reservations',
            'description' => 'Automated booking and calendar management',
            'price_monthly' => 4900,
            'icon' => 'calendar',
            'tier_minimum' => 'standard',
        ],
        'order_assistant' => [
            'name' => 'AI Order Assistant',
            'description' => 'Order capture and payment processing',
            'price_monthly' => 4900,
            'icon' => 'shopping-cart',
            'tier_minimum' => 'standard',
        ],
        'sales_agent' => [
            'name' => 'AI Sales Agent',
            'description' => 'Lead qualification and follow-up automation',
            'price_monthly' => 9900,
            'icon' => 'trending-up',
            'tier_minimum' => 'premium',
        ],
        'marketing' => [
            'name' => 'AI Marketing Manager',
            'description' => 'Campaign management and content creation',
            'price_monthly' => 9900,
            'icon' => 'megaphone',
            'tier_minimum' => 'premium',
        ],
        'customer_service' => [
            'name' => 'AI Customer Service',
            'description' => 'Complaint handling and satisfaction monitoring',
            'price_monthly' => 9900,
            'icon' => 'headphones',
            'tier_minimum' => 'premium',
        ],
        'finance' => [
            'name' => 'AI Financial Manager',
            'description' => 'Invoicing, P&L, and cash flow management',
            'price_monthly' => 9900,
            'icon' => 'dollar-sign',
            'tier_minimum' => 'enterprise',
        ],
        'operations' => [
            'name' => 'AI Operations Manager',
            'description' => 'Workflow optimization and resource allocation',
            'price_monthly' => 9900,
            'icon' => 'settings',
            'tier_minimum' => 'enterprise',
        ],
    ],

    'subscription_tiers' => [
        'basic' => ['name' => 'Basic', 'price' => 0, 'max_ai_services' => 0],
        'standard' => ['name' => 'Professional Growth', 'price' => 9900, 'max_ai_services' => 1],
        'premium' => ['name' => 'Business Expansion', 'price' => 29900, 'max_ai_services' => 4],
        'enterprise' => ['name' => 'Enterprise Operations', 'price' => 99900, 'max_ai_services' => 8],
    ],

    'trial_days' => 90,
    'cache_ttl' => [
        'business_data' => 3600,       // 1 hour
        'generated_content' => 21600,  // 6 hours
        'schema_markup' => 86400,      // 24 hours
        'cross_platform' => 1800,      // 30 minutes
    ],
];
```

---

## 3. PHASE 2: CRM FRONTEND & BUSINESS CLAIMING (Week 3–5) {#3-phase-2}

### Agent: Tier 2 (Claude Code Agent Mode) — Multi-file feature slices

---

### Task 2.1: CRM Layout Component

**File:** `resources/js/layouts/alphasite-crm-layout.tsx`

This is the shell layout for ALL CRM pages. It must include:

- Left sidebar with navigation links for: Dashboard, Customers, Interactions, FAQs, Surveys, AI Services, Settings
- Business name/logo header
- Subscription tier badge (trial countdown if applicable)
- Link back to public business page
- `Inertia <Link>` components for navigation

**Props interface:**

```typescript
interface CrmLayoutProps {
  business: {
    id: string;
    name: string;
    slug: string;
    alphasite_subdomain: string | null;
    subscription_tier: string;
    city: string;
    state: string;
  };
  subscription: {
    tier: string;
    status: string;
    trial_expires_at: string | null;
    ai_services_enabled: string[];
  } | null;
  children: React.ReactNode;
}
```

---

### Task 2.2: CRM Dashboard Page

**File:** `resources/js/pages/alphasite/crm/dashboard.tsx`

**URL:** `/crm/dashboard` (auth required)

**Controller:** `SMBCrmController@dashboard` (ALREADY EXISTS)

**Inertia Props (from controller — already defined):**

```typescript
interface DashboardProps {
  business: Business;
  dashboard: {
    total_customers: number;
    new_leads_today: number;
    interactions_today: number;
    ai_handled_rate: number;
    average_health_score: number;
    recent_interactions: Interaction[];
    customers_needing_attention: Customer[];
  };
  fourCallsIntegration: FourCallsIntegration | null;
  subscription: SubscriptionDetails | null;
}
```

**UI Sections:**
1. **Metrics Cards Row:** Total customers, New leads today, AI handled rate, Average health score
2. **Trial Banner:** If `subscription.tier === 'trial'`, show countdown with CTA to convert
3. **Recent Interactions Feed:** Last 10 interactions with customer name, type, outcome, timestamp
4. **Customers Needing Attention:** List with health score bars (red < 30, yellow < 60, green >= 60)
5. **4Calls Integration Panel:** If integration active, show call stats summary
6. **Quick Actions:** Add customer, Create FAQ, Send survey, View AI services

---

### Task 2.3: CRM Customers Page

**File:** `resources/js/pages/alphasite/crm/customers.tsx`

**URL:** `/crm/customers`

**Controller:** `SMBCrmController@customers` (ALREADY EXISTS)

**Inertia Props:**

```typescript
interface CustomersProps {
  business: Business;
  customers: PaginatedResponse<Customer>;
}

interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive' | 'churned';
  health_score: number | null;
  lifetime_value: string | null;
  predicted_churn_risk: string | null;
  ai_notes: string | null;
  tags: string[] | null;
  last_interaction_at: string | null;
  created_at: string;
}
```

**UI Requirements:**
- Search bar (filters `first_name`, `last_name`, `email`)
- Status filter dropdown (lead, prospect, customer, inactive, churned)
- Table columns: Name, Email, Phone, Status (badge), Health Score (bar), Source, Last Contact, Actions
- Click row → navigate to customer detail page
- "Add Customer" button → slide-over form
- Pagination controls
- Export to CSV button

---

### Task 2.4: CRM Customer Detail Page

**File:** `resources/js/pages/alphasite/crm/customer/show.tsx`

**URL:** `/crm/customers/{customer}`

**Controller:** `SMBCrmController@showCustomer` (ALREADY EXISTS)

**Inertia Props:**

```typescript
interface CustomerShowProps {
  business: Business;
  customer: {
    customer: Customer;
    interactions: Interaction[];
    survey_responses: SurveyResponse[];
  };
}

interface Interaction {
  id: string;
  interaction_type: string;
  channel: string;
  direction: string;
  subject: string | null;
  content: string | null;
  handled_by: string;
  ai_service_used: string | null;
  ai_confidence_score: string | null;
  outcome: string;
  sentiment: string | null;
  created_at: string;
}
```

**UI Sections:**
1. **Customer Header:** Name, contact info, status badge, health score gauge
2. **AI Notes Panel:** AI-generated summary of customer relationship
3. **Interaction Timeline:** Chronological list with type icons, sentiment indicators
4. **Survey Responses:** Collapsible cards showing survey answers and AI summaries
5. **Tags Editor:** Add/remove tags
6. **Status Change Dropdown:** Transition between lead/prospect/customer/inactive
7. **Manual Interaction Form:** Log a phone call, email, or in-person visit

---

### Task 2.5: CRM Interactions Page

**File:** `resources/js/pages/alphasite/crm/interactions.tsx`

**URL:** `/crm/interactions`

**Controller:** `SMBCrmController@interactions` (ALREADY EXISTS)

**Inertia Props:**

```typescript
interface InteractionsProps {
  business: Business;
  interactions: PaginatedResponse<InteractionWithCustomer>;
  callHistory: FourCallsCall[];
}
```

**UI:** Filterable table (by type, by handler), merged view of AI chat + phone + email + 4calls history

---

### Task 2.6: CRM FAQs Management Page

**File:** `resources/js/pages/alphasite/crm/faqs.tsx`

**URL:** `/crm/faqs`

**Controller:** `SMBCrmController@faqs` (ALREADY EXISTS)

**Inertia Props:**

```typescript
interface FaqsProps {
  business: Business;
  faqs: BusinessFaq[];
}

interface BusinessFaq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  variations: string[] | null;
  follow_up_questions: string[] | null;
  times_used: number;
  helpful_votes: number;
  unhelpful_votes: number;
  is_active: boolean;
  display_order: number;
}
```

**UI Requirements:**
- Grouped by category with drag-to-reorder
- Inline edit for question/answer
- "Generate AI Answer" button per FAQ (calls AIService::generateFaqAnswer)
- Add new FAQ modal
- Bulk import from CSV
- Toggle active/inactive
- Usage stats (times_used, helpful/unhelpful vote counts)

**Additional routes needed (add to `routes/alphasite.php` CRM group):**

```php
Route::put('/faqs/{faq}', [SMBCrmController::class, 'updateFaq'])->name('alphasite.crm.faqs.update');
Route::delete('/faqs/{faq}', [SMBCrmController::class, 'deleteFaq'])->name('alphasite.crm.faqs.destroy');
Route::post('/faqs/{faq}/generate-answer', [SMBCrmController::class, 'generateFaqAnswer'])->name('alphasite.crm.faqs.generate');
Route::post('/faqs/reorder', [SMBCrmController::class, 'reorderFaqs'])->name('alphasite.crm.faqs.reorder');
```

**Add to SMBCrmController:**

```php
public function updateFaq(Request $request, string $faq): RedirectResponse { ... }
public function deleteFaq(string $faq): RedirectResponse { ... }
public function generateFaqAnswer(Request $request, string $faq): JsonResponse { ... }
public function reorderFaqs(Request $request): JsonResponse { ... }
```

---

### Task 2.7: CRM Surveys Page

**File:** `resources/js/pages/alphasite/crm/surveys.tsx`

**URL:** `/crm/surveys`

**Controller:** `SMBCrmController@surveys` (ALREADY EXISTS)

**Additional routes:**

```php
Route::post('/surveys', [SMBCrmController::class, 'storeSurvey'])->name('alphasite.crm.surveys.store');
Route::put('/surveys/{survey}', [SMBCrmController::class, 'updateSurvey'])->name('alphasite.crm.surveys.update');
Route::delete('/surveys/{survey}', [SMBCrmController::class, 'deleteSurvey'])->name('alphasite.crm.surveys.destroy');
Route::get('/surveys/{survey}/responses', [SMBCrmController::class, 'surveyResponses'])->name('alphasite.crm.surveys.responses');
```

---

### Task 2.8: CRM AI Services Page

**File:** `resources/js/pages/alphasite/crm/ai-services.tsx`

**URL:** `/crm/ai-services`

**Controller:** `SMBCrmController@aiServices` (ALREADY EXISTS)

**Inertia Props:**

```typescript
interface AIServicesProps {
  business: Business;
  servicesConfig: {
    enabled: boolean;
    services: string[];
  };
  fourCallsIntegration: FourCallsIntegration | null;
  subscription: SubscriptionDetails | null;
  availablePackages: Record<string, Package>;
}
```

**UI:** Service cards grid showing all 8 AI services from `config/alphasite.php`. Each card shows: icon, name, description, status (active/locked/available), price. Active services have a "Configure" button. Locked services show the tier needed to unlock. "Add Service" flows through Stripe.

---

### Task 2.9: Claim Flow — Complete Rewrite of ClaimController

**Update file:** `app/Http/Controllers/AlphaSite/ClaimController.php`

The existing controller has TODO placeholders. Replace with full implementation using `VerificationService` and `StripeService`.

**Full flow:**

1. `GET /claim/{slug}` → `start()` → render `alphasite/claim/start.tsx` with business data
2. `POST /claim/{slug}/send-code` → `sendVerification()` → sends phone or email code via VerificationService
3. `POST /claim/{slug}/verify` → `verify()` → validates code, sets session flag
4. `GET /claim/{slug}/select-plan` → `selectPlan()` → render plan selection page (only if verified)
5. `POST /claim/{slug}/checkout` → `checkout()` → creates Stripe Checkout session, redirects
6. `GET /claim/{slug}/success` → `success()` → handles Stripe redirect, completes claim

**New routes (replace existing claim routes):**

```php
Route::middleware('auth')->prefix('claim/{slug}')->group(function () {
    Route::get('/', [ClaimController::class, 'start'])->name('alphasite.claim.start');
    Route::post('/send-code', [ClaimController::class, 'sendVerification'])->name('alphasite.claim.send-code');
    Route::post('/verify', [ClaimController::class, 'verify'])->name('alphasite.claim.verify');
    Route::get('/verify-email/{token}', [ClaimController::class, 'verifyEmail'])->name('alphasite.claim.verify.email');
    Route::get('/select-plan', [ClaimController::class, 'selectPlan'])->name('alphasite.claim.select-plan');
    Route::post('/checkout', [ClaimController::class, 'checkout'])->name('alphasite.claim.checkout');
    Route::get('/success', [ClaimController::class, 'success'])->name('alphasite.claim.success');
});
```

**New frontend pages:**

| File | Purpose |
|------|---------|
| `resources/js/pages/alphasite/claim/start.tsx` | Business info + verify method selection |
| `resources/js/pages/alphasite/claim/verify.tsx` | Code/token entry form |
| `resources/js/pages/alphasite/claim/select-plan.tsx` | Subscription tier selection + Stripe Elements |
| `resources/js/pages/alphasite/claim/success.tsx` | Welcome + redirect to CRM dashboard |

---

## 4. PHASE 3: AI CONCIERGE & CHAT SYSTEM (Week 6–7) {#4-phase-3}

### Agent: Tier 2 (Claude Code) for service wiring; Tier 3 (Opus) for prompt engineering

---

### Task 3.1: AlphaSiteAIConciergeService

**File:** `app/Services/AlphaSite/AIConciergeService.php`

This is the core AI service that powers the customer-facing chat widget on business pages.

```php
<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessFaq;
use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use App\Services\AIService;

final class AIConciergeService
{
    public function __construct(
        private readonly AIService $aiService,
        private readonly SMBCrmService $crmService
    ) {}

    /** Process an incoming chat message from a customer on the AlphaSite business page */
    public function processMessage(
        Business $business,
        string $message,
        ?string $conversationId = null,
        ?array $customerInfo = null
    ): array { ... }

    /** Build the system prompt with business context, FAQs, hours, services */
    private function buildSystemPrompt(Business $business): string { ... }

    /** Search FAQs for relevant answers */
    private function findRelevantFaqs(Business $business, string $query): Collection { ... }

    /** Extract customer intent from message */
    private function classifyIntent(string $message): string { ... }
    // Returns: 'question', 'booking', 'order', 'complaint', 'general'

    /** Determine if escalation to human is needed */
    private function shouldEscalate(string $message, float $confidence): bool { ... }

    /** Record the interaction in CRM */
    private function recordInteraction(
        Business $business,
        string $message,
        string $response,
        float $confidence,
        ?SMBCrmCustomer $customer
    ): SMBCrmInteraction { ... }

    /** Auto-create or update customer from chat data */
    private function identifyOrCreateCustomer(
        Business $business,
        ?array $customerInfo
    ): ?SMBCrmCustomer { ... }
}
```

**System prompt template (for Opus review):**

```
You are an AI concierge for {business.name}, a {business.industry.name} located at {business.address}, {business.city}, {business.state}.

BUSINESS HOURS:
{formatted_hours}

SERVICES/MENU:
{business.description}
{business.amenities}

FREQUENTLY ASKED QUESTIONS:
{foreach faq in active_faqs}
Q: {faq.question}
A: {faq.answer}
{endforeach}

INSTRUCTIONS:
- Answer customer questions accurately based on the FAQ database above
- If a question is not covered by the FAQ, provide a helpful general response and note that the customer should contact the business directly for specifics
- For booking/reservation requests, collect: name, date, time, party size, and confirm with the customer
- For complaints, acknowledge the concern empathetically and offer to escalate to the business owner
- Never make up business policies, prices, or availability that aren't in the provided data
- Be warm, professional, and concise
- Always mention the business name naturally in your first response
```

---

### Task 3.2: Update BusinessPageController aiChat Method

**Update file:** `app/Http/Controllers/AlphaSite/BusinessPageController.php`

Replace the existing `aiChat` method to use `AIConciergeService` instead of directly calling `FourCallsIntegrationService`:

```php
public function aiChat(Request $request, string $slug)
{
    $request->validate([
        'message' => 'required|string|max:1000',
        'conversation_id' => 'nullable|string',
        'customer_name' => 'nullable|string',
        'customer_email' => 'nullable|string|email',
    ]);

    $business = $this->businessService->getBusinessForAlphaSite($slug);
    if (!$business) abort(404);

    // Check if business has AI concierge enabled
    $subscription = $business->subscription;
    $hasAI = $subscription && in_array('concierge', $subscription->ai_services_enabled ?? []);

    if (!$hasAI) {
        return response()->json([
            'success' => false,
            'message' => 'AI chat is not available for this business.',
        ], 403);
    }

    try {
        $response = app(AIConciergeService::class)->processMessage(
            $business,
            $request->input('message'),
            $request->input('conversation_id'),
            $request->only(['customer_name', 'customer_email'])
        );
        return response()->json(['success' => true, ...$response]);
    } catch (\Exception $e) {
        // Fallback to 4Calls if available
        try {
            $response = $this->fourCallsService->sendChatMessage($business, $request->input('message'), $request->input('conversation_id'));
            return response()->json(['success' => true, ...$response]);
        } catch (\Exception $e2) {
            return response()->json(['success' => false, 'message' => 'Chat service temporarily unavailable.'], 503);
        }
    }
}
```

---

### Task 3.3: Chat Widget Component Enhancement

**Update file:** `resources/js/pages/alphasite/business/show.tsx`

Enhance the existing AI chat section in the business show page:

- Floating chat button (bottom-right corner)
- Expandable chat panel with conversation history
- Pre-chat form: optional name + email fields
- Message input with send button
- Loading indicator during AI response
- "This is an AI assistant" disclosure
- Escalation prompt when AI confidence is low
- Session persistence via `conversation_id`

---

### Task 3.4: Conversation Model & Migration

**Migration:** `database/migrations/2026_02_15_000002_create_ai_conversations_table.php`

```php
Schema::create('ai_conversations', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->uuid('customer_id')->nullable();
    $table->string('channel', 50)->default('alphasite_chat');
    $table->string('status', 50)->default('active'); // active, resolved, escalated
    $table->json('messages'); // Array of {role, content, timestamp, confidence}
    $table->integer('message_count')->default(0);
    $table->string('resolved_by', 50)->nullable(); // ai, human
    $table->text('summary')->nullable(); // AI-generated conversation summary
    $table->json('metadata')->nullable();
    $table->timestamps();

    $table->index('business_id');
    $table->index('customer_id');
    $table->index(['business_id', 'status']);
});
```

**Model:** `app/Models/AIConversation.php`

```php
final class AIConversation extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'ai_conversations';

    protected $fillable = [
        'business_id', 'customer_id', 'channel', 'status',
        'messages', 'message_count', 'resolved_by', 'summary', 'metadata',
    ];

    protected function casts(): array
    {
        return ['messages' => 'array', 'metadata' => 'array'];
    }

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function customer(): BelongsTo { return $this->belongsTo(SMBCrmCustomer::class, 'customer_id'); }
}
```

---

## 5. PHASE 4: CROSS-PLATFORM CONTENT INTEGRATION (Week 8–9) {#5-phase-4}

### Agent: Tier 2 (Claude Code)

---

### Task 4.1: Extend LinkingService

**Update file:** `app/Services/AlphaSite/LinkingService.php`

Current implementation is 76 lines and delegates to OrganizationService. Extend to:

```php
/** Get Day.News articles mentioning this business */
public function getDayNewsArticles(Business $business, int $limit = 5): Collection
{
    return DayNewsPost::where(function ($q) use ($business) {
        $q->where('content', 'LIKE', "%{$business->name}%")
          ->orWhereHas('businessMentions', fn($q2) => $q2->where('business_id', $business->id));
    })->published()->latest()->limit($limit)->get();
}

/** Get GoEventCity events for this business/venue */
public function getEvents(Business $business, int $limit = 5): Collection
{
    return Event::where(function ($q) use ($business) {
        $q->where('venue_id', $business->id)
          ->orWhere('business_id', $business->id)
          ->orWhere('venue_name', 'LIKE', "%{$business->name}%");
    })->upcoming()->orderBy('start_date')->limit($limit)->get();
}

/** Get DowntownsGuide coupons for this business */
public function getCoupons(Business $business, int $limit = 5): Collection
{
    return Coupon::where('business_id', $business->id)
        ->active()->orderByDesc('created_at')->limit($limit)->get();
}

/** Get GoLocalVoices podcasts mentioning this business */
public function getLocalVoicesContent(Business $business, int $limit = 3): Collection
{
    return Podcast::whereHas('episodes', fn($q) =>
        $q->where('description', 'LIKE', "%{$business->name}%")
    )->limit($limit)->get();
}

/** Aggregate all cross-platform content */
public function getCrossPlatformContent(Business $business): array
{
    return [
        'articles' => $this->getDayNewsArticles($business),
        'events' => $this->getEvents($business),
        'coupons' => $this->getCoupons($business),
        'local_voices' => $this->getLocalVoicesContent($business),
        'backlinks' => $this->generateBacklinks($business),
        'internal_links' => $this->generateInternalLinks($business),
    ];
}
```

---

### Task 4.2: Social Sharing Component

**File:** `resources/js/components/alphasite/social-share.tsx`

```typescript
interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  image?: string;
}
```

Platforms: Facebook, Twitter/X, LinkedIn, WhatsApp, Email, Copy Link

---

### Task 4.3: Add Geo Meta Tags to SEO Component

**Update file:** `resources/js/components/common/seo.tsx`

Add to the `<Head>` component:

```html
<meta name="geo.position" content="{latitude};{longitude}" />
<meta name="geo.placename" content="{city}, {state}" />
<meta name="geo.region" content="US-{state}" />
<meta name="ICBM" content="{latitude}, {longitude}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{image}" />
```

---

## 6. PHASE 5: EXECUTIVE COMMAND CENTER (Week 10–13) {#6-phase-5}

### Agent: Tier 2 (Claude Code) for frontend; Tier 3 (Opus) for data architecture

---

### Task 5.1: Command Center Controller

**File:** `app/Http/Controllers/AlphaSite/CommandCenterController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Services\AlphaSite\CommandCenterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CommandCenterController extends Controller
{
    public function __construct(
        private readonly CommandCenterService $commandCenter
    ) {}

    public function dashboard(Request $request): Response { ... }
    public function aiTeam(Request $request): Response { ... }
    public function revenue(Request $request): Response { ... }
    public function community(Request $request): Response { ... }
    public function settings(Request $request): Response { ... }
}
```

**Routes (add to CRM auth group in `routes/alphasite.php`):**

```php
Route::prefix('command-center')->group(function () {
    Route::get('/', [CommandCenterController::class, 'dashboard'])->name('alphasite.command.dashboard');
    Route::get('/ai-team', [CommandCenterController::class, 'aiTeam'])->name('alphasite.command.ai-team');
    Route::get('/revenue', [CommandCenterController::class, 'revenue'])->name('alphasite.command.revenue');
    Route::get('/community', [CommandCenterController::class, 'community'])->name('alphasite.command.community');
    Route::get('/settings', [CommandCenterController::class, 'settings'])->name('alphasite.command.settings');
});
```

---

### Task 5.2: CommandCenterService

**File:** `app/Services/AlphaSite/CommandCenterService.php`

```php
final class CommandCenterService
{
    /** Get full dashboard data */
    public function getDashboardData(Business $business): array
    {
        return [
            'metrics' => $this->getBusinessMetrics($business),
            'ai_team' => $this->getAITeamStatus($business),
            'revenue' => $this->getRevenueData($business),
            'community' => $this->getCommunityMetrics($business),
            'alerts' => $this->getAlerts($business),
            'quick_actions' => $this->getQuickActions($business),
        ];
    }

    private function getBusinessMetrics(Business $business): array { ... }
    // Returns: revenue_today, monthly_progress, active_customers, satisfaction_score, efficiency_score, community_engagement

    private function getAITeamStatus(Business $business): array { ... }
    // Returns: array of {name, role, efficiency, active_tasks, pending_items, status}

    private function getRevenueData(Business $business): array { ... }
    // Returns: today, mtd, target, trend_data (last 30 days), projections

    private function getCommunityMetrics(Business $business): array { ... }
    // Returns: mentions, reviews, events, local_rank

    private function getAlerts(Business $business): array { ... }
    // Returns: array of {type, message, priority, action_url}

    private function getQuickActions(Business $business): array { ... }
    // Returns: array of available quick actions based on subscription tier
}
```

---

### Task 5.3: Command Center Frontend Pages

| File | URL | Description |
|------|-----|-------------|
| `resources/js/pages/alphasite/command-center/dashboard.tsx` | `/command-center` | 5-panel executive dashboard |
| `resources/js/pages/alphasite/command-center/ai-team.tsx` | `/command-center/ai-team` | AI employee directory + status grid |
| `resources/js/pages/alphasite/command-center/revenue.tsx` | `/command-center/revenue` | Revenue tracking with charts |
| `resources/js/pages/alphasite/command-center/community.tsx` | `/command-center/community` | Community integration hub |
| `resources/js/pages/alphasite/command-center/settings.tsx` | `/command-center/settings` | Business configuration |

**Dashboard Props (Task 5.3a):**

```typescript
interface CommandCenterDashboardProps {
  business: Business;
  dashboard: {
    metrics: {
      revenue_today: number;
      revenue_target: number;
      monthly_progress: number;
      monthly_target: number;
      active_customers: number;
      customer_change: number;
      satisfaction_score: number;
      satisfaction_responses: number;
      efficiency_score: number;
      community_engagement: number;
    };
    ai_team: AIEmployee[];
    revenue: {
      today: number;
      mtd: number;
      target: number;
      trend: { date: string; amount: number }[];
    };
    community: {
      mentions: number;
      reviews_this_week: number;
      upcoming_events: number;
      local_rank: number;
    };
    alerts: Alert[];
    quick_actions: QuickAction[];
  };
  subscription: SubscriptionDetails;
}

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  efficiency: number;
  active_tasks: number;
  pending_items: number;
  status: 'active' | 'idle' | 'processing' | 'offline';
  last_activity: string;
}
```

---

## 7. PHASE 6: AI EMPLOYEE INTERFACES (Week 14–19) {#7-phase-6}

### Agent: Tier 3 (Opus) for personality design; Tier 2 (Claude Code) for implementation

---

### Task 6.1: AI Employee System Architecture

**New migration:** `database/migrations/2026_02_15_000003_create_ai_employees_table.php`

```php
Schema::create('ai_employees', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->string('name', 100);           // 'Sarah', 'Alex', 'Emma', etc.
    $table->string('role', 100);           // 'Sales Manager', 'Operations Manager', etc.
    $table->string('service_key', 100);    // maps to config('alphasite.ai_services') key
    $table->string('avatar', 255)->nullable();
    $table->string('status', 50)->default('active');
    $table->json('personality');            // {tone, formality, specialties, greeting}
    $table->json('capabilities');           // ['lead_management', 'email_drafting', ...]
    $table->json('performance_metrics');    // {efficiency, tasks_completed, ...}
    $table->json('configuration');          // Business-specific tuning
    $table->json('integrations');           // Connected third-party services
    $table->timestamp('last_active_at')->nullable();
    $table->timestamps();

    $table->index('business_id');
    $table->index(['business_id', 'service_key']);
});
```

**Model:** `app/Models/AIEmployee.php`

```php
final class AIEmployee extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'business_id', 'name', 'role', 'service_key', 'avatar', 'status',
        'personality', 'capabilities', 'performance_metrics', 'configuration',
        'integrations', 'last_active_at',
    ];

    protected function casts(): array
    {
        return [
            'personality' => 'array',
            'capabilities' => 'array',
            'performance_metrics' => 'array',
            'configuration' => 'array',
            'integrations' => 'array',
            'last_active_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function tasks(): HasMany { return $this->hasMany(AIEmployeeTask::class); }
}
```

**Task tracking migration:** `database/migrations/2026_02_15_000004_create_ai_employee_tasks_table.php`

```php
Schema::create('ai_employee_tasks', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('ai_employee_id');
    $table->uuid('business_id');
    $table->string('task_type', 100);
    $table->string('title', 255);
    $table->text('description')->nullable();
    $table->string('status', 50)->default('pending'); // pending, in_progress, completed, failed
    $table->string('priority', 50)->default('normal');
    $table->json('input_data')->nullable();
    $table->json('output_data')->nullable();
    $table->float('confidence_score')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();

    $table->index('ai_employee_id');
    $table->index('business_id');
    $table->index(['business_id', 'status']);
});
```

---

### Task 6.2: AI Employee Default Profiles

**File:** `config/alphasite_employees.php`

```php
return [
    'sarah' => [
        'name' => 'Sarah',
        'role' => 'Sales Manager',
        'service_key' => 'sales_agent',
        'avatar' => '/images/ai-employees/sarah.svg',
        'personality' => [
            'tone' => 'enthusiastic and confident',
            'formality' => 'professional yet approachable',
            'greeting' => "Hi! I'm Sarah, your AI Sales Manager.",
            'specialties' => ['lead qualification', 'follow-up sequences', 'proposal generation', 'pipeline management'],
        ],
        'capabilities' => ['lead_management', 'email_drafting', 'proposal_generation', 'pipeline_tracking', 'follow_up_automation', 'conversion_optimization'],
    ],
    'alex' => [
        'name' => 'Alex',
        'role' => 'Operations Manager',
        'service_key' => 'operations',
        'avatar' => '/images/ai-employees/alex.svg',
        'personality' => [
            'tone' => 'analytical and efficient',
            'formality' => 'straightforward and precise',
            'greeting' => "Hello! I'm Alex, your AI Operations Manager.",
            'specialties' => ['workflow optimization', 'resource allocation', 'scheduling', 'quality control'],
        ],
        'capabilities' => ['workflow_management', 'scheduling', 'resource_allocation', 'quality_tracking', 'vendor_coordination', 'process_optimization'],
    ],
    'emma' => [
        'name' => 'Emma',
        'role' => 'Financial Manager',
        'service_key' => 'finance',
        'personality' => ['tone' => 'precise and reassuring', 'formality' => 'professional'],
        'capabilities' => ['invoicing', 'expense_tracking', 'cash_flow', 'tax_prep', 'financial_reporting', 'budget_management'],
    ],
    'lisa' => [
        'name' => 'Lisa',
        'role' => 'Customer Service Manager',
        'service_key' => 'customer_service',
        'personality' => ['tone' => 'empathetic and patient', 'formality' => 'warm and professional'],
        'capabilities' => ['complaint_handling', 'satisfaction_surveys', 'escalation_management', 'appointment_scheduling', 'loyalty_programs'],
    ],
    'marcus' => [
        'name' => 'Marcus',
        'role' => 'Marketing Manager',
        'service_key' => 'marketing',
        'personality' => ['tone' => 'creative and strategic', 'formality' => 'casual yet expert'],
        'capabilities' => ['content_creation', 'social_media', 'email_campaigns', 'seo_optimization', 'analytics', 'ad_management'],
    ],
    'david' => [
        'name' => 'David',
        'role' => 'Dispatch & Field Manager',
        'service_key' => 'operations',
        'personality' => ['tone' => 'calm under pressure', 'formality' => 'direct and clear'],
        'capabilities' => ['route_optimization', 'fleet_management', 'field_scheduling', 'real_time_tracking', 'crew_coordination'],
    ],
    'catherine' => [
        'name' => 'Catherine',
        'role' => 'Community Relations Manager',
        'service_key' => 'marketing',
        'personality' => ['tone' => 'friendly and community-focused', 'formality' => 'approachable'],
        'capabilities' => ['partnership_management', 'local_engagement', 'event_coordination', 'community_outreach', 'reputation_management'],
    ],
    'alexandra' => [
        'name' => 'Alexandra',
        'role' => 'Strategic AI Consultant',
        'service_key' => 'concierge',
        'personality' => ['tone' => 'wise and forward-thinking', 'formality' => 'executive-level'],
        'capabilities' => ['business_strategy', 'performance_analysis', 'growth_planning', 'competitive_analysis', 'ai_deployment_recommendations'],
    ],
];
```

---

### Task 6.3: AI Employee Controller & Pages

**File:** `app/Http/Controllers/AlphaSite/AIEmployeeController.php`

```php
public function index(Request $request): Response { ... }      // AI team directory
public function show(Request $request, string $employee): Response { ... }  // Individual employee dashboard
public function chat(Request $request, string $employee): JsonResponse { ... } // Chat with employee
public function tasks(Request $request, string $employee): Response { ... }  // Task management
public function configure(Request $request, string $employee): Response { ... } // Settings
public function executeTask(Request $request, string $employee): JsonResponse { ... } // Trigger a task
```

**Routes:**

```php
Route::prefix('ai-team')->group(function () {
    Route::get('/', [AIEmployeeController::class, 'index'])->name('alphasite.ai-team.index');
    Route::get('/{employee}', [AIEmployeeController::class, 'show'])->name('alphasite.ai-team.show');
    Route::post('/{employee}/chat', [AIEmployeeController::class, 'chat'])->name('alphasite.ai-team.chat');
    Route::get('/{employee}/tasks', [AIEmployeeController::class, 'tasks'])->name('alphasite.ai-team.tasks');
    Route::get('/{employee}/configure', [AIEmployeeController::class, 'configure'])->name('alphasite.ai-team.configure');
    Route::post('/{employee}/execute', [AIEmployeeController::class, 'executeTask'])->name('alphasite.ai-team.execute');
});
```

**Frontend pages:**

| File | URL | Props |
|------|-----|-------|
| `resources/js/pages/alphasite/ai-team/index.tsx` | `/ai-team` | `{ business, employees: AIEmployee[], subscription }` |
| `resources/js/pages/alphasite/ai-team/show.tsx` | `/ai-team/{id}` | `{ business, employee, tasks, metrics, conversations }` |
| `resources/js/pages/alphasite/ai-team/configure.tsx` | `/ai-team/{id}/configure` | `{ business, employee, availableCapabilities }` |

---

## 8. PHASE 7: ANALYTICS & REPORTING SUITE (Week 20–22) {#8-phase-7}

### Task 7.1: Analytics Migration

**Migration:** `database/migrations/2026_02_15_000005_create_business_analytics_table.php`

```php
Schema::create('business_analytics_snapshots', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->date('snapshot_date');
    $table->string('period', 20); // daily, weekly, monthly

    // Revenue metrics
    $table->decimal('revenue', 12, 2)->default(0);
    $table->decimal('expenses', 12, 2)->default(0);
    $table->decimal('profit', 12, 2)->default(0);

    // Customer metrics
    $table->integer('total_customers')->default(0);
    $table->integer('new_customers')->default(0);
    $table->integer('churned_customers')->default(0);
    $table->decimal('satisfaction_score', 3, 2)->nullable();

    // AI metrics
    $table->integer('ai_interactions')->default(0);
    $table->integer('ai_resolved')->default(0);
    $table->decimal('ai_efficiency', 5, 2)->nullable();

    // Marketing metrics
    $table->integer('page_views')->default(0);
    $table->integer('unique_visitors')->default(0);
    $table->integer('leads_generated')->default(0);

    // Community metrics
    $table->integer('reviews_received')->default(0);
    $table->decimal('average_rating', 3, 2)->nullable();
    $table->integer('community_interactions')->default(0);

    $table->json('metadata')->nullable();
    $table->timestamps();

    $table->unique(['business_id', 'snapshot_date', 'period']);
    $table->index('business_id');
});
```

### Task 7.2: AnalyticsService

**File:** `app/Services/AlphaSite/AnalyticsService.php`

Methods:
- `captureSnapshot(Business $business, string $period): void`
- `getFinancialDashboard(Business $business, string $range): array`
- `getOperationalMetrics(Business $business, string $range): array`
- `getMarketingIntelligence(Business $business, string $range): array`
- `getCustomerAnalytics(Business $business, string $range): array`
- `generateCustomReport(Business $business, array $config): array`
- `getPredictions(Business $business): array`

### Task 7.3: Analytics Controller & Pages

**File:** `app/Http/Controllers/AlphaSite/AnalyticsController.php`

**Routes:**

```php
Route::prefix('analytics')->group(function () {
    Route::get('/', [AnalyticsController::class, 'overview'])->name('alphasite.analytics.overview');
    Route::get('/financial', [AnalyticsController::class, 'financial'])->name('alphasite.analytics.financial');
    Route::get('/operational', [AnalyticsController::class, 'operational'])->name('alphasite.analytics.operational');
    Route::get('/marketing', [AnalyticsController::class, 'marketing'])->name('alphasite.analytics.marketing');
    Route::get('/customers', [AnalyticsController::class, 'customers'])->name('alphasite.analytics.customers');
    Route::get('/reports/builder', [AnalyticsController::class, 'reportBuilder'])->name('alphasite.analytics.builder');
    Route::post('/reports/generate', [AnalyticsController::class, 'generateReport'])->name('alphasite.analytics.generate');
});
```

**Scheduled snapshot command:**

```php
Schedule::command('alphasite:capture-analytics-snapshot --period=daily')->dailyAt('23:55');
Schedule::command('alphasite:capture-analytics-snapshot --period=weekly')->weeklyOn(0, '23:55');
Schedule::command('alphasite:capture-analytics-snapshot --period=monthly')->monthlyOn(1, '00:05');
```

---

## 9. PHASE 8: INDUSTRY-SPECIFIC MODULES (Week 23–25) {#9-phase-8}

### Task 8.1: Enhanced TemplateService

**Update file:** `app/Services/AlphaSite/TemplateService.php` (currently 59 lines — needs full rewrite)

```php
final class TemplateService
{
    /** Get template configuration for industry */
    public function getTemplateForIndustry(string $industrySlug): array { ... }

    /** Get industry-specific AI prompt additions */
    public function getIndustryPromptContext(Business $business): string { ... }

    /** Get industry-specific page sections */
    public function getIndustrySections(string $industrySlug): array { ... }

    /** Get industry-specific CRM fields */
    public function getIndustryCrmFields(string $industrySlug): array { ... }
}
```

### Task 8.2: Industry Configuration

**File:** `config/alphasite_industries.php`

```php
return [
    'restaurant' => [
        'sections' => ['menu', 'reservations', 'reviews', 'gallery', 'events'],
        'ai_features' => ['menu_management', 'reservation_system', 'order_taking'],
        'crm_fields' => ['dietary_preferences', 'favorite_dishes', 'party_size_preference'],
        'template_class' => 'restaurant',
    ],
    'healthcare' => [
        'sections' => ['services', 'providers', 'insurance', 'patient_portal', 'reviews'],
        'ai_features' => ['appointment_scheduling', 'insurance_verification', 'patient_intake'],
        'crm_fields' => ['insurance_provider', 'preferred_provider', 'medical_notes'],
        'template_class' => 'healthcare',
        'compliance' => ['hipaa'],
    ],
    'legal' => [
        'sections' => ['practice_areas', 'attorneys', 'case_results', 'consultations', 'reviews'],
        'ai_features' => ['consultation_scheduling', 'case_intake', 'document_requests'],
        'crm_fields' => ['case_type', 'referral_source', 'consultation_notes'],
        'template_class' => 'legal',
    ],
    'retail' => [
        'sections' => ['products', 'deals', 'reviews', 'gallery', 'events'],
        'ai_features' => ['product_search', 'inventory_check', 'order_tracking'],
        'crm_fields' => ['preferred_brands', 'size_preferences', 'loyalty_points'],
        'template_class' => 'retail',
    ],
    'home_services' => [
        'sections' => ['services', 'service_areas', 'gallery', 'estimates', 'reviews'],
        'ai_features' => ['estimate_requests', 'scheduling', 'permit_tracking'],
        'crm_fields' => ['property_type', 'service_history', 'preferred_schedule'],
        'template_class' => 'home_services',
    ],
];
```

---

## 10. PHASE 9: THIRD-PARTY INTEGRATIONS (Week 26–28) {#10-phase-9}

### Task 9.1: Integration Framework

**Migration:** `database/migrations/2026_02_15_000006_create_business_integrations_table.php`

```php
Schema::create('business_integrations', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->string('provider', 100); // stripe, twilio, sendgrid, google_ads, quickbooks, calendly, etc.
    $table->string('status', 50)->default('pending'); // pending, active, error, disconnected
    $table->json('credentials')->nullable(); // Encrypted API keys/tokens
    $table->json('configuration')->nullable();
    $table->json('sync_status')->nullable();
    $table->timestamp('last_sync_at')->nullable();
    $table->timestamps();

    $table->unique(['business_id', 'provider']);
    $table->index('business_id');
});
```

### Task 9.2: Integration Manager Service

**File:** `app/Services/AlphaSite/IntegrationManagerService.php`

```php
final class IntegrationManagerService
{
    public function connect(Business $business, string $provider, array $credentials): BusinessIntegration { ... }
    public function disconnect(Business $business, string $provider): void { ... }
    public function sync(Business $business, string $provider): array { ... }
    public function getStatus(Business $business): array { ... }
    public function getAvailableIntegrations(Business $business): array { ... }
}
```

### Task 9.3: Integrations Page

**File:** `resources/js/pages/alphasite/command-center/integrations.tsx`

**Route:** `Route::get('/command-center/integrations', ...)->name('alphasite.command.integrations');`

---

## 11. PHASE 10: AI COMPONENT BUILDER (Week 29–30) {#11-phase-10}

### Task 10.1: Component Builder Service

**File:** `app/Services/AlphaSite/ComponentBuilderService.php`

Allows business owners to use AI chat to generate custom components for their AlphaSite webpage.

```php
final class ComponentBuilderService
{
    /** Generate a component from natural language description */
    public function generateComponent(Business $business, string $description): array { ... }

    /** Get existing components for a business */
    public function getComponents(Business $business): Collection { ... }

    /** Check for singleton duplicates (hero, contact, etc.) */
    public function validateNoDuplicateSingleton(Business $business, string $componentType): bool { ... }

    /** Save generated component */
    public function saveComponent(Business $business, array $componentData): BusinessComponent { ... }

    /** Reorder components */
    public function reorderComponents(Business $business, array $order): void { ... }
}
```

**Migration:** `database/migrations/2026_02_15_000007_create_business_components_table.php`

```php
Schema::create('business_components', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->string('type', 100);        // hero, about, services, gallery, testimonials, cta, contact, custom
    $table->string('name', 255);
    $table->json('content');             // Component-specific data
    $table->json('style')->nullable();   // Custom styling overrides
    $table->integer('display_order')->default(0);
    $table->boolean('is_active')->default(true);
    $table->boolean('is_singleton')->default(false); // Only one per type allowed
    $table->timestamps();

    $table->index('business_id');
    $table->index(['business_id', 'type']);
});
```

---

## 12. PHASE 11: HARDENING, TESTING & LAUNCH (Week 31–33) {#12-phase-11}

### Task 11.1: Complete Test Suite

| Test File | Type | Coverage |
|-----------|------|----------|
| `tests/Feature/AlphaSite/ProcessExpiredTrialsTest.php` | Feature | Trial lifecycle |
| `tests/Feature/AlphaSite/ClaimFlowTest.php` | Feature | Full claim → verify → subscribe flow |
| `tests/Feature/AlphaSite/StripeWebhookTest.php` | Feature | All webhook event types |
| `tests/Feature/AlphaSite/CrmDashboardTest.php` | Feature | Dashboard data loading |
| `tests/Feature/AlphaSite/CrmCustomersTest.php` | Feature | CRUD + search + filter |
| `tests/Feature/AlphaSite/AIConciergeTest.php` | Feature | Chat flow + FAQ matching + CRM recording |
| `tests/Feature/AlphaSite/CommandCenterTest.php` | Feature | All 5 dashboard panels |
| `tests/Feature/AlphaSite/AIEmployeeTest.php` | Feature | Employee CRUD + task execution |
| `tests/Feature/AlphaSite/AnalyticsTest.php` | Feature | Snapshot capture + report generation |
| `tests/Feature/AlphaSite/CrossPlatformTest.php` | Feature | Content aggregation from all platforms |
| `tests/Unit/Services/SubscriptionLifecycleServiceTest.php` | Unit | All state transitions |
| `tests/Unit/Services/SMBCrmServiceTest.php` | Unit | Customer + interaction CRUD |
| `tests/Unit/Services/AIConciergeServiceTest.php` | Unit | Prompt building + FAQ matching |
| `tests/Unit/Services/StripeServiceTest.php` | Unit | Checkout + webhook handling |
| `tests/Unit/Services/VerificationServiceTest.php` | Unit | Phone + email verification |

### Task 11.2: Database Seeder Updates

**Update file:** `database/seeders/DatabaseSeeder.php`

Add calls to:
- `AlphaSiteCommunitySeeder` (already exists)
- `BusinessSubscriptionSeeder` (NEW — seed trial + paid examples)
- `AIEmployeeSeeder` (NEW — seed default employees per business)
- `AIConversationSeeder` (NEW — seed example conversations)
- `BusinessComponentSeeder` (NEW — seed example components)
- `BusinessIntegrationSeeder` (NEW — seed mock integrations)
- `BusinessAnalyticsSnapshotSeeder` (NEW — seed 90 days of sample data)

### Task 11.3: Performance Optimization

- Add Redis caching for all AlphaSite pages (use `config/alphasite.php` TTLs)
- Add `Cache::tags(['alphasite', "business:{$business->id}"])` for targeted invalidation
- Add database indexes per CURSOR_INSTRUCTIONS spec
- Add Horizon queue workers for AI processing jobs
- Add rate limiting to AI chat endpoints (10 req/min per IP)

### Task 11.4: Security Audit

- CSRF protection on all non-webhook routes
- Stripe webhook signature verification
- Rate limiting on claim verification (5 attempts per hour)
- XSS sanitization on all user inputs in CRM
- Authorization policies: business owners can only access their own CRM data
- Encrypted storage for integration credentials (`business_integrations.credentials`)

---

## 13. MASTER ROUTE REGISTRY {#13-master-route-registry}

### All Routes to Add to `routes/alphasite.php`

```
EXISTING ROUTES (DO NOT MODIFY):
GET    /                                    → DirectoryController@home
GET    /directory                           → DirectoryController@index
GET    /business/{slug}                     → BusinessPageController@show
GET    /business/{slug}/{tab}               → BusinessPageController@showTab
POST   /ai/chat (subdomain)                 → BusinessPageController@aiChat
GET    /claim/{slug}                        → ClaimController@start
GET    /search                              → SearchController@index
GET    /community/{city}-{state}            → CommunityController@show
GET    /city/{slug}                         → CityPageController@show
GET    /county/{slug}                       → CountyPageController@show
GET    /state/{state}                       → CityPageController@showState
GET    /industry/{slug}                     → IndustryController@show
GET    /sitemap.xml                         → SitemapController@index
GET    /llms.txt                            → LlmsTxtController@show
GET    /crm/dashboard                       → SMBCrmController@dashboard
GET    /crm/customers                       → SMBCrmController@customers
GET    /crm/customers/{customer}            → SMBCrmController@showCustomer
GET    /crm/interactions                    → SMBCrmController@interactions
GET    /crm/faqs                            → SMBCrmController@faqs
POST   /crm/faqs                            → SMBCrmController@storeFaq
GET    /crm/surveys                         → SMBCrmController@surveys
GET    /crm/ai-services                     → SMBCrmController@aiServices
POST   /api/fourcalls/subscribe             → FourCallsSubscriptionController@subscribe

NEW ROUTES TO ADD:

# Stripe Webhook
POST   /webhooks/stripe                     → StripeWebhookController@handle [no CSRF]

# Claim Flow (replace existing)
POST   /claim/{slug}/send-code              → ClaimController@sendVerification
POST   /claim/{slug}/verify                 → ClaimController@verify
GET    /claim/{slug}/verify-email/{token}   → ClaimController@verifyEmail
GET    /claim/{slug}/select-plan            → ClaimController@selectPlan
POST   /claim/{slug}/checkout               → ClaimController@checkout
GET    /claim/{slug}/success                → ClaimController@success

# CRM Extensions
PUT    /crm/faqs/{faq}                      → SMBCrmController@updateFaq
DELETE /crm/faqs/{faq}                      → SMBCrmController@deleteFaq
POST   /crm/faqs/{faq}/generate-answer      → SMBCrmController@generateFaqAnswer
POST   /crm/faqs/reorder                    → SMBCrmController@reorderFaqs
POST   /crm/surveys                         → SMBCrmController@storeSurvey
PUT    /crm/surveys/{survey}                → SMBCrmController@updateSurvey
DELETE /crm/surveys/{survey}                → SMBCrmController@deleteSurvey
GET    /crm/surveys/{survey}/responses      → SMBCrmController@surveyResponses
POST   /crm/customers                       → SMBCrmController@storeCustomer
PUT    /crm/customers/{customer}            → SMBCrmController@updateCustomer
DELETE /crm/customers/{customer}            → SMBCrmController@deleteCustomer
POST   /crm/customers/{customer}/log        → SMBCrmController@logInteraction

# Command Center
GET    /command-center                      → CommandCenterController@dashboard
GET    /command-center/ai-team              → CommandCenterController@aiTeam
GET    /command-center/revenue              → CommandCenterController@revenue
GET    /command-center/community            → CommandCenterController@community
GET    /command-center/integrations         → CommandCenterController@integrations
GET    /command-center/settings             → CommandCenterController@settings

# AI Team
GET    /ai-team                             → AIEmployeeController@index
GET    /ai-team/{employee}                  → AIEmployeeController@show
POST   /ai-team/{employee}/chat             → AIEmployeeController@chat
GET    /ai-team/{employee}/tasks            → AIEmployeeController@tasks
GET    /ai-team/{employee}/configure        → AIEmployeeController@configure
PUT    /ai-team/{employee}/configure        → AIEmployeeController@updateConfig
POST   /ai-team/{employee}/execute          → AIEmployeeController@executeTask

# Analytics
GET    /analytics                           → AnalyticsController@overview
GET    /analytics/financial                 → AnalyticsController@financial
GET    /analytics/operational               → AnalyticsController@operational
GET    /analytics/marketing                 → AnalyticsController@marketing
GET    /analytics/customers                 → AnalyticsController@customers
GET    /analytics/reports/builder           → AnalyticsController@reportBuilder
POST   /analytics/reports/generate          → AnalyticsController@generateReport

# Component Builder
GET    /components                          → ComponentBuilderController@index
POST   /components/generate                 → ComponentBuilderController@generate
POST   /components                          → ComponentBuilderController@store
PUT    /components/{component}              → ComponentBuilderController@update
DELETE /components/{component}              → ComponentBuilderController@destroy
POST   /components/reorder                  → ComponentBuilderController@reorder

# Subscription Management
GET    /subscription                        → SubscriptionController@show
POST   /subscription/change-tier            → SubscriptionController@changeTier
POST   /subscription/cancel                 → SubscriptionController@cancel
POST   /subscription/resume                 → SubscriptionController@resume
GET    /subscription/portal                 → SubscriptionController@portal
POST   /subscription/add-service            → SubscriptionController@addService
POST   /subscription/remove-service         → SubscriptionController@removeService
```

---

## 14. MASTER MIGRATION REGISTRY {#14-master-migration-registry}

### New Migrations Required

| # | Migration File | Table | Phase |
|---|---------------|-------|-------|
| 1 | `2026_02_15_000001_add_claimed_by_id_to_businesses_table.php` | businesses (alter) | 1 |
| 2 | `2026_02_15_000002_create_ai_conversations_table.php` | ai_conversations | 3 |
| 3 | `2026_02_15_000003_create_ai_employees_table.php` | ai_employees | 6 |
| 4 | `2026_02_15_000004_create_ai_employee_tasks_table.php` | ai_employee_tasks | 6 |
| 5 | `2026_02_15_000005_create_business_analytics_snapshots_table.php` | business_analytics_snapshots | 7 |
| 6 | `2026_02_15_000006_create_business_integrations_table.php` | business_integrations | 9 |
| 7 | `2026_02_15_000007_create_business_components_table.php` | business_components | 10 |
| 8 | `2026_02_15_000008_enhance_business_templates_table.php` | business_templates (alter) | 8 |

---

## 15. MASTER MODEL REGISTRY {#15-master-model-registry}

### New Models Required

| Model | Table | Phase | Relations |
|-------|-------|-------|-----------|
| `AIConversation` | ai_conversations | 3 | belongsTo(Business), belongsTo(SMBCrmCustomer) |
| `AIEmployee` | ai_employees | 6 | belongsTo(Business), hasMany(AIEmployeeTask) |
| `AIEmployeeTask` | ai_employee_tasks | 6 | belongsTo(AIEmployee), belongsTo(Business) |
| `BusinessAnalyticsSnapshot` | business_analytics_snapshots | 7 | belongsTo(Business) |
| `BusinessIntegration` | business_integrations | 9 | belongsTo(Business) |
| `BusinessComponent` | business_components | 10 | belongsTo(Business) |

---

## 16. TYPESCRIPT INTERFACE REGISTRY {#16-typescript-interface-registry}

**File:** `resources/js/types/alphasite.d.ts`

```typescript
// Core Business Types
interface Business {
  id: string;
  name: string;
  slug: string;
  alphasite_subdomain: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  subscription_tier: string;
  ai_services_enabled: boolean;
  industry_id: string | null;
  template_id: string | null;
  claimed_at: string | null;
  claimed_by_id: string | null;
  rating: number | null;
  reviews_count: number;
}

interface BusinessSubscription {
  id: string;
  business_id: string;
  tier: 'basic' | 'trial' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'past_due';
  trial_started_at: string | null;
  trial_expires_at: string | null;
  trial_converted_at: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  ai_services_enabled: string[];
  monthly_amount: string | null;
  stripe_subscription_id: string | null;
}

interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive' | 'churned';
  health_score: number | null;
  lifetime_value: string | null;
  predicted_churn_risk: string | null;
  ai_notes: string | null;
  preferences: Record<string, any> | null;
  tags: string[] | null;
  last_interaction_at: string | null;
  created_at: string;
}

interface Interaction {
  id: string;
  customer_id: string | null;
  interaction_type: string;
  channel: string;
  direction: string;
  subject: string | null;
  content: string | null;
  handled_by: 'ai' | 'human' | 'ai_escalated';
  ai_service_used: string | null;
  ai_confidence_score: string | null;
  outcome: string;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  created_at: string;
  customer?: Customer;
}

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  service_key: string;
  avatar: string;
  status: 'active' | 'idle' | 'processing' | 'offline';
  personality: { tone: string; formality: string; greeting: string; specialties: string[] };
  capabilities: string[];
  performance_metrics: { efficiency: number; tasks_completed: number; avg_response_time: number };
  last_active_at: string | null;
}

interface AIEmployeeTask {
  id: string;
  ai_employee_id: string;
  task_type: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  confidence_score: number | null;
  started_at: string | null;
  completed_at: string | null;
}

interface BusinessFaq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  variations: string[] | null;
  follow_up_questions: string[] | null;
  times_used: number;
  helpful_votes: number;
  unhelpful_votes: number;
  is_active: boolean;
  display_order: number;
}

interface BusinessSurvey {
  id: string;
  name: string;
  description: string | null;
  survey_type: string | null;
  questions: SurveyQuestion[];
  is_active: boolean;
  responses_count: number;
  average_score: string | null;
}

interface SurveyQuestion {
  id: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'yes_no';
  question: string;
  options?: string[];
  required: boolean;
}

interface Alert {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_url: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```

---

## COMPLETE FILE MANIFEST

### New Files to Create (Total: 47)

**Backend (24 files):**
1. `app/Console/Commands/ProcessExpiredTrials.php`
2. `app/Console/Commands/SendTrialExpirationReminders.php`
3. `app/Console/Commands/CaptureAnalyticsSnapshot.php`
4. `app/Services/AlphaSite/StripeService.php`
5. `app/Services/AlphaSite/VerificationService.php`
6. `app/Services/AlphaSite/AIConciergeService.php`
7. `app/Services/AlphaSite/CommandCenterService.php`
8. `app/Services/AlphaSite/AIEmployeeService.php`
9. `app/Services/AlphaSite/AnalyticsService.php`
10. `app/Services/AlphaSite/IntegrationManagerService.php`
11. `app/Services/AlphaSite/ComponentBuilderService.php`
12. `app/Http/Controllers/AlphaSite/StripeWebhookController.php`
13. `app/Http/Controllers/AlphaSite/CommandCenterController.php`
14. `app/Http/Controllers/AlphaSite/AIEmployeeController.php`
15. `app/Http/Controllers/AlphaSite/AnalyticsController.php`
16. `app/Http/Controllers/AlphaSite/ComponentBuilderController.php`
17. `app/Http/Controllers/AlphaSite/SubscriptionController.php`
18. `app/Models/AIConversation.php`
19. `app/Models/AIEmployee.php`
20. `app/Models/AIEmployeeTask.php`
21. `app/Models/BusinessAnalyticsSnapshot.php`
22. `app/Models/BusinessIntegration.php`
23. `app/Models/BusinessComponent.php`
24. `config/alphasite.php`, `config/stripe.php`, `config/alphasite_employees.php`, `config/alphasite_industries.php`

**Migrations (8 files):**
25–32. See Migration Registry above

**Frontend (15 files):**
33. `resources/js/types/alphasite.d.ts`
34. `resources/js/layouts/alphasite-crm-layout.tsx`
35. `resources/js/pages/alphasite/crm/dashboard.tsx`
36. `resources/js/pages/alphasite/crm/customers.tsx`
37. `resources/js/pages/alphasite/crm/customer/show.tsx`
38. `resources/js/pages/alphasite/crm/interactions.tsx`
39. `resources/js/pages/alphasite/crm/faqs.tsx`
40. `resources/js/pages/alphasite/crm/surveys.tsx`
41. `resources/js/pages/alphasite/crm/ai-services.tsx`
42. `resources/js/pages/alphasite/claim/verify.tsx`
43. `resources/js/pages/alphasite/claim/select-plan.tsx`
44. `resources/js/pages/alphasite/claim/success.tsx`
45. `resources/js/pages/alphasite/command-center/dashboard.tsx`
46. `resources/js/pages/alphasite/command-center/ai-team.tsx`
47. `resources/js/pages/alphasite/command-center/revenue.tsx`
48. `resources/js/pages/alphasite/command-center/community.tsx`
49. `resources/js/pages/alphasite/command-center/integrations.tsx`
50. `resources/js/pages/alphasite/command-center/settings.tsx`
51. `resources/js/pages/alphasite/ai-team/index.tsx`
52. `resources/js/pages/alphasite/ai-team/show.tsx`
53. `resources/js/pages/alphasite/ai-team/configure.tsx`
54. `resources/js/pages/alphasite/analytics/overview.tsx`
55. `resources/js/pages/alphasite/analytics/financial.tsx`
56. `resources/js/pages/alphasite/analytics/operational.tsx`
57. `resources/js/pages/alphasite/analytics/marketing.tsx`
58. `resources/js/pages/alphasite/analytics/customers.tsx`
59. `resources/js/pages/alphasite/analytics/report-builder.tsx`
60. `resources/js/pages/alphasite/components/index.tsx`
61. `resources/js/pages/alphasite/subscription/show.tsx`
62. `resources/js/components/alphasite/social-share.tsx`

**Files to Update (9 files):**
- `app/Http/Controllers/AlphaSite/ClaimController.php` (full rewrite)
- `app/Http/Controllers/AlphaSite/SMBCrmController.php` (add 8 methods)
- `app/Http/Controllers/AlphaSite/BusinessPageController.php` (update aiChat)
- `app/Services/AlphaSite/LinkingService.php` (extend to ~200 lines)
- `app/Services/AlphaSite/TemplateService.php` (full rewrite)
- `routes/alphasite.php` (add ~50 new routes)
- `resources/js/components/common/seo.tsx` (add geo/twitter tags)
- `resources/js/pages/alphasite/business/show.tsx` (enhance chat widget)
- `routes/console.php` or `app/Console/Kernel.php` (add 4 scheduled commands)

---

*End of AlphaSite.ai Complete Project Plan*
*Zero Deferred Maintenance — Every file, route, migration, model, and prop documented.*
