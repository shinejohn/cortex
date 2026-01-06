# Comprehensive API Test Plan

**Date:** December 29, 2025  
**Status:** In Progress  
**Total Controllers:** 64  
**Estimated Tests:** 500+ test cases

## Test Strategy

### 1. Test Structure
- **Feature Tests:** Test full HTTP request/response cycle
- **Unit Tests:** Test individual controller methods (if needed)
- **Integration Tests:** Test relationships and nested resources

### 2. Test Coverage Per Controller
Each controller should have tests for:
- ✅ **Index** - List resources (with pagination, filters, sorting)
- ✅ **Show** - Get single resource
- ✅ **Store** - Create resource (with validation)
- ✅ **Update** - Update resource (with validation)
- ✅ **Destroy** - Delete resource
- ✅ **Authorization** - Who can access what
- ✅ **Validation** - Invalid inputs
- ✅ **Relationships** - Nested resources
- ✅ **Edge Cases** - Empty results, pagination boundaries

## Phase-by-Phase Test Implementation

### Phase 1: Fix Existing Tests ✅ (In Progress)
- [x] Fix AuthTest (4 tests)
- [x] Fix PostTest (3 tests)
- [x] Fix CustomerTest (2 tests)

### Phase 2: Shared APIs (10 controllers)
1. **AuthController** - 8 tests
   - Register, Login, Logout, Refresh, User, Sessions, Password Reset, Magic Link
2. **UserController** - 10 tests
   - Index, Show, Update, Destroy, Me, Posts, Activity
3. **WorkspaceController** - 8 tests
   - CRUD + Members, Invitations
4. **WorkspaceMemberController** - 6 tests
   - CRUD operations
5. **WorkspaceInvitationController** - 6 tests
   - CRUD operations
6. **TenantController** - 6 tests
   - CRUD operations
7. **AccountManagerController** - 6 tests
   - CRUD operations
8. **RoleController** - 6 tests
   - CRUD operations
9. **SocialAccountController** - 6 tests
   - CRUD operations
10. **RegionController** - 8 tests
    - CRUD + Search, ZIP codes

**Total Phase 2:** ~70 tests

### Phase 3: Publishing Core APIs (7 controllers)
1. **PostController** - 15 tests
   - CRUD + Featured, Trending, Regions, Tags, Comments, Payments, Sponsor
2. **NewsArticleController** - 10 tests
   - CRUD + Approve, Reject, Publish
3. **TagController** - 8 tests
   - CRUD + Posts with tag
4. **CommentController** - 10 tests
   - CRUD + Like, Unlike, Report
5. **EventController** - 12 tests
   - CRUD + Upcoming, Calendar, RSVP, Venue, Performer
6. **VenueController** - 10 tests
   - CRUD + Events, Nearby, Featured
7. **PerformerController** - 10 tests
   - CRUD + Shows, Featured, Trending

**Total Phase 3:** ~75 tests

### Phase 4: Publishing Extended APIs (16 controllers)
1. **AnnouncementController** - 6 tests
2. **ClassifiedController** - 8 tests (CRUD + Renew)
3. **CouponController** - 8 tests (CRUD + Claim)
4. **LegalNoticeController** - 6 tests
5. **MemorialController** - 8 tests (CRUD + Tributes)
6. **PhotoController** - 6 tests
7. **PhotoAlbumController** - 8 tests (CRUD + Add Photos)
8. **PodcastController** - 8 tests (CRUD + Episodes)
9. **PodcastEpisodeController** - 8 tests (CRUD + Play)
10. **CreatorProfileController** - 8 tests (CRUD + Content, Follow)
11. **BusinessController** - 12 tests (CRUD + Search, Nearby, Subscriptions, FAQs, Surveys, Achievements)
12. **BusinessSubscriptionController** - 6 tests
13. **BusinessTemplateController** - 6 tests
14. **BusinessFaqController** - 6 tests
15. **BusinessSurveyController** - 8 tests (CRUD + Responses)
16. **AchievementController** - 6 tests

**Total Phase 4:** ~120 tests

### Phase 5: CRM Core APIs (10 controllers)
1. **SmbBusinessController** - 12 tests (CRUD + Search, Customers, Reviews, Hours, Photos, Attributes)
2. **CustomerController** - 12 tests (CRUD + Search, Interactions, Deals, Tasks, Campaigns)
3. **DealController** - 10 tests (CRUD + Pipeline, Stages)
4. **CampaignController** - 10 tests (CRUD + Send, Recipients, Analytics)
5. **InteractionController** - 10 tests (CRUD + By Customer/Business)
6. **TaskController** - 12 tests (CRUD + Complete, Assign, By Customer/User)
7. **BusinessHoursController** - 6 tests
8. **BusinessPhotoController** - 6 tests
9. **BusinessReviewController** - 6 tests
10. **BusinessAttributeController** - 6 tests

**Total Phase 5:** ~90 tests

### Phase 6: Social & Community APIs (6 controllers)
1. **SocialPostController** - 10 tests (CRUD + Like, Unlike)
2. **SocialGroupController** - 10 tests (CRUD + Join, Leave)
3. **CommunityController** - 10 tests (CRUD + Threads, Members)
4. **CommunityThreadController** - 8 tests
5. **ConversationController** - 8 tests (CRUD + Read Status)
6. **MessageController** - 6 tests

**Total Phase 6:** ~52 tests

### Phase 7: E-commerce & Ticketing APIs (7 controllers)
1. **StoreController** - 8 tests (CRUD + Products)
2. **ProductController** - 6 tests
3. **CartController** - 8 tests (View, Add Item, Remove Item, Clear)
4. **OrderController** - 8 tests (List, View, Create)
5. **TicketPlanController** - 8 tests
6. **TicketOrderController** - 8 tests
7. **PromoCodeController** - 6 tests (List, Validate)

**Total Phase 7:** ~52 tests

### Phase 8: System & Integration APIs (6 controllers)
1. **CalendarController** - 8 tests (CRUD + Events, Follow)
2. **HubController** - 6 tests
3. **AdvertisementController** - 6 tests (List, Track Impressions/Clicks)
4. **EmailCampaignController** - 8 tests (CRUD + Send)
5. **EmergencyAlertController** - 6 tests
6. **SearchController** - 6 tests

**Total Phase 8:** ~40 tests

## Test Implementation Checklist

For each controller test file:
- [ ] Setup: Use RefreshDatabase trait
- [ ] Create factories for test data
- [ ] Test authentication requirement
- [ ] Test authorization (who can access)
- [ ] Test validation rules
- [ ] Test successful CRUD operations
- [ ] Test error cases (404, 403, 422)
- [ ] Test relationships/nested resources
- [ ] Test pagination
- [ ] Test filtering/sorting
- [ ] Test edge cases

## Estimated Timeline

- **Phase 1 (Fix Existing):** 2 hours
- **Phase 2 (Shared APIs):** 8 hours
- **Phase 3 (Publishing Core):** 8 hours
- **Phase 4 (Publishing Extended):** 12 hours
- **Phase 5 (CRM Core):** 10 hours
- **Phase 6 (Social & Community):** 6 hours
- **Phase 7 (E-commerce & Ticketing):** 6 hours
- **Phase 8 (System & Integration):** 4 hours

**Total Estimated Time:** 56 hours

## Success Criteria

- ✅ All tests pass
- ✅ 80%+ code coverage
- ✅ All CRUD operations tested
- ✅ All authorization rules tested
- ✅ All validation rules tested
- ✅ All relationships tested
- ✅ Edge cases covered


