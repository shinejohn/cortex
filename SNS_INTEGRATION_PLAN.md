# SNS Notification System - Complete Integration Plan

**Date:** December 24, 2025  
**Status:** Ready for Integration  
**Estimated Time:** 4-6 hours

---

## 🎯 Integration Objectives

1. ✅ Ensure all database tables are created and seeded
2. ✅ Integrate notification triggers with existing events
3. ✅ Configure frontend components across all platforms
4. ✅ Set up AWS SNS and Web Push infrastructure
5. ✅ Configure queue workers for async processing
6. ✅ Add notification UI to all relevant pages
7. ✅ Test end-to-end workflows

---

## Phase 1: Database & Infrastructure Setup

### 1.1 Run Migrations
**Time:** 5 minutes

```bash
# Run migrations
php artisan migrate

# Verify tables created
php artisan tinker
>>> Schema::hasTable('notification_subscriptions')
>>> Schema::hasTable('phone_verifications')
>>> Schema::hasTable('notification_log')
```

**Verification:**
- [ ] All 3 tables exist
- [ ] Foreign keys are correct
- [ ] Indexes are created

### 1.2 Generate VAPID Keys
**Time:** 5 minutes

```bash
# Install web-push globally (if not already)
npm install -g web-push

# Generate keys
npx web-push generate-vapid-keys
```

**Output:**
```
Public Key: <your-public-key>
Private Key: <your-private-key>
```

**Add to `.env`:**
```bash
VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=mailto:notifications@shine.com
SNS_TOPIC_PREFIX=shine-notifications
```

**Verification:**
- [ ] Keys generated
- [ ] Keys added to `.env`
- [ ] Config cache cleared: `php artisan config:clear`

### 1.3 AWS SNS Configuration
**Time:** 30 minutes

**Steps:**
1. **Verify AWS Credentials**
   ```bash
   # Check .env has AWS credentials
   grep AWS_ACCESS_KEY_ID .env
   grep AWS_SECRET_ACCESS_KEY .env
   grep AWS_DEFAULT_REGION .env
   ```

2. **Request SMS Production Access** (if not already done)
   - AWS Console > SNS > Text messaging (SMS)
   - Click "Edit" > "Request production access"
   - Fill out form (can take 7-10 days for approval)
   - **Note:** Sandbox works immediately for testing

3. **Set SMS Spending Limits**
   - AWS Console > SNS > Text messaging (SMS)
   - Set monthly spending limit (start with $100)
   - Set per-message limit

4. **Register 10DLC** (for US SMS production)
   - AWS Console > Pinpoint > SMS and voice
   - Register company ($4 one-time)
   - Create campaign ($10/month or $2 for low-volume)
   - Purchase 10DLC number ($1/month)

**Verification:**
- [ ] AWS credentials configured
- [ ] SMS access requested/approved
- [ ] Spending limits set
- [ ] 10DLC registered (if needed)

### 1.4 Queue Configuration
**Time:** 10 minutes

**Verify queue is configured:**

```bash
# Check .env
QUEUE_CONNECTION=redis  # or database

# Test queue connection
php artisan queue:work --once
```

**Start Horizon (if using Redis):**
```bash
php artisan horizon
```

**Verification:**
- [ ] Queue connection working
- [ ] Horizon running (if applicable)
- [ ] Jobs can be dispatched

---

## Phase 2: Backend Integration

### 2.1 Integrate with Day.News Events
**Time:** 45 minutes

**Files to Modify:**
- `app/Events/DayNews/ArticlePublished.php` (create if doesn't exist)
- `app/Listeners/DayNews/SendBreakingNewsNotification.php` (create)

**Create Event Listener:**

```php
// app/Listeners/DayNews/SendBreakingNewsNotification.php
<?php

namespace App\Listeners\DayNews;

use App\Services\NotificationIntegrationService;
use App\Events\DayNews\ArticlePublished;

class SendBreakingNewsNotification
{
    public function __construct(
        private NotificationIntegrationService $notificationService
    ) {}

    public function handle(ArticlePublished $event): void
    {
        $article = $event->article;
        
        // Only send for breaking news
        if ($article->is_breaking_news) {
            $this->notificationService->sendBreakingNews(
                communityId: $article->community_id ?? 'default',
                title: $article->title,
                message: substr($article->excerpt ?? $article->content, 0, 150),
                url: route('day-news.articles.show', $article)
            );
        }
    }
}
```

**Register in `app/Providers/EventServiceProvider.php`:**

```php
use App\Events\DayNews\ArticlePublished;
use App\Listeners\DayNews\SendBreakingNewsNotification;

protected $listen = [
    ArticlePublished::class => [
        SendBreakingNewsNotification::class,
    ],
];
```

**Verification:**
- [ ] Event listener created
- [ ] Registered in EventServiceProvider
- [ ] Test: Publish breaking news article → notification sent

### 2.2 Integrate with GoEventCity Events
**Time:** 45 minutes

**Create Event Listeners:**

1. **Order Confirmation** (`app/Listeners/GoEventCity/SendOrderConfirmationNotification.php`)

```php
<?php

namespace App\Listeners\GoEventCity;

use App\Services\NotificationIntegrationService;
use App\Events\GoEventCity\OrderCreated;

class SendOrderConfirmationNotification
{
    public function __construct(
        private NotificationIntegrationService $notificationService
    ) {}

    public function handle(OrderCreated $event): void
    {
        $order = $event->order;
        
        $this->notificationService->sendOrderConfirmation(
            communityId: $order->event->community_id ?? 'default',
            orderId: $order->id,
            message: "Your order #{$order->order_number} for {$order->event->title} has been confirmed!",
            url: route('orders.show', $order)
        );
    }
}
```

2. **Event Reminder** (`app/Listeners/GoEventCity/SendEventReminderNotification.php`)

```php
<?php

namespace App\Listeners\GoEventCity;

use App\Services\NotificationIntegrationService;
use App\Jobs\SendEventReminders;

class SendEventReminderNotification
{
    public function __construct(
        private NotificationIntegrationService $notificationService
    ) {}

    public function handle(SendEventReminders $job): void
    {
        $event = $job->event;
        
        // Send 24 hours before event
        $this->notificationService->sendEventReminder(
            communityId: $event->community_id ?? 'default',
            eventTitle: $event->title,
            message: "Don't forget: {$event->title} is tomorrow at {$event->event_date->format('g:i A')}!",
            url: route('events.show', $event)
        );
    }
}
```

**Create Scheduled Job** (`app/Console/Kernel.php` or `routes/console.php`):

```php
use Illuminate\Console\Scheduling\Schedule;

// In schedule method
$schedule->call(function () {
    // Get events happening in 24 hours
    $events = Event::whereBetween('event_date', [
        now()->addHours(23),
        now()->addHours(25)
    ])->get();
    
    foreach ($events as $event) {
        SendEventReminders::dispatch($event);
    }
})->hourly();
```

**Verification:**
- [ ] Event listeners created
- [ ] Scheduled job configured
- [ ] Test: Create order → notification sent
- [ ] Test: Event reminder scheduled → notification sent

### 2.3 Integrate with DowntownsGuide Events
**Time:** 30 minutes

**Create Event Listeners:**

1. **Booking Confirmation** (`app/Listeners/DowntownsGuide/SendBookingConfirmationNotification.php`)

```php
<?php

namespace App\Listeners\DowntownsGuide;

use App\Services\NotificationIntegrationService;
use App\Events\DowntownsGuide\BookingCreated;

class SendBookingConfirmationNotification
{
    public function __construct(
        private NotificationIntegrationService $notificationService
    ) {}

    public function handle(BookingCreated $event): void
    {
        $booking = $event->booking;
        
        $this->notificationService->sendBookingConfirmation(
            communityId: $booking->business->community_id ?? 'default',
            title: 'Booking Confirmed',
            message: "Your booking at {$booking->business->name} on {$booking->booking_date->format('M d, Y')} at {$booking->booking_time->format('g:i A')} is confirmed!",
            url: route('bookings.show', $booking)
        );
    }
}
```

2. **Deal Alert** (`app/Listeners/DowntownsGuide/SendDealAlertNotification.php`)

```php
<?php

namespace App\Listeners\DowntownsGuide;

use App\Services\NotificationIntegrationService;
use App\Events\DowntownsGuide\CouponCreated;

class SendDealAlertNotification
{
    public function __construct(
        private NotificationIntegrationService $notificationService
    ) {}

    public function handle(CouponCreated $event): void
    {
        $coupon = $event->coupon;
        
        if ($coupon->is_featured) {
            $this->notificationService->sendDealAlert(
                communityId: $coupon->business->community_id ?? 'default',
                title: "New Deal: {$coupon->title}",
                message: "{$coupon->description} - Valid until {$coupon->expires_at->format('M d')}",
                url: route('coupons.show', $coupon)
            );
        }
    }
}
```

**Verification:**
- [ ] Event listeners created
- [ ] Test: Create booking → notification sent
- [ ] Test: Create featured coupon → notification sent

### 2.4 Integrate with AlphaSite Events
**Time:** 30 minutes

**Create Event Listener:**

```php
// app/Listeners/AlphaSite/SendBusinessUpdateNotification.php
<?php

namespace App\Listeners\AlphaSite;

use App\Services\NotificationIntegrationService;
use App\Events\AlphaSite\BusinessClaimed;
use App\Events\AlphaSite\CommunityUpdated;

class SendBusinessUpdateNotification
{
    public function __construct(
        private NotificationIntegrationService $notificationService
    ) {}

    public function handleBusinessClaimed(BusinessClaimed $event): void
    {
        $business = $event->business;
        
        $this->notificationService->sendBusinessUpdate(
            businessId: $business->id,
            title: 'Business Claimed',
            message: "Your business {$business->name} has been successfully claimed!",
            url: route('alphasite.business.show', $business)
        );
    }
    
    public function handleCommunityUpdated(CommunityUpdated $event): void
    {
        $community = $event->community;
        
        $this->notificationService->sendBusinessUpdate(
            businessId: $community->id,
            title: 'Community Updated',
            message: "New updates available for {$community->name}",
            url: route('alphasite.community.show', $community)
        );
    }
}
```

**Verification:**
- [ ] Event listener created
- [ ] Test: Claim business → notification sent
- [ ] Test: Update community → notification sent

---

## Phase 3: Frontend Integration

### 3.1 Add Notification Component to Day.News
**Time:** 15 minutes

**File:** `resources/js/pages/day-news/settings/notifications.tsx` (create)

```tsx
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import NotificationSubscribe from '@/components/NotificationSubscribe';

export default function NotificationSettings() {
    return (
        <AppLayout>
            <Head title="Notification Settings" />
            <div className="max-w-2xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
                <NotificationSubscribe 
                    platform="daynews" 
                    communityId={window.location.hostname.split('.')[0]} 
                />
            </div>
        </AppLayout>
    );
}
```

**Add Route** (`routes/web.php` - Day.News section):

```php
Route::get('/settings/notifications', function () {
    return Inertia::render('day-news/settings/notifications');
})->middleware('auth')->name('day-news.settings.notifications');
```

**Add Link to Settings Menu:**

```tsx
// In settings navigation component
<Link href={route('day-news.settings.notifications')}>
    Notifications
</Link>
```

**Verification:**
- [ ] Page created
- [ ] Route added
- [ ] Link in settings menu
- [ ] Component renders correctly

### 3.2 Add Notification Component to GoEventCity
**Time:** 15 minutes

**Similar to Day.News:**
- Create `resources/js/pages/event-city/settings/notifications.tsx`
- Add route
- Add to settings menu

**Verification:**
- [ ] Page created
- [ ] Route added
- [ ] Component renders correctly

### 3.3 Add Notification Component to DowntownsGuide
**Time:** 15 minutes

**Similar to above:**
- Create `resources/js/pages/downtownsguide/settings/notifications.tsx`
- Add route
- Add to settings menu

**Verification:**
- [ ] Page created
- [ ] Route added
- [ ] Component renders correctly

### 3.4 Add Notification Component to AlphaSite
**Time:** 15 minutes

**Similar to above:**
- Create `resources/js/pages/alphasite/settings/notifications.tsx`
- Add route
- Add to settings menu

**Verification:**
- [ ] Page created
- [ ] Route added
- [ ] Component renders correctly

### 3.5 Register Service Worker Globally
**Time:** 10 minutes

**File:** `resources/js/app.tsx` or main layout

```tsx
// Register service worker on app load
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
```

**Verification:**
- [ ] Service worker registered
- [ ] Console shows registration success
- [ ] Service worker appears in DevTools > Application > Service Workers

---

## Phase 4: Testing & Verification

### 4.1 Test Database Setup
**Time:** 10 minutes

```bash
php artisan tinker
```

```php
// Test models
$sub = App\Models\NotificationSubscription::create([
    'user_id' => App\Models\User::first()->id,
    'platform' => 'daynews',
    'community_id' => 'chicago-il',
    'notification_types' => ['breaking_news'],
    'status' => 'active',
]);

$sub->isQuietHours(); // Should return boolean
$sub->wantsNotificationType('breaking_news'); // Should return true
```

**Verification:**
- [ ] Models work correctly
- [ ] Relationships work
- [ ] Scopes work
- [ ] Methods work

### 4.2 Test Services
**Time:** 15 minutes

```php
// Test NotificationService
$service = app(\App\Services\NotificationService::class);
$topicArn = $service->getOrCreateTopic('daynews', 'chicago-il');
// Should return ARN

// Test PhoneVerificationService
$phoneService = app(\App\Services\PhoneVerificationService::class);
$phoneService->sendVerificationCode('+13125551234', 'daynews');
// Should send SMS

// Test WebPushService
$webPushService = app(\App\Services\WebPushService::class);
// Should instantiate without errors
```

**Verification:**
- [ ] Services instantiate correctly
- [ ] Methods work
- [ ] No errors

### 4.3 Test API Endpoints
**Time:** 20 minutes

**Using Postman or curl:**

```bash
# Get VAPID key (public)
curl http://localhost/api/notifications/vapid-key

# Register web push (requires auth token)
curl -X POST http://localhost/api/notifications/web-push/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "daynews",
    "community_id": "chicago-il",
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }'

# Request SMS verification
curl -X POST http://localhost/api/notifications/sms/request-verification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+13125551234",
    "platform": "daynews"
  }'
```

**Verification:**
- [ ] All endpoints respond correctly
- [ ] Authentication works
- [ ] Validation works
- [ ] Errors handled correctly

### 4.4 Test Artisan Command
**Time:** 10 minutes

```bash
# Test notification command
php artisan notify:send daynews chicago-il \
    --type=breaking_news \
    --title="Test Notification" \
    --message="This is a test notification" \
    --url="https://chicago.daynews.com" \
    --push

# Check notification log
php artisan tinker
>>> App\Models\NotificationLog::latest()->first();
```

**Verification:**
- [ ] Command runs successfully
- [ ] Notification logged
- [ ] Subscribers receive notification

---

## Phase 5: Production Readiness

### 5.1 Environment Variables Checklist
**Time:** 5 minutes

**Verify all required variables:**

```bash
# Check .env has all required variables
grep -E "VAPID_|SNS_|AWS_" .env
```

**Required:**
- [ ] `VAPID_PUBLIC_KEY`
- [ ] `VAPID_PRIVATE_KEY`
- [ ] `VAPID_SUBJECT`
- [ ] `SNS_TOPIC_PREFIX`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_DEFAULT_REGION`

### 5.2 Queue Worker Setup
**Time:** 10 minutes

**For Production:**

```bash
# Supervisor config for queue worker
# /etc/supervisor/conf.d/laravel-worker.conf

[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
stopwaitsecs=3600
```

**Or use Horizon:**

```bash
# Supervisor config for Horizon
[program:horizon]
process_name=%(program_name)s
command=php /path/to/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/horizon.log
```

**Verification:**
- [ ] Queue worker running
- [ ] Jobs processing
- [ ] Logs working

### 5.3 Monitoring Setup
**Time:** 15 minutes

**Add to monitoring:**

1. **Queue Monitoring**
   - Monitor queue size
   - Alert if queue grows too large
   - Monitor failed jobs

2. **Notification Log Monitoring**
   - Track notification success rate
   - Alert on high failure rate
   - Monitor SMS costs

3. **AWS SNS Monitoring**
   - CloudWatch alarms for SMS failures
   - Monitor spending limits
   - Track topic creation

**Verification:**
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Dashboards created

---

## Phase 6: Documentation & Training

### 6.1 User Documentation
**Time:** 30 minutes

**Create:**
- User guide for subscribing to notifications
- FAQ for common issues
- Troubleshooting guide

**Verification:**
- [ ] Documentation created
- [ ] Accessible to users
- [ ] Clear and helpful

### 6.2 Admin Documentation
**Time:** 30 minutes

**Create:**
- Admin guide for sending notifications
- Command reference
- Integration examples

**Verification:**
- [ ] Documentation created
- [ ] Examples provided
- [ ] Clear instructions

---

## ✅ Integration Checklist

### Database & Infrastructure
- [ ] Migrations run successfully
- [ ] VAPID keys generated and configured
- [ ] AWS SNS configured
- [ ] Queue workers running

### Backend Integration
- [ ] Day.News event listeners created
- [ ] GoEventCity event listeners created
- [ ] DowntownsGuide event listeners created
- [ ] AlphaSite event listeners created
- [ ] Scheduled jobs configured

### Frontend Integration
- [ ] Notification component added to Day.News
- [ ] Notification component added to GoEventCity
- [ ] Notification component added to DowntownsGuide
- [ ] Notification component added to AlphaSite
- [ ] Service worker registered globally

### Testing
- [ ] Database tests pass
- [ ] Service tests pass
- [ ] API tests pass
- [ ] Command tests pass

### Production Readiness
- [ ] Environment variables set
- [ ] Queue workers configured
- [ ] Monitoring set up
- [ ] Documentation complete

---

## 🚨 Common Issues & Solutions

### Issue: Service Worker Not Registering
**Solution:**
- Ensure HTTPS (required for push notifications)
- Check browser console for errors
- Verify service-worker.js is accessible at `/service-worker.js`

### Issue: SMS Not Sending
**Solution:**
- Verify AWS credentials
- Check SMS spending limits
- Verify phone number format (+1XXXXXXXXXX)
- Check AWS SNS logs in CloudWatch

### Issue: Web Push Not Working
**Solution:**
- Verify VAPID keys are correct
- Check service worker registration
- Verify browser supports push notifications
- Check notification permissions

### Issue: Notifications Not Respecting Preferences
**Solution:**
- Verify subscription status is 'active'
- Check notification_types array
- Verify quiet hours logic
- Check timezone settings

---

## 📊 Success Metrics

After integration, track:
- Number of active subscriptions
- Notification delivery rate
- SMS costs
- Web push success rate
- User engagement with notifications

---

**Total Estimated Time:** 4-6 hours  
**Next Step:** Proceed to Testing Plan

