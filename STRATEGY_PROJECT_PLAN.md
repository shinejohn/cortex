# Project Plan: Advertising, Email & Emergency Systems Implementation

**Date:** December 23, 2025  
**Based On:** Strategy Document (`cursor_instructions_advertising_email_revised.md.pdf`)  
**Gap Analysis:** `STRATEGY_GAP_ANALYSIS.md`  
**AWS SNS Decision:** `AWS_SNS_VS_TWILIO_COMPARISON.md`  
**Estimated Duration:** 2-3 weeks (69-97 hours)

---

## Executive Summary

This project plan addresses the **95% gap** between the current basic advertisement system and the comprehensive advertising, email engagement, and emergency notification platform outlined in the strategy document.

**Key Deliverables:**
1. Campaign-based advertising system (CPM/CPC/flat rate/sponsored)
2. Email engagement platform (daily digests, newsletters, breaking news, SMB reports)
3. Emergency notification system (alerts, SMS, municipal partners)
4. AI content generation integration (Claude API)

---

## PHASE 1: ADVERTISING SYSTEM ENHANCEMENT

**Duration:** 5-7 days  
**Priority:** High  
**Dependencies:** None

### 1.1 Database Migrations (Day 1)

**Tasks:**
- [ ] Create `ad_campaigns` migration
  - Campaign management (budget, targeting, platforms, status)
  - Link to `businesses` table (advertiser)
  - Support CPM/CPC/flat rate/sponsored types
- [ ] Create `ad_creatives` migration
  - Creative assets (headline, body, images, video, audio)
  - Link to campaigns
  - Format support (leaderboard, medium_rectangle, sidebar, native, sponsored_article, audio, video)
- [ ] Create `ad_placements` migration
  - Placement definitions (platform, slot, format, pricing)
  - Base CPM/CPC rates per placement
- [ ] Create `ad_inventory` migration
  - Daily inventory tracking (impressions sold/delivered, revenue)
  - Link to placements and communities
- [ ] Create `ad_impressions` migration
  - Detailed impression tracking (session, IP hash, cost, timestamp)
  - Link to creatives and placements
- [ ] Create `ad_clicks` migration
  - Detailed click tracking (linked to impressions, cost)
  - Click fraud prevention

**Estimated Time:** 2-3 hours

### 1.2 Eloquent Models (Day 1-2)

**Tasks:**
- [ ] Create `AdCampaign` model
  - Relationships: advertiser, creatives
  - Scopes: active, expired, byStatus
  - Methods: isActive(), getRemainingBudgetAttribute()
- [ ] Create `AdCreative` model
  - Relationships: campaign, impressions, clicks
  - Scopes: active, byFormat, byStatus
  - Methods: getCtrAttribute()
- [ ] Create `AdPlacement` model
  - Relationships: inventory, impressions
  - Scopes: active, byPlatform
- [ ] Create `AdInventory` model
  - Relationships: placement, community
  - Methods: updateInventory()
- [ ] Create `AdImpression` model
  - Relationships: creative, placement, community, click
  - Scopes: byDateRange, byCreative
- [ ] Create `AdClick` model
  - Relationships: impression, creative
  - Scopes: byDateRange

**Estimated Time:** 2-3 hours

### 1.3 Ad Server Service (Day 2-3)

**Tasks:**
- [ ] Create `AdServerService`
  - `getAd()` - Select best ad for placement/community
  - `selectCreative()` - Campaign selection logic with frequency capping
  - `recordImpression()` - Track impressions with cost calculation
  - `recordClick()` - Track clicks with cost calculation
  - `getCampaignStats()` - Performance analytics
  - Frequency capping (max 3 impressions per hour per session)
  - Weighted random selection (based on remaining budget)
  - Budget tracking (CPM/CPC cost calculation)
- [ ] Update `AdvertisementService` (backward compatibility)
  - Keep existing methods for current ads
  - Add migration path for existing ads

**Estimated Time:** 4-6 hours

### 1.4 Admin Controllers (Day 3-4)

**Tasks:**
- [ ] Create `Admin\Advertising\CampaignController`
  - CRUD operations (index, create, store, show, edit, update, destroy)
  - Status management (active, paused, cancelled)
  - Performance stats
- [ ] Create `Admin\Advertising\CreativeController`
  - CRUD operations
  - Creative approval workflow
- [ ] Create `Admin\Advertising\PlacementController`
  - CRUD operations
  - Pricing management
- [ ] Create `Admin\Advertising\ReportController`
  - Campaign performance reports
  - Export functionality (CSV/PDF)

**Estimated Time:** 4-6 hours

### 1.5 Public Ad Serving (Day 4)

**Tasks:**
- [ ] Create `Ads\AdController`
  - `serve()` - Return ad JSON for frontend
  - `click()` - Track clicks and redirect
- [ ] Update existing controllers to use new ad system
  - Migrate from `AdvertisementService` to `AdServerService`
  - Maintain backward compatibility

**Estimated Time:** 2-3 hours

### 1.6 Frontend Admin Pages (Day 4-5)

**Tasks:**
- [ ] Create `Admin/Advertising/Campaigns/Index.tsx`
  - List campaigns with filters (status, search)
  - Performance stats display
- [ ] Create `Admin/Advertising/Campaigns/Create.tsx`
  - Campaign creation form
  - Budget, targeting, platform selection
- [ ] Create `Admin/Advertising/Campaigns/Show.tsx`
  - Campaign details
  - Performance charts (impressions/clicks over time)
  - Creative management
- [ ] Create `Admin/Advertising/Campaigns/Edit.tsx`
  - Campaign editing form
- [ ] Create `Admin/Advertising/Creatives/` pages
  - Creative CRUD pages
- [ ] Create `Admin/Advertising/Placements/` pages
  - Placement management pages

**Estimated Time:** 6-8 hours

### 1.7 Testing & Documentation (Day 5)

**Tasks:**
- [ ] Unit tests for models
- [ ] Integration tests for AdServerService
- [ ] Test campaign selection logic
- [ ] Test budget tracking
- [ ] Test frequency capping
- [ ] Documentation: API docs, admin guide

**Estimated Time:** 2-3 hours

**Phase 1 Total: ~18-26 hours**

---

## PHASE 2: EMAIL ENGAGEMENT SYSTEM

**Duration:** 6-8 days  
**Priority:** High  
**Dependencies:** Phase 1 (can run in parallel)

### 2.1 Database Migrations (Day 1)

**Tasks:**
- [ ] Create `email_subscribers` migration
  - Subscriber management (email, preferences, status)
  - Link to communities and businesses
  - Support reader/SMB types
- [ ] Create `email_templates` migration
  - Template management (HTML/text, variables, versioning)
  - Template types (daily_digest, breaking_news, weekly_newsletter, smb_report, emergency, transactional)
- [ ] Create `email_campaigns` migration
  - Campaign management (type, status, segmentation)
  - Link to templates and communities
  - Analytics fields (sent, delivered, opened, clicked, bounced)
- [ ] Create `email_sends` migration
  - Individual send tracking (opens, clicks, bounces, complaints)
  - Link to campaigns and subscribers
- [ ] Create `newsletter_subscriptions` migration
  - Paid newsletter subscriptions (Stripe integration)
  - Link to subscribers

**Estimated Time:** 2-3 hours

### 2.2 Eloquent Models (Day 1-2)

**Tasks:**
- [ ] Create `EmailSubscriber` model
  - Relationships: community, business, sends, newsletterSubscription, emergencySubscription
  - Scopes: active, byType, byCommunity
  - Methods: wantsDigest(), wantsBreakingNews(), wantsNewsletter()
- [ ] Create `EmailTemplate` model
  - Relationships: campaigns
  - Scopes: active, byType
- [ ] Create `EmailCampaign` model
  - Relationships: community, template, sends
  - Methods: getOpenRateAttribute(), getClickRateAttribute()
- [ ] Create `EmailSend` model
  - Relationships: campaign, subscriber
  - Scopes: byStatus, byDateRange
- [ ] Create `NewsletterSubscription` model
  - Relationships: subscriber
  - Stripe integration methods

**Estimated Time:** 2-3 hours

### 2.3 Email Services (Day 2-4)

**Tasks:**
- [ ] Create `EmailGeneratorService`
  - `generateDailyDigest()` - AI-powered daily digest
  - `generateWeeklyNewsletter()` - AI-powered weekly newsletter
  - `generateBreakingNews()` - Immediate breaking news alert
  - `generateSmbReport()` - SMB performance report
  - `gatherDigestContent()` - Collect content for digest
  - `renderDigestHtml()` - Render HTML with ads
  - `getOptimalSendTime()` - Timezone-aware send times
  - `queueRecipients()` - Queue email sends
- [ ] Create `EmailDeliveryService`
  - `sendEmail()` - Send via SES/Postmark
  - `trackOpen()` - Pixel tracking
  - `trackClick()` - Link tracking
  - `handleBounce()` - Bounce handling
  - `handleComplaint()` - Complaint handling
- [ ] Create `AIContentService` (if not exists)
  - `generateDigestContent()` - Claude API integration
  - `generateNewsletterContent()` - Claude API integration
  - `generateSubjectLines()` - A/B testing variants
  - `buildDigestPrompt()` - Prompt engineering
  - `parseDigestResponse()` - JSON parsing

**Estimated Time:** 6-8 hours

### 2.4 Admin Controllers (Day 4-5)

**Tasks:**
- [ ] Create `Admin\Email\CampaignController`
  - CRUD operations
  - `generateDigest()` - Trigger daily digest generation
  - `generateNewsletter()` - Trigger weekly newsletter generation
  - Campaign analytics
- [ ] Create `Admin\Email\SubscriberController`
  - Subscriber management (index, show, edit, update, destroy)
  - Import/export functionality
- [ ] Create `Admin\Email\TemplateController`
  - Template CRUD operations
  - Template preview
- [ ] Create public `EmailSubscriptionController`
  - Signup form
  - Unsubscribe page
  - Preference management

**Estimated Time:** 4-6 hours

### 2.5 Queue Jobs (Day 5)

**Tasks:**
- [ ] Create `SendEmailJob`
  - Queue email sends
  - Track delivery status
  - Handle failures
- [ ] Create `ProcessEmailOpensJob`
  - Process open tracking pixels
- [ ] Create `ProcessEmailClicksJob`
  - Process click tracking
- [ ] Create `ProcessEmailBouncesJob`
  - Handle bounces from SES/Postmark webhooks
- [ ] Create `ProcessEmailComplaintsJob`
  - Handle complaints from SES/Postmark webhooks

**Estimated Time:** 2-3 hours

### 2.6 Scheduled Commands (Day 5)

**Tasks:**
- [ ] Create `GenerateDailyDigests` command
  - Run daily at 2 AM
  - Generate digests for all active communities
- [ ] Create `GenerateWeeklyNewsletters` command
  - Run weekly on Saturday at 10 PM
- [ ] Create `GenerateSmbReports` command
  - Run weekly on Sunday at 6 PM
- [ ] Create `ProcessEmailQueue` command
  - Run every minute
  - Process queued email sends
- [ ] Update `app/Console/Kernel.php`
  - Schedule all commands

**Estimated Time:** 2-3 hours

### 2.7 Frontend Admin Pages (Day 5-6)

**Tasks:**
- [ ] Create `Admin/Email/Campaigns/Index.tsx`
  - List campaigns with filters
  - Performance metrics
- [ ] Create `Admin/Email/Campaigns/Show.tsx`
  - Campaign details
  - Analytics charts (opens/clicks over time)
- [ ] Create `Admin/Email/Subscribers/Index.tsx`
  - Subscriber list with filters
  - Import/export buttons
- [ ] Create `Admin/Email/Templates/Index.tsx`
  - Template list
- [ ] Create `Admin/Email/Templates/Edit.tsx`
  - Template editor (HTML/text)
- [ ] Create public `Email/Subscribe.tsx`
  - Signup form
- [ ] Create public `Email/Unsubscribe.tsx`
  - Unsubscribe page
- [ ] Create public `Email/Preferences.tsx`
  - Preference management

**Estimated Time:** 6-8 hours

### 2.8 Email Templates (Day 6-7)

**Tasks:**
- [ ] Create Blade templates
  - `emails/digest.blade.php` - Daily digest template
  - `emails/newsletter.blade.php` - Weekly newsletter template
  - `emails/breaking-news.blade.php` - Breaking news template
  - `emails/smb-report.blade.php` - SMB report template
  - Responsive design
  - Unsubscribe links
  - Preference management links
- [ ] Create text versions
  - Plain text alternatives for all templates

**Estimated Time:** 2-3 hours

### 2.9 Testing & Documentation (Day 7-8)

**Tasks:**
- [ ] Unit tests for models
- [ ] Integration tests for EmailGeneratorService
- [ ] Test AI content generation
- [ ] Test email delivery
- [ ] Test open/click tracking
- [ ] Test bounce/complaint handling
- [ ] Documentation: API docs, admin guide, user guide

**Estimated Time:** 2-3 hours

**Phase 2 Total: ~23-31 hours**

---

## PHASE 3: EMERGENCY NOTIFICATION SYSTEM

**Duration:** 5-7 days  
**Priority:** Medium  
**Dependencies:** Phase 2 (email infrastructure)

### 3.1 Database Migrations (Day 1)

**Tasks:**
- [ ] Create `emergency_alerts` migration
  - Alert management (priority, category, message, instructions)
  - Link to communities and municipal partners
  - Status workflow (draft, active, expired, cancelled)
  - Delivery channels (email, SMS)
- [ ] Create `emergency_subscriptions` migration
  - User emergency preferences (email/SMS enabled)
  - Priority levels and categories filtering
  - Phone verification
  - SMS tier (none, basic)
- [ ] Create `emergency_deliveries` migration
  - Delivery tracking (email/SMS, status, external IDs)
  - Link to alerts and subscriptions
- [ ] Create `municipal_partners` migration
  - Municipal partner accounts (API keys, verification)
  - Allowed categories and priorities
  - Approval workflow
- [ ] Create `emergency_audit_log` migration
  - Audit trail for all alert actions
  - Link to alerts, users, municipal partners

**Estimated Time:** 2-3 hours

### 3.2 Eloquent Models (Day 1-2)

**Tasks:**
- [ ] Create `EmergencyAlert` model
  - Relationships: community, creator, municipalPartner, deliveries, auditLogs
  - Scopes: active, expired, byPriority, byCategory
  - Methods: isActive(), getPriorityColorAttribute()
- [ ] Create `EmergencySubscription` model
  - Relationships: subscriber, deliveries
  - Methods: shouldReceiveAlert(), canReceiveSms()
- [ ] Create `EmergencyDelivery` model
  - Relationships: alert, subscription
  - Scopes: byStatus, byChannel
- [ ] Create `MunicipalPartner` model
  - Relationships: alerts, primaryContact
  - Scopes: active, verified
- [ ] Create `EmergencyAuditLog` model
  - Relationships: alert, user, municipalPartner

**Estimated Time:** 2-3 hours

### 3.3 Emergency Services (Day 2-3)

**Tasks:**
- [ ] Create `EmergencyBroadcastService`
  - `createAlert()` - Create draft or active alert
  - `publishAlert()` - Publish draft alert
  - `broadcast()` - Broadcast to eligible subscribers
  - `cancelAlert()` - Cancel active alert
  - `queueEmailDelivery()` - Queue email sends
  - `queueSmsDelivery()` - Queue SMS sends
  - `getDeliveryStats()` - Delivery statistics
  - `logAction()` - Audit logging
- [ ] Create `SmsService`
  - `sendEmergencyAlert()` - Send SMS via AWS SNS
  - `verifyPhoneNumber()` - Phone verification
  - `sendVerificationCode()` - Send verification code
- [ ] Create `MunicipalPartnerService`
  - `createPartner()` - Create municipal partner account
  - `generateApiKey()` - Generate API key
  - `verifyApiKey()` - Verify API key for API requests
  - `approveAlert()` - Approval workflow

**Estimated Time:** 4-6 hours

### 3.4 SMS Integration (Day 3)

**Tasks:**
- [ ] Configure AWS SNS SMS
  - AWS credentials already configured (reuse `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
  - Add SNS config to `config/services.php`
  - Request SMS sandbox (for testing) or production access
  - Test SMS sending
- [ ] Create SNS webhook handler
  - Handle delivery status updates (SNS HTTP/HTTPS subscriptions)
  - Handle verification callbacks

**Estimated Time:** 1-2 hours (faster than Twilio - no new vendor setup)

**Note:** Using AWS SNS instead of Twilio provides:
- ✅ Lower cost (~14% cheaper per SMS)
- ✅ Unified AWS infrastructure (same credentials, monitoring, billing)
- ✅ Simpler integration (AWS SDK already available)
- ✅ No phone number rental fees
- ⚠️ Requires 7-10 days for production SMS access approval (sandbox available immediately)

See `AWS_SNS_VS_TWILIO_COMPARISON.md` for detailed comparison.

### 3.5 Admin Controllers (Day 3-4)

**Tasks:**
- [ ] Create `Admin\Emergency\AlertController`
  - CRUD operations
  - `publish()` - Publish draft alert
  - `cancel()` - Cancel active alert
  - Delivery stats
- [ ] Create `Admin\Emergency\SubscriptionController`
  - Subscription management
- [ ] Create `Admin\Emergency\MunicipalController`
  - Municipal partner management
  - API key generation
- [ ] Create `Api\Emergency\AlertController` (for municipal partners)
  - `create()` - Create alert via API
  - API key authentication
  - Approval workflow

**Estimated Time:** 4-6 hours

### 3.6 Queue Jobs (Day 4)

**Tasks:**
- [ ] Create `SendEmergencyEmail` job
  - High priority queue
  - Email delivery via EmailDeliveryService
  - Track delivery status
- [ ] Create `SendEmergencySms` job
  - Critical priority queue
  - SMS delivery via SmsService
  - Track delivery status

**Estimated Time:** 2-3 hours

### 3.7 Scheduled Commands (Day 4)

**Tasks:**
- [ ] Create `ExpireEmergencyAlerts` command
  - Run every 5 minutes
  - Auto-expire alerts past expiration date
- [ ] Update `app/Console/Kernel.php`
  - Schedule command

**Estimated Time:** 1 hour

### 3.8 Frontend Admin Pages (Day 4-5)

**Tasks:**
- [ ] Create `Admin/Emergency/Alerts/Index.tsx`
  - Alert list with filters (priority, status, community)
- [ ] Create `Admin/Emergency/Alerts/Create.tsx`
  - Alert creation form
  - Priority selection (critical, urgent, advisory, info)
  - Category selection
  - Channel selection (email, SMS)
  - Publish immediately option
- [ ] Create `Admin/Emergency/Alerts/Show.tsx`
  - Alert details
  - Delivery statistics
  - Audit log
  - Publish/Cancel actions
- [ ] Create `Admin/Emergency/Subscriptions/Index.tsx`
  - Subscription list
- [ ] Create `Admin/Emergency/Municipal/Index.tsx`
  - Municipal partner list
- [ ] Create `Admin/Emergency/Municipal/Create.tsx`
  - Partner creation form
  - API key generation

**Estimated Time:** 6-8 hours

### 3.9 Public Pages (Day 5)

**Tasks:**
- [ ] Create `Emergency/Subscribe.tsx`
  - Emergency subscription signup
  - Priority and category preferences
  - Phone verification (for SMS)
- [ ] Create `Emergency/Preferences.tsx`
  - Preference management
  - Unsubscribe option

**Estimated Time:** 2-3 hours

### 3.10 Testing & Documentation (Day 6-7)

**Tasks:**
- [ ] Unit tests for models
- [ ] Integration tests for EmergencyBroadcastService
- [ ] Test SMS delivery
- [ ] Test municipal partner API
- [ ] Test approval workflow
- [ ] Test audit logging
- [ ] Documentation: API docs, admin guide, municipal partner guide

**Estimated Time:** 2-3 hours

**Phase 3 Total: ~20-28 hours**

---

## PHASE 4: INTEGRATION & TESTING

**Duration:** 2-3 days  
**Priority:** High  
**Dependencies:** Phases 1, 2, 3

### 4.1 Community Integration (Day 1)

**Tasks:**
- [ ] Link ads to communities (inventory tracking)
- [ ] Link email subscribers to communities
- [ ] Link emergency alerts to communities
- [ ] Update all services to use community-based targeting
- [ ] Update controllers to detect community from request

**Estimated Time:** 2-3 hours

### 4.2 Business Integration (Day 1)

**Tasks:**
- [ ] Link SMB email reports to businesses
- [ ] Create business performance tracking for email reports
- [ ] Update advertiser linking (already exists, verify)

**Estimated Time:** 1-2 hours

### 4.3 End-to-End Testing (Day 1-2)

**Tasks:**
- [ ] Test advertising system end-to-end
  - Create campaign → Create creative → Serve ad → Track impression → Track click
- [ ] Test email system end-to-end
  - Subscribe → Generate digest → Send email → Track open → Track click
- [ ] Test emergency system end-to-end
  - Create alert → Publish → Broadcast → Track delivery
- [ ] Test SMS delivery end-to-end
  - Subscribe with phone → Verify phone → Send SMS → Track delivery
- [ ] Test municipal partner API
  - Create partner → Generate API key → Create alert via API → Approve → Publish

**Estimated Time:** 4-6 hours

### 4.4 Performance Optimization (Day 2)

**Tasks:**
- [ ] Optimize ad server queries (caching, indexes)
- [ ] Optimize email queue processing (batch sends)
- [ ] Optimize emergency broadcast (parallel processing)
- [ ] Add Redis caching for frequently accessed data
- [ ] Add database indexes for performance

**Estimated Time:** 2-3 hours

### 4.5 Documentation (Day 2-3)

**Tasks:**
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Admin user guide
- [ ] Municipal partner API guide
- [ ] Developer guide
- [ ] Deployment guide

**Estimated Time:** 2-3 hours

**Phase 4 Total: ~8-12 hours**

---

## PROJECT TIMELINE

### Week 1: Advertising System
- **Days 1-2**: Database migrations, models, AdServerService
- **Days 3-4**: Admin controllers, public ad serving
- **Days 4-5**: Frontend admin pages
- **Day 5**: Testing & documentation

### Week 2: Email Engagement System
- **Days 1-2**: Database migrations, models, services
- **Days 3-4**: Admin controllers, queue jobs, scheduled commands
- **Days 5-6**: Frontend admin pages, email templates
- **Days 7-8**: Testing & documentation

### Week 3: Emergency System + Integration
- **Days 1-2**: Database migrations, models, services, SMS integration
- **Days 3-4**: Admin controllers, queue jobs, frontend pages
- **Days 5-6**: Public pages, testing
- **Days 6-7**: Integration, end-to-end testing, documentation

**Total Duration: 2-3 weeks**

---

## RISK MITIGATION

### High Risk Items:

1. **SMS Delivery (AWS SNS)**
   - **Risk**: AWS SNS SMS sandbox/production access approval delays
   - **Mitigation**: Request AWS SNS SMS access early, test SMS delivery in Phase 3.1
   - **Contingency**: Start with email-only emergency alerts, add SMS later
   - **Note**: Using AWS SNS instead of Twilio reduces setup complexity and cost

2. **AI Content Generation (Claude API)**
   - **Risk**: API key issues, prompt engineering challenges
   - **Mitigation**: Test Claude API integration early, iterate on prompts
   - **Contingency**: Use template-based content generation as fallback

3. **Email Deliverability**
   - **Risk**: SPF/DKIM/DMARC setup issues
   - **Mitigation**: Configure email authentication early, test with small batches
   - **Contingency**: Use Postmark (better deliverability) instead of SES

### Medium Risk Items:

4. **Campaign Performance Logic**
   - **Risk**: Complex ad server logic bugs
   - **Mitigation**: Thorough unit testing, start with simple logic, iterate
   - **Contingency**: Use existing AdvertisementService as fallback

5. **Email Queue Management**
   - **Risk**: High-volume email sending bottlenecks
   - **Mitigation**: Use Laravel Horizon, batch processing, rate limiting
   - **Contingency**: Increase queue workers, use SES/Postmark rate limits

---

## SUCCESS CRITERIA

### Phase 1 Success:
- ✅ Campaigns can be created and managed
- ✅ Ads are served based on campaign targeting
- ✅ Impressions and clicks are tracked with cost
- ✅ Budget tracking works correctly
- ✅ Frequency capping prevents over-serving

### Phase 2 Success:
- ✅ Subscribers can sign up and manage preferences
- ✅ Daily digests are generated and sent automatically
- ✅ Weekly newsletters are generated and sent automatically
- ✅ Breaking news alerts are sent immediately
- ✅ Open and click tracking works
- ✅ AI content generation produces quality content

### Phase 3 Success:
- ✅ Emergency alerts can be created and published
- ✅ Alerts are broadcast to eligible subscribers
- ✅ SMS delivery works via AWS SNS
- ✅ Municipal partners can create alerts via API
- ✅ Audit logging captures all actions

### Overall Success:
- ✅ All three systems work independently
- ✅ Systems integrate with communities and businesses
- ✅ Performance is acceptable (< 200ms ad serving, < 1s email generation)
- ✅ Documentation is complete
- ✅ Code is tested and production-ready

---

## RESOURCE REQUIREMENTS

### Development:
- **Backend Developer**: 2-3 weeks full-time
- **Frontend Developer**: 1-2 weeks (can overlap with backend)
- **QA/Testing**: 1 week (can overlap)

### Infrastructure:
- **AWS SNS SMS**: Required for SMS (uses existing AWS credentials)
- **Claude API Key**: Required for AI content
- **Email Service**: AWS SES or Postmark (already configured)
- **Redis**: Required for caching (already configured)
- **Queue Workers**: Laravel Horizon (already configured)

### External Services:
- ✅ Claude API (Anthropic) - Already available
- ⚠️ AWS SNS SMS - Needs access approval (uses existing AWS account)
- ✅ AWS SES/Postmark - Already configured
- ✅ Stripe - Already integrated

---

## NEXT STEPS

1. **Review and approve** this project plan
2. **Set up external services** (AWS SNS SMS access approval, Claude API keys)
3. **Create project tracking** (GitHub issues, project board)
4. **Begin Phase 1** (Advertising System Enhancement)
5. **Daily standups** to track progress
6. **Weekly reviews** to adjust timeline if needed

---

## APPENDIX: DETAILED TASK BREAKDOWN

### Phase 1 Detailed Tasks (18-26 hours)
- Database migrations: 2-3 hours
- Models: 2-3 hours
- AdServerService: 4-6 hours
- Controllers: 4-6 hours
- Frontend: 6-8 hours

### Phase 2 Detailed Tasks (23-31 hours)
- Database migrations: 2-3 hours
- Models: 2-3 hours
- Services: 6-8 hours
- Controllers: 4-6 hours
- Jobs/Commands: 4-6 hours
- Frontend: 6-8 hours
- Templates: 2-3 hours

### Phase 3 Detailed Tasks (20-28 hours)
- Database migrations: 2-3 hours
- Models: 2-3 hours
- Services: 4-6 hours
- SMS Integration: 2-3 hours
- Controllers: 4-6 hours
- Jobs/Commands: 3-4 hours
- Frontend: 6-8 hours

### Phase 4 Detailed Tasks (8-12 hours)
- Integration: 3-5 hours
- Testing: 4-6 hours
- Documentation: 2-3 hours

**TOTAL: 69-97 hours (~2-3 weeks)**

