# Database Seeding Plan - Complete Inventory & Strategy

**Generated:** December 29, 2025  
**Total Models:** 142  
**Total Factories:** 144  
**UUID Models:** 101  
**Integer ID Models:** 41  
**Existing Seeders:** 20

---

## Executive Summary

This document provides a comprehensive plan for seeding the database with proper UUID handling, relationship integrity, and dependency ordering. The seeding strategy ensures:

1. ✅ **Proper UUID generation** for all UUID-based models
2. ✅ **Correct foreign key relationships** maintained throughout
3. ✅ **Dependency-ordered seeding** (base models first)
4. ✅ **Realistic data relationships** (e.g., users belong to workspaces)
5. ✅ **Polymorphic relationships** handled correctly
6. ✅ **Unique constraints** respected (emails, slugs, etc.)

---

## Part 1: Database Schema Inventory

### 1.1 ID Type Classification

#### UUID Models (101 models)

**Base/Foundation Models:**
- `User` - Authentication & user management
- `Workspace` - Multi-tenancy workspace
- `Tenant` - CRM multi-tenancy
- `Region` - Geographic regions (hierarchical)
- `Role` - User roles (text primary key)

**Publishing Models:**
- `DayNewsPost` - Day News articles
- `DayNewsPostPayment` - Article payments
- `NewsArticle` - Automated news articles
- `NewsArticleDraft` - Draft articles
- `NewsFactCheck` - Fact-checking records
- `NewsWorkflowRun` - Workflow execution logs
- `NewsWorkflowSetting` - Workflow configuration
- `NewsFetchFrequency` - RSS fetch schedules
- `WriterAgent` - AI writer agents
- `ArticleComment` - Article comments
- `ArticleCommentLike` - Comment likes
- `Tag` - Content tags
- `SearchHistory` - Search queries
- `SearchSuggestion` - Search suggestions
- `CommentReport` - Comment moderation
- `Announcement` - Community announcements
- `Classified` - Classified ads
- `ClassifiedImage` - Classified images
- `ClassifiedPayment` - Classified payments
- `Coupon` - Coupons/deals
- `CouponUsage` - Coupon usage tracking
- `Photo` - Photo gallery
- `PhotoAlbum` - Photo albums
- `LegalNotice` - Legal notices
- `Memorial` - Memorials
- `Podcast` - Podcasts
- `PodcastEpisode` - Podcast episodes
- `CreatorProfile` - Podcast creators

**Event Management Models:**
- `Event` - Event listings
- `Venue` - Event venues
- `Performer` - Event performers
- `Booking` - Event bookings
- `UpcomingShow` - Upcoming shows
- `Calendar` - Event calendars
- `CalendarEvent` - Calendar events
- `CalendarFollower` - Calendar followers
- `CalendarRole` - Calendar roles
- `PlannedEvent` - Planned events

**Ticket System Models:**
- `TicketPlan` - Ticket pricing plans
- `TicketOrder` - Ticket orders
- `TicketOrderItem` - Order line items
- `TicketListing` - Ticket marketplace listings
- `TicketTransfer` - Ticket transfers
- `TicketGift` - Ticket gifts
- `PromoCode` - Promotional codes
- `PromoCodeUsage` - Promo code usage

**Social Features Models:**
- `SocialPost` - Social feed posts
- `SocialPostLike` - Post likes
- `SocialPostComment` - Post comments
- `SocialCommentLike` - Comment likes
- `SocialPostShare` - Post shares
- `SocialFriendship` - User friendships
- `SocialGroup` - Social groups
- `SocialGroupMember` - Group members
- `SocialGroupPost` - Group posts
- `SocialGroupInvitation` - Group invitations
- `SocialUserProfile` - User profiles
- `SocialUserFollow` - User follows
- `SocialActivity` - Activity feed
- `SocialAccount` - OAuth accounts

**Community Models:**
- `Community` - Communities
- `CommunityThread` - Discussion threads
- `CommunityThreadReply` - Thread replies
- `CommunityThreadReplyLike` - Reply likes
- `CommunityThreadView` - Thread views
- `CommunityMember` - Community members
- `AlphaSiteCommunity` - AlphaSite communities

**Messaging Models:**
- `Conversation` - Conversations
- `ConversationParticipant` - Conversation participants
- `Message` - Messages

**E-commerce Models:**
- `Store` - Stores
- `Product` - Products
- `Order` - Orders
- `OrderItem` - Order items
- `Cart` - Shopping carts
- `CartItem` - Cart items

**Business Directory Models:**
- `Business` - Business directory entries
- `BusinessSubscription` - Business subscriptions
- `BusinessTemplate` - Business templates
- `BusinessFaq` - Business FAQs
- `BusinessSurvey` - Business surveys
- `BusinessSurveyResponse` - Survey responses
- `Achievement` - Business achievements
- `Industry` - Industries

**CRM Models:**
- `Tenant` - CRM tenants
- `AccountManager` - Account managers
- `SmbBusiness` - CRM business records
- `Customer` - CRM customers
- `Deal` - Sales deals
- `Campaign` - Marketing campaigns
- `CampaignRecipient` - Campaign recipients
- `Interaction` - Customer interactions
- `Task` - CRM tasks
- `BusinessHours` - Business hours
- `BusinessPhoto` - Business photos
- `BusinessReview` - Business reviews
- `BusinessAttribute` - Business attributes
- `SMBCrmCustomer` - Legacy SMB CRM customers
- `SMBCrmInteraction` - Legacy SMB CRM interactions

**Hub Models:**
- `Hub` - Community hubs
- `HubSection` - Hub sections
- `HubMember` - Hub members
- `HubRole` - Hub roles
- `HubAnalytics` - Hub analytics
- `CheckIn` - Check-ins

**Review & Rating Models:**
- `Review` - Reviews (polymorphic)
- `Rating` - Ratings (polymorphic)

**Follow Model:**
- `Follow` - Follow relationships (polymorphic)

**Notification Models:**
- `Notification` - Notifications
- `NotificationSubscription` - Notification subscriptions
- `NotificationLog` - Notification logs
- `PhoneVerification` - Phone verifications

**Email Marketing Models:**
- `EmailSubscriber` - Email subscribers
- `EmailCampaign` - Email campaigns
- `EmailSend` - Email sends
- `EmailTemplate` - Email templates
- `NewsletterSubscription` - Newsletter subscriptions

**Emergency Alert Models:**
- `EmergencyAlert` - Emergency alerts
- `EmergencySubscription` - Emergency subscriptions
- `EmergencyAuditLog` - Audit logs
- `EmergencyDelivery` - Delivery logs
- `MunicipalPartner` - Municipal partners

**Advertising Models:**
- `Advertisement` - Advertisements
- `AdCampaign` - Ad campaigns
- `AdCreative` - Ad creatives
- `AdPlacement` - Ad placements
- `AdInventory` - Ad inventory
- `AdImpression` - Ad impressions
- `AdClick` - Ad clicks

**Organization Models:**
- `OrganizationRelationship` - Organization relationships
- `OrganizationHierarchy` - Organization hierarchies

**RSS Integration Models:**
- `RssFeed` - RSS feeds
- `RssFeedItem` - RSS feed items

**Other Models:**
- `WorkspaceMembership` - Workspace memberships
- `WorkspaceInvitation` - Workspace invitations
- `CrossDomainAuthToken` - Cross-domain auth tokens
- `EventExtractionDraft` - Event extraction drafts
- `Credits` - Credits system

#### Integer ID Models (41 models)

**Laravel System Tables:**
- `migrations` - Migration tracking
- `password_reset_tokens` - Password resets
- `sessions` - User sessions
- `cache` - Cache storage
- `cache_locks` - Cache locks
- `jobs` - Queue jobs
- `job_batches` - Job batches
- `failed_jobs` - Failed jobs
- `magic_links` - Magic link authentication

**Note:** These are Laravel system tables and don't need seeders.

---

## Part 2: Factory Inventory

### 2.1 Factory Status

**Total Factories:** 144  
**Models:** 142  
**Extra Factories:** 2 (likely duplicates or legacy)

### 2.2 Factory Coverage

✅ **All UUID models have factories** (101 factories)  
✅ **All relationship models have factories**  
⚠️ **Some factories may need updates** for:
- UUID generation consistency
- Relationship handling
- Unique constraint handling

### 2.3 Factory Quality Checklist

For each factory, verify:
- [ ] Uses `HasFactory` trait in model
- [ ] Generates UUIDs correctly (if UUID model)
- [ ] Handles foreign keys correctly
- [ ] Respects unique constraints (emails, slugs)
- [ ] Handles nullable fields appropriately
- [ ] Generates realistic data
- [ ] Handles polymorphic relationships (if applicable)

---

## Part 3: Dependency Analysis

### 3.1 Dependency Levels

#### Level 0: Foundation (No Dependencies)

These models have no foreign key dependencies:

1. **`User`** - Base user model
   - Dependencies: None
   - UUID: ✅ Yes
   - Factory: ✅ `UserFactory`
   - Seeder Priority: **CRITICAL - FIRST**

2. **`Tenant`** - CRM tenant
   - Dependencies: None
   - UUID: ✅ Yes
   - Factory: ✅ `TenantFactory`
   - Seeder Priority: **CRITICAL - FIRST**

3. **`Role`** - User roles
   - Dependencies: None
   - UUID: ❌ No (text primary key)
   - Factory: ✅ `RoleFactory`
   - Seeder Priority: **CRITICAL - FIRST**

#### Level 1: Direct Dependencies (Depends on Level 0)

4. **`Workspace`** - Multi-tenancy workspace
   - Dependencies: `User` (owner_id)
   - UUID: ✅ Yes
   - Factory: ✅ `WorkspaceFactory`
   - Seeder Priority: **HIGH - SECOND**

5. **`Region`** - Geographic regions
   - Dependencies: `Region` (parent_id, self-referencing)
   - UUID: ✅ Yes
   - Factory: ✅ `RegionFactory`
   - Seeder Priority: **HIGH - SECOND**

6. **`Industry`** - Industries
   - Dependencies: None (but may reference BusinessTemplate)
   - UUID: ✅ Yes
   - Factory: ✅ `IndustryFactory`
   - Seeder Priority: **HIGH - SECOND**

#### Level 2: Secondary Dependencies (Depends on Level 1)

7. **`WorkspaceMembership`** - Workspace memberships
   - Dependencies: `Workspace`, `User`, `Role`
   - UUID: ✅ Yes
   - Factory: ✅ `WorkspaceMembershipFactory`
   - Seeder Priority: **HIGH - THIRD**

8. **`WorkspaceInvitation`** - Workspace invitations
   - Dependencies: `Workspace`, `User`
   - UUID: ✅ Yes
   - Factory: ✅ `WorkspaceInvitationFactory`
   - Seeder Priority: **MEDIUM - THIRD**

9. **`RegionZipcode`** - Region zipcodes
   - Dependencies: `Region`
   - UUID: ✅ Yes
   - Factory: ✅ `RegionZipcodeFactory`
   - Seeder Priority: **MEDIUM - THIRD**

10. **`AccountManager`** - Account managers
    - Dependencies: `Tenant`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `AccountManagerFactory`
    - Seeder Priority: **HIGH - THIRD**

11. **`BusinessTemplate`** - Business templates
    - Dependencies: `Industry` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessTemplateFactory`
    - Seeder Priority: **MEDIUM - THIRD**

#### Level 3: Content Models (Depends on Level 2)

12. **`Business`** - Business directory
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessFactory`
    - Seeder Priority: **HIGH - FOURTH**

13. **`SmbBusiness`** - CRM business records
    - Dependencies: `Tenant`
    - UUID: ✅ Yes
    - Factory: ✅ `SmbBusinessFactory`
    - Seeder Priority: **HIGH - FOURTH**

14. **`Venue`** - Event venues
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `VenueFactory`
    - Seeder Priority: **HIGH - FOURTH**

15. **`Performer`** - Event performers
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `PerformerFactory`
    - Seeder Priority: **HIGH - FOURTH**

16. **`Store`** - E-commerce stores
    - Dependencies: `Workspace`
    - UUID: ✅ Yes
    - Factory: ✅ `StoreFactory`
    - Seeder Priority: **HIGH - FOURTH**

17. **`Community`** - Communities
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `CommunityFactory`
    - Seeder Priority: **HIGH - FOURTH**

18. **`Hub`** - Community hubs
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `HubFactory`
    - Seeder Priority: **MEDIUM - FOURTH**

19. **`Tag`** - Content tags
    - Dependencies: None
    - UUID: ✅ Yes
    - Factory: ✅ `TagFactory`
    - Seeder Priority: **MEDIUM - FOURTH**

20. **`CreatorProfile`** - Podcast creators
    - Dependencies: `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CreatorProfileFactory`
    - Seeder Priority: **MEDIUM - FOURTH**

#### Level 4: Related Content (Depends on Level 3)

21. **`Event`** - Events
    - Dependencies: `Workspace`, `Venue` (optional), `Performer` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `EventFactory`
    - Seeder Priority: **HIGH - FIFTH**

22. **`DayNewsPost`** - Day News articles
    - Dependencies: `Workspace`, `User` (author_id)
    - UUID: ✅ Yes
    - Factory: ✅ `DayNewsPostFactory`
    - Seeder Priority: **HIGH - FIFTH**

23. **`NewsArticle`** - Automated news articles
    - Dependencies: `Region`, `WriterAgent` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `NewsArticleFactory`
    - Seeder Priority: **HIGH - FIFTH**

24. **`Product`** - E-commerce products
    - Dependencies: `Store`
    - UUID: ✅ Yes
    - Factory: ✅ `ProductFactory`
    - Seeder Priority: **HIGH - FIFTH**

25. **`Customer`** - CRM customers
    - Dependencies: `Tenant`, `SmbBusiness` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `CustomerFactory`
    - Seeder Priority: **HIGH - FIFTH**

26. **`BusinessHours`** - Business hours
    - Dependencies: `SmbBusiness`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessHoursFactory`
    - Seeder Priority: **MEDIUM - FIFTH**

27. **`BusinessPhoto`** - Business photos
    - Dependencies: `SmbBusiness`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessPhotoFactory`
    - Seeder Priority: **MEDIUM - FIFTH**

28. **`BusinessReview`** - Business reviews
    - Dependencies: `SmbBusiness`, `Customer`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessReviewFactory`
    - Seeder Priority: **MEDIUM - FIFTH**

29. **`BusinessAttribute`** - Business attributes
    - Dependencies: `SmbBusiness`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessAttributeFactory`
    - Seeder Priority: **MEDIUM - FIFTH**

30. **`BusinessSubscription`** - Business subscriptions
    - Dependencies: `Business`, `Workspace`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessSubscriptionFactory`
    - Seeder Priority: **MEDIUM - FIFTH**

31. **`BusinessFaq`** - Business FAQs
    - Dependencies: `Business`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessFaqFactory`
    - Seeder Priority: **LOW - FIFTH**

32. **`BusinessSurvey`** - Business surveys
    - Dependencies: `Business`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessSurveyFactory`
    - Seeder Priority: **LOW - FIFTH**

33. **`BusinessSurveyResponse`** - Survey responses
    - Dependencies: `BusinessSurvey`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `BusinessSurveyResponseFactory`
    - Seeder Priority: **LOW - FIFTH**

34. **`Achievement`** - Business achievements
    - Dependencies: `Business`
    - UUID: ✅ Yes
    - Factory: ✅ `AchievementFactory`
    - Seeder Priority: **LOW - FIFTH**

#### Level 5: User-Generated Content (Depends on Level 4)

35. **`ArticleComment`** - Article comments
    - Dependencies: `DayNewsPost`, `User`, `ArticleComment` (parent_id)
    - UUID: ✅ Yes
    - Factory: ✅ `ArticleCommentFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

36. **`ArticleCommentLike`** - Comment likes
    - Dependencies: `ArticleComment`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `ArticleCommentLikeFactory`
    - Seeder Priority: **LOW - SIXTH**

37. **`CommentReport`** - Comment reports
    - Dependencies: `ArticleComment`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CommentReportFactory`
    - Seeder Priority: **LOW - SIXTH**

38. **`Review`** - Reviews (polymorphic)
    - Dependencies: `User`, polymorphic (Venue, Performer, etc.)
    - UUID: ✅ Yes
    - Factory: ✅ `ReviewFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

39. **`Rating`** - Ratings (polymorphic)
    - Dependencies: `User`, polymorphic (Venue, Performer, etc.)
    - UUID: ✅ Yes
    - Factory: ✅ `RatingFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

40. **`Follow`** - Follow relationships (polymorphic)
    - Dependencies: `User`, polymorphic (Tag, User, Event, etc.)
    - UUID: ✅ Yes
    - Factory: ✅ `FollowFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

41. **`Booking`** - Event bookings
    - Dependencies: `Event`, `Venue` (optional), `Performer` (optional), `Workspace`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `BookingFactory`
    - Seeder Priority: **HIGH - SIXTH**

42. **`TicketPlan`** - Ticket plans
    - Dependencies: `Event`
    - UUID: ✅ Yes
    - Factory: ✅ `TicketPlanFactory`
    - Seeder Priority: **HIGH - SIXTH**

43. **`TicketOrder`** - Ticket orders
    - Dependencies: `Event`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `TicketOrderFactory`
    - Seeder Priority: **HIGH - SIXTH**

44. **`TicketOrderItem`** - Order items
    - Dependencies: `TicketOrder`, `TicketPlan`
    - UUID: ✅ Yes
    - Factory: ✅ `TicketOrderItemFactory`
    - Seeder Priority: **HIGH - SIXTH**

45. **`Order`** - E-commerce orders
    - Dependencies: `Store`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `OrderFactory`
    - Seeder Priority: **HIGH - SIXTH**

46. **`OrderItem`** - Order items
    - Dependencies: `Order`, `Product`
    - UUID: ✅ Yes
    - Factory: ✅ `OrderItemFactory`
    - Seeder Priority: **HIGH - SIXTH**

47. **`Cart`** - Shopping carts
    - Dependencies: `User`, `Store`
    - UUID: ✅ Yes
    - Factory: ✅ `CartFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

48. **`CartItem`** - Cart items
    - Dependencies: `Cart`, `Product`
    - UUID: ✅ Yes
    - Factory: ✅ `CartItemFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

49. **`CommunityThread`** - Community threads
    - Dependencies: `Community`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CommunityThreadFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

50. **`CommunityMember`** - Community members
    - Dependencies: `Community`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CommunityMemberFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

51. **`CommunityThreadReply`** - Thread replies
    - Dependencies: `CommunityThread`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CommunityThreadReplyFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

52. **`CommunityThreadReplyLike`** - Reply likes
    - Dependencies: `CommunityThreadReply`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CommunityThreadReplyLikeFactory`
    - Seeder Priority: **LOW - SIXTH**

53. **`CommunityThreadView`** - Thread views
    - Dependencies: `CommunityThread`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CommunityThreadViewFactory`
    - Seeder Priority: **LOW - SIXTH**

54. **`SocialPost`** - Social posts
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `SocialPostFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

55. **`SocialPostLike`** - Post likes
    - Dependencies: `SocialPost`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialPostLikeFactory`
    - Seeder Priority: **LOW - SIXTH**

56. **`SocialPostComment`** - Post comments
    - Dependencies: `SocialPost`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialPostCommentFactory`
    - Seeder Priority: **LOW - SIXTH**

57. **`SocialCommentLike`** - Comment likes
    - Dependencies: `SocialPostComment`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialCommentLikeFactory`
    - Seeder Priority: **LOW - SIXTH**

58. **`SocialPostShare`** - Post shares
    - Dependencies: `SocialPost`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialPostShareFactory`
    - Seeder Priority: **LOW - SIXTH**

59. **`SocialFriendship`** - Friendships
    - Dependencies: `User` (user_id, friend_id)
    - UUID: ✅ Yes
    - Factory: ✅ `SocialFriendshipFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

60. **`SocialGroup`** - Social groups
    - Dependencies: `User` (creator_id), `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `SocialGroupFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

61. **`SocialGroupMember`** - Group members
    - Dependencies: `SocialGroup`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialGroupMemberFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

62. **`SocialGroupPost`** - Group posts
    - Dependencies: `SocialGroup`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialGroupPostFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

63. **`SocialGroupInvitation`** - Group invitations
    - Dependencies: `SocialGroup`, `User` (inviter_id, invitee_id)
    - UUID: ✅ Yes
    - Factory: ✅ `SocialGroupInvitationFactory`
    - Seeder Priority: **LOW - SIXTH**

64. **`SocialUserProfile`** - User profiles
    - Dependencies: `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialUserProfileFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

65. **`SocialUserFollow`** - User follows
    - Dependencies: `User` (follower_id, following_id)
    - UUID: ✅ Yes
    - Factory: ✅ `SocialUserFollowFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

66. **`SocialActivity`** - Activity feed
    - Dependencies: `User`, polymorphic
    - UUID: ✅ Yes
    - Factory: ✅ `SocialActivityFactory`
    - Seeder Priority: **LOW - SIXTH**

67. **`Conversation`** - Conversations
    - Dependencies: `User` (creator_id)
    - UUID: ✅ Yes
    - Factory: ✅ `ConversationFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

68. **`ConversationParticipant`** - Conversation participants
    - Dependencies: `Conversation`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `ConversationParticipantFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

69. **`Message`** - Messages
    - Dependencies: `Conversation`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `MessageFactory`
    - Seeder Priority: **MEDIUM - SIXTH**

70. **`Deal`** - CRM deals
    - Dependencies: `Tenant`, `Customer`
    - UUID: ✅ Yes
    - Factory: ✅ `DealFactory`
    - Seeder Priority: **HIGH - SIXTH**

71. **`Campaign`** - Marketing campaigns
    - Dependencies: `Tenant`
    - UUID: ✅ Yes
    - Factory: ✅ `CampaignFactory`
    - Seeder Priority: **HIGH - SIXTH**

72. **`CampaignRecipient`** - Campaign recipients
    - Dependencies: `Campaign`, `Customer`
    - UUID: ✅ Yes
    - Factory: ✅ `CampaignRecipientFactory`
    - Seeder Priority: **HIGH - SIXTH**

73. **`Interaction`** - Customer interactions
    - Dependencies: `Tenant`, `Customer`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `InteractionFactory`
    - Seeder Priority: **HIGH - SIXTH**

74. **`Task`** - CRM tasks
    - Dependencies: `Tenant`, `Customer`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `TaskFactory`
    - Seeder Priority: **HIGH - SIXTH**

#### Level 6: Supporting Models (Depends on Level 5)

75. **`Announcement`** - Announcements
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `AnnouncementFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

76. **`Classified`** - Classified ads
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `ClassifiedFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

77. **`ClassifiedImage`** - Classified images
    - Dependencies: `Classified`
    - UUID: ✅ Yes
    - Factory: ✅ `ClassifiedImageFactory`
    - Seeder Priority: **LOW - SEVENTH**

78. **`ClassifiedPayment`** - Classified payments
    - Dependencies: `Classified`
    - UUID: ✅ Yes
    - Factory: ✅ `ClassifiedPaymentFactory`
    - Seeder Priority: **LOW - SEVENTH**

79. **`Coupon`** - Coupons
    - Dependencies: `User`, `Business` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `CouponFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

80. **`CouponUsage`** - Coupon usage
    - Dependencies: `Coupon`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CouponUsageFactory`
    - Seeder Priority: **LOW - SEVENTH**

81. **`Photo`** - Photos
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `PhotoFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

82. **`PhotoAlbum`** - Photo albums
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `PhotoAlbumFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

83. **`LegalNotice`** - Legal notices
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `LegalNoticeFactory`
    - Seeder Priority: **LOW - SEVENTH**

84. **`Memorial`** - Memorials
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `MemorialFactory`
    - Seeder Priority: **LOW - SEVENTH**

85. **`Podcast`** - Podcasts
    - Dependencies: `CreatorProfile`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `PodcastFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

86. **`PodcastEpisode`** - Podcast episodes
    - Dependencies: `Podcast`
    - UUID: ✅ Yes
    - Factory: ✅ `PodcastEpisodeFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

87. **`Calendar`** - Calendars
    - Dependencies: `Workspace`, `User` (creator_id)
    - UUID: ✅ Yes
    - Factory: ✅ `CalendarFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

88. **`CalendarEvent`** - Calendar events
    - Dependencies: `Calendar`, `Event` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `CalendarEventFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

89. **`CalendarFollower`** - Calendar followers
    - Dependencies: `Calendar`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CalendarFollowerFactory`
    - Seeder Priority: **LOW - SEVENTH**

90. **`CalendarRole`** - Calendar roles
    - Dependencies: `Calendar`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CalendarRoleFactory`
    - Seeder Priority: **LOW - SEVENTH**

91. **`UpcomingShow`** - Upcoming shows
    - Dependencies: `Performer`, `Venue` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `UpcomingShowFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

92. **`PlannedEvent`** - Planned events
    - Dependencies: `User`, `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `PlannedEventFactory`
    - Seeder Priority: **LOW - SEVENTH**

93. **`TicketListing`** - Ticket listings
    - Dependencies: `TicketOrderItem`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `TicketListingFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

94. **`TicketTransfer`** - Ticket transfers
    - Dependencies: `TicketOrderItem`, `User` (from_user_id, to_user_id)
    - UUID: ✅ Yes
    - Factory: ✅ `TicketTransferFactory`
    - Seeder Priority: **LOW - SEVENTH**

95. **`TicketGift`** - Ticket gifts
    - Dependencies: `TicketOrderItem`, `User` (gifter_id, recipient_id)
    - UUID: ✅ Yes
    - Factory: ✅ `TicketGiftFactory`
    - Seeder Priority: **LOW - SEVENTH**

96. **`PromoCode`** - Promo codes
    - Dependencies: `Event` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `PromoCodeFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

97. **`PromoCodeUsage`** - Promo code usage
    - Dependencies: `PromoCode`, `TicketOrder`
    - UUID: ✅ Yes
    - Factory: ✅ `PromoCodeUsageFactory`
    - Seeder Priority: **LOW - SEVENTH**

98. **`HubSection`** - Hub sections
    - Dependencies: `Hub`
    - UUID: ✅ Yes
    - Factory: ✅ `HubSectionFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

99. **`HubMember`** - Hub members
    - Dependencies: `Hub`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `HubMemberFactory`
    - Seeder Priority: **MEDIUM - SEVENTH**

100. **`HubRole`** - Hub roles
    - Dependencies: `Hub`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `HubRoleFactory`
    - Seeder Priority: **LOW - SEVENTH**

101. **`HubAnalytics`** - Hub analytics
    - Dependencies: `Hub`
    - UUID: ✅ Yes
    - Factory: ✅ `HubAnalyticsFactory`
    - Seeder Priority: **LOW - SEVENTH**

102. **`CheckIn`** - Check-ins
    - Dependencies: `Hub`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CheckInFactory`
    - Seeder Priority: **LOW - SEVENTH**

103. **`AlphaSiteCommunity`** - AlphaSite communities
    - Dependencies: `Business`
    - UUID: ✅ Yes
    - Factory: ✅ `AlphaSiteCommunityFactory`
    - Seeder Priority: **LOW - SEVENTH**

#### Level 7: System & Configuration Models

104. **`Notification`** - Notifications
    - Dependencies: `User` (optional, polymorphic)
    - UUID: ✅ Yes
    - Factory: ✅ `NotificationFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

105. **`NotificationSubscription`** - Notification subscriptions
    - Dependencies: `User`
    - UUID: ✅ Yes
    - Factory: ✅ `NotificationSubscriptionFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

106. **`NotificationLog`** - Notification logs
    - Dependencies: `NotificationSubscription`
    - UUID: ✅ Yes
    - Factory: ✅ `NotificationLogFactory`
    - Seeder Priority: **LOW - EIGHTH**

107. **`PhoneVerification`** - Phone verifications
    - Dependencies: `User`
    - UUID: ✅ Yes
    - Factory: ✅ `PhoneVerificationFactory`
    - Seeder Priority: **LOW - EIGHTH**

108. **`SocialAccount`** - OAuth accounts
    - Dependencies: `User`
    - UUID: ✅ Yes
    - Factory: ✅ `SocialAccountFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

109. **`EmailSubscriber`** - Email subscribers
    - Dependencies: None
    - UUID: ✅ Yes
    - Factory: ✅ `EmailSubscriberFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

110. **`EmailCampaign`** - Email campaigns
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `EmailCampaignFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

111. **`EmailSend`** - Email sends
    - Dependencies: `EmailCampaign`, `EmailSubscriber`
    - UUID: ✅ Yes
    - Factory: ✅ `EmailSendFactory`
    - Seeder Priority: **LOW - EIGHTH**

112. **`EmailTemplate`** - Email templates
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `EmailTemplateFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

113. **`NewsletterSubscription`** - Newsletter subscriptions
    - Dependencies: `User` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `NewsletterSubscriptionFactory`
    - Seeder Priority: **LOW - EIGHTH**

114. **`EmergencyAlert`** - Emergency alerts
    - Dependencies: `User` (creator_id), `Region` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `EmergencyAlertFactory`
    - Seeder Priority: **LOW - EIGHTH**

115. **`EmergencySubscription`** - Emergency subscriptions
    - Dependencies: `User`, `Region` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `EmergencySubscriptionFactory`
    - Seeder Priority: **LOW - EIGHTH**

116. **`EmergencyAuditLog`** - Emergency audit logs
    - Dependencies: `EmergencyAlert`
    - UUID: ✅ Yes
    - Factory: ✅ `EmergencyAuditLogFactory`
    - Seeder Priority: **LOW - EIGHTH**

117. **`EmergencyDelivery`** - Emergency deliveries
    - Dependencies: `EmergencyAlert`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `EmergencyDeliveryFactory`
    - Seeder Priority: **LOW - EIGHTH**

118. **`MunicipalPartner`** - Municipal partners
    - Dependencies: `Region` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `MunicipalPartnerFactory`
    - Seeder Priority: **LOW - EIGHTH**

119. **`Advertisement`** - Advertisements
    - Dependencies: `Workspace` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `AdvertisementFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

120. **`AdCampaign`** - Ad campaigns
    - Dependencies: `Advertisement`
    - UUID: ✅ Yes
    - Factory: ✅ `AdCampaignFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

121. **`AdCreative`** - Ad creatives
    - Dependencies: `AdCampaign`
    - UUID: ✅ Yes
    - Factory: ✅ `AdCreativeFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

122. **`AdPlacement`** - Ad placements
    - Dependencies: `AdCampaign`
    - UUID: ✅ Yes
    - Factory: ✅ `AdPlacementFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

123. **`AdInventory`** - Ad inventory
    - Dependencies: `AdPlacement`
    - UUID: ✅ Yes
    - Factory: ✅ `AdInventoryFactory`
    - Seeder Priority: **LOW - EIGHTH**

124. **`AdImpression`** - Ad impressions
    - Dependencies: `AdCreative`, `AdPlacement`
    - UUID: ✅ Yes
    - Factory: ✅ `AdImpressionFactory`
    - Seeder Priority: **LOW - EIGHTH**

125. **`AdClick`** - Ad clicks
    - Dependencies: `AdCreative`, `AdPlacement`
    - UUID: ✅ Yes
    - Factory: ✅ `AdClickFactory`
    - Seeder Priority: **LOW - EIGHTH**

126. **`OrganizationRelationship`** - Organization relationships
    - Dependencies: `Business` (organization_id, related_organization_id)
    - UUID: ✅ Yes
    - Factory: ✅ `OrganizationRelationshipFactory`
    - Seeder Priority: **LOW - EIGHTH**

127. **`OrganizationHierarchy`** - Organization hierarchies
    - Dependencies: `Business` (parent_id, child_id)
    - UUID: ✅ Yes
    - Factory: ✅ `OrganizationHierarchyFactory`
    - Seeder Priority: **LOW - EIGHTH**

128. **`RssFeed`** - RSS feeds
    - Dependencies: `Business` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `RssFeedFactory`
    - Seeder Priority: **LOW - EIGHTH**

129. **`RssFeedItem`** - RSS feed items
    - Dependencies: `RssFeed`
    - UUID: ✅ Yes
    - Factory: ✅ `RssFeedItemFactory`
    - Seeder Priority: **LOW - EIGHTH**

130. **`NewsArticleDraft`** - News article drafts
    - Dependencies: `NewsArticle`
    - UUID: ✅ Yes
    - Factory: ✅ `NewsArticleDraftFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

131. **`NewsFactCheck`** - News fact checks
    - Dependencies: `NewsArticle`
    - UUID: ✅ Yes
    - Factory: ✅ `NewsFactCheckFactory`
    - Seeder Priority: **LOW - EIGHTH**

132. **`NewsWorkflowRun`** - Workflow runs
    - Dependencies: `Region`, `WriterAgent` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `NewsWorkflowRunFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

133. **`NewsWorkflowSetting`** - Workflow settings
    - Dependencies: `Region`
    - UUID: ✅ Yes
    - Factory: ✅ `NewsWorkflowSettingFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

134. **`NewsFetchFrequency`** - Fetch frequencies
    - Dependencies: `RssFeed`
    - UUID: ✅ Yes
    - Factory: ✅ `NewsFetchFrequencyFactory`
    - Seeder Priority: **LOW - EIGHTH**

135. **`WriterAgent`** - Writer agents
    - Dependencies: `Region` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `WriterAgentFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

136. **`DayNewsPostPayment`** - Day News post payments
    - Dependencies: `DayNewsPost`, `User`
    - UUID: ✅ Yes
    - Factory: ✅ `DayNewsPostPaymentFactory`
    - Seeder Priority: **MEDIUM - EIGHTH**

137. **`EventExtractionDraft`** - Event extraction drafts
    - Dependencies: `NewsArticle`
    - UUID: ✅ Yes
    - Factory: ✅ `EventExtractionDraftFactory`
    - Seeder Priority: **LOW - EIGHTH**

138. **`SearchHistory`** - Search history
    - Dependencies: `User` (optional)
    - UUID: ✅ Yes
    - Factory: ✅ `SearchHistoryFactory`
    - Seeder Priority: **LOW - EIGHTH**

139. **`SearchSuggestion`** - Search suggestions
    - Dependencies: None
    - UUID: ✅ Yes
    - Factory: ✅ `SearchSuggestionFactory`
    - Seeder Priority: **LOW - EIGHTH**

140. **`CrossDomainAuthToken`** - Cross-domain auth tokens
    - Dependencies: `User`
    - UUID: ✅ Yes
    - Factory: ✅ `CrossDomainAuthTokenFactory`
    - Seeder Priority: **LOW - EIGHTH**

141. **`Credits`** - Credits system
    - Dependencies: `Workspace`
    - UUID: ✅ Yes
    - Factory: ❌ No factory (check if needed)
    - Seeder Priority: **LOW - EIGHTH**

142. **`SMBCrmCustomer`** - Legacy SMB CRM customers
    - Dependencies: `Business`
    - UUID: ✅ Yes
    - Factory: ✅ `SMBCrmCustomerFactory`
    - Seeder Priority: **LOW - EIGHTH**

143. **`SMBCrmInteraction`** - Legacy SMB CRM interactions
    - Dependencies: `SMBCrmCustomer`
    - UUID: ✅ Yes
    - Factory: ✅ `SMBCrmInteractionFactory`
    - Seeder Priority: **LOW - EIGHTH**

---

## Part 4: Seeding Strategy

### 4.1 Seeding Order (Dependency-Based)

#### Phase 1: Foundation (Level 0)
**Priority: CRITICAL**

1. **`RoleSeeder`** - Create default roles
   - Roles: `owner`, `admin`, `member`, `viewer`
   - No dependencies

2. **`UserSeeder`** - Create base users
   - Create 10-20 users
   - No dependencies
   - Ensure unique emails

3. **`TenantSeeder`** - Create CRM tenants
   - Create 3-5 tenants
   - No dependencies
   - Ensure unique subdomains

#### Phase 2: Core Infrastructure (Level 1)

4. **`WorkspaceSeeder`** - Create workspaces
   - Create 5-10 workspaces
   - Assign owners from UserSeeder
   - Link users to workspaces

5. **`RegionSeeder`** - Create regions
   - Create hierarchical regions (state → county → city → neighborhood)
   - Handle self-referencing parent_id
   - Create 50-100 regions

6. **`IndustrySeeder`** - Create industries
   - Create 20-30 industries
   - No dependencies

#### Phase 3: Secondary Infrastructure (Level 2)

7. **`WorkspaceMembershipSeeder`** - Create memberships
   - Link users to workspaces
   - Assign roles

8. **`RegionZipcodeSeeder`** - Create zipcodes
   - Link zipcodes to regions

9. **`AccountManagerSeeder`** - Create account managers
   - Link to tenants and users

10. **`BusinessTemplateSeeder`** - Create business templates
    - Link to industries

#### Phase 4: Content Models (Level 3)

11. **`BusinessSeeder`** - Create businesses
    - Link to workspaces
    - Create 50-100 businesses

12. **`SmbBusinessSeeder`** - Create CRM businesses
    - Link to tenants
    - Create 100-200 businesses
    - Ensure unique google_place_id

13. **`VenueSeeder`** - Create venues
    - Link to workspaces
    - Create 30-50 venues

14. **`PerformerSeeder`** - Create performers
    - Link to workspaces
    - Create 50-100 performers

15. **`StoreSeeder`** - Create stores
    - Link to workspaces
    - Create 20-30 stores

16. **`CommunitySeeder`** - Create communities
    - Link to workspaces
    - Create 10-20 communities

17. **`HubSeeder`** - Create hubs
    - Link to workspaces
    - Create 10-15 hubs

18. **`TagSeeder`** - Create tags
    - Create 50-100 tags
    - Ensure unique slugs

19. **`CreatorProfileSeeder`** - Create creator profiles
    - Link to users
    - Create 10-20 creators

#### Phase 5: Primary Content (Level 4)

20. **`EventSeeder`** - Create events
    - Link to workspaces, venues, performers
    - Create 100-200 events

21. **`DayNewsPostSeeder`** - Create Day News posts
    - Link to workspaces, users
    - Create 50-100 posts

22. **`NewsArticleSeeder`** - Create news articles
    - Link to regions, writer agents
    - Create 100-200 articles

23. **`ProductSeeder`** - Create products
    - Link to stores
    - Create 100-200 products

24. **`CustomerSeeder`** - Create CRM customers
    - Link to tenants, SMB businesses
    - Create 200-500 customers
    - Ensure unique emails

25. **`BusinessHoursSeeder`** - Create business hours
    - Link to SMB businesses
    - Create hours for each business

26. **`BusinessPhotoSeeder`** - Create business photos
    - Link to SMB businesses
    - Create 5-10 photos per business

27. **`BusinessReviewSeeder`** - Create business reviews
    - Link to SMB businesses, customers
    - Create 2-5 reviews per business

28. **`BusinessAttributeSeeder`** - Create business attributes
    - Link to SMB businesses

#### Phase 6: User-Generated Content (Level 5)

29. **`ArticleCommentSeeder`** - Create article comments
    - Link to Day News posts, users
    - Handle parent_id for nested comments
    - Create 200-500 comments

30. **`ReviewSeeder`** - Create reviews
    - Link to venues, performers (polymorphic)
    - Create 100-200 reviews

31. **`RatingSeeder`** - Create ratings
    - Link to venues, performers (polymorphic)
    - Create 200-400 ratings

32. **`FollowSeeder`** - Create follows
    - Link to users, tags, events (polymorphic)
    - Create 500-1000 follows

33. **`BookingSeeder`** - Create bookings
    - Link to events, venues, performers, workspaces, users
    - Create 100-200 bookings

34. **`TicketPlanSeeder`** - Create ticket plans
    - Link to events
    - Create 2-5 plans per event

35. **`TicketOrderSeeder`** - Create ticket orders
    - Link to events, users
    - Create 200-500 orders

36. **`TicketOrderItemSeeder`** - Create order items
    - Link to orders, ticket plans
    - Create items for each order

37. **`OrderSeeder`** - Create e-commerce orders
    - Link to stores, users
    - Create 100-200 orders

38. **`OrderItemSeeder`** - Create order items
    - Link to orders, products
    - Create items for each order

39. **`CartSeeder`** - Create shopping carts
    - Link to users, stores
    - Create 50-100 carts

40. **`CartItemSeeder`** - Create cart items
    - Link to carts, products
    - Create items for each cart

41. **`CommunityThreadSeeder`** - Create threads
    - Link to communities, users
    - Create 200-500 threads

42. **`CommunityMemberSeeder`** - Create members
    - Link to communities, users
    - Create memberships

43. **`CommunityThreadReplySeeder`** - Create replies
    - Link to threads, users
    - Create 500-1000 replies

44. **`SocialPostSeeder`** - Create social posts
    - Link to users, workspaces
    - Create 500-1000 posts

45. **`SocialGroupSeeder`** - Create social groups
    - Link to users, workspaces
    - Create 20-30 groups

46. **`SocialGroupMemberSeeder`** - Create group members
    - Link to groups, users
    - Create memberships

47. **`SocialGroupPostSeeder`** - Create group posts
    - Link to groups, users
    - Create 100-200 posts

48. **`ConversationSeeder`** - Create conversations
    - Link to users
    - Create 50-100 conversations

49. **`ConversationParticipantSeeder`** - Create participants
    - Link to conversations, users
    - Create 2-4 participants per conversation

50. **`MessageSeeder`** - Create messages
    - Link to conversations, users
    - Create 500-1000 messages

51. **`DealSeeder`** - Create CRM deals
    - Link to tenants, customers
    - Create 100-200 deals

52. **`CampaignSeeder`** - Create campaigns
    - Link to tenants
    - Create 20-30 campaigns

53. **`CampaignRecipientSeeder`** - Create recipients
    - Link to campaigns, customers
    - Create recipients for each campaign

54. **`InteractionSeeder`** - Create interactions
    - Link to tenants, customers, users
    - Create 200-500 interactions

55. **`TaskSeeder`** - Create tasks
    - Link to tenants, customers, users
    - Create 200-500 tasks

#### Phase 7: Supporting Content (Level 6)

56. **`AnnouncementSeeder`** - Create announcements
    - Link to users, workspaces
    - Create 50-100 announcements

57. **`ClassifiedSeeder`** - Create classifieds
    - Link to users, workspaces
    - Create 100-200 classifieds

58. **`CouponSeeder`** - Create coupons
    - Link to users, businesses
    - Create 50-100 coupons

59. **`PhotoSeeder`** - Create photos
    - Link to users, workspaces
    - Create 200-500 photos

60. **`PhotoAlbumSeeder`** - Create photo albums
    - Link to users, workspaces
    - Create 50-100 albums

61. **`PodcastSeeder`** - Create podcasts
    - Link to creator profiles, workspaces
    - Create 20-30 podcasts

62. **`PodcastEpisodeSeeder`** - Create episodes
    - Link to podcasts
    - Create 5-10 episodes per podcast

63. **`CalendarSeeder`** - Create calendars
    - Link to workspaces, users
    - Create 20-30 calendars

64. **`CalendarEventSeeder`** - Create calendar events
    - Link to calendars, events
    - Create events for each calendar

65. **`PromoCodeSeeder`** - Create promo codes
    - Link to events
    - Create 20-30 promo codes

#### Phase 8: System & Configuration (Level 7)

66. **`NotificationSeeder`** - Create notifications
    - Link to users (polymorphic)
    - Create 200-500 notifications

67. **`NotificationSubscriptionSeeder`** - Create subscriptions
    - Link to users
    - Create subscriptions

68. **`SocialAccountSeeder`** - Create OAuth accounts
    - Link to users
    - Create 50-100 accounts

69. **`EmailSubscriberSeeder`** - Create email subscribers
    - Create 200-500 subscribers
    - Ensure unique emails

70. **`EmailCampaignSeeder`** - Create email campaigns
    - Link to workspaces
    - Create 10-20 campaigns

71. **`EmailTemplateSeeder`** - Create email templates
    - Link to workspaces
    - Create 10-20 templates

72. **`AdvertisementSeeder`** - Create advertisements
    - Link to workspaces
    - Create 20-30 advertisements

73. **`AdCampaignSeeder`** - Create ad campaigns
    - Link to advertisements
    - Create campaigns

74. **`WriterAgentSeeder`** - Create writer agents
    - Link to regions
    - Create 10-20 agents

75. **`NewsWorkflowSettingSeeder`** - Create workflow settings
    - Link to regions
    - Create settings

76. **`NewsWorkflowRunSeeder`** - Create workflow runs
    - Link to regions, writer agents
    - Create runs

77. **`RssFeedSeeder`** - Create RSS feeds
    - Link to businesses
    - Create 20-30 feeds

78. **`RssFeedItemSeeder`** - Create feed items
    - Link to feeds
    - Create items

79. **`NewsArticleDraftSeeder`** - Create drafts
    - Link to news articles
    - Create drafts

80. **`DayNewsPostPaymentSeeder`** - Create payments
    - Link to posts, users
    - Create payments

---

## Part 5: UUID & Relationship Handling

### 5.1 UUID Generation Strategy

#### For Models Using HasUuid Trait

Laravel's `HasUuids` trait automatically generates UUIDs. Ensure factories use:

```php
// In Factory definition()
return [
    'id' => Str::uuid(), // Explicit UUID generation
    // OR let Laravel handle it automatically (recommended)
];
```

**Best Practice:** Let Laravel handle UUID generation automatically. Don't manually set `id` in factories unless necessary.

#### For Foreign Keys

Always use factory relationships:

```php
// ✅ CORRECT
'user_id' => User::factory(),
'workspace_id' => Workspace::factory(),
'tenant_id' => Tenant::factory(),

// ❌ WRONG
'user_id' => Str::uuid(), // This won't match any user
```

### 5.2 Relationship Integrity

#### Polymorphic Relationships

For polymorphic relationships (Review, Rating, Follow):

```php
// Review factory example
return [
    'reviewable_type' => Venue::class, // or Performer::class, etc.
    'reviewable_id' => Venue::factory(),
    'user_id' => User::factory(),
];
```

#### Self-Referencing Relationships

For self-referencing relationships (Region, ArticleComment):

```php
// Region factory example
return [
    'parent_id' => null, // Top-level region
    // OR
    'parent_id' => Region::factory(), // Child region
];
```

#### Many-to-Many Relationships

Use pivot table seeders:

```php
// In seeder
$business->regions()->attach($region->id);
$event->regions()->attach($region->id);
```

### 5.3 Unique Constraints

#### Emails

```php
// User factory
'email' => $this->faker->unique()->safeEmail(),

// Customer factory
'email' => $this->faker->unique()->safeEmail(),
```

#### Slugs

```php
// Workspace factory
'slug' => Str::slug($this->faker->company()) . '-' . $this->faker->unique()->randomNumber(5),

// Tag factory
'slug' => Str::slug($this->faker->word()) . '-' . $this->faker->unique()->randomNumber(5),
```

#### Google Place IDs

```php
// SmbBusiness factory
'google_place_id' => 'ChIJ' . $this->faker->unique()->regexify('[A-Za-z0-9]{27}'),
```

### 5.4 Nullable Foreign Keys

Handle nullable foreign keys correctly:

```php
// Event factory - venue_id is nullable
'venue_id' => $this->faker->optional()->passthrough(Venue::factory()),

// OR
'venue_id' => null, // Explicit null
```

---

## Part 6: Implementation Plan

### 6.1 Phase 1: Foundation Seeders (Week 1)

**Priority: CRITICAL**

1. Create `RoleSeeder`
2. Create `UserSeeder`
3. Create `TenantSeeder`
4. Update `DatabaseSeeder` to call these first

**Estimated Time:** 4-6 hours

### 6.2 Phase 2: Core Infrastructure Seeders (Week 1-2)

**Priority: HIGH**

5. Create `WorkspaceSeeder`
6. Create `RegionSeeder` (handle hierarchy)
7. Create `IndustrySeeder`
8. Create `WorkspaceMembershipSeeder`
9. Create `AccountManagerSeeder`

**Estimated Time:** 8-12 hours

### 6.3 Phase 3: Content Model Seeders (Week 2)

**Priority: HIGH**

10. Create `BusinessSeeder`
11. Create `SmbBusinessSeeder`
12. Create `VenueSeeder`
13. Create `PerformerSeeder`
14. Create `StoreSeeder`
15. Create `CommunitySeeder`
16. Create `TagSeeder`

**Estimated Time:** 12-16 hours

### 6.4 Phase 4: Primary Content Seeders (Week 2-3)

**Priority: HIGH**

17. Create `EventSeeder`
18. Create `DayNewsPostSeeder`
19. Create `NewsArticleSeeder`
20. Create `ProductSeeder`
21. Create `CustomerSeeder`
22. Create CRM business detail seeders

**Estimated Time:** 16-20 hours

### 6.5 Phase 5: User-Generated Content Seeders (Week 3-4)

**Priority: MEDIUM**

23. Create `ArticleCommentSeeder`
24. Create `ReviewSeeder` / `RatingSeeder`
25. Create `BookingSeeder`
26. Create `TicketOrderSeeder`
27. Create `OrderSeeder`
28. Create `CommunityThreadSeeder`
29. Create `SocialPostSeeder`
30. Create `ConversationSeeder` / `MessageSeeder`
31. Create CRM seeders (Deal, Campaign, Interaction, Task)

**Estimated Time:** 20-24 hours

### 6.6 Phase 6: Supporting Content Seeders (Week 4)

**Priority: MEDIUM**

32. Create `AnnouncementSeeder`
33. Create `ClassifiedSeeder`
34. Create `CouponSeeder`
35. Create `PhotoSeeder` / `PhotoAlbumSeeder`
36. Create `PodcastSeeder`
37. Create `CalendarSeeder`

**Estimated Time:** 12-16 hours

### 6.7 Phase 7: System Seeders (Week 4-5)

**Priority: LOW**

38. Create `NotificationSeeder`
39. Create `EmailSubscriberSeeder` / `EmailCampaignSeeder`
40. Create `AdvertisementSeeder`
41. Create `WriterAgentSeeder`
42. Create `RssFeedSeeder`

**Estimated Time:** 8-12 hours

### 6.8 Phase 8: Testing & Refinement (Week 5)

**Priority: CRITICAL**

43. Test all seeders individually
44. Test full database seed
45. Verify UUID relationships
46. Verify unique constraints
47. Verify foreign key integrity
48. Performance testing
49. Documentation

**Estimated Time:** 8-12 hours

---

## Part 7: Quality Assurance Checklist

### 7.1 For Each Seeder

- [ ] Seeder class exists and extends `Seeder`
- [ ] Factory exists for the model
- [ ] Factory generates UUIDs correctly (if UUID model)
- [ ] Factory handles foreign keys correctly
- [ ] Factory respects unique constraints
- [ ] Seeder creates realistic data quantities
- [ ] Seeder handles relationships correctly
- [ ] Seeder can be run multiple times (idempotent)
- [ ] Seeder doesn't create duplicate data

### 7.2 For Database Seed

- [ ] All seeders run in correct dependency order
- [ ] No foreign key constraint violations
- [ ] No unique constraint violations
- [ ] All UUIDs are valid UUIDs
- [ ] All relationships are valid
- [ ] Polymorphic relationships work correctly
- [ ] Self-referencing relationships work correctly
- [ ] Many-to-many relationships work correctly

### 7.3 Performance

- [ ] Full database seed completes in reasonable time (< 5 minutes)
- [ ] No memory exhaustion
- [ ] Efficient use of database transactions
- [ ] Batch inserts where appropriate

---

## Part 8: Next Steps

1. **Review this plan** with the team
2. **Prioritize seeders** based on business needs
3. **Start with Phase 1** (Foundation seeders)
4. **Test incrementally** after each phase
5. **Document any issues** encountered
6. **Refine plan** based on learnings

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025  
**Status:** Ready for Implementation


