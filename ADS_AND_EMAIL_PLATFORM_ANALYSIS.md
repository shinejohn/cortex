# Advertisement Implementation & Email Platform Analysis

**Date:** December 22, 2025

---

## 📊 Current Advertisement Implementation

### Architecture Overview

**Unified Ad System:** Single `Advertisement` model serves all platforms:
- Day.News (`day_news`)
- GoEventCity (`event_city`)
- DowntownsGuide (`downtown_guide`)

### Database Schema

```sql
advertisements
├── id
├── platform (enum: 'day_news', 'event_city', 'downtown_guide')
├── advertable_type (polymorphic: DayNewsPost, Event, Business, etc.)
├── advertable_id
├── placement (enum: 'sidebar', 'banner', 'inline', 'featured')
├── regions (JSON array of region IDs)
├── impressions_count
├── clicks_count
├── starts_at
├── expires_at
├── is_active
└── timestamps
```

### Backend Implementation

#### 1. **Advertisement Model** (`app/Models/Advertisement.php`)
- Polymorphic relationship to any content (`advertable`)
- Scopes: `active()`, `forPlatform()`, `forPlacement()`, `forRegion()`
- Tracking: `incrementImpressions()`, `incrementClicks()`
- Analytics: `getClickThroughRate()`, `getCTR()`

#### 2. **AdvertisementService** (`app/Services/AdvertisementService.php`)
```php
// Create ad from any content
createAdvertisement(Model $advertable, string $platform, array $config)

// Get active ads for platform/region/placement
getActiveAds(string $platform, ?Region $region, string $placement)

// Track metrics
trackImpression(Advertisement $ad)
trackClick(Advertisement $ad)

// Management
expireExpiredAds()
deactivateAd(Advertisement $ad)
```

#### 3. **API Endpoint** (`app/Http/Controllers/Api/AdvertisementController.php`)
```
GET  /api/advertisements?platform=day_news&placement=sidebar&region_id=123
POST /api/advertisements/{id}/impression
POST /api/advertisements/{id}/click
```

### Frontend Implementation

#### 1. **React Component** (`resources/js/components/day-news/advertisement.tsx`)
- Supports 4 placements: `banner`, `sidebar`, `inline`, `featured`
- Automatic impression tracking on mount
- Click tracking on interaction
- Responsive design with Tailwind CSS

#### 2. **Current Usage Patterns**

**Pattern A: Via Inertia Props (SSR-friendly)** ✅
- `RegionHomeController` passes ads via Inertia props
- Ads included in SSR HTML
- Better SEO

**Pattern B: Via API Calls (Client-side)** ⚠️
- `posts/show.tsx` fetches ads via `useEffect` + `fetch`
- Ads NOT in SSR HTML
- Worse SEO

### Current Implementation Status by Publication

#### ✅ **Day.News** - Fully Implemented

**Backend:**
- ✅ `RegionHomeController` passes ads via Inertia props
- ✅ Supports: banner, featured, inline, sidebar placements
- ✅ Region-based targeting

**Frontend:**
- ✅ `day-news/index.tsx` - Uses Inertia props (SSR'd)
- ⚠️ `day-news/posts/show.tsx` - Uses API calls (NOT SSR'd)
- ✅ `Advertisement` component renders all placements

**Admin:**
- ✅ Filament admin panel (`AdvertisementResource`)
- ✅ Create/edit ads
- ✅ View analytics (impressions, clicks, CTR)

#### ⚠️ **GoEventCity** - Not Implemented

**Status:** Ad system exists but not integrated
- ✅ Database supports `event_city` platform
- ✅ API endpoint supports `event_city` platform
- ❌ No controllers pass ads to EventCity pages
- ❌ No frontend components display ads
- ❌ No Filament admin integration for EventCity ads

**What's Needed:**
- Add ads to `EventController::show()`
- Add ads to `EventController::index()`
- Add ads to `VenueController::show()`
- Create EventCity ad components (or reuse Day.News component)

#### ⚠️ **DowntownsGuide** - Not Implemented

**Status:** Ad system exists but not integrated
- ✅ Database supports `downtown_guide` platform
- ✅ API endpoint supports `downtown_guide` platform
- ❌ No controllers pass ads to DowntownsGuide pages
- ❌ No frontend components display ads
- ❌ No Filament admin integration for DowntownsGuide ads

**What's Needed:**
- Add ads to `BusinessController::show()`
- Add ads to `BusinessController::index()`
- Add ads to category/region pages
- Create DowntownsGuide ad components (or reuse Day.News component)

---

## 📧 Email Platform Analysis

### Current Email Configuration

**Mail Drivers Available:**
- ✅ SMTP (`smtp`)
- ✅ AWS SES (`ses`)
- ✅ Postmark (`postmark`)
- ✅ Resend (`resend`)
- ✅ Log (`log`) - for development
- ✅ Array (`array`) - for testing

**Configuration:** `config/mail.php`
```php
'default' => env('MAIL_MAILER', 'log'), // Currently logging only
```

**Service Configs:** `config/services.php`
- Postmark token configured
- AWS SES credentials configured
- Resend key configured

### Current Email Usage

#### ✅ **Authentication Emails**
- `MagicLinkNotification` - Magic link login
- `WorkspaceInvitationNotification` - Workspace invitations

#### ✅ **System Notifications**
- Laravel Horizon notifications (commented out)
- Error notifications (via Sentry)

#### ❌ **Newsletter System** - NOT IMPLEMENTED

**Missing Components:**
- ❌ No `Newsletter` model
- ❌ No `EmailSubscription` model
- ❌ No `NewsAlert` model
- ❌ No newsletter signup forms
- ❌ No email template system for newsletters
- ❌ No scheduled newsletter jobs
- ❌ No email list management

#### ❌ **News Alerts** - NOT IMPLEMENTED

**Missing Components:**
- ❌ No alert preferences model
- ❌ No alert categories (breaking news, local news, events, etc.)
- ❌ No alert scheduling system
- ❌ No email templates for alerts
- ❌ No alert sending jobs

---

## 🎯 Recommendations

### Advertisement Implementation

#### 1. **Standardize Ad Loading Pattern**

**Current Issue:** Mixed patterns (Inertia props vs API calls)

**Solution:** Use Inertia props everywhere
- ✅ Better SEO (ads in SSR HTML)
- ✅ Fewer HTTP requests
- ✅ Consistent architecture

**Action Items:**
- [ ] Update `PublicPostController::show()` to pass ads via Inertia props
- [ ] Remove API calls from `posts/show.tsx`
- [ ] Update `Advertisement` component to work with Inertia props

#### 2. **Implement Ads for GoEventCity**

**Action Items:**
- [ ] Add ads to `EventController::show()`
- [ ] Add ads to `EventController::index()`
- [ ] Add ads to `VenueController::show()`
- [ ] Add ads to `PerformerController::show()`
- [ ] Create EventCity-specific ad placements (or reuse Day.News)

#### 3. **Implement Ads for DowntownsGuide**

**Action Items:**
- [ ] Add ads to `BusinessController::show()`
- [ ] Add ads to `BusinessController::index()`
- [ ] Add ads to category pages
- [ ] Add ads to search results
- [ ] Create DowntownsGuide-specific ad placements (or reuse Day.News)

#### 4. **Extend Ad System**

**Current Limitations:**
- Only supports `DayNewsPost` as advertable content
- No support for external ads (Google AdSense, etc.)
- No ad rotation/weighting
- No A/B testing

**Future Enhancements:**
- Support `Event`, `Business`, `Coupon` as advertable content
- External ad integration (Google AdSense, etc.)
- Ad rotation with weights
- A/B testing framework

---

### Email Platform Implementation

#### 1. **Newsletter System** (High Priority)

**Required Components:**

**Database:**
```sql
email_subscriptions
├── id
├── email
├── platform (day_news, event_city, downtown_guide)
├── region_id (nullable)
├── categories (JSON array)
├── frequency (daily, weekly, monthly)
├── verified_at (nullable)
├── unsubscribed_at (nullable)
├── preferences (JSON)
└── timestamps

newsletters
├── id
├── platform
├── subject
├── content (HTML)
├── sent_at (nullable)
├── sent_count
├── opened_count
├── clicked_count
└── timestamps
```

**Models:**
- `EmailSubscription` - User email subscriptions
- `Newsletter` - Newsletter campaigns
- `NewsletterRecipient` - Track sends/opens/clicks

**Services:**
- `NewsletterService` - Create/send newsletters
- `EmailSubscriptionService` - Manage subscriptions
- `EmailTemplateService` - Template management

**Jobs:**
- `SendNewsletterJob` - Queue newsletter sends
- `ProcessNewsletterOpensJob` - Track opens
- `ProcessNewsletterClicksJob` - Track clicks

**Controllers:**
- `NewsletterController` - Admin newsletter management
- `EmailSubscriptionController` - Public subscription management

**Frontend:**
- Newsletter signup forms
- Subscription preferences page
- Unsubscribe page
- Newsletter archive (optional)

#### 2. **News Alerts System** (High Priority)

**Required Components:**

**Database:**
```sql
news_alerts
├── id
├── user_id (nullable) - for logged-in users
├── email (required if no user_id)
├── platform
├── region_id
├── categories (JSON array)
├── alert_types (JSON: breaking, daily_digest, weekly_summary)
├── verified_at (nullable)
├── is_active
└── timestamps

alert_sends
├── id
├── alert_id
├── content_type (post, event, announcement)
├── content_id
├── sent_at
├── opened_at (nullable)
├── clicked_at (nullable)
└── timestamps
```

**Models:**
- `NewsAlert` - User alert preferences
- `AlertSend` - Track alert sends

**Services:**
- `NewsAlertService` - Manage alerts
- `AlertSendingService` - Send alerts

**Jobs:**
- `SendBreakingNewsAlertJob` - Immediate alerts
- `SendDailyDigestJob` - Daily summaries
- `SendWeeklySummaryJob` - Weekly summaries

**Controllers:**
- `NewsAlertController` - Manage alert preferences

**Frontend:**
- Alert signup forms
- Alert preferences page
- Unsubscribe page

#### 3. **Email Template System**

**Required:**
- Blade templates for newsletters
- Blade templates for alerts
- Responsive email design
- Plain text alternatives
- Unsubscribe links
- Preference management links

**Recommended:**
- Use Laravel Mailables
- Use Markdown templates (easier to maintain)
- Use responsive email CSS framework (Tailwind CSS for emails or Foundation for Emails)

#### 4. **Email Service Integration**

**Recommended:** Use AWS SES or Postmark
- AWS SES: Cost-effective, scalable
- Postmark: Better deliverability, built-in analytics

**Configuration:**
```env
MAIL_MAILER=ses  # or postmark
MAIL_FROM_ADDRESS=noreply@day.news
MAIL_FROM_NAME="Day News"
```

---

## 📋 Implementation Priority

### Phase 1: Standardize Ad System (1-2 days)
1. Fix Day.News ad loading (use Inertia props)
2. Test ad SSR
3. Document ad system

### Phase 2: Extend Ads to Other Platforms (2-3 days)
1. Implement ads for GoEventCity
2. Implement ads for DowntownsGuide
3. Test ad display across platforms

### Phase 3: Newsletter System (1-2 weeks)
1. Create database migrations
2. Create models and services
3. Create admin interface (Filament)
4. Create public signup forms
5. Create email templates
6. Implement sending jobs
7. Test newsletter system

### Phase 4: News Alerts System (1-2 weeks)
1. Create database migrations
2. Create models and services
3. Create alert preferences interface
4. Create email templates
5. Implement alert sending jobs
6. Integrate with content publishing
7. Test alert system

---

## 📊 Summary

### Advertisement System
- ✅ **Backend:** Fully implemented (unified system)
- ✅ **Day.News:** Fully implemented (needs standardization)
- ⚠️ **GoEventCity:** Not implemented (needs integration)
- ⚠️ **DowntownsGuide:** Not implemented (needs integration)

### Email Platform
- ✅ **Email Infrastructure:** Configured (SES, Postmark, Resend)
- ✅ **Basic Emails:** Working (auth, notifications)
- ❌ **Newsletters:** Not implemented
- ❌ **News Alerts:** Not implemented

**Next Steps:** Choose priority (ads standardization vs email platform) and proceed with implementation.

