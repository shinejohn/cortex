# SNS Notification System - Complete Testing Plan

**Date:** December 24, 2025  
**Status:** Ready for Testing  
**Estimated Time:** 6-8 hours

---

## 🎯 Testing Objectives

1. ✅ Verify all components work correctly
2. ✅ Test all API endpoints
3. ✅ Test database operations
4. ✅ Test service integrations
5. ✅ Test frontend UI components
6. ✅ Test end-to-end user workflows
7. ✅ Test error handling and edge cases
8. ✅ Test performance and scalability

---

## Test Categories

1. **Unit Tests** - Individual components
2. **Feature Tests** - API endpoints and workflows
3. **Integration Tests** - Cross-component interactions
4. **Browser Tests** - Service worker and web push
5. **SMS Tests** - AWS SNS integration
6. **End-to-End Tests** - Complete user flows
7. **Performance Tests** - Load and stress testing
8. **Security Tests** - Authorization and validation

---

## Phase 1: Unit Tests

### 1.1 Model Tests
**File:** `tests/Unit/Models/NotificationSubscriptionTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\NotificationSubscription;
use App\Models\User;
use Carbon\Carbon;

class NotificationSubscriptionTest extends TestCase
{
    public function test_can_create_subscription(): void
    {
        $user = User::factory()->create();
        
        $subscription = NotificationSubscription::create([
            'user_id' => $user->id,
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
            'notification_types' => ['breaking_news', 'events'],
            'status' => 'active',
        ]);
        
        $this->assertDatabaseHas('notification_subscriptions', [
            'user_id' => $user->id,
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
        ]);
    }
    
    public function test_is_quiet_hours_works_correctly(): void
    {
        $subscription = NotificationSubscription::factory()->create([
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '08:00',
        ]);
        
        // Test during quiet hours (11 PM)
        Carbon::setTestNow(Carbon::create(2025, 12, 24, 23, 0, 0));
        $this->assertTrue($subscription->isQuietHours());
        
        // Test outside quiet hours (2 PM)
        Carbon::setTestNow(Carbon::create(2025, 12, 24, 14, 0, 0));
        $this->assertFalse($subscription->isQuietHours());
    }
    
    public function test_wants_notification_type_works_correctly(): void
    {
        $subscription = NotificationSubscription::factory()->create([
            'notification_types' => ['breaking_news', 'events'],
        ]);
        
        $this->assertTrue($subscription->wantsNotificationType('breaking_news'));
        $this->assertTrue($subscription->wantsNotificationType('events'));
        $this->assertFalse($subscription->wantsNotificationType('deals'));
    }
    
    public function test_active_scope_filters_correctly(): void
    {
        NotificationSubscription::factory()->create(['status' => 'active']);
        NotificationSubscription::factory()->create(['status' => 'paused']);
        NotificationSubscription::factory()->create(['status' => 'unsubscribed']);
        
        $active = NotificationSubscription::active()->get();
        
        $this->assertCount(1, $active);
        $this->assertEquals('active', $active->first()->status);
    }
    
    public function test_for_platform_scope_filters_correctly(): void
    {
        NotificationSubscription::factory()->create(['platform' => 'daynews']);
        NotificationSubscription::factory()->create(['platform' => 'goeventcity']);
        
        $daynews = NotificationSubscription::forPlatform('daynews')->get();
        
        $this->assertCount(1, $daynews);
        $this->assertEquals('daynews', $daynews->first()->platform);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationSubscriptionTest
```

**Verification:**
- [ ] All model tests pass
- [ ] Scopes work correctly
- [ ] Methods work correctly
- [ ] Relationships work correctly

### 1.2 Service Tests
**File:** `tests/Unit/Services/NotificationServiceTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Cache;
use Mockery;

class NotificationServiceTest extends TestCase
{
    public function test_get_or_create_topic_caches_result(): void
    {
        $service = app(NotificationService::class);
        
        Cache::flush();
        
        // First call should create topic
        $arn1 = $service->getOrCreateTopic('daynews', 'chicago-il');
        
        // Second call should use cache
        $arn2 = $service->getOrCreateTopic('daynews', 'chicago-il');
        
        $this->assertEquals($arn1, $arn2);
    }
    
    public function test_truncate_for_sms_works_correctly(): void
    {
        $service = app(NotificationService::class);
        
        $longMessage = str_repeat('a', 200);
        $truncated = $service->truncateForSMS($longMessage);
        
        $this->assertLessThanOrEqual(155, strlen($truncated));
        $this->assertStringEndsWith('...', $truncated);
    }
    
    public function test_send_direct_sms_handles_errors(): void
    {
        // Mock AWS SNS client to throw exception
        // Test error handling
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationServiceTest
```

**Verification:**
- [ ] All service tests pass
- [ ] Error handling works
- [ ] Caching works
- [ ] Methods work correctly

### 1.3 Phone Verification Service Tests
**File:** `tests/Unit/Services/PhoneVerificationServiceTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PhoneVerificationService;
use App\Models\PhoneVerification;
use Carbon\Carbon;

class PhoneVerificationServiceTest extends TestCase
{
    public function test_send_verification_code_creates_record(): void
    {
        $service = app(PhoneVerificationService::class);
        
        $service->sendVerificationCode('+13125551234', 'daynews');
        
        $this->assertDatabaseHas('phone_verifications', [
            'phone_number' => '+13125551234',
        ]);
    }
    
    public function test_send_verification_code_respects_rate_limit(): void
    {
        $service = app(PhoneVerificationService::class);
        
        // Send 3 codes (should work)
        $service->sendVerificationCode('+13125551234', 'daynews');
        $service->sendVerificationCode('+13125551234', 'daynews');
        $service->sendVerificationCode('+13125551234', 'daynews');
        
        // 4th should fail
        $this->expectException(\Exception::class);
        $service->sendVerificationCode('+13125551234', 'daynews');
    }
    
    public function test_verify_code_works_with_valid_code(): void
    {
        $service = app(PhoneVerificationService::class);
        
        $verification = PhoneVerification::create([
            'phone_number' => '+13125551234',
            'code' => '123456',
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);
        
        $result = $service->verifyCode('+13125551234', '123456');
        
        $this->assertTrue($result);
        $this->assertTrue($verification->fresh()->verified);
    }
    
    public function test_verify_code_fails_with_expired_code(): void
    {
        $service = app(PhoneVerificationService::class);
        
        PhoneVerification::create([
            'phone_number' => '+13125551234',
            'code' => '123456',
            'expires_at' => Carbon::now()->subMinutes(1),
        ]);
        
        $result = $service->verifyCode('+13125551234', '123456');
        
        $this->assertFalse($result);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter PhoneVerificationServiceTest
```

**Verification:**
- [ ] All verification tests pass
- [ ] Rate limiting works
- [ ] Expiration works
- [ ] Code validation works

---

## Phase 2: Feature Tests (API Endpoints)

### 2.1 VAPID Key Endpoint Test
**File:** `tests/Feature/Api/NotificationVapidKeyTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class NotificationVapidKeyTest extends TestCase
{
    public function test_can_get_vapid_key(): void
    {
        $response = $this->getJson('/api/notifications/vapid-key');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'publicKey',
            ]);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationVapidKeyTest
```

### 2.2 Web Push Registration Test
**File:** `tests/Feature/Api/NotificationWebPushTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;

class NotificationWebPushTest extends TestCase
{
    public function test_can_register_web_push(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/notifications/web-push/register', [
                'platform' => 'daynews',
                'community_id' => 'chicago-il',
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test',
                'keys' => [
                    'p256dh' => 'test-p256dh-key',
                    'auth' => 'test-auth-key',
                ],
                'notification_types' => ['breaking_news'],
            ]);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'subscription_id',
            ]);
        
        $this->assertDatabaseHas('notification_subscriptions', [
            'user_id' => $user->id,
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
            'web_push_endpoint' => 'https://fcm.googleapis.com/fcm/send/test',
        ]);
    }
    
    public function test_requires_authentication(): void
    {
        $response = $this->postJson('/api/notifications/web-push/register', []);
        
        $response->assertStatus(401);
    }
    
    public function test_validates_required_fields(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/notifications/web-push/register', []);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['platform', 'community_id', 'endpoint', 'keys']);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationWebPushTest
```

### 2.3 SMS Verification Test
**File:** `tests/Feature/Api/NotificationSmsTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\PhoneVerification;
use App\Services\NotificationService;
use Mockery;

class NotificationSmsTest extends TestCase
{
    public function test_can_request_phone_verification(): void
    {
        $user = User::factory()->create();
        
        // Mock NotificationService to avoid actual SMS send
        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('sendDirectSMS')
                ->once()
                ->andReturn(true);
        });
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/notifications/sms/request-verification', [
                'phone_number' => '+13125551234',
                'platform' => 'daynews',
            ]);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('phone_verifications', [
            'phone_number' => '+13125551234',
        ]);
    }
    
    public function test_can_verify_and_subscribe(): void
    {
        $user = User::factory()->create();
        
        $verification = PhoneVerification::create([
            'phone_number' => '+13125551234',
            'code' => '123456',
            'expires_at' => now()->addMinutes(10),
        ]);
        
        // Mock NotificationService
        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('subscribePhoneToSMS')
                ->once()
                ->andReturn('arn:aws:sns:us-east-1:123456789012:subscription/test');
        });
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/notifications/sms/verify-and-subscribe', [
                'phone_number' => '+13125551234',
                'code' => '123456',
                'platform' => 'daynews',
                'community_id' => 'chicago-il',
            ]);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('notification_subscriptions', [
            'user_id' => $user->id,
            'phone_number' => '+13125551234',
            'phone_verified' => true,
        ]);
    }
    
    public function test_fails_with_invalid_code(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/notifications/sms/verify-and-subscribe', [
                'phone_number' => '+13125551234',
                'code' => '000000',
                'platform' => 'daynews',
                'community_id' => 'chicago-il',
            ]);
        
        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationSmsTest
```

### 2.4 Subscription Management Test
**File:** `tests/Feature/Api/NotificationSubscriptionTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\NotificationSubscription;

class NotificationSubscriptionTest extends TestCase
{
    public function test_can_get_user_subscriptions(): void
    {
        $user = User::factory()->create();
        $subscription = NotificationSubscription::factory()->create([
            'user_id' => $user->id,
        ]);
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/notifications/subscriptions');
        
        $response->assertStatus(200)
            ->assertJsonCount(1, 'subscriptions');
    }
    
    public function test_can_update_preferences(): void
    {
        $user = User::factory()->create();
        $subscription = NotificationSubscription::factory()->create([
            'user_id' => $user->id,
        ]);
        
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/notifications/subscriptions/{$subscription->id}", [
                'notification_types' => ['breaking_news'],
                'frequency' => 'daily_digest',
            ]);
        
        $response->assertStatus(200);
        
        $this->assertEquals(['breaking_news'], $subscription->fresh()->notification_types);
    }
    
    public function test_can_unsubscribe(): void
    {
        $user = User::factory()->create();
        $subscription = NotificationSubscription::factory()->create([
            'user_id' => $user->id,
            'sns_sms_subscription_arn' => 'arn:aws:sns:test',
        ]);
        
        // Mock NotificationService
        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('unsubscribe')
                ->once()
                ->andReturn(true);
        });
        
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/notifications/subscriptions/{$subscription->id}");
        
        $response->assertStatus(200);
        
        $this->assertEquals('unsubscribed', $subscription->fresh()->status);
    }
    
    public function test_cannot_update_other_user_subscription(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $subscription = NotificationSubscription::factory()->create([
            'user_id' => $user2->id,
        ]);
        
        $response = $this->actingAs($user1, 'sanctum')
            ->patchJson("/api/notifications/subscriptions/{$subscription->id}", []);
        
        $response->assertStatus(403);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationSubscriptionTest
```

**Verification:**
- [ ] All API tests pass
- [ ] Authentication works
- [ ] Authorization works
- [ ] Validation works
- [ ] Error handling works

---

## Phase 3: Integration Tests

### 3.1 End-to-End Notification Flow Test
**File:** `tests/Integration/NotificationFlowTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\NotificationSubscription;
use App\Services\NotificationIntegrationService;
use App\Models\NotificationLog;

class NotificationFlowTest extends TestCase
{
    public function test_complete_notification_flow(): void
    {
        // 1. Create user and subscription
        $user = User::factory()->create();
        $subscription = NotificationSubscription::factory()->create([
            'user_id' => $user->id,
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
            'notification_types' => ['breaking_news'],
            'status' => 'active',
            'web_push_endpoint' => 'https://fcm.googleapis.com/fcm/send/test',
            'web_push_p256dh' => 'test-key',
            'web_push_auth' => 'test-auth',
        ]);
        
        // 2. Send notification
        $service = app(NotificationIntegrationService::class);
        $service->sendBreakingNews(
            communityId: 'chicago-il',
            title: 'Test Breaking News',
            message: 'This is a test',
            url: 'https://test.com'
        );
        
        // 3. Process queue
        $this->artisan('queue:work --once');
        
        // 4. Verify notification logged
        $this->assertDatabaseHas('notification_log', [
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
            'notification_type' => 'breaking_news',
        ]);
    }
}
```

**Run Tests:**
```bash
php artisan test --filter NotificationFlowTest
```

---

## Phase 4: Browser Tests (Service Worker & Web Push)

### 4.1 Service Worker Registration Test
**Manual Test Steps:**

1. **Open Browser DevTools**
   - Chrome: F12 > Application > Service Workers
   - Firefox: F12 > Application > Service Workers

2. **Navigate to Site**
   - Go to any page with service worker registration

3. **Verify Registration**
   - [ ] Service worker appears in list
   - [ ] Status shows "activated and is running"
   - [ ] No errors in console

4. **Test Push Event**
   - Send test notification via API
   - [ ] Notification appears in browser
   - [ ] Notification has correct title and message
   - [ ] Notification has correct icon

5. **Test Click Handler**
   - Click notification
   - [ ] Browser navigates to correct URL
   - [ ] Existing window focuses if URL matches

**Test Script:**
```javascript
// Run in browser console
navigator.serviceWorker.ready.then(registration => {
    console.log('Service Worker registered:', registration);
    
    // Test push subscription
    registration.pushManager.getSubscription().then(subscription => {
        console.log('Push subscription:', subscription);
    });
});
```

### 4.2 Web Push Notification Test
**Manual Test Steps:**

1. **Subscribe to Notifications**
   - Navigate to notification settings page
   - Click "Enable Browser Notifications"
   - Allow notifications when prompted
   - [ ] Success message appears
   - [ ] Subscription saved in database

2. **Send Test Notification**
   ```bash
   php artisan notify:send daynews chicago-il \
       --type=breaking_news \
       --title="Test Notification" \
       --message="This is a test" \
       --push
   ```

3. **Verify Notification Received**
   - [ ] Notification appears in browser
   - [ ] Notification has correct content
   - [ ] Clicking notification opens correct URL

4. **Test Notification Actions**
   - [ ] "View" action opens URL
   - [ ] "Dismiss" action closes notification

**Verification:**
- [ ] Service worker registers correctly
- [ ] Push notifications work
- [ ] Click handlers work
- [ ] Notification actions work

---

## Phase 5: SMS Tests (AWS SNS)

### 5.1 SMS Sending Test
**Manual Test Steps:**

1. **Test Direct SMS**
   ```php
   // In tinker
   $service = app(\App\Services\NotificationService::class);
   $result = $service->sendDirectSMS('+13125551234', 'Test message');
   // Should return true
   ```

2. **Verify SMS Received**
   - [ ] SMS received on phone
   - [ ] Message content correct
   - [ ] Sender ID correct (if configured)

3. **Test Topic Publishing**
   ```php
   // Subscribe phone to topic first
   $service->subscribePhoneToSMS('+13125551234', 'daynews', 'chicago-il');
   
   // Publish to topic
   $messageId = $service->publishToTopic('daynews', 'chicago-il', 'Test message');
   // Should return message ID
   ```

4. **Verify Topic SMS Received**
   - [ ] SMS received on subscribed phone
   - [ ] Message content correct

**Verification:**
- [ ] Direct SMS works
- [ ] Topic publishing works
- [ ] Subscriptions work
- [ ] Messages delivered correctly

### 5.2 Phone Verification Test
**Manual Test Steps:**

1. **Request Verification Code**
   - Use API endpoint or UI
   - Enter phone number
   - [ ] Verification code sent
   - [ ] Code received via SMS

2. **Verify Code**
   - Enter code in UI
   - [ ] Code verified successfully
   - [ ] Subscription created

3. **Test Invalid Code**
   - Enter wrong code
   - [ ] Error message shown
   - [ ] Attempts incremented

4. **Test Expired Code**
   - Wait 10+ minutes
   - Try to verify
   - [ ] Error message shown

**Verification:**
- [ ] Verification codes sent
- [ ] Codes verified correctly
- [ ] Invalid codes rejected
- [ ] Expired codes rejected
- [ ] Rate limiting works

---

## Phase 6: End-to-End User Flow Tests

### 6.1 Complete Subscription Flow Test
**Manual Test Steps:**

**Scenario:** User subscribes to Day.News notifications

1. **Navigate to Settings**
   - Go to Day.News
   - Click "Settings" > "Notifications"
   - [ ] Notification settings page loads

2. **Select Notification Types**
   - Check "Breaking News"
   - Check "Local Events"
   - Uncheck "Deals & Offers"
   - [ ] Preferences saved

3. **Enable Browser Notifications**
   - Click "Enable Browser Notifications"
   - Allow notifications when prompted
   - [ ] Success message appears
   - [ ] "Browser notifications enabled" shown

4. **Subscribe to SMS**
   - Enter phone number: +13125551234
   - Click "Verify"
   - [ ] Verification code sent
   - Enter code: 123456
   - Click "Subscribe"
   - [ ] Success message appears
   - [ ] "SMS notifications enabled" shown

5. **Receive Test Notification**
   ```bash
   php artisan notify:send daynews chicago-il \
       --type=breaking_news \
       --title="Breaking News Test" \
       --message="This is a test notification" \
       --sms --push
   ```
   - [ ] Browser notification received
   - [ ] SMS received
   - [ ] Both have correct content

6. **Update Preferences**
   - Change notification types
   - Change quiet hours
   - [ ] Changes saved
   - [ ] New preferences applied

7. **Unsubscribe**
   - Click "Unsubscribe"
   - Confirm
   - [ ] Unsubscribed successfully
   - [ ] No more notifications received

**Verification:**
- [ ] Complete flow works end-to-end
- [ ] All UI interactions work
- [ ] Notifications received correctly
- [ ] Preferences updated correctly
- [ ] Unsubscribe works

### 6.2 Multi-Platform Test
**Manual Test Steps:**

1. **Subscribe to Day.News**
   - Complete subscription flow
   - [ ] Subscription created

2. **Subscribe to GoEventCity**
   - Switch to GoEventCity
   - Complete subscription flow
   - [ ] Separate subscription created

3. **Send Platform-Specific Notifications**
   - Send Day.News notification
   - [ ] Only Day.News subscribers receive it
   - Send GoEventCity notification
   - [ ] Only GoEventCity subscribers receive it

**Verification:**
- [ ] Multiple subscriptions work
- [ ] Platform isolation works
- [ ] Notifications go to correct subscribers

---

## Phase 7: Performance Tests

### 7.1 Load Test
**Test Script:** `tests/Performance/NotificationLoadTest.php`

```php
<?php

namespace Tests\Performance;

use Tests\TestCase;
use App\Models\NotificationSubscription;
use App\Services\NotificationIntegrationService;

class NotificationLoadTest extends TestCase
{
    public function test_can_send_to_many_subscribers(): void
    {
        // Create 1000 subscribers
        NotificationSubscription::factory()->count(1000)->create([
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
            'status' => 'active',
        ]);
        
        $start = microtime(true);
        
        $service = app(NotificationIntegrationService::class);
        $service->sendBreakingNews(
            communityId: 'chicago-il',
            title: 'Load Test',
            message: 'This is a load test',
        );
        
        // Process queue
        $this->artisan('queue:work --stop-when-empty');
        
        $duration = microtime(true) - $start;
        
        // Should complete in reasonable time
        $this->assertLessThan(60, $duration); // 60 seconds
    }
}
```

**Verification:**
- [ ] System handles 1000+ subscribers
- [ ] Performance acceptable
- [ ] No memory leaks
- [ ] Queue processes efficiently

### 7.2 Stress Test
**Manual Test Steps:**

1. **Create Many Subscriptions**
   ```php
   // In tinker
   NotificationSubscription::factory()->count(10000)->create();
   ```

2. **Send Notification**
   ```bash
   php artisan notify:send daynews chicago-il \
       --type=breaking_news \
       --message="Stress test" \
       --sms --push
   ```

3. **Monitor**
   - [ ] Queue processes all jobs
   - [ ] No errors
   - [ ] System remains stable
   - [ ] Memory usage acceptable

**Verification:**
- [ ] System handles stress
- [ ] No crashes
- [ ] Performance degrades gracefully

---

## Phase 8: Security Tests

### 8.1 Authorization Tests
**Test Cases:**

```php
public function test_cannot_access_other_user_subscription(): void
{
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $subscription = NotificationSubscription::factory()->create([
        'user_id' => $user2->id,
    ]);
    
    $response = $this->actingAs($user1, 'sanctum')
        ->getJson("/api/notifications/subscriptions/{$subscription->id}");
    
    $response->assertStatus(403);
}
```

**Verification:**
- [ ] Users can only access their own subscriptions
- [ ] Authorization policies work
- [ ] Unauthorized access blocked

### 8.2 Validation Tests
**Test Cases:**

```php
public function test_rejects_invalid_phone_number(): void
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/notifications/sms/request-verification', [
            'phone_number' => 'invalid',
            'platform' => 'daynews',
        ]);
    
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['phone_number']);
}
```

**Verification:**
- [ ] Invalid inputs rejected
- [ ] Validation messages clear
- [ ] SQL injection prevented
- [ ] XSS prevented

---

## Phase 9: Error Handling Tests

### 9.1 Service Failure Tests
**Test Cases:**

```php
public function test_handles_sns_failure_gracefully(): void
{
    // Mock SNS to throw exception
    $this->mock(NotificationService::class, function ($mock) {
        $mock->shouldReceive('publishToTopic')
            ->andThrow(new \Exception('SNS Error'));
    });
    
    $service = app(NotificationIntegrationService::class);
    
    // Should not throw exception
    $service->sendBreakingNews(
        communityId: 'chicago-il',
        title: 'Test',
        message: 'Test',
    );
    
    // Should log error
    // Check logs
}
```

**Verification:**
- [ ] Errors handled gracefully
- [ ] Errors logged
- [ ] User sees appropriate message
- [ ] System continues functioning

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Test database created
- [ ] Test environment configured
- [ ] AWS SNS sandbox configured
- [ ] VAPID keys generated
- [ ] Test phone numbers available

### Unit Tests
- [ ] Model tests pass
- [ ] Service tests pass
- [ ] Policy tests pass

### Feature Tests
- [ ] API endpoint tests pass
- [ ] Authentication tests pass
- [ ] Authorization tests pass
- [ ] Validation tests pass

### Integration Tests
- [ ] End-to-end flow tests pass
- [ ] Queue processing tests pass
- [ ] Database integration tests pass

### Browser Tests
- [ ] Service worker registration works
- [ ] Web push notifications work
- [ ] Click handlers work
- [ ] Cross-browser compatibility verified

### SMS Tests
- [ ] Direct SMS works
- [ ] Topic publishing works
- [ ] Phone verification works
- [ ] Error handling works

### End-to-End Tests
- [ ] Complete subscription flow works
- [ ] Multi-platform works
- [ ] Preferences work
- [ ] Unsubscribe works

### Performance Tests
- [ ] Load tests pass
- [ ] Stress tests pass
- [ ] Performance acceptable

### Security Tests
- [ ] Authorization tests pass
- [ ] Validation tests pass
- [ ] Security vulnerabilities checked

---

## Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [ENV]

Unit Tests: [PASS/FAIL] ([X] passed, [Y] failed)
Feature Tests: [PASS/FAIL] ([X] passed, [Y] failed)
Integration Tests: [PASS/FAIL] ([X] passed, [Y] failed)
Browser Tests: [PASS/FAIL] ([X] passed, [Y] failed)
SMS Tests: [PASS/FAIL] ([X] passed, [Y] failed)
E2E Tests: [PASS/FAIL] ([X] passed, [Y] failed)
Performance Tests: [PASS/FAIL] ([X] passed, [Y] failed)
Security Tests: [PASS/FAIL] ([X] passed, [Y] failed)

Issues Found:
1. [ISSUE]
2. [ISSUE]

Notes:
[NOTES]
```

---

## Running All Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter NotificationSubscriptionTest
php artisan test --filter NotificationServiceTest
php artisan test --filter NotificationWebPushTest

# Run with coverage
php artisan test --coverage

# Run in parallel
php artisan test --parallel
```

---

**Total Estimated Testing Time:** 6-8 hours  
**Next Step:** Execute tests and document results

