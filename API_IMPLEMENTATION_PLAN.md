# Complete API Implementation Plan
## Based on DayNews_Complete_API_Reference_v2.docx

**Generated:** December 29, 2025  
**Reference Document:** DayNews_Complete_API_Reference_v2.docx  
**Framework:** Laravel 12.43.1  
**API Version:** v1  
**Total Endpoints:** ~400+ endpoints across 28 categories

---

## Executive Summary

This plan implements the complete API reference covering **164+ database tables** organized into **28 functional categories**. The API follows RESTful conventions, uses JSON for request/response payloads, and implements proper authentication, rate limiting, pagination, and error handling.

### Current State Analysis

**Existing API Infrastructure:**
- ✅ Sanctum authentication configured
- ✅ Basic API routes exist (~20 endpoints)
- ✅ API controllers exist for: Notifications, Organizations, Location, Advertisement, N8N Integration
- ✅ Basic error handling

**Missing:**
- ❌ **~380+ API endpoints** need to be created
- ❌ API versioning (`/api/v1/`)
- ❌ Comprehensive API Resources (Laravel API Resources)
- ❌ API Form Requests (validation)
- ❌ Rate limiting per endpoint
- ❌ API documentation (OpenAPI/Swagger)
- ❌ Consistent response formatting
- ❌ Pagination middleware
- ❌ Filtering/sorting middleware

---

## Part 1: API Infrastructure Setup

### 1.1 API Versioning & Routing Structure

**Structure:**
```
/api/v1/
├── auth/              # Authentication endpoints
├── users/             # User management
├── workspaces/        # Workspace management
├── tenants/           # CRM tenant management
├── posts/             # Day News posts
├── news-articles/     # Automated news articles
├── events/            # Event management
├── venues/            # Venue management
├── performers/        # Performer management
├── businesses/        # Business directory
├── crm/               # CRM endpoints (prefixed)
│   ├── customers/
│   ├── deals/
│   ├── campaigns/
│   ├── interactions/
│   ├── tasks/
│   └── businesses/   # SMB businesses
├── social/            # Social features
├── communities/       # Community forums
├── messaging/         # Private messaging
├── notifications/     # Push notifications
├── tickets/           # Ticketing system
├── stores/            # E-commerce stores
├── calendars/         # Calendar system
├── hubs/              # Community hubs
├── regions/           # Geographic regions
├── ads/               # Advertising platform
├── email/             # Email marketing
├── emergency/         # Emergency alerts
├── search/            # Search functionality
└── ...                # Additional endpoints
```

### 1.2 Required Infrastructure Components

#### A. API Response Formatter
**File:** `app/Http/Responses/ApiResponse.php`

```php
<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success($data = null, string $message = null, int $code = 200): JsonResponse
    {
        $response = ['success' => true];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        if ($message !== null) {
            $response['message'] = $message;
        }
        
        return response()->json($response, $code);
    }
    
    public static function error(string $message, string $code = null, array $details = [], int $httpCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $code ?? 'ERROR',
                'message' => $message,
                'details' => $details,
            ],
        ], $httpCode);
    }
    
    public static function paginated($data, $meta): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => $meta,
        ]);
    }
}
```

#### B. API Middleware
**Files:**
- `app/Http/Middleware/ApiVersion.php` - API versioning
- `app/Http/Middleware/ApiResponseFormatter.php` - Response formatting
- `app/Http/Middleware/ApiRateLimit.php` - Rate limiting per endpoint

#### C. API Resources
**Directory:** `app/Http/Resources/Api/V1/`
- UserResource
- PostResource
- EventResource
- CustomerResource
- DealResource
- CampaignResource
- ... (one per model)

#### D. API Form Requests
**Directory:** `app/Http/Requests/Api/V1/`
- StorePostRequest
- UpdatePostRequest
- StoreCustomerRequest
- ... (validation for each endpoint)

---

## Part 2: API Endpoints by Category

### Category 1: Authentication & Users (6 tables)

**Base Path:** `/api/v1/auth` and `/api/v1/users`

#### 1.1 Authentication Endpoints
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Authenticate user
POST   /api/v1/auth/logout            # End session
POST   /api/v1/auth/refresh           # Refresh token
GET    /api/v1/auth/user              # Get current user
POST   /api/v1/auth/forgot-password  # Request password reset
POST   /api/v1/auth/reset-password   # Reset password
POST   /api/v1/auth/magic-link        # Request magic link
POST   /api/v1/auth/magic-link/verify # Verify magic link
POST   /api/v1/auth/social/{provider} # Social login
```

#### 1.2 User Endpoints
```
GET    /api/v1/users                  # List users (admin)
GET    /api/v1/users/{id}             # Get user by ID
GET    /api/v1/users/me               # Get current user
POST   /api/v1/users                  # Create user
PUT    /api/v1/users/{id}             # Update user
DELETE /api/v1/users/{id}             # Delete user
GET    /api/v1/users/{id}/posts       # Get user's posts
GET    /api/v1/users/{id}/activity    # Get activity feed
```

#### 1.3 Social Accounts
```
GET    /api/v1/users/{id}/social-accounts        # List connected accounts
POST   /api/v1/users/{id}/social-accounts         # Connect account
DELETE /api/v1/social-accounts/{id}               # Disconnect account
```

#### 1.4 Sessions
```
GET    /api/v1/auth/sessions          # List active sessions
DELETE /api/v1/auth/sessions/{id}     # Revoke session
POST   /api/v1/auth/logout-all        # Logout all sessions
```

**Controllers Needed:**
- `Api/V1/AuthController.php`
- `Api/V1/UserController.php`
- `Api/V1/SocialAccountController.php`
- `Api/V1/SessionController.php`

**Resources Needed:**
- `UserResource.php`
- `SocialAccountResource.php`
- `SessionResource.php`

**Form Requests Needed:**
- `RegisterRequest.php`
- `LoginRequest.php`
- `UpdateUserRequest.php`
- `ConnectSocialAccountRequest.php`

---

### Category 2: Workspaces & Multi-Tenancy (6 tables)

**Base Path:** `/api/v1/workspaces` and `/api/v1/tenants`

#### 2.1 Workspace Endpoints
```
GET    /api/v1/workspaces             # List user's workspaces
GET    /api/v1/workspaces/{id}        # Get workspace details
POST   /api/v1/workspaces             # Create workspace
PUT    /api/v1/workspaces/{id}        # Update workspace
DELETE /api/v1/workspaces/{id}         # Delete workspace
GET    /api/v1/workspaces/{id}/members        # List members
POST   /api/v1/workspaces/{id}/members        # Add member
PUT    /api/v1/workspaces/{id}/members/{userId} # Update role
DELETE /api/v1/workspaces/{id}/members/{userId} # Remove member
GET    /api/v1/workspaces/{id}/invitations     # List invitations
POST   /api/v1/workspaces/{id}/invitations     # Send invitation
POST   /api/v1/invitations/{token}/accept      # Accept invitation
DELETE /api/v1/invitations/{id}                 # Cancel invitation
```

#### 2.2 Tenant Endpoints (CRM)
```
GET    /api/v1/tenants                # List tenants (super admin)
GET    /api/v1/tenants/{id}           # Get tenant details
POST   /api/v1/tenants                # Create tenant
PUT    /api/v1/tenants/{id}           # Update tenant
```

#### 2.3 Account Managers
```
GET    /api/v1/account-managers        # List account managers
POST   /api/v1/account-managers       # Assign manager
GET    /api/v1/account-managers/{id}/clients # Get manager's clients
```

#### 2.4 Roles
```
GET    /api/v1/roles                  # List roles
POST   /api/v1/roles                  # Create role
PUT    /api/v1/roles/{id}             # Update role
```

**Controllers Needed:**
- `Api/V1/WorkspaceController.php`
- `Api/V1/WorkspaceMemberController.php`
- `Api/V1/WorkspaceInvitationController.php`
- `Api/V1/TenantController.php`
- `Api/V1/AccountManagerController.php`
- `Api/V1/RoleController.php`

---

### Category 3: Publishing — Articles (7 tables)

**Base Path:** `/api/v1/posts`

#### 3.1 Day News Posts
```
GET    /api/v1/posts                  # List posts (paginated)
GET    /api/v1/posts/{id}             # Get post by ID
GET    /api/v1/posts/slug/{slug}      # Get post by slug
POST   /api/v1/posts                  # Create post
PUT    /api/v1/posts/{id}             # Update post
PATCH  /api/v1/posts/{id}/publish     # Publish draft
PATCH  /api/v1/posts/{id}/unpublish   # Unpublish post
DELETE /api/v1/posts/{id}             # Delete post
GET    /api/v1/posts/featured        # Get featured posts
GET    /api/v1/posts/trending         # Get trending posts
GET    /api/v1/posts/{id}/regions     # Get post regions
POST   /api/v1/posts/{id}/regions     # Add region
DELETE /api/v1/posts/{id}/regions/{regionId} # Remove region
GET    /api/v1/posts/{id}/tags        # Get post tags
POST   /api/v1/posts/{id}/tags        # Add tags
DELETE /api/v1/posts/{id}/tags/{tagId} # Remove tag
GET    /api/v1/posts/{id}/comments    # Get comments
POST   /api/v1/posts/{id}/comments    # Add comment
GET    /api/v1/posts/{id}/payments    # Get payment history
POST   /api/v1/posts/{id}/sponsor     # Sponsor post
```

**Query Parameters:**
- `region_id` - Filter by region
- `category` - Filter by category slug
- `author_id` - Filter by author
- `status` - draft, published, scheduled
- `sort` - latest, popular, trending
- `page` - Page number
- `per_page` - Items per page (max 100)

#### 3.2 Tags
```
GET    /api/v1/tags                   # List tags
GET    /api/v1/tags/{slug}            # Get tag by slug
GET    /api/v1/tags/{slug}/posts      # Get posts with tag
POST   /api/v1/tags                   # Create tag
PUT    /api/v1/tags/{id}              # Update tag
DELETE /api/v1/tags/{id}              # Delete tag
```

#### 3.3 Comments
```
GET    /api/v1/comments               # List comments
GET    /api/v1/comments/{id}          # Get comment
POST   /api/v1/comments               # Create comment
PUT    /api/v1/comments/{id}          # Update comment
DELETE /api/v1/comments/{id}          # Delete comment
POST   /api/v1/comments/{id}/like     # Like comment
DELETE /api/v1/comments/{id}/like     # Unlike comment
POST   /api/v1/comments/{id}/report   # Report comment
```

#### 3.4 Post Payments
```
GET    /api/v1/posts/{id}/payments    # Get payment history
POST   /api/v1/posts/{id}/sponsor     # Sponsor post
GET    /api/v1/payments/earnings      # Get author earnings
```

**Controllers Needed:**
- `Api/V1/PostController.php`
- `Api/V1/TagController.php`
- `Api/V1/CommentController.php`
- `Api/V1/PostPaymentController.php`

---

### Category 4: Publishing — News Workflow (8 tables)

**Base Path:** `/api/v1/news-articles`

#### 4.1 News Articles
```
GET    /api/v1/news-articles          # List articles
GET    /api/v1/news-articles/{id}     # Get article
POST   /api/v1/news-articles         # Create article
PUT    /api/v1/news-articles/{id}     # Update article
PATCH  /api/v1/news-articles/{id}/approve   # Approve for publication
PATCH  /api/v1/news-articles/{id}/reject    # Reject article
GET    /api/v1/news-articles/{id}/drafts    # Get draft history
POST   /api/v1/news-articles/{id}/drafts    # Save draft
POST   /api/v1/news-articles/{id}/drafts/{draftId}/restore # Restore draft
GET    /api/v1/news-articles/{id}/fact-checks # Get fact-checks
POST   /api/v1/news-articles/{id}/fact-checks # Submit fact-check
PUT    /api/v1/fact-checks/{id}       # Update fact-check
```

#### 4.2 Writer Agents (AI)
```
GET    /api/v1/writer-agents          # List agents
GET    /api/v1/writer-agents/{id}     # Get agent
POST   /api/v1/writer-agents          # Create agent
PUT    /api/v1/writer-agents/{id}     # Update agent
GET    /api/v1/writer-agents/{id}/articles # Get agent's articles
GET    /api/v1/writer-agents/{id}/regions   # Get assigned regions
POST   /api/v1/writer-agents/{id}/regions   # Assign region
```

#### 4.3 Workflow Automation
```
GET    /api/v1/workflow-runs          # List runs
GET    /api/v1/workflow-runs/{id}     # Get run details
POST   /api/v1/workflow-runs/trigger # Trigger manual run
GET    /api/v1/workflow-settings     # Get settings
PUT    /api/v1/workflow-settings     # Update settings
GET    /api/v1/fetch-frequencies     # List schedules
PUT    /api/v1/fetch-frequencies/{id} # Update schedule
```

**Controllers Needed:**
- `Api/V1/NewsArticleController.php`
- `Api/V1/NewsArticleDraftController.php`
- `Api/V1/NewsFactCheckController.php`
- `Api/V1/WriterAgentController.php`
- `Api/V1/NewsWorkflowRunController.php`
- `Api/V1/NewsWorkflowSettingController.php`
- `Api/V1/NewsFetchFrequencyController.php`

---

### Category 5: Publishing — Content Types (13 tables)

**Base Paths:** Various

#### 5.1 Announcements
```
GET    /api/v1/announcements          # List announcements
GET    /api/v1/announcements/{id}     # Get announcement
POST   /api/v1/announcements          # Create announcement
PUT    /api/v1/announcements/{id}     # Update announcement
DELETE /api/v1/announcements/{id}     # Delete announcement
```

#### 5.2 Classifieds
```
GET    /api/v1/classifieds            # List classifieds
GET    /api/v1/classifieds/{id}     # Get classified
POST   /api/v1/classifieds           # Create listing
PUT    /api/v1/classifieds/{id}      # Update listing
DELETE /api/v1/classifieds/{id}      # Delete listing
PATCH  /api/v1/classifieds/{id}/renew # Renew listing
GET    /api/v1/classifieds/{id}/images # Get images
POST   /api/v1/classifieds/{id}/images # Upload image
DELETE /api/v1/classified-images/{id} # Delete image
POST   /api/v1/classifieds/{id}/pay   # Process payment
GET    /api/v1/classifieds/{id}/payments # Get payment history
```

#### 5.3 Coupons
```
GET    /api/v1/coupons                # List coupons
GET    /api/v1/coupons/{id}           # Get coupon
POST   /api/v1/coupons                # Create coupon
PUT    /api/v1/coupons/{id}           # Update coupon
POST   /api/v1/coupons/{id}/claim     # Claim coupon
GET    /api/v1/coupons/{id}/usages    # Get usage stats
POST   /api/v1/coupons/{id}/redeem   # Redeem coupon
```

#### 5.4 Legal Notices
```
GET    /api/v1/legal-notices          # List notices
GET    /api/v1/legal-notices/{id}     # Get notice
POST   /api/v1/legal-notices          # Submit notice
PUT    /api/v1/legal-notices/{id}     # Update notice
```

#### 5.5 Memorials
```
GET    /api/v1/memorials              # List memorials
GET    /api/v1/memorials/{id}         # Get memorial
POST   /api/v1/memorials              # Create memorial
PUT    /api/v1/memorials/{id}         # Update memorial
POST   /api/v1/memorials/{id}/tributes # Leave tribute
```

**Controllers Needed:**
- `Api/V1/AnnouncementController.php`
- `Api/V1/ClassifiedController.php`
- `Api/V1/ClassifiedImageController.php`
- `Api/V1/ClassifiedPaymentController.php`
- `Api/V1/CouponController.php`
- `Api/V1/CouponUsageController.php`
- `Api/V1/LegalNoticeController.php`
- `Api/V1/MemorialController.php`

---

### Category 6: Publishing — Media (8 tables)

**Base Paths:** `/api/v1/photos`, `/api/v1/podcasts`

#### 6.1 Photos & Albums
```
GET    /api/v1/photos                 # List photos
GET    /api/v1/photos/{id}            # Get photo
POST   /api/v1/photos                 # Upload photo
PUT    /api/v1/photos/{id}            # Update metadata
DELETE /api/v1/photos/{id}            # Delete photo
GET    /api/v1/photo-albums           # List albums
GET    /api/v1/photo-albums/{id}      # Get album with photos
POST   /api/v1/photo-albums           # Create album
PUT    /api/v1/photo-albums/{id}      # Update album
POST   /api/v1/photo-albums/{id}/photos # Add photos to album
```

#### 6.2 Podcasts
```
GET    /api/v1/podcasts               # List podcasts
GET    /api/v1/podcasts/{id}          # Get podcast
POST   /api/v1/podcasts               # Create podcast
PUT    /api/v1/podcasts/{id}          # Update podcast
GET    /api/v1/podcasts/{id}/episodes # Get episodes
GET    /api/v1/episodes               # List all episodes
GET    /api/v1/episodes/{id}          # Get episode
POST   /api/v1/podcasts/{id}/episodes # Create episode
PUT    /api/v1/episodes/{id}          # Update episode
DELETE /api/v1/episodes/{id}          # Delete episode
POST   /api/v1/episodes/{id}/play     # Record play
```

#### 6.3 Creator Profiles
```
GET    /api/v1/creators               # List creators
GET    /api/v1/creators/{id}          # Get creator profile
POST   /api/v1/creators               # Create profile
PUT    /api/v1/creators/{id}          # Update profile
GET    /api/v1/creators/{id}/content  # Get creator's content
POST   /api/v1/creators/{id}/follow   # Follow creator
```

**Controllers Needed:**
- `Api/V1/PhotoController.php`
- `Api/V1/PhotoAlbumController.php`
- `Api/V1/PodcastController.php`
- `Api/V1/PodcastEpisodeController.php`
- `Api/V1/CreatorProfileController.php`

---

### Category 7: Events & Venues (8 tables)

**Base Paths:** `/api/v1/events`, `/api/v1/venues`, `/api/v1/performers`

#### 7.1 Events
```
GET    /api/v1/events                 # List events
GET    /api/v1/events/{id}            # Get event
POST   /api/v1/events                 # Create event
PUT    /api/v1/events/{id}            # Update event
DELETE /api/v1/events/{id}            # Cancel event
GET    /api/v1/events/upcoming        # Get upcoming events
GET    /api/v1/events/calendar        # Get calendar view
POST   /api/v1/events/{id}/rsvp       # RSVP to event
GET    /api/v1/event-drafts           # List extraction drafts
POST   /api/v1/event-drafts/{id}/approve # Approve draft
DELETE /api/v1/event-drafts/{id}      # Reject draft
```

**Query Parameters:**
- `region_id` - Filter by region
- `venue_id` - Filter by venue
- `date_from`, `date_to` - Date range
- `category` - Event category

#### 7.2 Venues
```
GET    /api/v1/venues                 # List venues
GET    /api/v1/venues/{id}            # Get venue
POST   /api/v1/venues                 # Create venue
PUT    /api/v1/venues/{id}            # Update venue
GET    /api/v1/venues/{id}/events    # Get venue events
GET    /api/v1/venues/nearby          # Find nearby venues
GET    /api/v1/venues/featured       # Get featured venues
```

#### 7.3 Performers & Shows
```
GET    /api/v1/performers             # List performers
GET    /api/v1/performers/{id}        # Get performer
POST   /api/v1/performers             # Create performer
PUT    /api/v1/performers/{id}        # Update performer
GET    /api/v1/performers/{id}/shows # Get performer's shows
GET    /api/v1/performers/featured   # Get featured performers
GET    /api/v1/performers/trending   # Get trending performers
GET    /api/v1/shows                  # List upcoming shows
GET    /api/v1/shows/{id}             # Get show
POST   /api/v1/shows                  # Create show
```

#### 7.4 Bookings
```
GET    /api/v1/bookings               # List user's bookings
GET    /api/v1/bookings/{id}          # Get booking
POST   /api/v1/events/{id}/book       # Book event/venue
DELETE /api/v1/bookings/{id}          # Cancel booking
```

**Controllers Needed:**
- `Api/V1/EventController.php`
- `Api/V1/EventExtractionDraftController.php`
- `Api/V1/VenueController.php`
- `Api/V1/PerformerController.php`
- `Api/V1/UpcomingShowController.php`
- `Api/V1/BookingController.php`

---

### Category 8: Ticketing System (8 tables)

**Base Path:** `/api/v1/tickets` and `/api/v1/ticket-orders`

#### 8.1 Ticket Plans
```
GET    /api/v1/events/{id}/ticket-plans      # Get available plans
POST   /api/v1/events/{id}/ticket-plans      # Create ticket plan
PUT    /api/v1/ticket-plans/{id}             # Update plan
DELETE /api/v1/ticket-plans/{id}             # Remove plan
```

#### 8.2 Orders
```
GET    /api/v1/ticket-orders          # List user's orders
GET    /api/v1/ticket-orders/{id}     # Get order details
POST   /api/v1/ticket-orders          # Create order
POST   /api/v1/ticket-orders/{id}/pay # Process payment
POST   /api/v1/ticket-orders/{id}/refund # Request refund
GET    /api/v1/ticket-orders/{id}/items # Get order items
GET    /api/v1/ticket-orders/{id}/tickets # Get actual tickets
```

#### 8.3 Ticket Marketplace
```
GET    /api/v1/ticket-listings        # Browse listings
POST   /api/v1/ticket-listings        # List ticket for sale
PUT    /api/v1/ticket-listings/{id}   # Update listing
DELETE /api/v1/ticket-listings/{id}   # Remove listing
POST   /api/v1/ticket-listings/{id}/buy # Purchase ticket
```

#### 8.4 Transfers & Gifts
```
POST   /api/v1/tickets/{id}/transfer  # Transfer ticket
GET    /api/v1/ticket-transfers       # List transfers
POST   /api/v1/ticket-transfers/{id}/accept # Accept transfer
POST   /api/v1/tickets/{id}/gift      # Gift ticket
GET    /api/v1/ticket-gifts           # List gifts
POST   /api/v1/ticket-gifts/{id}/claim # Claim gift
```

#### 8.5 Promo Codes
```
GET    /api/v1/events/{id}/promo-codes # List promo codes
POST   /api/v1/events/{id}/promo-codes # Create promo code
POST   /api/v1/promo-codes/validate   # Validate code
DELETE /api/v1/promo-codes/{id}       # Deactivate code
GET    /api/v1/promo-codes/{id}/usages # Get usage stats
```

**Controllers Needed:**
- `Api/V1/TicketPlanController.php` (exists, enhance)
- `Api/V1/TicketOrderController.php` (exists, enhance)
- `Api/V1/TicketListingController.php`
- `Api/V1/TicketTransferController.php`
- `Api/V1/TicketGiftController.php`
- `Api/V1/PromoCodeController.php`

---

### Category 9: Social Features (13 tables)

**Base Path:** `/api/v1/social`

#### 9.1 Social Posts
```
GET    /api/v1/social/feed            # Get user's feed
GET    /api/v1/social/posts/{id}     # Get post
POST   /api/v1/social/posts          # Create post
PUT    /api/v1/social/posts/{id}     # Update post
DELETE /api/v1/social/posts/{id}     # Delete post
POST   /api/v1/social/posts/{id}/like # Like post
DELETE /api/v1/social/posts/{id}/like # Unlike post
GET    /api/v1/social/posts/{id}/comments # Get comments
POST   /api/v1/social/posts/{id}/comments # Add comment
DELETE /api/v1/social/comments/{id}  # Delete comment
POST   /api/v1/social/posts/{id}/share # Share post
```

#### 9.2 Friendships & Follows
```
GET    /api/v1/social/friends         # List friends
POST   /api/v1/social/friends/request # Send friend request
POST   /api/v1/social/friends/{id}/accept # Accept request
DELETE /api/v1/social/friends/{id}    # Unfriend
GET    /api/v1/social/following       # List following
GET    /api/v1/social/followers       # List followers
POST   /api/v1/social/users/{id}/follow # Follow user
DELETE /api/v1/social/users/{id}/follow # Unfollow
```

#### 9.3 Groups
```
GET    /api/v1/social/groups          # List groups
GET    /api/v1/social/groups/{id}     # Get group
POST   /api/v1/social/groups          # Create group
PUT    /api/v1/social/groups/{id}      # Update group
DELETE /api/v1/social/groups/{id}     # Delete group
GET    /api/v1/social/groups/{id}/members # List members
POST   /api/v1/social/groups/{id}/join # Join group
DELETE /api/v1/social/groups/{id}/leave # Leave group
GET    /api/v1/social/groups/{id}/posts # Get group posts
POST   /api/v1/social/groups/{id}/posts # Post to group
GET    /api/v1/social/profiles/{id}   # Get social profile
PUT    /api/v1/social/profiles        # Update profile
GET    /api/v1/social/activities      # Get activity feed
```

**Controllers Needed:**
- `Api/V1/SocialPostController.php`
- `Api/V1/SocialPostLikeController.php`
- `Api/V1/SocialPostCommentController.php`
- `Api/V1/SocialPostShareController.php`
- `Api/V1/SocialFriendshipController.php`
- `Api/V1/SocialUserFollowController.php`
- `Api/V1/SocialGroupController.php`
- `Api/V1/SocialGroupMemberController.php`
- `Api/V1/SocialGroupPostController.php`
- `Api/V1/SocialUserProfileController.php`
- `Api/V1/SocialActivityController.php`

---

### Category 10: Community Forums (7 tables)

**Base Path:** `/api/v1/communities`

#### 10.1 Communities
```
GET    /api/v1/communities            # List communities
GET    /api/v1/communities/{id}       # Get community
POST   /api/v1/communities            # Create community
PUT    /api/v1/communities/{id}       # Update community
GET    /api/v1/communities/{id}/members # List members
POST   /api/v1/communities/{id}/join  # Join community
DELETE /api/v1/communities/{id}/leave # Leave
```

#### 10.2 Threads
```
GET    /api/v1/communities/{id}/threads # List threads
GET    /api/v1/threads/{id}           # Get thread
POST   /api/v1/communities/{id}/threads # Create thread
PUT    /api/v1/threads/{id}           # Update thread
DELETE /api/v1/threads/{id}           # Delete thread
POST   /api/v1/threads/{id}/pin      # Pin thread
GET    /api/v1/threads/{id}/replies  # Get replies
POST   /api/v1/threads/{id}/replies  # Add reply
PUT    /api/v1/replies/{id}           # Edit reply
DELETE /api/v1/replies/{id}           # Delete reply
POST   /api/v1/replies/{id}/like     # Like reply
DELETE /api/v1/replies/{id}/like     # Unlike
POST   /api/v1/threads/{id}/view     # Record view
GET    /api/v1/threads/{id}/stats    # Get view stats
```

**Controllers Needed:**
- `Api/V1/CommunityController.php`
- `Api/V1/CommunityMemberController.php`
- `Api/V1/CommunityThreadController.php`
- `Api/V1/CommunityThreadReplyController.php`
- `Api/V1/CommunityThreadReplyLikeController.php`
- `Api/V1/CommunityThreadViewController.php`

---

### Category 11: Messaging (3 tables)

**Base Path:** `/api/v1/conversations` and `/api/v1/messages`

#### 11.1 Conversations
```
GET    /api/v1/conversations          # List conversations
GET    /api/v1/conversations/{id}     # Get conversation
POST   /api/v1/conversations          # Start conversation
DELETE /api/v1/conversations/{id}     # Delete conversation
GET    /api/v1/conversations/{id}/participants # List participants
POST   /api/v1/conversations/{id}/participants # Add participant
DELETE /api/v1/conversations/{id}/participants/{userId} # Remove
```

#### 11.2 Messages
```
GET    /api/v1/conversations/{id}/messages # Get messages
POST   /api/v1/conversations/{id}/messages # Send message
PUT    /api/v1/messages/{id}          # Edit message
DELETE /api/v1/messages/{id}          # Delete message
POST   /api/v1/conversations/{id}/read # Mark as read
```

**Controllers Needed:**
- `Api/V1/ConversationController.php`
- `Api/V1/ConversationParticipantController.php`
- `Api/V1/MessageController.php`

---

### Category 12: Notifications (4 tables)

**Base Path:** `/api/v1/notifications`

#### 12.1 Notifications
```
GET    /api/v1/notifications          # List notifications
GET    /api/v1/notifications/unread-count # Get unread count
POST   /api/v1/notifications/{id}/read # Mark as read
POST   /api/v1/notifications/read-all # Mark all read
DELETE /api/v1/notifications/{id}     # Delete notification
```

#### 12.2 Notification Subscriptions
```
GET    /api/v1/notification-preferences # Get preferences
PUT    /api/v1/notification-preferences # Update preferences
POST   /api/v1/push-tokens            # Register device token
```

#### 12.3 Phone Verifications
```
POST   /api/v1/phone/verify          # Send verification code
POST   /api/v1/phone/confirm         # Confirm code
```

**Controllers Needed:**
- `Api/V1/NotificationController.php` (exists, enhance)
- `Api/V1/NotificationSubscriptionController.php`
- `Api/V1/PhoneVerificationController.php`

---

### Category 13: Business Directory (8 tables)

**Base Path:** `/api/v1/businesses`

#### 13.1 Businesses (Publishing Directory)
```
GET    /api/v1/businesses             # List businesses
GET    /api/v1/businesses/{id}        # Get business
POST   /api/v1/businesses             # Create listing
PUT    /api/v1/businesses/{id}        # Update listing
DELETE /api/v1/businesses/{id}        # Delete listing
GET    /api/v1/businesses/nearby      # Find nearby
GET    /api/v1/businesses/search      # Search businesses
GET    /api/v1/businesses/{id}/regions # Get service areas
POST   /api/v1/businesses/{id}/regions # Add region
GET    /api/v1/businesses/{id}/subscription # Get subscription
POST   /api/v1/businesses/{id}/subscribe # Subscribe to plan
DELETE /api/v1/businesses/{id}/subscription # Cancel
GET    /api/v1/business-templates     # List templates
POST   /api/v1/businesses/{id}/apply-template # Apply template
GET    /api/v1/businesses/{id}/faqs   # Get FAQs
POST   /api/v1/businesses/{id}/faqs    # Add FAQ
PUT    /api/v1/faqs/{id}              # Update FAQ
GET    /api/v1/businesses/{id}/surveys # List surveys
POST   /api/v1/businesses/{id}/surveys # Create survey
GET    /api/v1/surveys/{id}/responses # Get responses
POST   /api/v1/surveys/{id}/respond   # Submit response
GET    /api/v1/businesses/{id}/achievements # Get badges
GET    /api/v1/achievements           # List all achievements
```

**Controllers Needed:**
- `Api/V1/BusinessController.php`
- `Api/V1/BusinessSubscriptionController.php`
- `Api/V1/BusinessTemplateController.php`
- `Api/V1/BusinessFaqController.php`
- `Api/V1/BusinessSurveyController.php`
- `Api/V1/BusinessSurveyResponseController.php`
- `Api/V1/AchievementController.php`

---

### Category 14: CRM System (11 tables)

**Base Path:** `/api/v1/crm`

#### 14.1 SMB Businesses (CRM)
```
GET    /api/v1/crm/businesses         # List CRM businesses
GET    /api/v1/crm/businesses/{id}    # Get business
POST   /api/v1/crm/businesses         # Create SMB account
PUT    /api/v1/crm/businesses/{id}    # Update account
DELETE /api/v1/crm/businesses/{id}   # Delete account
GET    /api/v1/crm/businesses/{id}/customers # Get customers
GET    /api/v1/crm/businesses/{id}/reviews # Get reviews
GET    /api/v1/crm/businesses/{id}/hours # Get hours
PUT    /api/v1/crm/businesses/{id}/hours # Update hours
GET    /api/v1/crm/businesses/{id}/photos # Get photos
POST   /api/v1/crm/businesses/{id}/photos # Upload photo
GET    /api/v1/crm/businesses/{id}/attributes # Get attributes
PUT    /api/v1/crm/businesses/{id}/attributes # Update attributes
GET    /api/v1/crm/businesses/search  # Search businesses
```

#### 14.2 Customers
```
GET    /api/v1/crm/customers          # List customers
GET    /api/v1/crm/customers/{id}     # Get customer
POST   /api/v1/crm/customers          # Add customer
PUT    /api/v1/crm/customers/{id}     # Update customer
DELETE /api/v1/crm/customers/{id}     # Delete customer
GET    /api/v1/crm/customers/{id}/interactions # Get interactions
GET    /api/v1/crm/customers/{id}/deals # Get deals
GET    /api/v1/crm/customers/{id}/tasks # Get tasks
GET    /api/v1/crm/customers/{id}/campaigns # Get campaigns
GET    /api/v1/crm/customers/search   # Search customers
```

#### 14.3 Deals & Pipeline
```
GET    /api/v1/crm/deals              # List deals
GET    /api/v1/crm/deals/{id}         # Get deal
POST   /api/v1/crm/deals              # Create deal
PUT    /api/v1/crm/deals/{id}         # Update deal
DELETE /api/v1/crm/deals/{id}         # Delete deal
PATCH  /api/v1/crm/deals/{id}/stage   # Move stage
GET    /api/v1/crm/pipeline           # Get pipeline view
GET    /api/v1/crm/deals/{id}/activities # Get activities
```

#### 14.4 Campaigns
```
GET    /api/v1/crm/campaigns         # List campaigns
POST   /api/v1/crm/campaigns         # Create campaign
PUT    /api/v1/crm/campaigns/{id}    # Update campaign
DELETE /api/v1/crm/campaigns/{id}    # Delete campaign
POST   /api/v1/crm/campaigns/{id}/send # Send campaign
GET    /api/v1/crm/campaigns/{id}/recipients # List recipients
POST   /api/v1/crm/campaigns/{id}/recipients # Add recipients
GET    /api/v1/crm/campaigns/{id}/analytics # Get analytics
```

#### 14.5 Interactions & Tasks
```
GET    /api/v1/crm/interactions       # List interactions
GET    /api/v1/crm/interactions/{id}  # Get interaction
POST   /api/v1/crm/interactions       # Log interaction
PUT    /api/v1/crm/interactions/{id}  # Update interaction
DELETE /api/v1/crm/interactions/{id}  # Delete interaction
GET    /api/v1/crm/interactions/by-customer/{customerId} # By customer
GET    /api/v1/crm/interactions/by-business/{businessId} # By business
GET    /api/v1/crm/tasks              # List tasks
GET    /api/v1/crm/tasks/{id}         # Get task
POST   /api/v1/crm/tasks              # Create task
PUT    /api/v1/crm/tasks/{id}         # Update task
DELETE /api/v1/crm/tasks/{id}         # Delete task
PATCH  /api/v1/crm/tasks/{id}/complete # Mark complete
PATCH  /api/v1/crm/tasks/{id}/assign  # Assign task
GET    /api/v1/crm/tasks/by-customer/{customerId} # By customer
GET    /api/v1/crm/tasks/by-user/{userId} # By user
```

**Controllers Needed:**
- `Api/V1/Crm/SmbBusinessController.php`
- `Api/V1/Crm/CustomerController.php`
- `Api/V1/Crm/DealController.php`
- `Api/V1/Crm/CampaignController.php`
- `Api/V1/Crm/CampaignRecipientController.php`
- `Api/V1/Crm/InteractionController.php`
- `Api/V1/Crm/TaskController.php`
- `Api/V1/Crm/BusinessHoursController.php`
- `Api/V1/Crm/BusinessPhotoController.php`
- `Api/V1/Crm/BusinessReviewController.php`
- `Api/V1/Crm/BusinessAttributeController.php`

---

### Category 15: E-Commerce (6 tables)

**Base Path:** `/api/v1/stores` and `/api/v1/orders`

#### 15.1 Stores
```
GET    /api/v1/stores                 # List stores
GET    /api/v1/stores/{id}            # Get store
POST   /api/v1/stores                 # Create store
PUT    /api/v1/stores/{id}            # Update store
DELETE /api/v1/stores/{id}            # Delete store
```

#### 15.2 Products
```
GET    /api/v1/stores/{id}/products   # List products
GET    /api/v1/products/{id}         # Get product
POST   /api/v1/stores/{id}/products   # Create product
PUT    /api/v1/products/{id}         # Update product
DELETE /api/v1/products/{id}         # Delete product
```

#### 15.3 Shopping Cart
```
GET    /api/v1/cart                   # Get current cart
DELETE /api/v1/cart                   # Clear cart
POST   /api/v1/cart/items             # Add to cart
PUT    /api/v1/cart/items/{id}        # Update quantity
DELETE /api/v1/cart/items/{id}        # Remove item
```

#### 15.4 Orders
```
GET    /api/v1/orders                  # List orders
GET    /api/v1/orders/{id}            # Get order
POST   /api/v1/orders                  # Create order (checkout)
PATCH  /api/v1/orders/{id}/status     # Update status
GET    /api/v1/orders/{id}/items      # Get order items
```

**Controllers Needed:**
- `Api/V1/StoreController.php`
- `Api/V1/ProductController.php`
- `Api/V1/CartController.php`
- `Api/V1/CartItemController.php`
- `Api/V1/OrderController.php` (exists, enhance)
- `Api/V1/OrderItemController.php`

---

### Category 16: Calendars (4 tables)

**Base Path:** `/api/v1/calendars`

#### 16.1 Calendars
```
GET    /api/v1/calendars              # List calendars
GET    /api/v1/calendars/{id}         # Get calendar
POST   /api/v1/calendars              # Create calendar
PUT    /api/v1/calendars/{id}         # Update calendar
DELETE /api/v1/calendars/{id}         # Delete calendar
GET    /api/v1/calendars/{id}/events # Get events
POST   /api/v1/calendars/{id}/events # Add event
PUT    /api/v1/calendar-events/{id}   # Update event
DELETE /api/v1/calendar-events/{id}  # Delete event
GET    /api/v1/calendars/{id}/followers # List followers
POST   /api/v1/calendars/{id}/follow  # Follow calendar
DELETE /api/v1/calendars/{id}/follow  # Unfollow
GET    /api/v1/calendars/{id}/roles   # Get roles
POST   /api/v1/calendars/{id}/roles  # Assign role
```

**Controllers Needed:**
- `Api/V1/CalendarController.php`
- `Api/V1/CalendarEventController.php`
- `Api/V1/CalendarFollowerController.php`
- `Api/V1/CalendarRoleController.php`

---

### Category 17: Hubs (6 tables)

**Base Path:** `/api/v1/hubs`

#### 17.1 Hubs
```
GET    /api/v1/hubs                   # List hubs
GET    /api/v1/hubs/{id}              # Get hub
POST   /api/v1/hubs                   # Create hub
PUT    /api/v1/hubs/{id}              # Update hub
DELETE /api/v1/hubs/{id}              # Delete hub
GET    /api/v1/hubs/{id}/sections     # Get sections
POST   /api/v1/hubs/{id}/sections     # Add section
PUT    /api/v1/hub-sections/{id}      # Update section
GET    /api/v1/hubs/{id}/members      # List members
POST   /api/v1/hubs/{id}/join         # Join hub
DELETE /api/v1/hubs/{id}/leave        # Leave hub
GET    /api/v1/hubs/{id}/roles        # Get roles
POST   /api/v1/hubs/{id}/roles        # Create role
GET    /api/v1/hubs/{id}/analytics    # Get analytics
GET    /api/v1/hubs/{id}/check-ins    # List check-ins
POST   /api/v1/hubs/{id}/check-in     # Check in
```

**Controllers Needed:**
- `Api/V1/HubController.php`
- `Api/V1/HubSectionController.php`
- `Api/V1/HubMemberController.php`
- `Api/V1/HubRoleController.php`
- `Api/V1/HubAnalyticsController.php` (exists, enhance)
- `Api/V1/CheckInController.php` (exists, enhance)

---

### Category 18: Regions & Location (2 tables)

**Base Path:** `/api/v1/regions`

#### 18.1 Regions
```
GET    /api/v1/regions                # List all regions
GET    /api/v1/regions/{id}          # Get region details
POST   /api/v1/regions                # Create region
PUT    /api/v1/regions/{id}          # Update region
GET    /api/v1/regions/search        # Search regions
GET    /api/v1/regions/{id}/content  # Get region content
GET    /api/v1/regions/{id}/zipcodes # Get ZIP codes
POST   /api/v1/regions/{id}/zipcodes # Add ZIP code
GET    /api/v1/zipcodes/{code}/region # Find region by ZIP
```

**Controllers Needed:**
- `Api/V1/RegionController.php`
- `Api/V1/RegionZipcodeController.php`

---

### Category 19: Advertising Platform (7 tables)

**Base Path:** `/api/v1/ads`

#### 19.1 Advertisements
```
GET    /api/v1/ads                    # List advertisements
GET    /api/v1/ads/{id}               # Get ad details
POST   /api/v1/ads                    # Create advertisement
PUT    /api/v1/ads/{id}               # Update ad
DELETE /api/v1/ads/{id}               # Delete ad
POST   /api/v1/ads/{id}/impression    # Record impression
POST   /api/v1/ads/{id}/click         # Record click
```

#### 19.2 Campaigns
```
GET    /api/v1/ad-campaigns           # List campaigns
GET    /api/v1/ad-campaigns/{id}      # Get campaign
POST   /api/v1/ad-campaigns           # Create campaign
PUT    /api/v1/ad-campaigns/{id}      # Update campaign
PATCH  /api/v1/ad-campaigns/{id}/pause # Pause campaign
PATCH  /api/v1/ad-campaigns/{id}/resume # Resume campaign
GET    /api/v1/ad-campaigns/{id}/creatives # List creatives
POST   /api/v1/ad-campaigns/{id}/creatives # Upload creative
PUT    /api/v1/ad-creatives/{id}      # Update creative
GET    /api/v1/ad-placements          # List placements
POST   /api/v1/ad-placements          # Create placement
GET    /api/v1/ad-inventory           # Get available inventory
GET    /api/v1/ad-inventory/forecast  # Forecast availability
GET    /api/v1/ad-campaigns/{id}/impressions # Get impressions
GET    /api/v1/ad-campaigns/{id}/clicks # Get clicks
GET    /api/v1/ad-campaigns/{id}/analytics # Full analytics
```

**Controllers Needed:**
- `Api/V1/AdvertisementController.php` (exists, enhance)
- `Api/V1/AdCampaignController.php`
- `Api/V1/AdCreativeController.php`
- `Api/V1/AdPlacementController.php`
- `Api/V1/AdInventoryController.php`
- `Api/V1/AdImpressionController.php`
- `Api/V1/AdClickController.php`

---

### Category 20: Email Marketing (5 tables)

**Base Path:** `/api/v1/email`

#### 20.1 Email Subscribers
```
GET    /api/v1/email/subscribers      # List subscribers
POST   /api/v1/email/subscribe       # Subscribe
DELETE /api/v1/email/unsubscribe     # Unsubscribe
```

#### 20.2 Email Campaigns
```
GET    /api/v1/email/campaigns        # List campaigns
POST   /api/v1/email/campaigns        # Create campaign
PUT    /api/v1/email/campaigns/{id}   # Update campaign
POST   /api/v1/email/campaigns/{id}/send # Send campaign
POST   /api/v1/email/campaigns/{id}/schedule # Schedule send
GET    /api/v1/email/campaigns/{id}/sends # Get send log
GET    /api/v1/email/campaigns/{id}/stats # Get stats
```

#### 20.3 Email Templates
```
GET    /api/v1/email/templates        # List templates
POST   /api/v1/email/templates        # Create template
PUT    /api/v1/email/templates/{id}   # Update template
```

#### 20.4 Newsletter Subscriptions
```
GET    /api/v1/newsletters            # List newsletters
POST   /api/v1/newsletters/{id}/subscribe # Subscribe
DELETE /api/v1/newsletters/{id}/subscribe # Unsubscribe
```

**Controllers Needed:**
- `Api/V1/EmailSubscriberController.php`
- `Api/V1/EmailCampaignController.php`
- `Api/V1/EmailTemplateController.php`
- `Api/V1/EmailSendController.php`
- `Api/V1/NewsletterSubscriptionController.php`

---

### Category 21: Emergency Alerts (5 tables)

**Base Path:** `/api/v1/emergency`

#### 21.1 Emergency Alerts
```
GET    /api/v1/emergency-alerts       # List alerts
GET    /api/v1/emergency-alerts/{id} # Get alert
POST   /api/v1/emergency-alerts       # Create alert
PUT    /api/v1/emergency-alerts/{id}  # Update alert
POST   /api/v1/emergency-alerts/{id}/send # Send alert
GET    /api/v1/emergency-alerts/{id}/deliveries # Get delivery log
```

#### 21.2 Emergency Subscriptions
```
GET    /api/v1/emergency/subscriptions # Get subscriptions
POST   /api/v1/emergency/subscribe    # Subscribe to alerts
PUT    /api/v1/emergency/subscriptions # Update preferences
```

#### 21.3 Municipal Partners
```
GET    /api/v1/municipal-partners     # List partners
POST   /api/v1/municipal-partners     # Add partner
PUT    /api/v1/municipal-partners/{id} # Update partner
```

#### 21.4 Audit Log
```
GET    /api/v1/emergency/audit-log     # Get audit log
```

**Controllers Needed:**
- `Api/V1/EmergencyAlertController.php`
- `Api/V1/EmergencySubscriptionController.php`
- `Api/V1/EmergencyDeliveryController.php`
- `Api/V1/EmergencyAuditLogController.php`
- `Api/V1/MunicipalPartnerController.php`

---

### Category 22: Additional Systems (Multiple tables)

**Base Paths:** Various

#### 22.1 Search
```
GET    /api/v1/search                 # Perform search
GET    /api/v1/search/history        # Get search history
DELETE /api/v1/search/history        # Clear history
GET    /api/v1/search/suggestions    # Get suggestions
```

#### 22.2 RSS Feeds
```
GET    /api/v1/rss-feeds              # List RSS feeds
POST   /api/v1/rss-feeds              # Add feed
DELETE /api/v1/rss-feeds/{id}         # Remove feed
GET    /api/v1/rss-feeds/{id}/items  # Get feed items
POST   /api/v1/rss-feeds/{id}/refresh # Refresh feed
```

#### 22.3 Reviews & Ratings
```
GET    /api/v1/reviews                # List reviews
POST   /api/v1/reviews                # Submit review
PUT    /api/v1/reviews/{id}           # Update review
POST   /api/v1/ratings                # Submit rating
GET    /api/v1/{type}/{id}/ratings    # Get ratings
```

#### 22.4 Follows & Engagement
```
POST   /api/v1/{type}/{id}/follow     # Follow entity
DELETE /api/v1/{type}/{id}/follow    # Unfollow
GET    /api/v1/following              # List following
POST   /api/v1/comments/{id}/report   # Report comment
GET    /api/v1/reports                # List reports (admin)
```

#### 22.5 Organizations
```
GET    /api/v1/organizations/{id}/relationships # Get relationships
POST   /api/v1/organizations/{id}/relationships # Create relationship
GET    /api/v1/organizations/{id}/hierarchy # Get hierarchy
PUT    /api/v1/organizations/{id}/parent # Set parent
```

**Controllers Needed:**
- `Api/V1/SearchController.php`
- `Api/V1/SearchHistoryController.php`
- `Api/V1/SearchSuggestionController.php`
- `Api/V1/RssFeedController.php`
- `Api/V1/RssFeedItemController.php`
- `Api/V1/ReviewController.php`
- `Api/V1/RatingController.php`
- `Api/V1/FollowController.php` (exists, enhance)
- `Api/V1/CommentReportController.php`
- `Api/V1/OrganizationRelationshipController.php` (exists, enhance)
- `Api/V1/OrganizationHierarchyController.php`

---

## Part 3: Implementation Strategy

### Phase 1: API Infrastructure (Week 1-2)
**Priority: CRITICAL**

#### 1.1 Setup API Versioning
- Create `/api/v1/` route prefix
- Configure route groups
- Set up API middleware stack

#### 1.2 Create Base Infrastructure
- `ApiResponse` helper class
- API middleware (versioning, formatting, rate limiting)
- API exception handler
- Pagination helper
- Filtering/sorting helper

#### 1.3 Authentication Setup
- Sanctum configuration
- API token generation
- Token refresh mechanism
- Social login integration

#### 1.4 Rate Limiting
- Configure per-endpoint limits
- Set up rate limit middleware
- Create rate limit exceptions

**Deliverables:**
- ✅ API versioning working
- ✅ Consistent response format
- ✅ Authentication working
- ✅ Rate limiting configured

---

### Phase 2: Shared APIs (Week 3-4)
**Priority: HIGH**

#### 2.1 Authentication & Users
- AuthController (register, login, logout, refresh)
- UserController (CRUD)
- SocialAccountController
- SessionController

#### 2.2 Workspaces & Tenants
- WorkspaceController
- WorkspaceMemberController
- WorkspaceInvitationController
- TenantController
- AccountManagerController
- RoleController

#### 2.3 Regions
- RegionController
- RegionZipcodeController

**Deliverables:**
- ✅ 30+ endpoints for shared resources
- ✅ Full CRUD operations
- ✅ Proper authentication
- ✅ API Resources created

---

### Phase 3: Publishing Core APIs (Week 5-7)
**Priority: HIGH**

#### 3.1 Articles
- PostController (Day News posts)
- TagController
- CommentController
- PostPaymentController

#### 3.2 News Workflow
- NewsArticleController
- NewsArticleDraftController
- NewsFactCheckController
- WriterAgentController
- NewsWorkflowRunController
- NewsWorkflowSettingController

#### 3.3 Events & Venues
- EventController
- VenueController
- PerformerController
- BookingController
- UpcomingShowController

**Deliverables:**
- ✅ 60+ endpoints for publishing
- ✅ Full CRUD operations
- ✅ Relationship endpoints
- ✅ Search and filtering

---

### Phase 4: Publishing Extended APIs (Week 8-10)
**Priority: MEDIUM**

#### 4.1 Content Types
- AnnouncementController
- ClassifiedController
- CouponController
- LegalNoticeController
- MemorialController

#### 4.2 Media
- PhotoController
- PhotoAlbumController
- PodcastController
- PodcastEpisodeController
- CreatorProfileController

#### 4.3 Business Directory
- BusinessController (Publishing)
- BusinessSubscriptionController
- BusinessTemplateController
- BusinessFaqController
- BusinessSurveyController
- AchievementController

**Deliverables:**
- ✅ 50+ endpoints for extended publishing
- ✅ File upload handling
- ✅ Regional distribution

---

### Phase 5: CRM Core APIs (Week 11-13)
**Priority: HIGH**

#### 5.1 CRM Businesses & Customers
- Crm/SmbBusinessController
- Crm/CustomerController
- Crm/BusinessHoursController
- Crm/BusinessPhotoController
- Crm/BusinessReviewController
- Crm/BusinessAttributeController

#### 5.2 CRM Sales
- Crm/DealController
- Crm/CampaignController
- Crm/CampaignRecipientController
- Crm/InteractionController
- Crm/TaskController

**Deliverables:**
- ✅ 80+ endpoints for CRM
- ✅ Pipeline management
- ✅ Campaign management
- ✅ Customer relationship tracking

---

### Phase 6: Social & Community APIs (Week 14-15)
**Priority: MEDIUM**

#### 6.1 Social Features
- SocialPostController
- SocialFriendshipController
- SocialGroupController
- SocialActivityController

#### 6.2 Community Forums
- CommunityController
- CommunityThreadController
- CommunityThreadReplyController

#### 6.3 Messaging
- ConversationController
- MessageController

**Deliverables:**
- ✅ 50+ endpoints for social features
- ✅ Real-time capabilities
- ✅ Activity feeds

---

### Phase 7: E-Commerce & Ticketing (Week 16-17)
**Priority: MEDIUM**

#### 7.1 E-Commerce
- StoreController
- ProductController
- CartController
- OrderController

#### 7.2 Ticketing
- TicketPlanController (enhance)
- TicketOrderController (enhance)
- TicketListingController
- TicketTransferController
- TicketGiftController
- PromoCodeController

**Deliverables:**
- ✅ 40+ endpoints for commerce
- ✅ Payment processing integration
- ✅ Order management

---

### Phase 8: System & Integration APIs (Week 18-19)
**Priority: MEDIUM**

#### 8.1 Calendars & Hubs
- CalendarController
- HubController

#### 8.2 Advertising
- AdvertisementController (enhance)
- AdCampaignController
- AdCreativeController
- AdPlacementController

#### 8.3 Email Marketing
- EmailCampaignController
- EmailSubscriberController
- EmailTemplateController

#### 8.4 Emergency Alerts
- EmergencyAlertController
- EmergencySubscriptionController

#### 8.5 Search & RSS
- SearchController
- RssFeedController

**Deliverables:**
- ✅ 60+ endpoints for system features
- ✅ Integration capabilities
- ✅ Analytics endpoints

---

### Phase 9: Testing & Documentation (Week 20-21)
**Priority: HIGH**

#### 9.1 API Testing
- Feature tests for all endpoints
- Integration tests
- Performance tests
- Security tests

#### 9.2 API Documentation
- OpenAPI/Swagger specification
- Postman collection
- API usage guides
- Authentication guides

**Deliverables:**
- ✅ Complete test coverage
- ✅ API documentation
- ✅ Usage examples

---

## Part 4: Technical Implementation Details

### 4.1 Laravel API Resources Structure

**Directory:** `app/Http/Resources/Api/V1/`

Each model should have a corresponding Resource class:

```php
<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'status' => $this->status,
            'author' => new UserResource($this->whenLoaded('author')),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

### 4.2 Form Request Validation

**Directory:** `app/Http/Requests/Api/V1/`

Each endpoint should have validation:

```php
<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\DayNewsPost::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['exists:tags,id'],
        ];
    }
}
```

### 4.3 Controller Structure

**Standard CRUD Controller Pattern:**

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePostRequest;
use App\Http\Requests\Api\V1\UpdatePostRequest;
use App\Http\Resources\Api\V1\PostResource;
use App\Models\DayNewsPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DayNewsPost::query();
        
        // Apply filters
        if ($request->has('region_id')) {
            $query->whereHas('regions', fn($q) => $q->where('regions.id', $request->region_id));
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Apply sorting
        $sort = $request->get('sort', 'latest');
        match($sort) {
            'latest' => $query->latest(),
            'popular' => $query->orderBy('view_count', 'desc'),
            'trending' => $query->orderBy('trending_score', 'desc'),
            default => $query->latest(),
        };
        
        // Paginate
        $posts = $query->paginate($request->get('per_page', 20));
        
        return ApiResponse::paginated(
            PostResource::collection($posts),
            [
                'page' => $posts->currentPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'last_page' => $posts->lastPage(),
            ]
        );
    }
    
    public function show(DayNewsPost $post): JsonResponse
    {
        return ApiResponse::success(new PostResource($post->load(['author', 'regions', 'tags'])));
    }
    
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = DayNewsPost::create($request->validated());
        
        if ($request->has('region_ids')) {
            $post->regions()->attach($request->region_ids);
        }
        
        if ($request->has('tag_ids')) {
            $post->tags()->attach($request->tag_ids);
        }
        
        return ApiResponse::success(new PostResource($post->load(['author', 'regions', 'tags'])), 'Post created successfully', 201);
    }
    
    public function update(UpdatePostRequest $request, DayNewsPost $post): JsonResponse
    {
        $post->update($request->validated());
        
        if ($request->has('region_ids')) {
            $post->regions()->sync($request->region_ids);
        }
        
        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->tag_ids);
        }
        
        return ApiResponse::success(new PostResource($post->load(['author', 'regions', 'tags'])), 'Post updated successfully');
    }
    
    public function destroy(DayNewsPost $post): JsonResponse
    {
        $post->delete();
        
        return ApiResponse::success(null, 'Post deleted successfully', 204);
    }
}
```

### 4.4 Route Organization

**File:** `routes/api/v1.php`

```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');
        Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    });
    
    // Public endpoints
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    
    // Authenticated endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('posts', PostController::class)->except(['index', 'show']);
        Route::post('/posts/{post}/publish', [PostController::class, 'publish']);
        // ... more routes
    });
});
```

**File:** `routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    require __DIR__.'/api/v1.php';
});
```

---

## Part 5: Implementation Checklist

### Infrastructure Setup
- [ ] Create API versioning structure (`/api/v1/`)
- [ ] Create `ApiResponse` helper class
- [ ] Create API middleware (versioning, formatting, rate limiting)
- [ ] Configure Sanctum for API authentication
- [ ] Set up rate limiting per endpoint
- [ ] Create API exception handler
- [ ] Create pagination helper
- [ ] Create filtering/sorting helper

### Shared APIs (30 endpoints)
- [ ] AuthController (8 endpoints)
- [ ] UserController (7 endpoints)
- [ ] SocialAccountController (3 endpoints)
- [ ] SessionController (4 endpoints)
- [ ] WorkspaceController (5 endpoints)
- [ ] WorkspaceMemberController (4 endpoints)
- [ ] WorkspaceInvitationController (4 endpoints)
- [ ] TenantController (4 endpoints)
- [ ] AccountManagerController (3 endpoints)
- [ ] RoleController (3 endpoints)
- [ ] RegionController (6 endpoints)
- [ ] RegionZipcodeController (3 endpoints)

### Publishing Core APIs (60 endpoints)
- [ ] PostController (15 endpoints)
- [ ] TagController (6 endpoints)
- [ ] CommentController (7 endpoints)
- [ ] PostPaymentController (3 endpoints)
- [ ] NewsArticleController (8 endpoints)
- [ ] NewsArticleDraftController (3 endpoints)
- [ ] NewsFactCheckController (3 endpoints)
- [ ] WriterAgentController (6 endpoints)
- [ ] NewsWorkflowRunController (3 endpoints)
- [ ] NewsWorkflowSettingController (2 endpoints)
- [ ] NewsFetchFrequencyController (2 endpoints)
- [ ] EventController (8 endpoints)
- [ ] VenueController (6 endpoints)
- [ ] PerformerController (7 endpoints)
- [ ] BookingController (4 endpoints)
- [ ] UpcomingShowController (3 endpoints)

### Publishing Extended APIs (50 endpoints)
- [ ] AnnouncementController (5 endpoints)
- [ ] ClassifiedController (8 endpoints)
- [ ] ClassifiedImageController (3 endpoints)
- [ ] ClassifiedPaymentController (2 endpoints)
- [ ] CouponController (7 endpoints)
- [ ] CouponUsageController (2 endpoints)
- [ ] LegalNoticeController (4 endpoints)
- [ ] MemorialController (5 endpoints)
- [ ] PhotoController (5 endpoints)
- [ ] PhotoAlbumController (5 endpoints)
- [ ] PodcastController (6 endpoints)
- [ ] PodcastEpisodeController (5 endpoints)
- [ ] CreatorProfileController (5 endpoints)
- [ ] BusinessController (Publishing) (7 endpoints)
- [ ] BusinessSubscriptionController (3 endpoints)
- [ ] BusinessTemplateController (2 endpoints)
- [ ] BusinessFaqController (3 endpoints)
- [ ] BusinessSurveyController (4 endpoints)
- [ ] BusinessSurveyResponseController (2 endpoints)
- [ ] AchievementController (2 endpoints)

### CRM APIs (80 endpoints)
- [ ] Crm/SmbBusinessController (12 endpoints)
- [ ] Crm/CustomerController (9 endpoints)
- [ ] Crm/DealController (7 endpoints)
- [ ] Crm/CampaignController (7 endpoints)
- [ ] Crm/CampaignRecipientController (2 endpoints)
- [ ] Crm/InteractionController (7 endpoints)
- [ ] Crm/TaskController (8 endpoints)
- [ ] Crm/BusinessHoursController (4 endpoints)
- [ ] Crm/BusinessPhotoController (5 endpoints)
- [ ] Crm/BusinessReviewController (5 endpoints)
- [ ] Crm/BusinessAttributeController (4 endpoints)
- [ ] Crm/IndustryController (5 endpoints)
- [ ] Crm/CommunityController (5 endpoints)

### Social & Community APIs (50 endpoints)
- [ ] SocialPostController (8 endpoints)
- [ ] SocialPostLikeController (2 endpoints)
- [ ] SocialPostCommentController (3 endpoints)
- [ ] SocialPostShareController (1 endpoint)
- [ ] SocialFriendshipController (4 endpoints)
- [ ] SocialUserFollowController (4 endpoints)
- [ ] SocialGroupController (6 endpoints)
- [ ] SocialGroupMemberController (3 endpoints)
- [ ] SocialGroupPostController (2 endpoints)
- [ ] SocialUserProfileController (2 endpoints)
- [ ] SocialActivityController (1 endpoint)
- [ ] CommunityController (6 endpoints)
- [ ] CommunityMemberController (3 endpoints)
- [ ] CommunityThreadController (6 endpoints)
- [ ] CommunityThreadReplyController (4 endpoints)
- [ ] CommunityThreadReplyLikeController (2 endpoints)
- [ ] CommunityThreadViewController (2 endpoints)
- [ ] ConversationController (4 endpoints)
- [ ] ConversationParticipantController (3 endpoints)
- [ ] MessageController (5 endpoints)

### E-Commerce & Ticketing APIs (40 endpoints)
- [ ] StoreController (5 endpoints)
- [ ] ProductController (5 endpoints)
- [ ] CartController (3 endpoints)
- [ ] CartItemController (3 endpoints)
- [ ] OrderController (5 endpoints)
- [ ] OrderItemController (2 endpoints)
- [ ] TicketPlanController (4 endpoints) - enhance existing
- [ ] TicketOrderController (6 endpoints) - enhance existing
- [ ] TicketOrderItemController (2 endpoints)
- [ ] TicketListingController (5 endpoints)
- [ ] TicketTransferController (3 endpoints)
- [ ] TicketGiftController (3 endpoints)
- [ ] PromoCodeController (5 endpoints)
- [ ] PromoCodeUsageController (2 endpoints)

### System & Integration APIs (60 endpoints)
- [ ] CalendarController (6 endpoints)
- [ ] CalendarEventController (4 endpoints)
- [ ] CalendarFollowerController (3 endpoints)
- [ ] CalendarRoleController (2 endpoints)
- [ ] HubController (6 endpoints)
- [ ] HubSectionController (3 endpoints)
- [ ] HubMemberController (3 endpoints)
- [ ] HubRoleController (2 endpoints)
- [ ] HubAnalyticsController (1 endpoint) - enhance existing
- [ ] CheckInController (2 endpoints) - enhance existing
- [ ] AdvertisementController (3 endpoints) - enhance existing
- [ ] AdCampaignController (7 endpoints)
- [ ] AdCreativeController (3 endpoints)
- [ ] AdPlacementController (2 endpoints)
- [ ] AdInventoryController (2 endpoints)
- [ ] AdImpressionController (2 endpoints)
- [ ] AdClickController (2 endpoints)
- [ ] EmailSubscriberController (3 endpoints)
- [ ] EmailCampaignController (6 endpoints)
- [ ] EmailTemplateController (3 endpoints)
- [ ] EmailSendController (2 endpoints)
- [ ] NewsletterSubscriptionController (3 endpoints)
- [ ] EmergencyAlertController (5 endpoints)
- [ ] EmergencySubscriptionController (3 endpoints)
- [ ] EmergencyDeliveryController (1 endpoint)
- [ ] EmergencyAuditLogController (1 endpoint)
- [ ] MunicipalPartnerController (3 endpoints)
- [ ] SearchController (4 endpoints)
- [ ] SearchHistoryController (3 endpoints)
- [ ] SearchSuggestionController (1 endpoint)
- [ ] RssFeedController (4 endpoints)
- [ ] RssFeedItemController (2 endpoints)
- [ ] ReviewController (3 endpoints)
- [ ] RatingController (2 endpoints)
- [ ] FollowController (3 endpoints) - enhance existing
- [ ] CommentReportController (2 endpoints)
- [ ] OrganizationRelationshipController (2 endpoints) - enhance existing
- [ ] OrganizationHierarchyController (2 endpoints)

### Testing & Documentation
- [ ] Feature tests for all endpoints
- [ ] Integration tests
- [ ] Performance tests
- [ ] Security tests
- [ ] OpenAPI/Swagger documentation
- [ ] Postman collection
- [ ] API usage guides

---

## Part 6: Estimated Timeline

### Total Implementation Time: ~21 weeks (5 months)

**Breakdown:**
- **Phase 1:** Infrastructure (2 weeks)
- **Phase 2:** Shared APIs (2 weeks)
- **Phase 3:** Publishing Core (3 weeks)
- **Phase 4:** Publishing Extended (3 weeks)
- **Phase 5:** CRM Core (3 weeks)
- **Phase 6:** Social & Community (2 weeks)
- **Phase 7:** E-Commerce & Ticketing (2 weeks)
- **Phase 8:** System & Integration (2 weeks)
- **Phase 9:** Testing & Documentation (2 weeks)

### Resource Requirements

**Team Size:** 2-3 developers
- 1 Senior Laravel Developer (API architecture, complex endpoints)
- 1-2 Mid-level Developers (CRUD endpoints, testing)

**Skills Required:**
- Laravel API development
- RESTful API design
- API authentication (Sanctum)
- API testing (Pest/PHPUnit)
- API documentation (OpenAPI/Swagger)

---

## Part 7: Success Criteria

### Functional Requirements
- ✅ All 400+ endpoints implemented
- ✅ All endpoints follow RESTful conventions
- ✅ Consistent response format across all endpoints
- ✅ Proper authentication and authorization
- ✅ Rate limiting configured
- ✅ Pagination on all list endpoints
- ✅ Filtering and sorting on list endpoints
- ✅ Proper error handling
- ✅ Input validation on all endpoints

### Non-Functional Requirements
- ✅ API response time < 200ms (p95)
- ✅ API uptime > 99.9%
- ✅ Rate limiting prevents abuse
- ✅ Comprehensive test coverage (>80%)
- ✅ Complete API documentation
- ✅ Security best practices implemented

---

## Part 8: Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business needs
3. **Set up development environment** for API development
4. **Begin Phase 1** (Infrastructure setup)
5. **Iterate and refine** based on feedback

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025  
**Status:** Ready for Implementation  
**Total Endpoints:** ~400+  
**Total Controllers:** ~120+  
**Estimated Time:** 21 weeks


