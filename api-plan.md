# API Plan: Publishing & Sales/Ops Integration

**Generated:** December 28, 2025  
**Project:** Multisite (Combined Publishing + CRM Platform)  
**Framework:** Laravel 12.43.1 + Inertia.js v2

---

## Executive Summary

This project combines **Publishing** (Day News, Events, Articles) and **Sales/Ops** (CRM, Customers, Deals, Campaigns) functionality in a single Laravel application. This API plan defines:

1. **Shared APIs** - Data both systems need (Users, Workspaces, Regions)
2. **Publishing APIs** - Content management, articles, events, businesses
3. **Sales/Ops APIs** - CRM functionality, customers, deals, campaigns, interactions
4. **Data Ownership** - Which system owns which data
5. **Implementation Order** - Priority for building APIs

**Current State:**
- ✅ Models exist for both Publishing and Sales/Ops
- ✅ Controllers exist but mostly Inertia-based (web routes)
- ⚠️ **Only 20 API routes exist** (mostly notifications, organizations, N8N integration)
- ❌ **No RESTful APIs for CRM models** (Customer, Deal, Campaign, Task, Interaction)
- ❌ **No RESTful APIs for Publishing models** (DayNewsPost, NewsArticle, Event, etc.)

---

## STEP 1: Models Comparison

### Models Comparison Table

| Model Name | In Publishing? | In Sales/Ops? | Fields Match? | Notes |
|------------|----------------|---------------|---------------|-------|
| **User** | ✅ | ✅ | ✅ | Shared - Single source of truth |
| **Workspace** | ✅ | ✅ | ✅ | Shared - Multi-tenancy |
| **Region** | ✅ | ✅ | ✅ | Shared - Location management |
| **Business** | ✅ | ✅ | ⚠️ | Different purposes - Publishing uses for directory, Sales uses SmbBusiness |
| **SmbBusiness** | ❌ | ✅ | N/A | Sales/Ops only - CRM business records |
| **Customer** | ❌ | ✅ | N/A | Sales/Ops only - CRM customers |
| **Tenant** | ❌ | ✅ | N/A | Sales/Ops only - Multi-tenant CRM |
| **Deal** | ❌ | ✅ | N/A | Sales/Ops only - Sales pipeline |
| **Campaign** | ❌ | ✅ | N/A | Sales/Ops only - Marketing campaigns |
| **CampaignRecipient** | ❌ | ✅ | N/A | Sales/Ops only - Campaign targeting |
| **Interaction** | ❌ | ✅ | N/A | Sales/Ops only - Customer interactions |
| **Task** | ❌ | ✅ | N/A | Sales/Ops only - Task management |
| **AccountManager** | ❌ | ✅ | N/A | Sales/Ops only - Account management |
| **DayNewsPost** | ✅ | ❌ | N/A | Publishing only - News articles |
| **NewsArticle** | ✅ | ❌ | N/A | Publishing only - Automated news |
| **NewsArticleDraft** | ✅ | ❌ | N/A | Publishing only - Draft articles |
| **Event** | ✅ | ❌ | N/A | Publishing only - Event listings |
| **ArticleComment** | ✅ | ❌ | N/A | Publishing only - Article comments |
| **Tag** | ✅ | ❌ | N/A | Publishing only - Content tags |
| **Announcement** | ✅ | ❌ | N/A | Publishing only - Community announcements |
| **Classified** | ✅ | ❌ | N/A | Publishing only - Classified ads |
| **Coupon** | ✅ | ⚠️ | ⚠️ | Both - Publishing for public, Sales for campaigns |
| **Photo** | ✅ | ❌ | N/A | Publishing only - Photo galleries |
| **PhotoAlbum** | ✅ | ❌ | N/A | Publishing only - Photo albums |
| **LegalNotice** | ✅ | ❌ | N/A | Publishing only - Legal notices |
| **Memorial** | ✅ | ❌ | N/A | Publishing only - Memorials |
| **Podcast** | ✅ | ❌ | N/A | Publishing only - Podcasts |
| **PodcastEpisode** | ✅ | ❌ | N/A | Publishing only - Podcast episodes |
| **Community** | ✅ | ⚠️ | ⚠️ | Both - Publishing for public, Sales for CRM communities |
| **BusinessReview** | ⚠️ | ✅ | ⚠️ | Both - Publishing for public reviews, Sales for CRM |
| **BusinessHours** | ⚠️ | ✅ | ⚠️ | Both - Publishing for directory, Sales for CRM |
| **BusinessPhoto** | ⚠️ | ✅ | ⚠️ | Both - Publishing for directory, Sales for CRM |
| **BusinessAttribute** | ⚠️ | ✅ | ⚠️ | Both - Publishing for directory, Sales for CRM |
| **Venue** | ✅ | ❌ | N/A | Publishing only - Event venues |
| **Performer** | ✅ | ❌ | N/A | Publishing only - Event performers |
| **Booking** | ✅ | ❌ | N/A | Publishing only - Event bookings |
| **TicketOrder** | ✅ | ❌ | N/A | Publishing only - Ticket sales |
| **Store** | ✅ | ❌ | N/A | Publishing only - E-commerce |
| **Product** | ✅ | ❌ | N/A | Publishing only - E-commerce products |
| **Order** | ✅ | ❌ | N/A | Publishing only - E-commerce orders |
| **SocialPost** | ✅ | ❌ | N/A | Publishing only - Social feed |
| **SocialGroup** | ✅ | ❌ | N/A | Publishing only - Social groups |
| **Conversation** | ✅ | ❌ | N/A | Publishing only - Messaging |
| **Message** | ✅ | ❌ | N/A | Publishing only - Messages |
| **Notification** | ✅ | ✅ | ✅ | Shared - Single notification system |
| **EmailCampaign** | ⚠️ | ✅ | ⚠️ | Both - Publishing for newsletters, Sales for CRM |
| **EmailSubscriber** | ⚠️ | ✅ | ⚠️ | Both - Publishing for newsletters, Sales for CRM |
| **Advertisement** | ✅ | ❌ | N/A | Publishing only - Ad management |
| **AdCampaign** | ✅ | ❌ | N/A | Publishing only - Ad campaigns |
| **Hub** | ✅ | ❌ | N/A | Publishing only - Community hubs |
| **Calendar** | ✅ | ❌ | N/A | Publishing only - Event calendars |
| **CalendarEvent** | ✅ | ❌ | N/A | Publishing only - Calendar events |
| **Follow** | ✅ | ⚠️ | ⚠️ | Both - Publishing for content, Sales for customer follow |
| **Rating** | ✅ | ⚠️ | ⚠️ | Both - Publishing for content, Sales for customer ratings |
| **Review** | ✅ | ⚠️ | ⚠️ | Both - Publishing for content, Sales for customer reviews |

**Total Models:** 142  
**Publishing Only:** ~60 models  
**Sales/Ops Only:** ~12 models  
**Shared:** ~10 models  
**Both (Different Purposes):** ~8 models

---

## STEP 2: Tables Comparison

### Database Tables Comparison

| Table Name | In Publishing? | In Sales/Ops? | Schema Match? | Notes |
|------------|----------------|---------------|---------------|-------|
| **users** | ✅ | ✅ | ✅ | Shared table |
| **workspaces** | ✅ | ✅ | ✅ | Shared table |
| **regions** | ✅ | ✅ | ✅ | Shared table |
| **businesses** | ✅ | ⚠️ | ⚠️ | Publishing uses for directory, Sales has separate `smb_businesses` |
| **smb_businesses** | ❌ | ✅ | N/A | Sales/Ops only - 85+ Google Places API fields |
| **customers** | ❌ | ✅ | N/A | Sales/Ops only - CRM customer records |
| **tenants** | ❌ | ✅ | N/A | Sales/Ops only - Multi-tenant CRM |
| **deals** | ❌ | ✅ | N/A | Sales/Ops only - Sales pipeline |
| **campaigns** | ❌ | ✅ | N/A | Sales/Ops only - Marketing campaigns |
| **campaign_recipients** | ❌ | ✅ | N/A | Sales/Ops only - Campaign targeting |
| **interactions** | ❌ | ✅ | N/A | Sales/Ops only - Customer interactions |
| **tasks** | ❌ | ✅ | N/A | Sales/Ops only - Task management |
| **account_managers** | ❌ | ✅ | N/A | Sales/Ops only - Account management |
| **business_hours** | ⚠️ | ✅ | ⚠️ | Both - Different purposes |
| **business_photos** | ⚠️ | ✅ | ⚠️ | Both - Different purposes |
| **business_reviews** | ⚠️ | ✅ | ⚠️ | Both - Different purposes |
| **business_attributes** | ⚠️ | ✅ | ⚠️ | Both - Different purposes |
| **day_news_posts** | ✅ | ❌ | N/A | Publishing only |
| **news_articles** | ✅ | ❌ | N/A | Publishing only |
| **news_article_drafts** | ✅ | ❌ | N/A | Publishing only |
| **events** | ✅ | ❌ | N/A | Publishing only |
| **article_comments** | ✅ | ❌ | N/A | Publishing only |
| **tags** | ✅ | ❌ | N/A | Publishing only |
| **announcements** | ✅ | ❌ | N/A | Publishing only |
| **classifieds** | ✅ | ❌ | N/A | Publishing only |
| **coupons** | ✅ | ⚠️ | ⚠️ | Both - Different purposes |
| **photos** | ✅ | ❌ | N/A | Publishing only |
| **photo_albums** | ✅ | ❌ | N/A | Publishing only |
| **venues** | ✅ | ❌ | N/A | Publishing only |
| **performers** | ✅ | ❌ | N/A | Publishing only |
| **bookings** | ✅ | ❌ | N/A | Publishing only |
| **ticket_orders** | ✅ | ❌ | N/A | Publishing only |
| **stores** | ✅ | ❌ | N/A | Publishing only |
| **products** | ✅ | ❌ | N/A | Publishing only |
| **orders** | ✅ | ❌ | N/A | Publishing only |
| **notifications** | ✅ | ✅ | ✅ | Shared table |
| **email_campaigns** | ⚠️ | ✅ | ⚠️ | Both - Different purposes |
| **email_subscribers** | ⚠️ | ✅ | ⚠️ | Both - Different purposes |
| **advertisements** | ✅ | ❌ | N/A | Publishing only |
| **ad_campaigns** | ✅ | ❌ | N/A | Publishing only |

**Key Finding:** `businesses` table exists for Publishing directory, but Sales/Ops uses `smb_businesses` with 85+ Google Places API fields. These are separate tables with different schemas.

---

## STEP 3: Controllers Comparison

### Controllers Comparison Table

| Controller | In Publishing? | In Sales/Ops? | Purpose | API Exists? |
|------------|----------------|---------------|---------|-------------|
| **DayNews/PostController** | ✅ | ❌ | Article CRUD | ❌ |
| **DayNews/PublicPostController** | ✅ | ❌ | Public article view | ❌ |
| **DayNews/PostPaymentController** | ✅ | ❌ | Article payments | ❌ |
| **DayNews/PostPublishController** | ✅ | ❌ | Publishing workflow | ❌ |
| **DayNews/ArticleCommentController** | ✅ | ❌ | Article comments | ❌ |
| **DayNews/TagController** | ✅ | ❌ | Tag management | ❌ |
| **DayNews/SearchController** | ✅ | ❌ | Article search | ❌ |
| **DayNews/AnnouncementController** | ✅ | ❌ | Announcements | ❌ |
| **DayNews/ClassifiedController** | ✅ | ❌ | Classifieds | ❌ |
| **DayNews/CouponController** | ✅ | ❌ | Coupons | ❌ |
| **DayNews/EventController** | ✅ | ❌ | Events | ❌ |
| **DayNews/BusinessController** | ✅ | ❌ | Business directory | ❌ |
| **DayNews/PhotoController** | ✅ | ❌ | Photo galleries | ❌ |
| **DayNews/AuthorController** | ✅ | ❌ | Author profiles | ❌ |
| **DayNews/MemorialController** | ✅ | ❌ | Memorials | ❌ |
| **DayNews/LegalNoticeController** | ✅ | ❌ | Legal notices | ❌ |
| **DayNews/CreatorController** | ✅ | ❌ | Podcast creators | ❌ |
| **DayNews/PodcastController** | ✅ | ❌ | Podcasts | ❌ |
| **EventController** | ✅ | ❌ | Event management | ❌ |
| **VenueController** | ✅ | ❌ | Venue management | ❌ |
| **PerformerController** | ✅ | ❌ | Performer management | ❌ |
| **BookingController** | ✅ | ❌ | Booking management | ❌ |
| **TicketOrderController** | ✅ | ❌ | Ticket sales | ❌ |
| **StoreController** | ✅ | ❌ | Store management | ❌ |
| **ProductController** | ✅ | ❌ | Product management | ❌ |
| **OrderController** | ✅ | ❌ | Order management | ❌ |
| **AlphaSite/SMBCrmController** | ❌ | ✅ | CRM dashboard (Inertia) | ❌ |
| **AlphaSite/BusinessPageController** | ⚠️ | ✅ | Business pages | ❌ |
| **AlphaSite/CommunityController** | ⚠️ | ✅ | Communities | ❌ |
| **AlphaSite/IndustryController** | ⚠️ | ✅ | Industries | ❌ |
| **AlphaSite/SearchController** | ⚠️ | ✅ | Business search | ❌ |
| **AlphaSite/ClaimController** | ⚠️ | ✅ | Business claiming | ❌ |
| **Api/NotificationController** | ✅ | ✅ | Notifications | ✅ |
| **Api/LocationController** | ✅ | ✅ | Location services | ✅ |
| **Api/AdvertisementController** | ✅ | ❌ | Ad management | ✅ |
| **Api/N8nIntegrationController** | ✅ | ❌ | N8N automation | ✅ |
| **OrganizationController** | ✅ | ✅ | Organizations | ✅ |
| **OrganizationRelationshipController** | ✅ | ✅ | Org relationships | ✅ |

**Key Finding:** 
- **102 controllers exist** but only **5 API controllers** exist
- **No API controllers for CRM models** (Customer, Deal, Campaign, Task, Interaction)
- **No API controllers for Publishing models** (DayNewsPost, NewsArticle, Event, etc.)
- All controllers are Inertia-based (web routes) except the 5 API controllers

---

## STEP 4: Redundancy & Gap Analysis

### 1. REDUNDANT (Exists in Both, Possibly Different)

#### Business Models
- **`Business` (Publishing)** vs **`SmbBusiness` (Sales/Ops)**
  - **Difference:** `Business` is for public directory, `SmbBusiness` has 85+ Google Places API fields for CRM
  - **Recommendation:** Keep both - different purposes
  - **API Strategy:** Separate endpoints (`/api/v1/businesses` vs `/api/v1/crm/businesses`)

#### Coupon Models
- **`Coupon` (Publishing)** vs **`Campaign` (Sales/Ops)**
  - **Difference:** Publishing coupons are public deals, Sales campaigns are marketing automation
  - **Recommendation:** Keep both - different purposes
  - **API Strategy:** Separate endpoints (`/api/v1/coupons` vs `/api/v1/crm/campaigns`)

#### Email Campaigns
- **`EmailCampaign` (Publishing)** vs **`Campaign` (Sales/Ops)**
  - **Difference:** Publishing email campaigns are newsletters, Sales campaigns are CRM marketing
  - **Recommendation:** Keep both - different purposes
  - **API Strategy:** Separate endpoints (`/api/v1/email-campaigns` vs `/api/v1/crm/campaigns`)

#### Community Models
- **`Community` (Publishing)** vs **`Community` (Sales/Ops via AlphaSite)**
  - **Difference:** Publishing communities are public forums, Sales communities are CRM groups
  - **Recommendation:** Keep both - different purposes
  - **API Strategy:** Separate endpoints (`/api/v1/communities` vs `/api/v1/crm/communities`)

#### Review/Rating Models
- **`Review`/`Rating` (Publishing)** vs **`BusinessReview` (Sales/Ops)**
  - **Difference:** Publishing reviews are for content, Sales reviews are for CRM customer feedback
  - **Recommendation:** Keep both - different purposes
  - **API Strategy:** Separate endpoints (`/api/v1/reviews` vs `/api/v1/crm/business-reviews`)

---

### 2. PUBLISHING ONLY (Sales/Ops Might Need Access)

#### Content Models (Sales/Ops should consume via API)
- ✅ **DayNewsPost** - Sales/Ops might need to track article performance
- ✅ **NewsArticle** - Sales/Ops might need to track automated news
- ✅ **Event** - Sales/Ops might need to track event performance
- ✅ **ArticleComment** - Sales/Ops might need engagement metrics
- ✅ **Tag** - Sales/Ops might need content categorization
- ✅ **Announcement** - Sales/Ops might need to create announcements
- ✅ **Classified** - Sales/Ops might need classified ad management
- ✅ **Photo** - Sales/Ops might need photo management
- ✅ **Podcast** - Sales/Ops might need podcast management
- ✅ **LegalNotice** - Sales/Ops might need legal notice management
- ✅ **Memorial** - Sales/Ops might need memorial management

#### E-commerce Models (Sales/Ops might need access)
- ✅ **Store** - Sales/Ops might need store management
- ✅ **Product** - Sales/Ops might need product management
- ✅ **Order** - Sales/Ops might need order management
- ✅ **TicketOrder** - Sales/Ops might need ticket sales data

#### Social Models (Sales/Ops might need access)
- ✅ **SocialPost** - Sales/Ops might need social engagement metrics
- ✅ **SocialGroup** - Sales/Ops might need group management
- ✅ **Conversation** - Sales/Ops might need messaging data
- ✅ **Message** - Sales/Ops might need message data

**API Strategy:** Expose all Publishing models via RESTful APIs so Sales/Ops can consume them.

---

### 3. SALES/OPS ONLY (Publishing Might Need Access)

#### CRM Models (Publishing might need access)
- ✅ **Customer** - Publishing might need customer data for personalization
- ✅ **Deal** - Publishing might need deal data for content recommendations
- ✅ **Campaign** - Publishing might need campaign data for content alignment
- ✅ **Interaction** - Publishing might need interaction data for engagement
- ✅ **Task** - Publishing might need task data for workflow management
- ✅ **AccountManager** - Publishing might need account manager data
- ✅ **Tenant** - Publishing might need tenant data for multi-tenancy
- ✅ **SmbBusiness** - Publishing might need CRM business data

**API Strategy:** Expose all Sales/Ops models via RESTful APIs so Publishing can consume them.

---

### 4. GAPS (Missing from Both but Needed)

#### API Infrastructure
- ❌ **No API versioning** - Need `/api/v1/` prefix
- ❌ **No API authentication** - Need Sanctum token authentication
- ❌ **No API rate limiting** - Need rate limiting per endpoint
- ❌ **No API documentation** - Need OpenAPI/Swagger docs
- ❌ **No API resources** - Need Laravel API Resources for consistent responses
- ❌ **No API request validation** - Need Form Requests for API validation
- ❌ **No API error handling** - Need consistent error responses
- ❌ **No API pagination** - Need pagination for list endpoints
- ❌ **No API filtering** - Need filtering/sorting for list endpoints
- ❌ **No API webhooks** - Need webhook support for integrations

#### CRM API Endpoints (Missing)
- ❌ **Customer API** - CRUD operations
- ❌ **Deal API** - Sales pipeline management
- ❌ **Campaign API** - Marketing campaign management
- ❌ **Interaction API** - Customer interaction tracking
- ❌ **Task API** - Task management
- ❌ **AccountManager API** - Account manager management
- ❌ **Tenant API** - Multi-tenant management
- ❌ **SmbBusiness API** - CRM business management

#### Publishing API Endpoints (Missing)
- ❌ **Article API** - DayNewsPost CRUD
- ❌ **NewsArticle API** - Automated news CRUD
- ❌ **Event API** - Event CRUD (partial exists)
- ❌ **Comment API** - Article comment management
- ❌ **Tag API** - Tag management
- ❌ **Search API** - Unified search
- ❌ **Analytics API** - Content analytics

#### Integration APIs (Missing)
- ❌ **Webhook API** - Webhook management
- ❌ **Integration API** - Third-party integrations
- ❌ **Export API** - Data export endpoints
- ❌ **Import API** - Data import endpoints

---

## STEP 5: API Plan

### 1. Shared APIs (Both Systems Need)

```
# Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/user

# Users
GET    /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}

# Workspaces
GET    /api/v1/workspaces
GET    /api/v1/workspaces/{id}
POST   /api/v1/workspaces
PUT    /api/v1/workspaces/{id}
DELETE /api/v1/workspaces/{id}

# Regions
GET    /api/v1/regions
GET    /api/v1/regions/{id}
GET    /api/v1/regions/{id}/businesses
GET    /api/v1/regions/{id}/events

# Notifications
GET    /api/v1/notifications
GET    /api/v1/notifications/{id}
PATCH  /api/v1/notifications/{id}/read
PATCH  /api/v1/notifications/read-all
POST   /api/v1/notifications/web-push/register
POST   /api/v1/notifications/sms/request-verification
POST   /api/v1/notifications/sms/verify-and-subscribe

# Location Services
GET    /api/v1/location/search
POST   /api/v1/location/detect-browser
POST   /api/v1/location/set-region
POST   /api/v1/location/clear
```

---

### 2. Publishing APIs (Publishing Exposes, Sales/Ops Consumes)

```
# Articles (Day News)
GET    /api/v1/articles
GET    /api/v1/articles/{id}
POST   /api/v1/articles
PUT    /api/v1/articles/{id}
DELETE /api/v1/articles/{id}
GET    /api/v1/articles/{id}/comments
POST   /api/v1/articles/{id}/comments
GET    /api/v1/articles/{id}/analytics
GET    /api/v1/articles/trending
GET    /api/v1/articles/search

# News Articles (Automated)
GET    /api/v1/news-articles
GET    /api/v1/news-articles/{id}
POST   /api/v1/news-articles
PUT    /api/v1/news-articles/{id}
DELETE /api/v1/news-articles/{id}
GET    /api/v1/news-articles/{id}/drafts
POST   /api/v1/news-articles/{id}/publish

# Events
GET    /api/v1/events
GET    /api/v1/events/{id}
POST   /api/v1/events
PUT    /api/v1/events/{id}
DELETE /api/v1/events/{id}
GET    /api/v1/events/{id}/tickets
GET    /api/v1/events/{id}/bookings
GET    /api/v1/events/featured
GET    /api/v1/events/upcoming
GET    /api/v1/events/search

# Venues
GET    /api/v1/venues
GET    /api/v1/venues/{id}
POST   /api/v1/venues
PUT    /api/v1/venues/{id}
DELETE /api/v1/venues/{id}
GET    /api/v1/venues/{id}/events
GET    /api/v1/venues/featured

# Performers
GET    /api/v1/performers
GET    /api/v1/performers/{id}
POST   /api/v1/performers
PUT    /api/v1/performers/{id}
DELETE /api/v1/performers/{id}
GET    /api/v1/performers/{id}/events
GET    /api/v1/performers/featured
GET    /api/v1/performers/trending

# Businesses (Publishing Directory)
GET    /api/v1/businesses
GET    /api/v1/businesses/{id}
GET    /api/v1/businesses/{id}/reviews
GET    /api/v1/businesses/{id}/photos
GET    /api/v1/businesses/{id}/hours
GET    /api/v1/businesses/search

# Comments
GET    /api/v1/comments
GET    /api/v1/comments/{id}
POST   /api/v1/comments
PUT    /api/v1/comments/{id}
DELETE /api/v1/comments/{id}
POST   /api/v1/comments/{id}/like
DELETE /api/v1/comments/{id}/like

# Tags
GET    /api/v1/tags
GET    /api/v1/tags/{id}
POST   /api/v1/tags
PUT    /api/v1/tags/{id}
DELETE /api/v1/tags/{id}
GET    /api/v1/tags/{id}/articles

# Announcements
GET    /api/v1/announcements
GET    /api/v1/announcements/{id}
POST   /api/v1/announcements
PUT    /api/v1/announcements/{id}
DELETE /api/v1/announcements/{id}

# Classifieds
GET    /api/v1/classifieds
GET    /api/v1/classifieds/{id}
POST   /api/v1/classifieds
PUT    /api/v1/classifieds/{id}
DELETE /api/v1/classifieds/{id}

# Coupons (Publishing)
GET    /api/v1/coupons
GET    /api/v1/coupons/{id}
POST   /api/v1/coupons
PUT    /api/v1/coupons/{id}
DELETE /api/v1/coupons/{id}

# Photos
GET    /api/v1/photos
GET    /api/v1/photos/{id}
POST   /api/v1/photos
PUT    /api/v1/photos/{id}
DELETE /api/v1/photos/{id}
GET    /api/v1/photo-albums
GET    /api/v1/photo-albums/{id}
POST   /api/v1/photo-albums
GET    /api/v1/photo-albums/{id}/photos

# Podcasts
GET    /api/v1/podcasts
GET    /api/v1/podcasts/{id}
POST   /api/v1/podcasts
PUT    /api/v1/podcasts/{id}
DELETE /api/v1/podcasts/{id}
GET    /api/v1/podcasts/{id}/episodes
POST   /api/v1/podcasts/{id}/episodes

# Legal Notices
GET    /api/v1/legal-notices
GET    /api/v1/legal-notices/{id}
POST   /api/v1/legal-notices
PUT    /api/v1/legal-notices/{id}
DELETE /api/v1/legal-notices/{id}

# Memorials
GET    /api/v1/memorials
GET    /api/v1/memorials/{id}
POST   /api/v1/memorials
PUT    /api/v1/memorials/{id}
DELETE /api/v1/memorials/{id}

# Search
GET    /api/v1/search
GET    /api/v1/search/articles
GET    /api/v1/search/events
GET    /api/v1/search/businesses
GET    /api/v1/search/venues
GET    /api/v1/search/performers

# Analytics
GET    /api/v1/analytics/articles
GET    /api/v1/analytics/events
GET    /api/v1/analytics/engagement
GET    /api/v1/analytics/revenue
```

---

### 3. Sales/Ops APIs (Sales/Ops Exposes, Possibly for Apps/Bots)

```
# Tenants
GET    /api/v1/crm/tenants
GET    /api/v1/crm/tenants/{id}
POST   /api/v1/crm/tenants
PUT    /api/v1/crm/tenants/{id}
DELETE /api/v1/crm/tenants/{id}

# Customers
GET    /api/v1/crm/customers
GET    /api/v1/crm/customers/{id}
POST   /api/v1/crm/customers
PUT    /api/v1/crm/customers/{id}
DELETE /api/v1/crm/customers/{id}
GET    /api/v1/crm/customers/{id}/interactions
GET    /api/v1/crm/customers/{id}/deals
GET    /api/v1/crm/customers/{id}/tasks
GET    /api/v1/crm/customers/{id}/campaigns
GET    /api/v1/crm/customers/search

# SMB Businesses (CRM)
GET    /api/v1/crm/businesses
GET    /api/v1/crm/businesses/{id}
POST   /api/v1/crm/businesses
PUT    /api/v1/crm/businesses/{id}
DELETE /api/v1/crm/businesses/{id}
GET    /api/v1/crm/businesses/{id}/customers
GET    /api/v1/crm/businesses/{id}/reviews
GET    /api/v1/crm/businesses/{id}/hours
GET    /api/v1/crm/businesses/{id}/photos
GET    /api/v1/crm/businesses/{id}/attributes
GET    /api/v1/crm/businesses/search

# Deals
GET    /api/v1/crm/deals
GET    /api/v1/crm/deals/{id}
POST   /api/v1/crm/deals
PUT    /api/v1/crm/deals/{id}
DELETE /api/v1/crm/deals/{id}
PATCH  /api/v1/crm/deals/{id}/stage
GET    /api/v1/crm/deals/pipeline
GET    /api/v1/crm/deals/{id}/activities

# Campaigns
GET    /api/v1/crm/campaigns
GET    /api/v1/crm/campaigns/{id}
POST   /api/v1/crm/campaigns
PUT    /api/v1/crm/campaigns/{id}
DELETE /api/v1/crm/campaigns/{id}
POST   /api/v1/crm/campaigns/{id}/launch
POST   /api/v1/crm/campaigns/{id}/pause
POST   /api/v1/crm/campaigns/{id}/resume
GET    /api/v1/crm/campaigns/{id}/recipients
POST   /api/v1/crm/campaigns/{id}/recipients
GET    /api/v1/crm/campaigns/{id}/analytics

# Interactions
GET    /api/v1/crm/interactions
GET    /api/v1/crm/interactions/{id}
POST   /api/v1/crm/interactions
PUT    /api/v1/crm/interactions/{id}
DELETE /api/v1/crm/interactions/{id}
GET    /api/v1/crm/interactions/by-customer/{customerId}
GET    /api/v1/crm/interactions/by-business/{businessId}

# Tasks
GET    /api/v1/crm/tasks
GET    /api/v1/crm/tasks/{id}
POST   /api/v1/crm/tasks
PUT    /api/v1/crm/tasks/{id}
DELETE /api/v1/crm/tasks/{id}
PATCH  /api/v1/crm/tasks/{id}/complete
PATCH  /api/v1/crm/tasks/{id}/assign
GET    /api/v1/crm/tasks/by-customer/{customerId}
GET    /api/v1/crm/tasks/by-user/{userId}

# Account Managers
GET    /api/v1/crm/account-managers
GET    /api/v1/crm/account-managers/{id}
POST   /api/v1/crm/account-managers
PUT    /api/v1/crm/account-managers/{id}
DELETE /api/v1/crm/account-managers/{id}
GET    /api/v1/crm/account-managers/{id}/customers
GET    /api/v1/crm/account-managers/{id}/deals

# Business Hours
GET    /api/v1/crm/business-hours
GET    /api/v1/crm/business-hours/{id}
POST   /api/v1/crm/business-hours
PUT    /api/v1/crm/business-hours/{id}
DELETE /api/v1/crm/business-hours/{id}

# Business Photos
GET    /api/v1/crm/business-photos
GET    /api/v1/crm/business-photos/{id}
POST   /api/v1/crm/business-photos
PUT    /api/v1/crm/business-photos/{id}
DELETE /api/v1/crm/business-photos/{id}

# Business Reviews
GET    /api/v1/crm/business-reviews
GET    /api/v1/crm/business-reviews/{id}
POST   /api/v1/crm/business-reviews
PUT    /api/v1/crm/business-reviews/{id}
DELETE /api/v1/crm/business-reviews/{id}

# Business Attributes
GET    /api/v1/crm/business-attributes
GET    /api/v1/crm/business-attributes/{id}
POST   /api/v1/crm/business-attributes
PUT    /api/v1/crm/business-attributes/{id}
DELETE /api/v1/crm/business-attributes/{id}

# Industries
GET    /api/v1/crm/industries
GET    /api/v1/crm/industries/{id}
POST   /api/v1/crm/industries
PUT    /api/v1/crm/industries/{id}
DELETE /api/v1/crm/industries/{id}

# Communities (CRM)
GET    /api/v1/crm/communities
GET    /api/v1/crm/communities/{id}
POST   /api/v1/crm/communities
PUT    /api/v1/crm/communities/{id}
DELETE /api/v1/crm/communities/{id}

# CRM Analytics
GET    /api/v1/crm/analytics/dashboard
GET    /api/v1/crm/analytics/customers
GET    /api/v1/crm/analytics/deals
GET    /api/v1/crm/analytics/campaigns
GET    /api/v1/crm/analytics/revenue
```

---

### 4. Data Ownership

| Data Type | Owned By | Accessible By | Notes |
|-----------|----------|---------------|-------|
| **Users** | Shared | Both | Single source of truth |
| **Workspaces** | Shared | Both | Multi-tenancy |
| **Regions** | Shared | Both | Location management |
| **DayNewsPost** | Publishing | Sales/Ops (read-only) | Publishing owns, Sales can read |
| **NewsArticle** | Publishing | Sales/Ops (read-only) | Publishing owns, Sales can read |
| **Event** | Publishing | Sales/Ops (read-only) | Publishing owns, Sales can read |
| **Customer** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **Deal** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **Campaign** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **SmbBusiness** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **Business** (Directory) | Publishing | Sales/Ops (read-only) | Publishing owns, Sales can read |
| **Interaction** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **Task** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **Tenant** | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |
| **Notification** | Shared | Both | Single notification system |
| **EmailCampaign** | Both | Both | Separate tables for different purposes |
| **Coupon** | Publishing | Sales/Ops (read-only) | Publishing owns, Sales can read |
| **Campaign** (CRM) | Sales/Ops | Publishing (read-only) | Sales owns, Publishing can read |

**Access Rules:**
- **Read-only access** via API for cross-system data
- **Write access** only for owning system
- **Shared data** (Users, Workspaces, Regions) - both can read/write

---

## STEP 6: Implementation Order

### Phase 1: Foundation (Week 1-2)
**Priority: CRITICAL**

1. **API Infrastructure**
   - ✅ Set up API versioning (`/api/v1/`)
   - ✅ Configure Sanctum authentication
   - ✅ Set up API rate limiting
   - ✅ Create API error handling middleware
   - ✅ Create API response formatter
   - ✅ Set up API pagination
   - ✅ Set up API filtering/sorting

2. **Shared APIs**
   - ✅ User API (CRUD)
   - ✅ Workspace API (CRUD)
   - ✅ Region API (CRUD)
   - ✅ Notification API (enhance existing)
   - ✅ Location API (enhance existing)

**Estimated Time:** 2 weeks  
**Dependencies:** None

---

### Phase 2: Publishing Core APIs (Week 3-4)
**Priority: HIGH**

1. **Article APIs**
   - ✅ DayNewsPost API (CRUD)
   - ✅ NewsArticle API (CRUD)
   - ✅ Article Comment API
   - ✅ Article Analytics API

2. **Event APIs**
   - ✅ Event API (CRUD)
   - ✅ Venue API (CRUD)
   - ✅ Performer API (CRUD)
   - ✅ Booking API

3. **Business Directory API**
   - ✅ Business API (Publishing directory)
   - ✅ Business Review API
   - ✅ Business Photo API

**Estimated Time:** 2 weeks  
**Dependencies:** Phase 1

---

### Phase 3: Publishing Extended APIs (Week 5-6)
**Priority: MEDIUM**

1. **Content APIs**
   - ✅ Tag API
   - ✅ Announcement API
   - ✅ Classified API
   - ✅ Coupon API (Publishing)
   - ✅ Photo API
   - ✅ Photo Album API

2. **Media APIs**
   - ✅ Podcast API
   - ✅ Podcast Episode API
   - ✅ Legal Notice API
   - ✅ Memorial API

3. **Search API**
   - ✅ Unified Search API
   - ✅ Search History API

**Estimated Time:** 2 weeks  
**Dependencies:** Phase 2

---

### Phase 4: CRM Core APIs (Week 7-8)
**Priority: HIGH**

1. **Customer Management**
   - ✅ Customer API (CRUD)
   - ✅ Customer Search API
   - ✅ Customer Analytics API

2. **Business Management (CRM)**
   - ✅ SmbBusiness API (CRUD)
   - ✅ Business Hours API
   - ✅ Business Photo API (CRM)
   - ✅ Business Review API (CRM)
   - ✅ Business Attribute API

3. **Tenant Management**
   - ✅ Tenant API (CRUD)
   - ✅ Account Manager API

**Estimated Time:** 2 weeks  
**Dependencies:** Phase 1

---

### Phase 5: CRM Sales APIs (Week 9-10)
**Priority: HIGH**

1. **Deal Management**
   - ✅ Deal API (CRUD)
   - ✅ Deal Pipeline API
   - ✅ Deal Analytics API

2. **Campaign Management**
   - ✅ Campaign API (CRUD)
   - ✅ Campaign Recipient API
   - ✅ Campaign Launch/Pause/Resume
   - ✅ Campaign Analytics API

3. **Interaction Management**
   - ✅ Interaction API (CRUD)
   - ✅ Interaction by Customer API
   - ✅ Interaction by Business API

**Estimated Time:** 2 weeks  
**Dependencies:** Phase 4

---

### Phase 6: CRM Task & Workflow APIs (Week 11-12)
**Priority: MEDIUM**

1. **Task Management**
   - ✅ Task API (CRUD)
   - ✅ Task Assignment API
   - ✅ Task Completion API
   - ✅ Task by Customer API

2. **Industry & Community APIs**
   - ✅ Industry API (CRUD)
   - ✅ Community API (CRM)
   - ✅ Community Member API

**Estimated Time:** 2 weeks  
**Dependencies:** Phase 4

---

### Phase 7: Analytics & Integration APIs (Week 13-14)
**Priority: MEDIUM**

1. **Analytics APIs**
   - ✅ Publishing Analytics API
   - ✅ CRM Analytics API
   - ✅ Dashboard Analytics API

2. **Integration APIs**
   - ✅ Webhook API
   - ✅ Export API
   - ✅ Import API
   - ✅ Third-party Integration API

**Estimated Time:** 2 weeks  
**Dependencies:** Phases 2-6

---

### Phase 8: Documentation & Testing (Week 15-16)
**Priority: HIGH**

1. **API Documentation**
   - ✅ OpenAPI/Swagger documentation
   - ✅ API usage guides
   - ✅ Authentication guides

2. **Testing**
   - ✅ API endpoint tests
   - ✅ Integration tests
   - ✅ Performance tests

**Estimated Time:** 2 weeks  
**Dependencies:** All previous phases

---

## Summary

### Total Endpoints to Build: ~200+ endpoints

**Breakdown:**
- **Shared APIs:** ~20 endpoints
- **Publishing APIs:** ~80 endpoints
- **Sales/Ops APIs:** ~100 endpoints

### Total Implementation Time: ~16 weeks (4 months)

**Priority Order:**
1. **Foundation** (Weeks 1-2) - CRITICAL
2. **Publishing Core** (Weeks 3-4) - HIGH
3. **CRM Core** (Weeks 7-8) - HIGH
4. **CRM Sales** (Weeks 9-10) - HIGH
5. **Publishing Extended** (Weeks 5-6) - MEDIUM
6. **CRM Task & Workflow** (Weeks 11-12) - MEDIUM
7. **Analytics & Integration** (Weeks 13-14) - MEDIUM
8. **Documentation & Testing** (Weeks 15-16) - HIGH

### Key Deliverables

1. ✅ **RESTful API endpoints** for all models
2. ✅ **API authentication** via Sanctum
3. ✅ **API versioning** (`/api/v1/`)
4. ✅ **API documentation** (OpenAPI/Swagger)
5. ✅ **API rate limiting** and security
6. ✅ **API pagination** and filtering
7. ✅ **API error handling** and validation
8. ✅ **API testing** suite

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business needs
3. **Set up API infrastructure** (Phase 1)
4. **Begin implementation** starting with Phase 1
5. **Iterate and refine** based on feedback

---

**Document Version:** 1.0  
**Last Updated:** December 28, 2025  
**Author:** AI Assistant  
**Status:** Ready for Review


