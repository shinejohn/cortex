# DowntownsGuide Implementation Specification

**Generated:** 2025-12-20  
**Based On:** Gap Analysis Report + UI Specification from `../magic/Downtownsguide`  
**Purpose:** Complete implementation specification for DowntownsGuide application

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend API Specification](#backend-api-specification)
5. [Frontend Pages Specification](#frontend-pages-specification)
6. [Component Specification](#component-specification)
7. [Feature Specifications](#feature-specifications)
8. [Integration Requirements](#integration-requirements)
9. [Implementation Phases](#implementation-phases)

---

## Overview

### Project Description

DowntownsGuide is a comprehensive local business directory and community platform that enables users to discover, review, and engage with local businesses. The platform includes gamification features, loyalty programs, deals/coupons, events, news, and business management tools.

### Core Features

1. **Business Directory** - Searchable directory of local businesses with profiles, reviews, and ratings
2. **Reviews & Ratings** - User-generated reviews and ratings for businesses
3. **Deals & Coupons** - Business deals and digital coupons with wallet integration
4. **Events** - Local events calendar and event management
5. **News** - Local news and community updates
6. **Gamification** - Achievements, challenges, leaderboards, and rewards
7. **Loyalty Programs** - Business loyalty programs with points and tiers
8. **Business Dashboard** - Business owner dashboard with analytics and management tools
9. **User Profiles** - User profiles with favorites, achievements, and activity
10. **Admin Panel** - Administrative tools for content moderation and system management

### Technology Stack

- **Backend:** Laravel 12.43.1 (PHP 8.2+)
- **Frontend:** Inertia.js v2 + React 19.2.3 + TypeScript 5.9.3
- **Styling:** Tailwind CSS 4.1.18
- **Build Tool:** Vite 7.3.0
- **Database:** PostgreSQL/SQLite (multi-database support)
- **Payment:** Stripe Connect
- **Caching:** Redis
- **File Storage:** AWS S3

---

## Architecture

### Multi-Domain Setup

DowntownsGuide is part of a multi-site application serving three domains:
- **GoEventCity** (default/fallback)
- **DayNews** (separate domain)
- **DowntownsGuide** (separate domain)

Domain routing is configured in `bootstrap/app.php` and `config/domains.php`.

### Directory Structure

```
app/
├── Http/
│   └── Controllers/
│       └── DowntownGuide/
│           ├── BusinessController.php
│           ├── BusinessDashboardController.php
│           ├── BusinessAnalyticsController.php
│           ├── ReviewController.php
│           ├── DealController.php
│           ├── CouponController.php
│           ├── EventController.php
│           ├── NewsController.php
│           ├── SearchController.php
│           ├── AchievementController.php
│           ├── ChallengeController.php
│           ├── LeaderboardController.php
│           ├── RewardController.php
│           ├── LoyaltyController.php
│           ├── ProfileController.php
│           ├── FavoritesController.php
│           ├── ReferralController.php
│           └── AdminController.php
├── Models/
│   ├── Business.php (existing - extend)
│   ├── Review.php (existing - use)
│   ├── Rating.php (existing - use)
│   ├── Coupon.php (existing - use)
│   ├── Deal.php (new)
│   ├── Achievement.php (new)
│   ├── Challenge.php (new)
│   ├── Leaderboard.php (new)
│   ├── Reward.php (new)
│   ├── UserReward.php (new)
│   ├── Referral.php (new)
│   ├── LoyaltyProgram.php (new)
│   ├── LoyaltyTier.php (new)
│   ├── LoyaltyMember.php (new)
│   ├── LoyaltyTransaction.php (new)
│   └── Favorite.php (new)
└── Services/
    └── DowntownGuide/
        ├── BusinessService.php
        ├── BusinessAnalyticsService.php
        ├── BusinessLoyaltyService.php
        ├── ReviewService.php
        ├── DealService.php
        ├── CouponWalletService.php
        ├── SearchService.php
        ├── GamificationService.php
        └── LoyaltyService.php

resources/js/
├── pages/
│   └── downtown-guide/
│       ├── index.tsx (Home)
│       ├── business/
│       │   ├── [slug].tsx
│       │   ├── dashboard.tsx
│       │   ├── analytics.tsx
│       │   ├── coupons.tsx
│       │   ├── loyalty.tsx
│       │   ├── promotions.tsx
│       │   ├── events.tsx
│       │   ├── homepage.tsx
│       │   ├── integrations.tsx
│       │   └── profile/
│       │       └── edit.tsx
│       ├── search.tsx
│       ├── explore.tsx
│       ├── deals.tsx
│       ├── deal-detail.tsx
│       ├── events.tsx
│       ├── event-detail.tsx
│       ├── news.tsx
│       ├── news-detail.tsx
│       ├── trending.tsx
│       ├── rewards.tsx
│       ├── achievements.tsx
│       ├── challenges.tsx
│       ├── leaderboards.tsx
│       ├── review/
│       │   └── [businessId].tsx
│       ├── profile/
│       │   ├── [username].tsx
│       │   ├── edit.tsx
│       │   └── rewards.tsx
│       ├── favorites.tsx
│       ├── referrals.tsx
│       ├── settings.tsx
│       ├── billing.tsx
│       ├── pricing.tsx
│       └── admin/
│           ├── index.tsx
│           ├── brand-config.tsx
│           ├── moderation.tsx
│           └── notifications.tsx
└── components/
    └── downtown-guide/
        ├── business/
        │   └── BusinessCard.tsx
        ├── review/
        │   └── ReviewCard.tsx
        ├── search/
        │   └── FilterControls.tsx
        ├── rewards/
        │   └── AchievementCard.tsx
        ├── wallet/
        │   ├── WalletCoupon.tsx
        │   └── WalletCouponExample.tsx
        ├── BusinessProfile.tsx
        ├── FeaturedPlaces.tsx
        ├── CategorySection.tsx
        ├── CitySearchBar.tsx
        ├── CommunityHero.tsx
        ├── CommunityActivity.tsx
        ├── CommunitySelector.tsx
        ├── EventsCalendar.tsx
        ├── NewsAndEvents.tsx
        ├── TrendingNow.tsx
        ├── FloatingNavigation.tsx
        ├── Header.tsx
        ├── Footer.tsx
        ├── Hero.tsx
        ├── Layout.tsx
        ├── MetaTags.tsx
        ├── SEOContent.tsx
        ├── SocialShareModal.tsx
        ├── PlanUpgradeButton.tsx
        ├── BrandPreview.tsx
        └── admin/
            ├── Analytics.tsx
            ├── BusinessManagement.tsx
            ├── ContentModeration.tsx
            ├── UserManagement.tsx
            ├── BrandConfiguration.tsx
            ├── SystemHealth.tsx
            └── Sidebar.tsx
```

---

## Database Schema

### New Tables Required

#### 1. Deals Table

```sql
CREATE TABLE deals (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed', 'buy_one_get_one', 'free_item') NOT NULL,
    discount_value DECIMAL(10,2),
    original_price DECIMAL(10,2),
    deal_price DECIMAL(10,2),
    image VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    status ENUM('active', 'expired', 'scheduled', 'cancelled') DEFAULT 'active',
    terms TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_deals_business ON deals(business_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_dates ON deals(start_date, end_date);
```

#### 2. Achievements Table

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    points INTEGER DEFAULT 0,
    category VARCHAR(100),
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
```

#### 3. User Achievements Table

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP NOT NULL,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
```

#### 4. Challenges Table

```sql
CREATE TABLE challenges (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type ENUM('review', 'visit', 'deal', 'event', 'referral', 'custom') NOT NULL,
    target_value INTEGER NOT NULL,
    points_reward INTEGER DEFAULT 0,
    achievement_id UUID REFERENCES achievements(id),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_challenges_type ON challenges(challenge_type);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
```

#### 5. User Challenges Table

```sql
CREATE TABLE user_challenges (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    started_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge ON user_challenges(challenge_id);
```

#### 6. Leaderboards Table

```sql
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leaderboard_type ENUM('points', 'reviews', 'visits', 'referrals', 'custom') NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'all_time') NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX idx_leaderboards_period ON leaderboards(period);
```

#### 7. Leaderboard Entries Table

```sql
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY,
    leaderboard_id UUID NOT NULL REFERENCES leaderboards(id),
    user_id UUID NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(leaderboard_id, user_id, period_start)
);

CREATE INDEX idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_user ON leaderboard_entries(user_id);
CREATE INDEX idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
```

#### 8. Rewards Table

```sql
CREATE TABLE rewards (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    reward_type ENUM('points', 'coupon', 'discount', 'badge', 'custom') NOT NULL,
    points_cost INTEGER,
    coupon_id UUID REFERENCES coupons(id),
    discount_percentage INTEGER,
    badge_name VARCHAR(255),
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    redeemed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_rewards_type ON rewards(reward_type);
CREATE INDEX idx_rewards_active ON rewards(is_active);
```

#### 9. User Rewards Table

```sql
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    reward_id UUID NOT NULL REFERENCES rewards(id),
    points_spent INTEGER,
    redeemed_at TIMESTAMP NOT NULL,
    status ENUM('pending', 'active', 'used', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_reward ON user_rewards(reward_id);
CREATE INDEX idx_user_rewards_status ON user_rewards(status);
```

#### 10. Referrals Table

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
    reward_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
```

#### 11. Loyalty Programs Table

```sql
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    points_per_visit INTEGER DEFAULT 0,
    points_per_review INTEGER DEFAULT 0,
    redemption_rate DECIMAL(5,2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loyalty_programs_business ON loyalty_programs(business_id);
```

#### 12. Loyalty Tiers Table

```sql
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY,
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_points INTEGER NOT NULL,
    benefits TEXT,
    badge_color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loyalty_tiers_program ON loyalty_tiers(loyalty_program_id);
CREATE INDEX idx_loyalty_tiers_points ON loyalty_tiers(min_points);
```

#### 13. Loyalty Members Table

```sql
CREATE TABLE loyalty_members (
    id UUID PRIMARY KEY,
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    current_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    current_tier_id UUID REFERENCES loyalty_tiers(id),
    joined_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(loyalty_program_id, user_id)
);

CREATE INDEX idx_loyalty_members_program ON loyalty_members(loyalty_program_id);
CREATE INDEX idx_loyalty_members_user ON loyalty_members(user_id);
CREATE INDEX idx_loyalty_members_points ON loyalty_members(current_points DESC);
```

#### 14. Loyalty Transactions Table

```sql
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY,
    loyalty_member_id UUID NOT NULL REFERENCES loyalty_members(id),
    transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    reference_type VARCHAR(100),
    reference_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loyalty_transactions_member ON loyalty_transactions(loyalty_member_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_reference ON loyalty_transactions(reference_type, reference_id);
```

#### 15. Favorites Table

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    favoritable_type VARCHAR(100) NOT NULL,
    favoritable_id UUID NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, favoritable_type, favoritable_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_favoritable ON favorites(favoritable_type, favoritable_id);
```

### Extended Tables

#### Business Table Extensions

Add to existing `businesses` table:

```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS premium_enrolled_at TIMESTAMP;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS homepage_content JSON;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS social_links JSON;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_hours JSON;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS amenities JSON;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS promoted BOOLEAN DEFAULT false;
```

#### Users Table Extensions

Add to existing `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
```

---

## Backend API Specification

### Business Management APIs

#### GET /downtown-guide/businesses
**Description:** List businesses with filters and pagination

**Query Parameters:**
- `search` (string) - Search query
- `category` (string) - Filter by category
- `location` (string) - Filter by location
- `rating_min` (float) - Minimum rating
- `price_range` (string) - Price range filter
- `sort` (string) - Sort by: `rating`, `reviews`, `distance`, `name`
- `page` (integer) - Page number
- `per_page` (integer) - Items per page

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "name": "Business Name",
            "slug": "business-slug",
            "description": "Description",
            "rating": 4.5,
            "reviews_count": 123,
            "categories": ["restaurant", "dining"],
            "image": "url",
            "address": "123 Main St",
            "city": "City",
            "state": "State",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "is_verified": true,
            "is_featured": false
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 10,
        "per_page": 20,
        "total": 200
    }
}
```

#### GET /downtown-guide/businesses/{slug}
**Description:** Get business details

**Response:**
```json
{
    "id": "uuid",
    "name": "Business Name",
    "slug": "business-slug",
    "description": "Full description",
    "rating": 4.5,
    "reviews_count": 123,
    "categories": ["restaurant", "dining"],
    "images": ["url1", "url2"],
    "address": "123 Main St",
    "city": "City",
    "state": "State",
    "postal_code": "12345",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phone": "+1234567890",
    "email": "email@example.com",
    "website": "https://example.com",
    "business_hours": {
        "monday": "9:00 AM - 5:00 PM",
        "tuesday": "9:00 AM - 5:00 PM"
    },
    "amenities": ["wifi", "parking"],
    "social_links": {
        "facebook": "url",
        "instagram": "url"
    },
    "is_verified": true,
    "is_featured": false,
    "premium_tier": "premium",
    "reviews": [...],
    "deals": [...],
    "events": [...],
    "loyalty_program": {...}
}
```

#### GET /downtown-guide/businesses/{slug}/dashboard
**Description:** Get business dashboard data (authenticated, business owner only)

**Response:**
```json
{
    "business": {...},
    "analytics": {
        "views": {
            "today": 50,
            "week": 350,
            "month": 1500,
            "total": 10000
        },
        "reviews": {
            "average_rating": 4.5,
            "total_reviews": 123,
            "recent_reviews": 5
        },
        "deals": {
            "active": 3,
            "total_views": 500,
            "total_redemptions": 50
        },
        "loyalty": {
            "total_members": 200,
            "active_members": 150,
            "points_issued": 5000
        }
    },
    "recent_reviews": [...],
    "recent_deals": [...],
    "loyalty_members": [...]
}
```

### Review APIs

#### GET /downtown-guide/businesses/{slug}/reviews
**Description:** Get reviews for a business

**Query Parameters:**
- `rating` (integer) - Filter by rating (1-5)
- `sort` (string) - Sort by: `newest`, `oldest`, `helpful`, `rating`
- `page` (integer) - Page number

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "user": {
                "id": "uuid",
                "name": "User Name",
                "avatar": "url"
            },
            "rating": 5,
            "title": "Review Title",
            "content": "Review content",
            "is_verified": true,
            "helpful_count": 10,
            "created_at": "2025-01-01T00:00:00Z"
        }
    ],
    "meta": {...}
}
```

#### POST /downtown-guide/businesses/{slug}/reviews
**Description:** Create a review (authenticated)

**Request Body:**
```json
{
    "rating": 5,
    "title": "Review Title",
    "content": "Review content"
}
```

**Response:**
```json
{
    "id": "uuid",
    "rating": 5,
    "title": "Review Title",
    "content": "Review content",
    "created_at": "2025-01-01T00:00:00Z"
}
```

#### POST /downtown-guide/reviews/{id}/helpful
**Description:** Mark review as helpful (authenticated)

**Response:**
```json
{
    "helpful_count": 11,
    "is_helpful": true
}
```

### Deal APIs

#### GET /downtown-guide/deals
**Description:** List active deals

**Query Parameters:**
- `business_id` (uuid) - Filter by business
- `category` (string) - Filter by category
- `location` (string) - Filter by location
- `sort` (string) - Sort by: `newest`, `expiring`, `popular`
- `page` (integer) - Page number

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "business": {
                "id": "uuid",
                "name": "Business Name",
                "slug": "business-slug"
            },
            "title": "Deal Title",
            "description": "Deal description",
            "discount_type": "percentage",
            "discount_value": 20,
            "original_price": 100.00,
            "deal_price": 80.00,
            "image": "url",
            "start_date": "2025-01-01",
            "end_date": "2025-01-31",
            "views_count": 500,
            "clicks_count": 50
        }
    ],
    "meta": {...}
}
```

#### GET /downtown-guide/deals/{id}
**Description:** Get deal details

**Response:**
```json
{
    "id": "uuid",
    "business": {...},
    "title": "Deal Title",
    "description": "Full description",
    "discount_type": "percentage",
    "discount_value": 20,
    "original_price": 100.00,
    "deal_price": 80.00,
    "image": "url",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "terms": "Terms and conditions",
    "usage_limit": 100,
    "used_count": 50,
    "views_count": 500,
    "clicks_count": 50
}
```

### Coupon APIs

#### GET /downtown-guide/coupons/wallet
**Description:** Get user's coupon wallet (authenticated)

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "coupon": {
                "id": "uuid",
                "title": "Coupon Title",
                "description": "Description",
                "discount_type": "percentage",
                "discount_value": 15,
                "code": "SAVE15",
                "image": "url",
                "business": {
                    "name": "Business Name",
                    "slug": "business-slug"
                }
            },
            "added_at": "2025-01-01T00:00:00Z",
            "expires_at": "2025-01-31T00:00:00Z",
            "is_used": false
        }
    ]
}
```

#### POST /downtown-guide/coupons/{id}/add-to-wallet
**Description:** Add coupon to wallet (authenticated)

**Response:**
```json
{
    "message": "Coupon added to wallet",
    "coupon": {...}
}
```

#### POST /downtown-guide/coupons/{id}/redeem
**Description:** Redeem coupon (authenticated)

**Response:**
```json
{
    "message": "Coupon redeemed successfully",
    "usage": {
        "id": "uuid",
        "redeemed_at": "2025-01-01T00:00:00Z"
    }
}
```

### Search APIs

#### GET /downtown-guide/search
**Description:** Unified search across businesses, deals, events, news

**Query Parameters:**
- `q` (string) - Search query (required)
- `type` (string) - Filter by type: `business`, `deal`, `event`, `news`, `all`
- `category` (string) - Filter by category
- `location` (string) - Filter by location
- `radius` (integer) - Search radius in miles
- `sort` (string) - Sort by: `relevance`, `rating`, `distance`, `newest`
- `page` (integer) - Page number

**Response:**
```json
{
    "query": "search query",
    "results": {
        "businesses": {
            "data": [...],
            "total": 50
        },
        "deals": {
            "data": [...],
            "total": 20
        },
        "events": {
            "data": [...],
            "total": 10
        },
        "news": {
            "data": [...],
            "total": 5
        }
    },
    "suggestions": ["suggestion1", "suggestion2"],
    "filters": {
        "categories": [...],
        "locations": [...]
    }
}
```

#### GET /downtown-guide/search/suggestions
**Description:** Get search suggestions/autocomplete

**Query Parameters:**
- `q` (string) - Search query

**Response:**
```json
{
    "suggestions": [
        {
            "text": "Business Name",
            "type": "business",
            "url": "/businesses/business-slug"
        }
    ]
}
```

### Gamification APIs

#### GET /downtown-guide/achievements
**Description:** List all achievements

**Query Parameters:**
- `category` (string) - Filter by category
- `rarity` (string) - Filter by rarity

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "name": "First Review",
            "description": "Write your first review",
            "icon": "url",
            "points": 10,
            "category": "reviews",
            "rarity": "common",
            "unlocked": false,
            "progress": 0,
            "target": 1
        }
    ]
}
```

#### GET /downtown-guide/users/{id}/achievements
**Description:** Get user's achievements

**Response:**
```json
{
    "unlocked": [
        {
            "id": "uuid",
            "achievement": {...},
            "unlocked_at": "2025-01-01T00:00:00Z",
            "progress": 100
        }
    ],
    "in_progress": [...],
    "locked": [...]
}
```

#### GET /downtown-guide/challenges
**Description:** List active challenges

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "name": "Review Challenge",
            "description": "Write 5 reviews this week",
            "challenge_type": "review",
            "target_value": 5,
            "points_reward": 50,
            "start_date": "2025-01-01",
            "end_date": "2025-01-07",
            "user_progress": {
                "progress": 2,
                "completed": false
            }
        }
    ]
}
```

#### GET /downtown-guide/leaderboards
**Description:** List leaderboards

**Query Parameters:**
- `type` (string) - Filter by type
- `period` (string) - Filter by period

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "name": "Top Reviewers",
            "leaderboard_type": "reviews",
            "period": "monthly",
            "entries": [
                {
                    "rank": 1,
                    "user": {
                        "id": "uuid",
                        "name": "User Name",
                        "avatar": "url"
                    },
                    "score": 50
                }
            ]
        }
    ]
}
```

### Loyalty APIs

#### GET /downtown-guide/businesses/{slug}/loyalty
**Description:** Get business loyalty program

**Response:**
```json
{
    "id": "uuid",
    "business": {...},
    "name": "Loyalty Program Name",
    "description": "Description",
    "points_per_dollar": 1.00,
    "points_per_visit": 10,
    "points_per_review": 20,
    "redemption_rate": 100.00,
    "tiers": [
        {
            "id": "uuid",
            "name": "Bronze",
            "min_points": 0,
            "benefits": ["5% discount"]
        }
    ],
    "user_membership": {
        "current_points": 150,
        "lifetime_points": 500,
        "current_tier": {...},
        "next_tier": {...},
        "points_to_next_tier": 50
    }
}
```

#### POST /downtown-guide/businesses/{slug}/loyalty/join
**Description:** Join loyalty program (authenticated)

**Response:**
```json
{
    "message": "Successfully joined loyalty program",
    "membership": {
        "id": "uuid",
        "current_points": 0,
        "current_tier": {...}
    }
}
```

#### POST /downtown-guide/loyalty/{id}/earn-points
**Description:** Earn loyalty points (authenticated, business owner only)

**Request Body:**
```json
{
    "user_id": "uuid",
    "points": 10,
    "reason": "visit"
}
```

### User Profile APIs

#### GET /downtown-guide/profile/{username}
**Description:** Get user profile

**Response:**
```json
{
    "id": "uuid",
    "username": "username",
    "name": "User Name",
    "bio": "Bio text",
    "avatar": "url",
    "location": "City, State",
    "total_points": 500,
    "level": 5,
    "achievements_count": 10,
    "reviews_count": 25,
    "favorites_count": 15,
    "joined_at": "2025-01-01T00:00:00Z",
    "achievements": [...],
    "recent_reviews": [...],
    "recent_activity": [...]
}
```

#### GET /downtown-guide/favorites
**Description:** Get user's favorites (authenticated)

**Query Parameters:**
- `type` (string) - Filter by type: `business`, `deal`, `event`

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "favoritable_type": "business",
            "favoritable": {
                "id": "uuid",
                "name": "Business Name",
                "slug": "business-slug"
            },
            "created_at": "2025-01-01T00:00:00Z"
        }
    ]
}
```

#### POST /downtown-guide/favorites
**Description:** Add favorite (authenticated)

**Request Body:**
```json
{
    "favoritable_type": "business",
    "favoritable_id": "uuid"
}
```

#### DELETE /downtown-guide/favorites/{id}
**Description:** Remove favorite (authenticated)

### Referral APIs

#### GET /downtown-guide/referrals
**Description:** Get user's referrals (authenticated)

**Response:**
```json
{
    "referral_code": "USER123",
    "total_referrals": 5,
    "total_rewards": 250,
    "referrals": [
        {
            "id": "uuid",
            "referred_user": {
                "name": "User Name",
                "joined_at": "2025-01-01T00:00:00Z"
            },
            "status": "completed",
            "reward_earned": 50,
            "completed_at": "2025-01-01T00:00:00Z"
        }
    ]
}
```

#### POST /downtown-guide/referrals/use-code
**Description:** Use referral code (authenticated)

**Request Body:**
```json
{
    "code": "USER123"
}
```

---

## Frontend Pages Specification

### Public Pages

#### Home Page (`/`)
**Route:** `GET /downtown-guide/`  
**Component:** `resources/js/pages/downtown-guide/index.tsx`

**Features:**
- Hero section with search bar
- Featured businesses carousel
- Trending businesses
- Recent deals
- Upcoming events
- Community activity feed
- Category sections

**Data Required:**
- Featured businesses
- Trending businesses
- Recent deals
- Upcoming events
- Community activity
- Categories

#### Business Directory (`/businesses`)
**Route:** `GET /downtown-guide/businesses`  
**Component:** `resources/js/pages/downtown-guide/businesses/index.tsx`

**Features:**
- Search bar
- Filter sidebar (category, location, rating, price)
- Business grid/list view toggle
- Map view toggle
- Sort options
- Pagination

**Data Required:**
- Businesses list
- Categories
- Locations
- Filters metadata

#### Business Profile (`/businesses/{slug}`)
**Route:** `GET /downtown-guide/businesses/{slug}`  
**Component:** `resources/js/pages/downtown-guide/businesses/[slug].tsx`

**Features:**
- Business header with image, name, rating
- Business info (hours, address, contact)
- Reviews section with filters
- Deals section
- Events section
- Loyalty program section
- Map location
- Social share buttons
- Favorite button

**Tabs:**
- Overview
- Reviews
- Deals
- Events
- Photos
- About

**Data Required:**
- Business details
- Reviews
- Deals
- Events
- Loyalty program
- Business hours
- Map data

#### Search Page (`/search`)
**Route:** `GET /downtown-guide/search`  
**Component:** `resources/js/pages/downtown-guide/search.tsx`

**Features:**
- Search input with autocomplete
- Filter controls
- Results grouped by type (businesses, deals, events, news)
- Search suggestions
- Search history
- Trending searches

**Data Required:**
- Search results
- Suggestions
- Filters
- Search history

#### Explore Page (`/explore`)
**Route:** `GET /downtown-guide/explore`  
**Component:** `resources/js/pages/downtown-guide/explore.tsx`

**Features:**
- Category browser
- Location selector
- Featured businesses
- Popular deals
- Upcoming events
- Trending content

**Data Required:**
- Categories
- Locations
- Featured businesses
- Popular deals
- Upcoming events
- Trending content

#### Deals Page (`/deals`)
**Route:** `GET /downtown-guide/deals`  
**Component:** `resources/js/pages/downtown-guide/deals.tsx`

**Features:**
- Deal grid/list view
- Filter by category, location
- Sort by newest, expiring, popular
- Deal cards with business info
- Expiration countdown

**Data Required:**
- Deals list
- Categories
- Locations

#### Deal Detail (`/deals/{id}`)
**Route:** `GET /downtown-guide/deals/{id}`  
**Component:** `resources/js/pages/downtown-guide/deal-detail.tsx`

**Features:**
- Deal header with image
- Deal details
- Business info
- Terms and conditions
- Add to wallet button
- Share buttons
- Related deals

**Data Required:**
- Deal details
- Business info
- Related deals

#### Events Page (`/events`)
**Route:** `GET /downtown-guide/events`  
**Component:** `resources/js/pages/downtown-guide/events.tsx`

**Features:**
- Calendar view
- List view
- Filter by date, category, location
- Event cards
- Map view

**Data Required:**
- Events list
- Calendar data
- Categories
- Locations

#### Event Detail (`/events/{id}`)
**Route:** `GET /downtown-guide/events/{id}`  
**Component:** `resources/js/pages/downtown-guide/event-detail.tsx`

**Features:**
- Event header
- Event details
- Venue/performer info
- Ticket information
- Related events
- Share buttons
- Favorite button

**Data Required:**
- Event details
- Venue/performer info
- Tickets
- Related events

#### News Page (`/news`)
**Route:** `GET /downtown-guide/news`  
**Component:** `resources/js/pages/downtown-guide/news.tsx`

**Features:**
- News grid/list view
- Filter by category, date
- News cards
- Pagination

**Data Required:**
- News articles
- Categories

#### News Detail (`/news/{id}`)
**Route:** `GET /downtown-guide/news/{id}`  
**Component:** `resources/js/pages/downtown-guide/news-detail.tsx`

**Features:**
- Article header
- Article content
- Author info
- Related articles
- Share buttons
- Comments section

**Data Required:**
- Article details
- Author info
- Related articles
- Comments

#### Trending Page (`/trending`)
**Route:** `GET /downtown-guide/trending`  
**Component:** `resources/js/pages/downtown-guide/trending.tsx`

**Features:**
- Trending businesses
- Trending deals
- Trending events
- Trending topics
- Time period selector (today, week, month)

**Data Required:**
- Trending businesses
- Trending deals
- Trending events
- Trending topics

### Authenticated Pages

#### User Profile (`/profile/{username}`)
**Route:** `GET /downtown-guide/profile/{username}`  
**Component:** `resources/js/pages/downtown-guide/profile/[username].tsx`  
**Auth:** Public (with edit button for own profile)

**Features:**
- Profile header with avatar, name, bio
- Stats (points, level, achievements, reviews)
- Achievements showcase
- Recent reviews
- Favorites
- Activity feed
- Edit profile button (if own profile)

**Tabs:**
- Overview
- Reviews
- Achievements
- Favorites
- Activity

**Data Required:**
- User profile
- Stats
- Achievements
- Reviews
- Favorites
- Activity

#### Profile Edit (`/profile/edit`)
**Route:** `GET /downtown-guide/profile/edit`  
**Component:** `resources/js/pages/downtown-guide/profile/edit.tsx`  
**Auth:** Required

**Features:**
- Profile form (name, bio, avatar, location)
- Privacy settings
- Notification preferences
- Account settings

**Data Required:**
- User profile data

#### Favorites (`/favorites`)
**Route:** `GET /downtown-guide/favorites`  
**Component:** `resources/js/pages/downtown-guide/favorites.tsx`  
**Auth:** Required

**Features:**
- Favorites list
- Filter by type (business, deal, event)
- Remove favorite buttons
- Empty state

**Data Required:**
- User favorites

#### Rewards (`/rewards`)
**Route:** `GET /downtown-guide/rewards`  
**Component:** `resources/js/pages/downtown-guide/rewards.tsx`  
**Auth:** Required

**Features:**
- Available rewards
- User's redeemed rewards
- Points balance
- Reward categories
- Redeem reward buttons

**Data Required:**
- Available rewards
- User's redeemed rewards
- Points balance

#### Achievements (`/achievements`)
**Route:** `GET /downtown-guide/achievements`  
**Component:** `resources/js/pages/downtown-guide/achievements.tsx`  
**Auth:** Required

**Features:**
- Unlocked achievements
- In-progress achievements
- Locked achievements
- Achievement categories
- Progress indicators

**Data Required:**
- User achievements
- All achievements

#### Challenges (`/challenges`)
**Route:** `GET /downtown-guide/challenges`  
**Component:** `resources/js/pages/downtown-guide/challenges.tsx`  
**Auth:** Required

**Features:**
- Active challenges
- Completed challenges
- Challenge progress bars
- Join challenge buttons
- Challenge details

**Data Required:**
- Active challenges
- User challenge progress

#### Leaderboards (`/leaderboards`)
**Route:** `GET /downtown-guide/leaderboards`  
**Component:** `resources/js/pages/downtown-guide/leaderboards.tsx`  
**Auth:** Required

**Features:**
- Leaderboard list
- Filter by type, period
- User's rank highlight
- Top users display
- Leaderboard details

**Data Required:**
- Leaderboards
- User rankings

#### Referrals (`/referrals`)
**Route:** `GET /downtown-guide/referrals`  
**Component:** `resources/js/pages/downtown-guide/referrals.tsx`  
**Auth:** Required

**Features:**
- Referral code display
- Referral link
- Referral stats
- Referral list
- Share buttons

**Data Required:**
- User referral data
- Referral stats

#### Review Form (`/review/{businessId}`)
**Route:** `GET /downtown-guide/review/{businessId}`  
**Component:** `resources/js/pages/downtown-guide/review/[businessId].tsx`  
**Auth:** Required

**Features:**
- Business info
- Rating selector
- Review form (title, content)
- Photo upload
- Submit button

**Data Required:**
- Business details

### Business Owner Pages

#### Business Dashboard (`/business/dashboard`)
**Route:** `GET /downtown-guide/business/dashboard`  
**Component:** `resources/js/pages/downtown-guide/business/dashboard.tsx`  
**Auth:** Required (business owner)

**Features:**
- Analytics overview
- Recent reviews
- Active deals
- Loyalty program stats
- Quick actions
- Notifications

**Sections:**
- Overview
- Analytics
- Reviews
- Deals
- Loyalty
- Events

**Data Required:**
- Business analytics
- Recent reviews
- Active deals
- Loyalty stats
- Events

#### Business Analytics (`/business/analytics`)
**Route:** `GET /downtown-guide/business/analytics`  
**Component:** `resources/js/pages/downtown-guide/business/analytics.tsx`  
**Auth:** Required (business owner)

**Features:**
- Views analytics (charts)
- Reviews analytics
- Deals performance
- Loyalty program analytics
- Traffic sources
- Date range selector

**Data Required:**
- Analytics data
- Charts data

#### Business Coupons (`/business/coupons`)
**Route:** `GET /downtown-guide/business/coupons`  
**Component:** `resources/js/pages/downtown-guide/business/coupons.tsx`  
**Auth:** Required (business owner)

**Features:**
- Coupon list
- Create coupon button
- Edit/delete buttons
- Coupon stats
- Usage tracking

**Data Required:**
- Business coupons
- Coupon stats

#### Business Loyalty (`/business/loyalty`)
**Route:** `GET /downtown-guide/business/loyalty`  
**Component:** `resources/js/pages/downtown-guide/business/loyalty.tsx`  
**Auth:** Required (business owner)

**Features:**
- Loyalty program settings
- Tier management
- Member list
- Points transactions
- Program stats

**Data Required:**
- Loyalty program
- Tiers
- Members
- Transactions

#### Business Promotions (`/business/promotions`)
**Route:** `GET /downtown-guide/business/promotions`  
**Component:** `resources/js/pages/downtown-guide/business/promotions.tsx`  
**Auth:** Required (business owner)

**Features:**
- Promotion list
- Create promotion button
- Edit/delete buttons
- Promotion performance

**Data Required:**
- Promotions
- Performance data

#### Business Events (`/business/events`)
**Route:** `GET /downtown-guide/business/events`  
**Component:** `resources/js/pages/downtown-guide/business/events.tsx`  
**Auth:** Required (business owner)

**Features:**
- Event list
- Create event button
- Edit/delete buttons
- Event calendar

**Data Required:**
- Business events

#### Business Homepage Builder (`/business/homepage`)
**Route:** `GET /downtown-guide/business/homepage`  
**Component:** `resources/js/pages/downtown-guide/business/homepage.tsx`  
**Auth:** Required (business owner)

**Features:**
- Homepage preview
- Section editor
- Drag-and-drop sections
- Content editor
- Save button

**Data Required:**
- Business homepage content

#### Business Profile Edit (`/business/profile/edit`)
**Route:** `GET /downtown-guide/business/profile/edit`  
**Component:** `resources/js/pages/downtown-guide/business/profile/edit.tsx`  
**Auth:** Required (business owner)

**Features:**
- Business info form
- Hours editor
- Amenities selector
- Social links
- Images upload
- Save button

**Data Required:**
- Business profile data

### Admin Pages

#### Admin Dashboard (`/admin`)
**Route:** `GET /downtown-guide/admin`  
**Component:** `resources/js/pages/downtown-guide/admin/index.tsx`  
**Auth:** Required (admin)

**Features:**
- System overview
- User stats
- Business stats
- Content stats
- Recent activity
- System health

**Data Required:**
- System stats
- User stats
- Business stats
- Content stats

#### Admin Brand Config (`/admin/brand-config`)
**Route:** `GET /downtown-guide/admin/brand-config`  
**Component:** `resources/js/pages/downtown-guide/admin/brand-config.tsx`  
**Auth:** Required (admin)

**Features:**
- Brand settings
- Logo upload
- Color scheme
- Typography
- Theme settings

**Data Required:**
- Brand configuration

#### Admin Moderation (`/admin/moderation`)
**Route:** `GET /downtown-guide/admin/moderation`  
**Component:** `resources/js/pages/downtown-guide/admin/moderation.tsx`  
**Auth:** Required (admin)

**Features:**
- Pending reviews
- Reported content
- Flagged businesses
- Moderation queue
- Approve/reject buttons

**Data Required:**
- Pending content
- Reported content

---

## Component Specification

### Business Components

#### BusinessCard
**Location:** `resources/js/components/downtown-guide/business/BusinessCard.tsx`

**Props:**
```typescript
interface BusinessCardProps {
    business: {
        id: string;
        name: string;
        slug: string;
        rating: number;
        reviews_count: number;
        categories: string[];
        image: string;
        address: string;
        city: string;
        state: string;
        is_verified: boolean;
        is_featured: boolean;
    };
    showDistance?: boolean;
    distance?: number;
    onFavorite?: (businessId: string) => void;
    isFavorite?: boolean;
}
```

**Features:**
- Business image
- Business name
- Rating display
- Reviews count
- Categories badges
- Location
- Verified badge
- Featured badge
- Favorite button
- Distance (if provided)

#### BusinessProfile
**Location:** `resources/js/components/downtown-guide/BusinessProfile.tsx`

**Props:**
```typescript
interface BusinessProfileProps {
    business: Business;
    reviews?: Review[];
    deals?: Deal[];
    events?: Event[];
    loyaltyProgram?: LoyaltyProgram;
    onReviewSubmit?: (review: ReviewInput) => void;
    onFavorite?: () => void;
    isFavorite?: boolean;
}
```

**Features:**
- Business header
- Business info
- Tabs (Overview, Reviews, Deals, Events)
- Map integration
- Social share
- Favorite button

### Review Components

#### ReviewCard
**Location:** `resources/js/components/downtown-guide/review/ReviewCard.tsx`

**Props:**
```typescript
interface ReviewCardProps {
    review: {
        id: string;
        user: User;
        rating: number;
        title: string;
        content: string;
        is_verified: boolean;
        helpful_count: number;
        created_at: string;
    };
    onHelpful?: (reviewId: string) => void;
    isHelpful?: boolean;
}
```

**Features:**
- User avatar and name
- Rating stars
- Review title
- Review content
- Verified badge
- Helpful button
- Created date

### Search Components

#### FilterControls
**Location:** `resources/js/components/downtown-guide/search/FilterControls.tsx`

**Props:**
```typescript
interface FilterControlsProps {
    filters: {
        categories: string[];
        locations: string[];
        price_ranges: string[];
        ratings: number[];
    };
    selectedFilters: FilterSelection;
    onFilterChange: (filters: FilterSelection) => void;
}
```

**Features:**
- Category filters
- Location filters
- Price range filters
- Rating filters
- Clear filters button

#### CitySearchBar
**Location:** `resources/js/components/downtown-guide/CitySearchBar.tsx`

**Props:**
```typescript
interface CitySearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    suggestions?: string[];
    onLocationSelect?: (location: string) => void;
}
```

**Features:**
- Search input
- Autocomplete suggestions
- Location selector
- Search button

### Gamification Components

#### AchievementCard
**Location:** `resources/js/components/downtown-guide/rewards/AchievementCard.tsx`

**Props:**
```typescript
interface AchievementCardProps {
    achievement: {
        id: string;
        name: string;
        description: string;
        icon: string;
        points: number;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
    };
    unlocked?: boolean;
    progress?: number;
    target?: number;
}
```

**Features:**
- Achievement icon
- Achievement name
- Description
- Rarity badge
- Points display
- Progress bar (if in progress)
- Locked/unlocked state

### Wallet Components

#### WalletCoupon
**Location:** `resources/js/components/downtown-guide/wallet/WalletCoupon.tsx`

**Props:**
```typescript
interface WalletCouponProps {
    coupon: {
        id: string;
        title: string;
        description: string;
        discount_type: string;
        discount_value: number;
        code: string;
        image: string;
        business: Business;
        expires_at: string;
    };
    onRedeem?: (couponId: string) => void;
    isUsed?: boolean;
}
```

**Features:**
- Coupon image
- Business info
- Discount display
- Coupon code
- Expiration date
- Redeem button
- Used badge

### Layout Components

#### Header
**Location:** `resources/js/components/downtown-guide/Header.tsx`

**Features:**
- Logo
- Navigation menu
- Search bar
- User menu (if authenticated)
- Notifications (if authenticated)
- Login/Register buttons (if not authenticated)

#### Footer
**Location:** `resources/js/components/downtown-guide/Footer.tsx`

**Features:**
- Footer links
- Social media links
- Copyright
- Newsletter signup

#### Layout
**Location:** `resources/js/components/downtown-guide/Layout.tsx`

**Props:**
```typescript
interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    showHeader?: boolean;
    showFooter?: boolean;
}
```

**Features:**
- Header
- Main content area
- Footer
- SEO meta tags

---

## Feature Specifications

### Business Management

#### Business Profile Management
- Business owners can claim and manage their business profile
- Edit business information (name, description, hours, contact info)
- Upload business images
- Manage business categories
- Set business amenities
- Configure social media links
- Customize homepage content

#### Business Analytics
- View analytics dashboard
- Track profile views
- Monitor review trends
- Analyze deal performance
- Track loyalty program metrics
- View traffic sources

#### Business Premium Features
- Premium subscription tiers
- Enhanced profile features
- Promoted listings
- Advanced analytics
- Priority support

### Review System

#### Review Submission
- Users can submit reviews for businesses
- Rating (1-5 stars)
- Review title
- Review content
- Photo uploads
- Verification badge (for verified purchases/visits)

#### Review Management
- Business owners can respond to reviews
- Users can edit/delete their reviews
- Review moderation (admin)
- Review helpfulness voting
- Review reporting

### Deal System

#### Deal Creation
- Business owners can create deals
- Deal types: percentage, fixed amount, BOGO, free item
- Set deal duration
- Set usage limits
- Add terms and conditions
- Upload deal images

#### Deal Management
- Track deal views and clicks
- Monitor deal redemptions
- Edit/delete deals
- Set deal status (active, expired, scheduled)

### Coupon System

#### Coupon Creation
- Business owners can create coupons
- Generate unique coupon codes
- Set expiration dates
- Set usage limits
- Add terms and conditions

#### Coupon Wallet
- Users can add coupons to their wallet
- View wallet coupons
- Redeem coupons
- Track coupon usage
- QR code generation for redemption

### Gamification System

#### Achievements
- Unlock achievements for various actions
- Achievement categories (reviews, visits, referrals, etc.)
- Achievement rarity levels
- Points rewards for achievements
- Achievement progress tracking

#### Challenges
- Time-limited challenges
- Challenge types (review, visit, deal, event, referral)
- Progress tracking
- Points rewards
- Challenge completion badges

#### Leaderboards
- Multiple leaderboard types
- Time periods (daily, weekly, monthly, all-time)
- User rankings
- Score tracking
- Leaderboard rewards

#### Rewards
- Points-based rewards
- Coupon rewards
- Discount rewards
- Badge rewards
- Reward redemption
- Reward inventory management

### Loyalty Programs

#### Program Creation
- Business owners can create loyalty programs
- Set points earning rules
- Configure redemption rates
- Create loyalty tiers
- Set tier benefits

#### Member Management
- Users can join loyalty programs
- Track points balance
- View tier status
- Points transaction history
- Tier progression tracking

#### Points Earning
- Points per dollar spent
- Points per visit
- Points per review
- Bonus point events
- Referral points

### Search System

#### Unified Search
- Search across businesses, deals, events, news
- Search suggestions/autocomplete
- Search filters
- Search history
- Trending searches
- Location-based search
- Distance-based sorting

#### Advanced Filters
- Category filters
- Location filters
- Price range filters
- Rating filters
- Date filters
- Sort options

### User Profiles

#### Profile Features
- User profile pages
- Profile customization
- Achievement showcase
- Review history
- Favorites list
- Activity feed
- Points and level display

#### Favorites
- Save businesses to favorites
- Save deals to favorites
- Save events to favorites
- Organize favorites
- Share favorites

### Referral System

#### Referral Program
- Unique referral codes
- Referral link generation
- Referral tracking
- Referral rewards
- Referral stats
- Referral sharing

---

## Integration Requirements

### Payment Integration

#### Stripe Connect
- Business subscription payments
- Premium feature payments
- Deal purchase payments
- Payment processing
- Subscription management

### Geocoding Integration

#### Location Services
- Address to coordinates conversion
- Distance calculations
- Location-based search
- Map integration
- Location autocomplete

### Email Notifications

#### Notification Types
- Review notifications
- Deal notifications
- Achievement notifications
- Challenge notifications
- Loyalty program notifications
- Referral notifications

### Social Media Integration

#### Sharing
- Share businesses
- Share deals
- Share events
- Share achievements
- Social media login (optional)

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Priority:** Critical

**Backend:**
- Business management system
- Review system
- Basic search
- User authentication

**Frontend:**
- Home page
- Business directory
- Business profile pages
- Review pages
- Search page
- Basic layouts

**Estimated Effort:** 80-100 hours

---

### Phase 2: Core Features (Weeks 3-4)
**Priority:** High

**Backend:**
- Deal system
- Coupon system
- Events integration
- User profiles
- Favorites system

**Frontend:**
- Deals pages
- Coupon wallet
- Events pages
- User profile pages
- Favorites page

**Estimated Effort:** 60-80 hours

---

### Phase 3: Engagement (Weeks 5-7)
**Priority:** Medium

**Backend:**
- Gamification system (achievements, challenges, leaderboards)
- Rewards system
- Loyalty programs
- Referral system

**Frontend:**
- Achievements pages
- Challenges pages
- Leaderboards pages
- Rewards pages
- Loyalty program pages
- Referral pages

**Estimated Effort:** 100-130 hours

---

### Phase 4: Advanced Features (Weeks 8-10)
**Priority:** Lower

**Backend:**
- Business dashboard
- Business analytics
- Admin system
- Advanced search
- Integrations

**Frontend:**
- Business dashboard pages
- Business analytics pages
- Admin pages
- Advanced search features
- Integration pages

**Estimated Effort:** 80-100 hours

---

## Conclusion

This specification provides a complete blueprint for implementing DowntownsGuide. The specification covers:

- **Database Schema:** All required tables and relationships
- **Backend APIs:** Complete API endpoints with request/response formats
- **Frontend Pages:** All pages with features and data requirements
- **Components:** Reusable component specifications
- **Features:** Detailed feature specifications
- **Integration:** Required integrations
- **Implementation Phases:** Phased approach with priorities

**Total Estimated Effort:** 320-410 hours (~8-10 weeks)

**With Common Code Leverage:** ~200-250 hours (~5-6 weeks) - **40-50% reduction**

---

**Specification Generated:** 2025-12-20  
**Status:** ✅ **COMPLETE**  
**Next Steps:** Begin Phase 1 implementation

