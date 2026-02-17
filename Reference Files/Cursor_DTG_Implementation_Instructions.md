# Downtown Guide — Cursor Implementation Instructions

> **Company**: Fibonacco (two C's, never "Fibonacci")
> **Application**: Downtown Guide (DowntownsGuide)
> **Stack**: Laravel 11 + Inertia.js + React (TSX) + Ziggy + Tailwind CSS + PostgreSQL + Railway
> **Date**: February 14, 2026

---

## CRITICAL RULES — READ BEFORE WRITING ANY CODE

1. **NEVER create custom UI components without express permission.** Magic Patterns and the UI team have invested significant effort in interface designs. Use existing components from `resources/js/components/ui/` exactly as provided. These are the **ultimate guide** for all interface implementation.

2. **Real functionality only.** No placeholders, no dummy returns, no "TODO" stubs. Every function must do real work. If a dependency is missing, create it.

3. **Follow existing patterns exactly.** Every model uses `HasUuid` (UUID primary keys), `declare(strict_types=1)`, and `final class`. Every controller uses constructor injection with `private readonly`. Every migration uses `$table->uuid('id')->primary()`. Match what's already in the codebase.

4. **TypeScript (.tsx) for all frontend files.** Never `.jsx`.

5. **Complete transparency about failures.** If something can't be done, say so. Don't fake it.

---

## EXISTING STACK REFERENCE

```
Technology        | Details
------------------|--------------------------------------------------
Backend           | Laravel 11, PHP 8.3, strict_types everywhere
Frontend          | React 18 via Inertia.js v2, TypeScript
Routing (PHP)     | routes/downtown-guide.php (domain-scoped)
Routing (JS)      | Ziggy — use route('downtown-guide.name')
UI Components     | shadcn/ui in resources/js/components/ui/
Styling           | Tailwind CSS
Database          | PostgreSQL, UUID primary keys
Auth              | Laravel Breeze + Sanctum + Socialite
Admin             | Filament PHP
Domain Detection  | DetectAppDomain middleware (multi-site)
State Management  | Inertia shared data + page props
Deployment        | Railway
```

### Existing File Conventions

**Models** — `app/Models/ModelName.php`:
```php
<?php
declare(strict_types=1);
namespace App\Models;
use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

final class ModelName extends Model
{
    use HasFactory, HasUuid, SoftDeletes;
    protected $fillable = [...];
    protected function casts(): array { return [...]; }
}
```

**Controllers** — `app/Http/Controllers/DowntownGuide/ControllerName.php`:
```php
<?php
declare(strict_types=1);
namespace App\Http\Controllers\DowntownGuide;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class ControllerName extends Controller
{
    public function __construct(
        private readonly SomeService $someService
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('downtown-guide/page-name/index', [
            'data' => $data,
            'platform' => 'downtownsguide',
        ]);
    }
}
```

**Migrations** — `database/migrations/YYYY_MM_DD_HHMMSS_create_table_name.php`:
```php
Schema::create('table_name', function (Blueprint $table) {
    $table->uuid('id')->primary();
    // ... columns
    $table->timestamps();
    $table->softDeletes();
    // indexes, NO foreign key constraints (FK DISABLED pattern)
    $table->index('related_id');
});
```

**React Pages** — `resources/js/pages/downtown-guide/section/page.tsx`:
```tsx
import { Head, Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
// Use existing UI components from @/components/ui/*

interface PageProps {
    // typed props from controller
}

export default function PageName({ prop1, prop2 }: PageProps) {
    return (
        <div className="min-h-screen bg-background">
            <Head title="Page Title" />
            {/* content */}
        </div>
    );
}
```

---

## PHASE 1: DATABASE — MISSING MODELS & MIGRATIONS

Create these in order. Each needs a migration AND a model. Follow the exact patterns above.

### 1.1 — User Table Additions

Create migration: `add_gamification_fields_to_users_table`

```
Columns to ADD to existing users table:
- total_points        INTEGER DEFAULT 0
- lifetime_points     INTEGER DEFAULT 0
- current_level       VARCHAR(50) DEFAULT 'Bronze'
- level_progress      INTEGER DEFAULT 0
- referral_code       VARCHAR(50) UNIQUE NULLABLE
- referred_by_id      UUID NULLABLE (index, no FK)
- account_type        VARCHAR(20) DEFAULT 'user' — values: user, business
- phone               VARCHAR(20) NULLABLE
- bio                 TEXT NULLABLE
- city                VARCHAR(100) NULLABLE
- state               VARCHAR(50) NULLABLE
- zip_code            VARCHAR(20) NULLABLE
- latitude            DECIMAL(10,8) NULLABLE
- longitude           DECIMAL(11,8) NULLABLE
- interests           JSONB DEFAULT '[]'
- privacy_settings    JSONB DEFAULT '{}'
- notification_prefs  JSONB DEFAULT '{}'
- last_active_at      TIMESTAMP NULLABLE
```

Update `app/Models/User.php` — add these to `$fillable`, add `casts()` for JSON/date fields, add relationships to new models below.

### 1.2 — user_achievements

```
id                UUID PRIMARY
user_id           UUID (index)
achievement_id    UUID (index)
progress          JSONB DEFAULT '{}' — {current, target, percentage}
completed_at      TIMESTAMP NULLABLE
points_awarded    INTEGER DEFAULT 0
timestamps
UNIQUE(user_id, achievement_id)
```

Model: `app/Models/UserAchievement.php`
Relationships: belongsTo User, belongsTo Achievement

### 1.3 — user_points (replaces in-user tracking for detailed balance)

```
id                UUID PRIMARY
user_id           UUID (index, unique)
points_balance    INTEGER DEFAULT 0
lifetime_points   INTEGER DEFAULT 0
current_level     VARCHAR(50) DEFAULT 'Bronze'
level_progress    INTEGER DEFAULT 0
timestamps
```

Model: `app/Models/UserPoints.php`
Relationships: belongsTo User

### 1.4 — point_transactions

```
id                UUID PRIMARY
user_id           UUID (index)
transaction_type  VARCHAR(20) — earned, spent, bonus, penalty
points            INTEGER NOT NULL
source            VARCHAR(50) — review, check_in, achievement, referral, coupon, loyalty, admin
source_id         UUID NULLABLE
business_id       UUID NULLABLE (index)
description       VARCHAR(255) NULLABLE
created_at        TIMESTAMP
```

Model: `app/Models/PointTransaction.php`
Relationships: belongsTo User, belongsTo Business (nullable)

### 1.5 — loyalty_programs

```
id                UUID PRIMARY
business_id       UUID (index)
name              VARCHAR(255) NOT NULL
description       TEXT NULLABLE
program_type      VARCHAR(50) DEFAULT 'points' — points, visits, tiered
points_per_dollar DECIMAL(8,2) DEFAULT 1.00
tiers             JSONB DEFAULT '[]' — [{name, threshold, perks}]
rewards_catalog   JSONB DEFAULT '[]' — [{name, cost, description}]
is_active         BOOLEAN DEFAULT true
timestamps
softDeletes
```

Model: `app/Models/LoyaltyProgram.php`
Relationships: belongsTo Business, hasMany LoyaltyEnrollment

### 1.6 — loyalty_enrollments

```
id                UUID PRIMARY
user_id           UUID (index)
loyalty_program_id UUID (index)
business_id       UUID (index)
points_balance    INTEGER DEFAULT 0
current_tier      VARCHAR(50) DEFAULT 'member'
visits_count      INTEGER DEFAULT 0
total_spent       DECIMAL(10,2) DEFAULT 0
enrolled_at       TIMESTAMP
timestamps
UNIQUE(user_id, loyalty_program_id)
```

Model: `app/Models/LoyaltyEnrollment.php`
Relationships: belongsTo User, belongsTo LoyaltyProgram, belongsTo Business

### 1.7 — referrals

```
id                    UUID PRIMARY
referrer_id           UUID (index)
referred_user_id      UUID (index)
referral_code         VARCHAR(50) NOT NULL
status                VARCHAR(20) DEFAULT 'pending' — pending, completed, rewarded
referrer_reward_points  INTEGER DEFAULT 0
referred_reward_points  INTEGER DEFAULT 0
source                VARCHAR(50) DEFAULT 'direct' — direct, email, sms, social
completed_at          TIMESTAMP NULLABLE
created_at            TIMESTAMP
UNIQUE(referrer_id, referred_user_id)
```

Model: `app/Models/Referral.php`
Relationships: belongsTo User (referrer), belongsTo User (referred)

### 1.8 — challenges

```
id                  UUID PRIMARY
name                VARCHAR(255) NOT NULL
description         TEXT NOT NULL
challenge_type      VARCHAR(50) — individual, community, business_specific
requirements        JSONB NOT NULL — {type, target, conditions, timeframe}
rewards             JSONB NOT NULL — {points, badges, coupons, specialRewards}
start_date          TIMESTAMP NOT NULL
end_date            TIMESTAMP NOT NULL
participant_limit   INTEGER DEFAULT 0 (0 = unlimited)
current_participants INTEGER DEFAULT 0
business_id         UUID NULLABLE (index)
is_active           BOOLEAN DEFAULT true
timestamps
softDeletes
```

Model: `app/Models/Challenge.php`
Relationships: belongsTo Business (nullable), hasMany ChallengeParticipation

### 1.9 — challenge_participations

```
id                UUID PRIMARY
challenge_id      UUID (index)
user_id           UUID (index)
progress          JSONB DEFAULT '{}' — {current, target, percentage, milestones}
completed_at      TIMESTAMP NULLABLE
rewards_claimed   BOOLEAN DEFAULT false
joined_at         TIMESTAMP
UNIQUE(challenge_id, user_id)
```

Model: `app/Models/ChallengeParticipation.php`
Relationships: belongsTo Challenge, belongsTo User

---

## PHASE 2: UNCOMMENT & COMPLETE SERVICES

### 2.1 — GamificationService (`app/Services/GamificationService.php`)

The service currently has ~70% of its logic commented out. Uncomment ALL methods and wire them to the new models:

- `awardPoints()` — create PointTransaction record, update UserPoints, recalculate level
- `unlockAchievement()` — create UserAchievement record, award points if configured
- `getUserAchievements()` — query UserAchievement with Achievement eager load
- `getAchievements()` — query Achievement table with filters
- `getUserLevel()` — query UserPoints table
- `getLeaderboard()` — query UserPoints/PointTransaction, ordered by score for period
- `checkAchievementProgress()` — NEW: evaluate if user has met any uncompleted achievement requirements
- `calculateLevel()` — already exists, keep the math: Bronze(0), Silver(500), Gold(1500), Platinum(3000), Diamond(6000)

### 2.2 — LoyaltyService (`app/Services/LoyaltyService.php`)

Uncomment all methods and wire to LoyaltyProgram + LoyaltyEnrollment:

- `enroll()` — create LoyaltyEnrollment
- `earnPoints()` — update LoyaltyEnrollment balance, check tier upgrades
- `getUserPrograms()` — query LoyaltyEnrollment with LoyaltyProgram eager load
- `getBusinessProgram()` — query LoyaltyProgram for a business
- `redeemReward()` — deduct points, create PointTransaction
- `calculateTier()` — evaluate tiers from program JSONB config

### 2.3 — ReferralService (`app/Services/ReferralService.php`)

Uncomment all methods and wire to Referral model:

- `createReferralCode()` — already works, keep it
- `trackReferral()` — create Referral record
- `completeReferral()` — update status to 'completed', award points via GamificationService
- `getReferrals()` — query Referral with eager loaded users
- `getReferralStats()` — count pending/completed/rewarded

### 2.4 — NEW: ChallengeService (`app/Services/ChallengeService.php`)

Create from scratch:

- `getActiveChallenges()` — query where is_active AND within date range
- `joinChallenge()` — create ChallengeParticipation, increment current_participants
- `updateProgress()` — update JSONB progress, check completion
- `completeChallenge()` — set completed_at, award rewards via GamificationService
- `getUserChallenges()` — query ChallengeParticipation for user
- `getChallenge()` — single challenge with participants count

---

## PHASE 3: DOWNTOWN GUIDE LAYOUT & NAVIGATION

### 3.1 — Create DTG Layout (`resources/js/layouts/downtown-guide-layout.tsx`)

This is the shell that wraps ALL downtown-guide pages. Follow the EventCity layout pattern but with DTG branding.

**Structure**:
```
┌──────────────────────────────────────────────┐
│  HEADER: Logo | Search Bar | Nav Links | User│
├──────────────────────────────────────────────┤
│                                              │
│              PAGE CONTENT                    │
│         (children / Inertia page)            │
│                                              │
├──────────────────────────────────────────────┤
│  FOOTER: Links | Social | Legal | © Fibonacco│
└──────────────────────────────────────────────┘
```

**Header Navigation Links**:
- Browse (businesses.index)
- Deals (coupons.index)
- Achievements (achievements.index)
- Leaderboard (leaderboard)

**User Menu (authenticated)**:
- Profile
- Rewards Dashboard
- My Challenges
- Referrals
- Settings
- Logout

**User Menu (guest)**:
- Login
- Sign Up

Use existing `@/components/ui/` components: `button`, `dropdown-menu`, `avatar`, `input`, `badge`, `sheet` (mobile nav).

Colors: Primary #2563EB, Secondary #7C3AED — as specified in Magic Patterns design system.

### 3.2 — Wire Layout to Pages

Every DTG page should import and use `DowntownGuideLayout`. Update all existing pages in `resources/js/pages/downtown-guide/` to wrap their content in this layout.

---

## PHASE 4: AUTHENTICATION PAGES FOR DTG

Auth controllers already exist at `app/Http/Controllers/Auth/`. The auth routes already exist at `routes/auth.php`. What's missing is DTG-branded auth PAGES.

### 4.1 — Create DTG Auth Pages

Follow the EventCity auth page patterns exactly (`resources/js/pages/event-city/auth/`), but place them at `resources/js/pages/downtown-guide/auth/`:

Create these files:
- `login.tsx` — copy pattern from `event-city/auth/login.tsx`, change branding
- `register.tsx` — multi-step form: Account Type → Profile → Preferences
- `forgot-password.tsx` — email input form
- `reset-password.tsx` — new password form
- `verify-email.tsx` — verification confirmation

All should use `DowntownGuideLayout` (or a minimal auth variant).

The register page MUST include:
- Account type selector (User / Business Owner)
- Location fields (city, state, zip)
- Interest selection (restaurant, shopping, services, events, etc.)
- Terms acceptance checkbox

### 4.2 — DTG Auth Controller Overrides

Create `app/Http/Controllers/DowntownGuide/AuthController.php` that renders the DTG-specific auth pages instead of the EventCity ones. Add routes in `routes/downtown-guide.php`:

```php
// Auth routes for DTG (domain-scoped)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('downtown-guide.login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('downtown-guide.register');
    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('downtown-guide.forgot-password');
});
```

These controllers simply render DTG Inertia pages but POST to the existing auth routes (`Route::post('login', ...)` etc.).

---

## PHASE 5: BUSINESS OWNER DASHBOARD & TOOLS

This is the revenue-generating side. Create ALL of the following.

### 5.1 — Business Dashboard Controller

`app/Http/Controllers/DowntownGuide/BusinessDashboardController.php`

Methods:
- `dashboard()` — render business-owner home with stats
- `editProfile()` — render profile editor
- `updateProfile()` — handle profile update
- `manageHours()` — render hours management
- `updateHours()` — handle hours update
- `managePhotos()` — render photo management
- `analytics()` — render analytics dashboard
- `settings()` — render business settings

### 5.2 — Business Coupon Management Controller

`app/Http/Controllers/DowntownGuide/BusinessCouponController.php`

Methods:
- `index()` — list business's coupons with performance metrics
- `create()` — coupon creation wizard
- `store()` — save new coupon
- `edit()` — edit existing coupon
- `update()` — save coupon changes
- `destroy()` — soft delete coupon
- `analytics()` — coupon performance data

### 5.3 — Business Loyalty Controller

`app/Http/Controllers/DowntownGuide/BusinessLoyaltyController.php`

Methods:
- `index()` — loyalty program dashboard
- `setup()` — program creation/editing
- `store()` / `update()` — save program
- `members()` — view enrolled customers
- `awardPoints()` — manually award points to a customer

### 5.4 — Business Achievement Controller

`app/Http/Controllers/DowntownGuide/BusinessAchievementController.php`

Methods:
- `index()` — achievement campaigns list
- `create()` / `store()` — create achievement campaign
- `participants()` — view participant progress

### 5.5 — Routes

Add to `routes/downtown-guide.php` inside an `auth` + `verified` middleware group:

```php
Route::prefix('business')->name('business.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BusinessDashboardController::class, 'dashboard'])->name('dashboard');
    Route::get('/profile/edit', [BusinessDashboardController::class, 'editProfile'])->name('profile.edit');
    Route::put('/profile', [BusinessDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::get('/hours', [BusinessDashboardController::class, 'manageHours'])->name('hours');
    Route::put('/hours', [BusinessDashboardController::class, 'updateHours'])->name('hours.update');
    Route::get('/photos', [BusinessDashboardController::class, 'managePhotos'])->name('photos');
    Route::get('/analytics', [BusinessDashboardController::class, 'analytics'])->name('analytics');
    Route::get('/settings', [BusinessDashboardController::class, 'settings'])->name('settings');

    Route::resource('coupons', BusinessCouponController::class);
    Route::get('/coupons-analytics', [BusinessCouponController::class, 'analytics'])->name('coupons.analytics');

    Route::get('/loyalty', [BusinessLoyaltyController::class, 'index'])->name('loyalty.index');
    Route::get('/loyalty/setup', [BusinessLoyaltyController::class, 'setup'])->name('loyalty.setup');
    Route::post('/loyalty', [BusinessLoyaltyController::class, 'store'])->name('loyalty.store');
    Route::put('/loyalty', [BusinessLoyaltyController::class, 'update'])->name('loyalty.update');
    Route::get('/loyalty/members', [BusinessLoyaltyController::class, 'members'])->name('loyalty.members');
    Route::post('/loyalty/award-points', [BusinessLoyaltyController::class, 'awardPoints'])->name('loyalty.award-points');

    Route::resource('achievements', BusinessAchievementController::class)->only(['index', 'create', 'store']);
    Route::get('/achievements/{achievement}/participants', [BusinessAchievementController::class, 'participants'])->name('achievements.participants');
});
```

### 5.6 — Frontend Pages

Create in `resources/js/pages/downtown-guide/business/`:

```
dashboard.tsx          — Stats cards, recent activity, quick actions
profile-edit.tsx       — Business info form (name, description, category, address, phone, website)
hours.tsx              — Day-by-day hours editor with special hours
photos.tsx             — Photo grid with upload, reorder, delete
analytics.tsx          — Charts (views, searches, reviews, coupon redemptions)
settings.tsx           — Business account settings

coupons/index.tsx      — Table of coupons with status, redemptions, actions
coupons/create.tsx     — Step-by-step coupon builder (type, value, targeting, dates)
coupons/edit.tsx       — Edit existing coupon

loyalty/index.tsx      — Program overview, member stats
loyalty/setup.tsx      — Program designer (type, tiers, rewards)
loyalty/members.tsx    — Member list with points, tier, actions

achievements/index.tsx — Campaign list with participation rates
achievements/create.tsx — Achievement campaign builder
```

---

## PHASE 6: USER REWARDS & GAMIFICATION PAGES

### 6.1 — Rewards Controller

`app/Http/Controllers/DowntownGuide/RewardsController.php`

Methods:
- `dashboard()` — central rewards hub
- `challenges()` — active/available/past challenges
- `joinChallenge()` — POST to join
- `referrals()` — referral dashboard

### 6.2 — Routes

Add to `routes/downtown-guide.php`:

```php
Route::middleware(['auth'])->group(function () {
    Route::get('/rewards', [RewardsController::class, 'dashboard'])->name('rewards.dashboard');
    Route::get('/challenges', [RewardsController::class, 'challenges'])->name('challenges.index');
    Route::post('/challenges/{challenge}/join', [RewardsController::class, 'joinChallenge'])->name('challenges.join');
    Route::get('/referrals', [RewardsController::class, 'referrals'])->name('referrals.index');
});
```

### 6.3 — Frontend Pages

Create in `resources/js/pages/downtown-guide/`:

```
rewards/dashboard.tsx    — Points summary, recent activity, quick actions, achievement progress, leaderboard preview, available rewards
challenges/index.tsx     — Tabs: Active | Available | Past. Progress bars, rewards preview, join buttons
referrals/index.tsx      — Referral code + sharing tools, friend status, reward tracking, history
```

---

## PHASE 7: MAP & LOCATION FEATURES

### 7.1 — Map Controller

`app/Http/Controllers/DowntownGuide/MapController.php`

Methods:
- `index()` — map view with business markers
- `nearby()` — JSON endpoint for businesses near lat/lng

### 7.2 — Routes

```php
Route::get('/map', [MapController::class, 'index'])->name('map');
Route::get('/api/map/nearby', [MapController::class, 'nearby'])->name('api.map.nearby');
```

### 7.3 — Frontend

Create `resources/js/pages/downtown-guide/map/index.tsx`:
- Full-screen map (use Leaflet via `react-leaflet` — add to package.json)
- Business markers with popup cards
- Search/filter sidebar
- List/map toggle
- Current location button
- Category filter chips

Also update `search/index.tsx` to add a map/list toggle that switches between the grid view and an inline map view.

---

## PHASE 8: COMMUNITY & SOCIAL FEATURES

### 8.1 — Community Controller

`app/Http/Controllers/DowntownGuide/CommunityController.php`

Methods:
- `forum()` — discussion listing
- `createPost()` — new discussion form
- `storePost()` — save discussion
- `showPost()` — single discussion with replies
- `storeReply()` — add reply

### 8.2 — Routes

```php
Route::get('/community', [CommunityController::class, 'forum'])->name('community.index');
Route::middleware(['auth'])->group(function () {
    Route::get('/community/create', [CommunityController::class, 'createPost'])->name('community.create');
    Route::post('/community', [CommunityController::class, 'storePost'])->name('community.store');
    Route::get('/community/{post}', [CommunityController::class, 'showPost'])->name('community.show');
    Route::post('/community/{post}/reply', [CommunityController::class, 'storeReply'])->name('community.reply');
});
```

### 8.3 — Frontend Pages

```
community/index.tsx    — Discussion list, category tabs, create button
community/create.tsx   — Post form (title, body, category, tags)
community/show.tsx     — Post detail with threaded replies
```

---

## PHASE 9: USER ACCOUNT SETTINGS

### 9.1 — Settings Controller

`app/Http/Controllers/DowntownGuide/SettingsController.php`

Methods:
- `account()` — general account settings
- `updateAccount()` — save account changes
- `privacy()` — privacy settings
- `updatePrivacy()` — save privacy changes
- `notifications()` — notification preferences
- `updateNotifications()` — save notification prefs
- `password()` — password change form
- `updatePassword()` — handle password change
- `deleteAccount()` — account deletion

### 9.2 — Routes

```php
Route::prefix('settings')->name('settings.')->middleware(['auth'])->group(function () {
    Route::get('/', [SettingsController::class, 'account'])->name('account');
    Route::put('/', [SettingsController::class, 'updateAccount'])->name('account.update');
    Route::get('/privacy', [SettingsController::class, 'privacy'])->name('privacy');
    Route::put('/privacy', [SettingsController::class, 'updatePrivacy'])->name('privacy.update');
    Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
    Route::put('/notifications', [SettingsController::class, 'updateNotifications'])->name('notifications.update');
    Route::get('/password', [SettingsController::class, 'password'])->name('password');
    Route::put('/password', [SettingsController::class, 'updatePassword'])->name('password.update');
    Route::delete('/account', [SettingsController::class, 'deleteAccount'])->name('account.delete');
});
```

### 9.3 — Frontend Pages

Create in `resources/js/pages/downtown-guide/settings/`:

```
account.tsx            — Name, email, phone, location, bio, interests
privacy.tsx            — Profile visibility, review privacy, location sharing
notifications.tsx      — Toggle groups: business updates, community, promotions, digest
password.tsx           — Current + new password form
```

Use a settings sub-layout with a sidebar nav (Account | Privacy | Notifications | Password | Delete Account).

---

## PHASE 10: REWARDS API ENDPOINTS

Add to `routes/api/v1.php` or create `routes/api/v1/rewards.php`:

### User Rewards API (auth:sanctum required)

```php
Route::prefix('rewards')->middleware('auth:sanctum')->group(function () {
    // Points
    Route::get('/points', [Api\RewardsController::class, 'points']);
    Route::post('/points/earn', [Api\RewardsController::class, 'earnPoints']);
    Route::post('/points/spend', [Api\RewardsController::class, 'spendPoints']);

    // Achievements
    Route::get('/achievements', [Api\RewardsController::class, 'achievements']);
    Route::get('/achievements/progress', [Api\RewardsController::class, 'achievementProgress']);

    // Coupons
    Route::get('/coupons', [Api\RewardsController::class, 'availableCoupons']);
    Route::post('/coupons/{coupon}/redeem', [Api\RewardsController::class, 'redeemCoupon']);

    // Loyalty
    Route::get('/loyalty', [Api\RewardsController::class, 'loyaltyPrograms']);
    Route::post('/loyalty/{program}/join', [Api\RewardsController::class, 'joinLoyalty']);

    // Challenges
    Route::get('/challenges', [Api\RewardsController::class, 'challenges']);
    Route::post('/challenges/{challenge}/join', [Api\RewardsController::class, 'joinChallenge']);
    Route::post('/challenges/{challenge}/progress', [Api\RewardsController::class, 'updateChallengeProgress']);

    // Referrals
    Route::get('/referrals', [Api\RewardsController::class, 'referralStats']);
    Route::post('/referrals/invite', [Api\RewardsController::class, 'sendInvite']);

    // Leaderboards
    Route::get('/leaderboards/{type}', [Api\RewardsController::class, 'leaderboard']);
});
```

### Business Rewards API (auth:sanctum + business ownership check)

```php
Route::prefix('business/{business}/rewards')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/coupons', [Api\BusinessRewardsController::class, 'coupons']);
    Route::post('/coupons', [Api\BusinessRewardsController::class, 'createCoupon']);
    Route::put('/coupons/{coupon}', [Api\BusinessRewardsController::class, 'updateCoupon']);
    Route::delete('/coupons/{coupon}', [Api\BusinessRewardsController::class, 'deleteCoupon']);
    Route::get('/coupons/analytics', [Api\BusinessRewardsController::class, 'couponAnalytics']);

    Route::get('/loyalty', [Api\BusinessRewardsController::class, 'loyaltyProgram']);
    Route::put('/loyalty', [Api\BusinessRewardsController::class, 'updateLoyaltyProgram']);
    Route::get('/loyalty/members', [Api\BusinessRewardsController::class, 'loyaltyMembers']);
    Route::post('/loyalty/award', [Api\BusinessRewardsController::class, 'awardLoyaltyPoints']);

    Route::get('/analytics', [Api\BusinessRewardsController::class, 'rewardsAnalytics']);
});
```

Create controllers at `app/Http/Controllers/Api/V1/RewardsController.php` and `app/Http/Controllers/Api/V1/BusinessRewardsController.php`.

---

## PHASE 11: STATIC & LEGAL PAGES

### 11.1 — Pages Controller

`app/Http/Controllers/DowntownGuide/PagesController.php`

Methods: `about()`, `contact()`, `pricing()`, `help()`, `terms()`, `privacy()`, `accessibility()`

### 11.2 — Routes

```php
Route::get('/about', [PagesController::class, 'about'])->name('about');
Route::get('/contact', [PagesController::class, 'contact'])->name('contact');
Route::get('/pricing', [PagesController::class, 'pricing'])->name('pricing');
Route::get('/help', [PagesController::class, 'help'])->name('help');
Route::get('/terms', [PagesController::class, 'terms'])->name('terms');
Route::get('/privacy', [PagesController::class, 'privacy'])->name('privacy');
Route::get('/accessibility', [PagesController::class, 'accessibility'])->name('accessibility');
```

### 11.3 — Frontend Pages

```
pages/about.tsx          — Company story, team, mission
pages/contact.tsx        — Contact form + info
pages/pricing.tsx        — Tier cards (Free, Pro, Enterprise) with features
pages/help.tsx           — FAQ accordion + search + contact link
pages/terms.tsx          — Terms of Service content
pages/privacy.tsx        — Privacy Policy content
pages/accessibility.tsx  — Accessibility Statement
```

---

## PHASE 12: NOTIFICATION SYSTEM INTEGRATION

### 12.1 — Wire Existing Components

`NotificationDropdown.tsx` and `NotificationSubscribe.tsx` already exist. Wire them into `DowntownGuideLayout`:

- Add NotificationDropdown to header (bell icon with unread count badge)
- Fetch notifications via Inertia shared data (already in HandleInertiaRequests middleware)
- Mark as read via existing NotificationController API

### 12.2 — Notification Center Page

Create `resources/js/pages/downtown-guide/notifications/index.tsx`:
- Full notification history
- Filter by type (rewards, reviews, business, social, system)
- Mark all as read
- Clear all

Route: `Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');`

---

## PHASE 13: FILAMENT ADMIN EXTENSIONS

Create Filament resources for DTG-specific admin needs:

### 13.1 — Business Verification Resource

`app/Filament/Resources/Businesses/BusinessResource.php`
- List businesses with verification status
- Verification queue (pending businesses)
- Approve/reject actions
- Featured business selection

### 13.2 — Rewards Admin Resource

`app/Filament/Resources/Rewards/AchievementResource.php`
- Create/edit global achievements
- View completion rates
- Manage point values

`app/Filament/Resources/Rewards/ChallengeResource.php`
- Create/edit challenges
- Monitor participation
- Manage rewards

### 13.3 — Coupon Oversight Resource

`app/Filament/Resources/Coupons/CouponResource.php`
- Monitor all coupons across businesses
- Flag suspicious redemption patterns
- Approve high-value campaigns

---

## PHASE 14: CHECK-IN SYSTEM WIRING

### 14.1 — Update CheckIn Model

Add `business_id` to the CheckIn model (currently only has `event_id`). Create migration to add column.

### 14.2 — Wire CheckIn Components

Existing components (`CheckInButton`, `CheckInFeed`, `CheckInModal`) in `resources/js/components/check-in/` need to be integrated into:

- Business detail page (`businesses/show.tsx`) — add CheckInButton
- User profile page (`profile/show.tsx`) — add CheckInFeed
- Homepage (`home.tsx`) — add recent check-in activity widget

### 14.3 — Award Points on Check-In

In `CheckInController` (or create one for DTG), after a successful check-in, call:
```php
$this->gamificationService->awardPoints($user, 10, 'Business check-in', 'check_in', $checkIn->id);
$this->gamificationService->checkAchievementProgress($user);
```

---

## EXECUTION ORDER

Run phases in this order for dependency management:

```
Phase 1  → Database (models + migrations) — everything else depends on this
Phase 2  → Services (uncomment + complete) — controllers depend on these
Phase 3  → Layout — all pages depend on this
Phase 4  → Auth pages — users need to log in for everything
Phase 5  → Business dashboard — revenue path
Phase 6  → Rewards pages — core differentiator
Phase 7  → Map features — discovery enhancement
Phase 10 → API endpoints — mobile/integration support
Phase 14 → Check-in wiring — gamification trigger
Phase 8  → Community — engagement layer
Phase 9  → Settings — user management
Phase 11 → Static pages — legal/marketing
Phase 12 → Notifications — engagement polish
Phase 13 → Admin extensions — operational tooling
```

---

## TESTING REQUIREMENTS PER PHASE

After each phase, run:

```bash
# PHP tests
php artisan test --filter=DowntownGuide

# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# Migration check
php artisan migrate:fresh --seed
```

Write these test files per phase:

- Phase 1: `tests/Unit/Models/UserAchievementTest.php`, `PointTransactionTest.php`, etc.
- Phase 2: `tests/Unit/Services/GamificationServiceTest.php`, `LoyaltyServiceTest.php`, etc.
- Phase 5: `tests/Feature/DowntownGuide/BusinessDashboardTest.php`
- Phase 6: `tests/Feature/DowntownGuide/RewardsTest.php`
- Phase 10: `tests/Feature/Api/V1/RewardsApiTest.php`

---

## DESIGN SYSTEM REFERENCE

Use these Tailwind classes consistently across all DTG pages:

```
Primary:     bg-blue-600 text-blue-600 hover:bg-blue-700 (#2563EB)
Secondary:   bg-violet-600 text-violet-600 (#7C3AED)
Success:     bg-emerald-600 (#059669)
Warning:     bg-amber-600 (#D97706)
Error:       bg-red-600 (#DC2626)
Background:  bg-gray-50 (#F9FAFB)
Surface:     bg-white
Text:        text-gray-900 (headings), text-gray-700 (body), text-gray-500 (caption)
Cards:       bg-white shadow-sm rounded-lg border border-gray-200
Buttons:     px-4 py-2 rounded-lg font-medium transition-colors
Inputs:      border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500
```

**Every page MUST have**: responsive design, loading states, error handling, proper `<Head>` title, and accessibility attributes (aria-labels, keyboard navigation).

---

## FINAL CHECKLIST

Before marking any phase complete, verify:

- [ ] No `// TODO` comments remain
- [ ] No commented-out code blocks
- [ ] No placeholder/dummy data
- [ ] All TypeScript types are explicit (no `any`)
- [ ] All forms have validation
- [ ] All async operations have loading + error states
- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1440px)
- [ ] `php artisan test` passes
- [ ] `npm run build` succeeds
- [ ] Routes registered: `php artisan route:list --name=downtown-guide`
