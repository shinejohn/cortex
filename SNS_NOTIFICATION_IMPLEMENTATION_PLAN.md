# SNS Notification Services Implementation Plan

**Date:** December 23, 2025  
**Status:** Planning Phase  
**Reference:** `/Users/johnshine/Dropbox/All-Vimeo-Videos/cursor-sns-notification-implementation.md`

---

## 🎯 Overview

Implement a comprehensive notification system using AWS SNS for SMS and Web Push API for browser notifications. This system will serve all platforms (Day.News, GoEventCity, DowntownsGuide, AlphaSite) with a unified architecture.

---

## 📊 Current State Analysis

### ✅ What Already Exists
1. **SmsService** - Basic SMS sending for emergency alerts and verification codes
2. **Notification Model** - In-app notifications (database notifications)
3. **NotificationController** - Basic notification management
4. **AWS SNS Configuration** - Already configured in `config/services.php`
5. **Emergency Alert System** - Uses SmsService for emergency broadcasts

### ❌ What Needs to Be Created
1. **Database Tables:**
   - `notification_subscriptions` - User subscription preferences
   - `phone_verifications` - Phone verification codes
   - `notification_log` - Audit log for sent notifications

2. **Services:**
   - `NotificationService` - SNS topic management and publishing
   - `WebPushService` - Browser push notification handling
   - `PhoneVerificationService` - Phone verification workflow

3. **Models:**
   - `NotificationSubscription`
   - `PhoneVerification`
   - `NotificationLog`

4. **API Endpoints:**
   - Web push registration
   - SMS verification and subscription
   - Subscription management

5. **Frontend:**
   - React component for subscription UI
   - Service worker for push notifications

6. **Admin Tools:**
   - Artisan command for sending notifications

---

## 🏗️ Implementation Phases

### Phase 1: Database Schema (Foundation)
**Estimated Time:** 30 minutes

**Tasks:**
- [ ] Create migration: `create_notification_subscriptions_table`
- [ ] Create migration: `create_phone_verifications_table`
- [ ] Create migration: `create_notification_log_table`
- [ ] Run migrations
- [ ] Verify indexes and foreign keys

**Files to Create:**
- `database/migrations/YYYY_MM_DD_HHMMSS_create_notification_subscriptions_table.php`
- `database/migrations/YYYY_MM_DD_HHMMSS_create_phone_verifications_table.php`
- `database/migrations/YYYY_MM_DD_HHMMSS_create_notification_log_table.php`

**Dependencies:** None

---

### Phase 2: Backend Services (Core Logic)
**Estimated Time:** 2 hours

**Tasks:**
- [ ] Create `NotificationService` - SNS topic management
- [ ] Create `WebPushService` - Web push handling
- [ ] Create `PhoneVerificationService` - Phone verification
- [ ] Integrate with existing `SmsService`
- [ ] Add caching for topic ARNs
- [ ] Add error handling and logging

**Files to Create:**
- `app/Services/NotificationService.php`
- `app/Services/WebPushService.php`
- `app/Services/PhoneVerificationService.php`

**Files to Modify:**
- `app/Services/SmsService.php` - Add integration points

**Dependencies:** Phase 1 (database)

---

### Phase 3: Eloquent Models & Policies
**Estimated Time:** 45 minutes

**Tasks:**
- [ ] Create `NotificationSubscription` model
- [ ] Create `PhoneVerification` model
- [ ] Create `NotificationLog` model
- [ ] Create authorization policies
- [ ] Add relationships and scopes
- [ ] Add accessor/mutator methods

**Files to Create:**
- `app/Models/NotificationSubscription.php`
- `app/Models/PhoneVerification.php`
- `app/Models/NotificationLog.php`
- `app/Policies/NotificationSubscriptionPolicy.php`

**Dependencies:** Phase 1 (database)

---

### Phase 4: API Controllers & Routes
**Estimated Time:** 1.5 hours

**Tasks:**
- [ ] Create `NotificationController` with all endpoints
- [ ] Add API routes
- [ ] Add request validation
- [ ] Add authentication middleware
- [ ] Add rate limiting
- [ ] Add API documentation

**Files to Create:**
- `app/Http/Controllers/Api/NotificationController.php`
- `app/Http/Requests/NotificationSubscriptionRequest.php`

**Files to Modify:**
- `routes/api.php` - Add notification routes

**Dependencies:** Phase 2 (services), Phase 3 (models)

---

### Phase 5: Frontend Components (React)
**Estimated Time:** 2 hours

**Tasks:**
- [ ] Create `NotificationSubscribe` component
- [ ] Add web push registration logic
- [ ] Add SMS verification UI
- [ ] Add preference management
- [ ] Add loading states and error handling
- [ ] Style with Tailwind CSS

**Files to Create:**
- `resources/js/components/NotificationSubscribe.tsx`
- `resources/js/hooks/useNotificationSubscription.ts`
- `resources/js/types/notification-subscription.d.ts`

**Dependencies:** Phase 4 (API)

---

### Phase 6: Service Worker (Web Push)
**Estimated Time:** 30 minutes

**Tasks:**
- [ ] Create `public/service-worker.js`
- [ ] Add push event listener
- [ ] Add notification click handler
- [ ] Add subscription change handler
- [ ] Test in browser

**Files to Create:**
- `public/service-worker.js`

**Dependencies:** Phase 5 (frontend)

---

### Phase 7: Admin Commands & Jobs
**Estimated Time:** 1 hour

**Tasks:**
- [ ] Create `SendNotification` artisan command
- [ ] Create `SendNotificationJob` queue job
- [ ] Add batch notification support
- [ ] Add filtering by notification types
- [ ] Add quiet hours support

**Files to Create:**
- `app/Console/Commands/SendNotification.php`
- `app/Jobs/SendNotificationJob.php`

**Dependencies:** Phase 2 (services), Phase 3 (models)

---

### Phase 8: Configuration & Environment
**Estimated Time:** 30 minutes

**Tasks:**
- [ ] Update `config/services.php` with SNS topic prefix
- [ ] Add web push VAPID keys configuration
- [ ] Update `.env.example` with new variables
- [ ] Generate VAPID keys (documentation)
- [ ] Add rate limiting configuration

**Files to Modify:**
- `config/services.php`
- `.env.example`

**Files to Create:**
- `docs/NOTIFICATION_SETUP.md`

**Dependencies:** None

---

### Phase 9: Integration with Existing Systems
**Estimated Time:** 1.5 hours

**Tasks:**
- [ ] Integrate with existing `SmsService`
- [ ] Update `EmergencyBroadcastService` to use new system
- [ ] Add notification triggers for:
  - Order confirmations (GoEventCity)
  - Booking confirmations (DowntownsGuide)
  - Breaking news (Day.News)
  - Business updates (AlphaSite)
- [ ] Add event listeners for automatic notifications

**Files to Modify:**
- `app/Services/EmergencyBroadcastService.php`
- `app/Services/SmsService.php`
- Create event listeners for various triggers

**Dependencies:** Phase 2-7 (all backend)

---

### Phase 10: Testing & Documentation
**Estimated Time:** 1 hour

**Tasks:**
- [ ] Write unit tests for services
- [ ] Write feature tests for API endpoints
- [ ] Test web push in browser
- [ ] Test SMS delivery (sandbox)
- [ ] Create user documentation
- [ ] Create admin documentation
- [ ] Add code comments

**Files to Create:**
- `tests/Unit/Services/NotificationServiceTest.php`
- `tests/Feature/Api/NotificationTest.php`
- `docs/NOTIFICATIONS_USER_GUIDE.md`
- `docs/NOTIFICATIONS_ADMIN_GUIDE.md`

**Dependencies:** All phases

---

## 📋 Detailed Task Breakdown

### Phase 1: Database Schema

#### Migration: `notification_subscriptions`
```php
Schema::create('notification_subscriptions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->enum('platform', ['daynews', 'goeventcity', 'downtownguide', 'alphasite']);
    $table->string('community_id', 100)->nullable();
    $table->uuid('business_id')->nullable();
    $table->string('phone_number', 20)->nullable();
    $table->boolean('phone_verified')->default(false);
    $table->timestamp('phone_verified_at')->nullable();
    $table->text('web_push_endpoint')->nullable();
    $table->string('web_push_p256dh', 255)->nullable();
    $table->string('web_push_auth', 255)->nullable();
    $table->string('sns_sms_subscription_arn', 255)->nullable();
    $table->string('sns_endpoint_arn', 255)->nullable();
    $table->json('notification_types')->default('["breaking_news", "events", "deals"]');
    $table->enum('frequency', ['instant', 'daily_digest', 'weekly_digest'])->default('instant');
    $table->time('quiet_hours_start')->default('22:00');
    $table->time('quiet_hours_end')->default('08:00');
    $table->enum('status', ['active', 'paused', 'unsubscribed'])->default('active');
    $table->timestamps();
    $table->timestamp('last_notification_at')->nullable();
    
    $table->unique(['user_id', 'platform', 'community_id']);
    $table->index('phone_number');
    $table->index(['platform', 'community_id']);
    $table->index('status');
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
});
```

#### Migration: `phone_verifications`
```php
Schema::create('phone_verifications', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('phone_number', 20);
    $table->string('code', 6);
    $table->timestamp('expires_at');
    $table->integer('attempts')->default(0);
    $table->boolean('verified')->default(false);
    $table->timestamps();
    
    $table->index(['phone_number', 'code']);
});
```

#### Migration: `notification_log`
```php
Schema::create('notification_log', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('platform', 50);
    $table->string('community_id', 100)->nullable();
    $table->string('notification_type', 50);
    $table->enum('channel', ['sms', 'web_push', 'app_push', 'email']);
    $table->string('title', 255)->nullable();
    $table->text('message');
    $table->json('payload')->nullable();
    $table->integer('recipient_count')->default(0);
    $table->string('sns_message_id', 255)->nullable();
    $table->enum('status', ['queued', 'sent', 'failed', 'partial'])->default('queued');
    $table->text('error_message')->nullable();
    $table->timestamps();
    $table->timestamp('sent_at')->nullable();
    
    $table->index(['platform', 'created_at']);
    $table->index('community_id');
});
```

---

### Phase 2: Backend Services

#### NotificationService Key Methods:
- `getOrCreateTopic(string $platform, string $communityId): string`
- `subscribePhoneToSMS(string $phoneNumber, string $platform, string $communityId): ?string`
- `sendDirectSMS(string $phoneNumber, string $message, string $senderId = null): bool`
- `publishToTopic(string $platform, string $communityId, string $message, array $options = []): ?string`
- `unsubscribe(string $subscriptionArn): bool`

#### WebPushService Key Methods:
- `sendToSubscription(NotificationSubscription $sub, array $payload): bool`
- `sendToMany(array $subscriptions, array $payload): array`

#### PhoneVerificationService Key Methods:
- `sendVerificationCode(string $phoneNumber, string $platform): bool`
- `verifyCode(string $phoneNumber, string $code): bool`

---

### Phase 3: Models

#### NotificationSubscription Model:
- Relationships: `user`, `business` (optional)
- Scopes: `active()`, `forPlatform()`, `forCommunity()`
- Methods: `isQuietHours()`, `wantsNotificationType()`

#### PhoneVerification Model:
- Scopes: `valid()`, `forPhone()`
- Methods: `isExpired()`, `incrementAttempts()`

#### NotificationLog Model:
- Scopes: `forPlatform()`, `forCommunity()`, `byStatus()`
- Methods: `markAsSent()`, `markAsFailed()`

---

### Phase 4: API Endpoints

#### Routes:
```php
GET    /api/notifications/vapid-key
POST   /api/notifications/web-push/register
POST   /api/notifications/sms/request-verification
POST   /api/notifications/sms/verify-and-subscribe
GET    /api/notifications/subscriptions
PATCH  /api/notifications/subscriptions/{subscription}
DELETE /api/notifications/subscriptions/{subscription}
```

---

### Phase 5: Frontend Components

#### NotificationSubscribe Component Features:
- Platform/community selection
- Notification type preferences (checkboxes)
- Browser push enable/disable button
- SMS phone number input and verification
- Loading states
- Error handling
- Success messages

---

### Phase 6: Service Worker

#### Features:
- Push event listener
- Notification display
- Click handler (opens URL)
- Subscription change handler
- Badge updates

---

### Phase 7: Admin Commands

#### SendNotification Command:
```bash
php artisan notify:send {platform} {community} \
    --type=breaking_news \
    --title="Title" \
    --message="Message" \
    --url="https://..." \
    --sms --push
```

---

### Phase 8: Configuration

#### Environment Variables:
```bash
SNS_TOPIC_PREFIX=shine-notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:notifications@shine.com
SMS_DAILY_LIMIT_PER_USER=5
SMS_MONTHLY_SPEND_LIMIT=1000
```

---

### Phase 9: Integration Points

#### Automatic Notification Triggers:
1. **GoEventCity:**
   - Order confirmation → SMS + Push
   - Event reminder → Push
   - Ticket transfer → Push

2. **Day.News:**
   - Breaking news → SMS + Push
   - Article published → Push
   - Comment reply → Push

3. **DowntownsGuide:**
   - Booking confirmation → SMS + Push
   - Deal alert → Push
   - Review response → Push

4. **AlphaSite:**
   - Business claim verification → SMS
   - Community update → Push

---

### Phase 10: Testing Checklist

- [ ] Unit tests for all services
- [ ] Feature tests for API endpoints
- [ ] Web push test in Chrome/Firefox
- [ ] SMS test in sandbox mode
- [ ] Phone verification flow test
- [ ] Subscription management test
- [ ] Unsubscribe test
- [ ] Quiet hours test
- [ ] Notification filtering test
- [ ] Multi-platform test

---

## 🔄 Integration with Existing Code

### Existing SmsService Integration
The new `NotificationService` will:
- Use existing `SmsService` for direct SMS sends
- Extend functionality with SNS topics for broadcasts
- Maintain backward compatibility

### Existing Notification Model
The new system will:
- Complement existing in-app notifications
- Add external delivery channels (SMS, Push)
- Use same notification types where applicable

---

## 📦 Dependencies to Install

```bash
composer require minishlink/web-push
# AWS SDK already installed
```

---

## 🚀 Implementation Order

1. **Phase 1** - Database (foundation)
2. **Phase 8** - Configuration (setup)
3. **Phase 2** - Services (core logic)
4. **Phase 3** - Models (data layer)
5. **Phase 4** - API (endpoints)
6. **Phase 5** - Frontend (UI)
7. **Phase 6** - Service Worker (push)
8. **Phase 7** - Admin Tools (commands)
9. **Phase 9** - Integration (triggers)
10. **Phase 10** - Testing (validation)

---

## ⏱️ Estimated Timeline

- **Phase 1:** 30 minutes
- **Phase 2:** 2 hours
- **Phase 3:** 45 minutes
- **Phase 4:** 1.5 hours
- **Phase 5:** 2 hours
- **Phase 6:** 30 minutes
- **Phase 7:** 1 hour
- **Phase 8:** 30 minutes
- **Phase 9:** 1.5 hours
- **Phase 10:** 1 hour

**Total:** ~11.5 hours

---

## ✅ Success Criteria

1. ✅ Users can subscribe to SMS notifications via phone verification
2. ✅ Users can subscribe to browser push notifications
3. ✅ Admins can send notifications via artisan command
4. ✅ Notifications respect user preferences (types, quiet hours)
5. ✅ System integrates with existing emergency alert system
6. ✅ All platforms (Day.News, GoEventCity, DowntownsGuide, AlphaSite) supported
7. ✅ Notification log tracks all sent notifications
8. ✅ Web push works in Chrome, Firefox, Safari
9. ✅ SMS delivery works via AWS SNS
10. ✅ System scales to 6,800+ communities

---

## 🎯 Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Database Schema)
3. Proceed sequentially through all phases
4. Test each phase before moving to next
5. Document as we go

---

**Ready to begin implementation?** Let me know and I'll start with Phase 1!

