# Notification System Setup Guide

## Overview

The notification system supports SMS (via AWS SNS) and Web Push notifications across all platforms (Day.News, GoEventCity, DowntownsGuide, AlphaSite).

## Prerequisites

1. AWS Account with SNS access
2. VAPID keys for Web Push (can be generated)

## Setup Steps

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

This will output:
- Public Key
- Private Key

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# SNS Topic Prefix
SNS_TOPIC_PREFIX=shine-notifications

# Web Push VAPID Keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:notifications@shine.com

# SMS Rate Limiting
SMS_DAILY_LIMIT_PER_USER=5
SMS_MONTHLY_SPEND_LIMIT=1000
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. AWS SNS Setup

#### Request SMS Access

1. Go to AWS Console > SNS > Text messaging (SMS)
2. Request production access (sandbox available immediately)
3. Set spending limits

#### Register 10DLC (for US SMS)

1. Go to AWS Console > Pinpoint > SMS and voice
2. Register company ($4 one-time)
3. Create campaign ($10/month or $2 for low-volume)
4. Purchase 10DLC number ($1/month)

### 5. Test the System

#### Test SMS

```bash
php artisan tinker
```

```php
$service = app(\App\Services\NotificationService::class);
$service->sendDirectSMS('+13125551234', 'Test notification');
```

#### Test Web Push

1. Navigate to a page with the `NotificationSubscribe` component
2. Click "Enable Browser Notifications"
3. Allow notifications in browser

#### Test Command

```bash
php artisan notify:send daynews chicago-il \
    --type=breaking_news \
    --title="Test Notification" \
    --message="This is a test notification" \
    --url="https://chicago.daynews.com" \
    --sms --push
```

## Usage Examples

### Send Breaking News (Day.News)

```php
use App\Services\NotificationIntegrationService;

$service = app(NotificationIntegrationService::class);
$service->sendBreakingNews(
    communityId: 'chicago-il',
    title: 'Breaking: Major Storm Warning',
    message: 'Severe weather alert for Chicago area. Stay safe!',
    url: 'https://chicago.daynews.com/weather-alert'
);
```

### Send Event Reminder (GoEventCity)

```php
$service->sendEventReminder(
    communityId: 'austin-tx',
    eventTitle: 'Food Truck Festival',
    message: "Don't miss the Austin Food Truck Festival starting at 5pm!",
    url: 'https://austin.goeventcity.com/events/food-truck-festival'
);
```

### Send Order Confirmation (GoEventCity)

```php
$service->sendOrderConfirmation(
    communityId: 'austin-tx',
    orderId: 'order_123',
    message: 'Your tickets for Food Truck Festival have been confirmed!',
    url: 'https://austin.goeventcity.com/orders/order_123'
);
```

## API Endpoints

### Public Endpoints

- `GET /api/notifications/vapid-key` - Get VAPID public key

### Authenticated Endpoints

- `POST /api/notifications/web-push/register` - Register web push subscription
- `POST /api/notifications/sms/request-verification` - Request phone verification code
- `POST /api/notifications/sms/verify-and-subscribe` - Verify code and subscribe to SMS
- `GET /api/notifications/subscriptions` - Get user's subscriptions
- `PATCH /api/notifications/subscriptions/{subscription}` - Update preferences
- `DELETE /api/notifications/subscriptions/{subscription}` - Unsubscribe

## Frontend Integration

### Add Notification Subscribe Component

```tsx
import NotificationSubscribe from '@/components/NotificationSubscribe';

<NotificationSubscribe 
    platform="daynews" 
    communityId="chicago-il" 
/>
```

## Cost Estimation

For 6,800 communities:

- SNS Topics: $0 (free)
- SNS API Requests: ~$0.50/month
- Web Push: ~$0.25/month
- SMS (100K messages): ~$645/month
- SMS Carrier Fees: ~$300/month
- 10DLC Monthly: $11/month

**Total: ~$957/month**

*Note: SMS is the major cost driver. Use push notifications for routine updates, SMS for high-value alerts.*

## Troubleshooting

### Web Push Not Working

1. Check VAPID keys are set correctly
2. Verify service worker is registered
3. Check browser console for errors
4. Ensure HTTPS (required for push notifications)

### SMS Not Sending

1. Verify AWS credentials are correct
2. Check SMS spending limits in AWS Console
3. Verify phone number format (+1XXXXXXXXXX)
4. Check AWS SNS logs in CloudWatch

### Notifications Not Respecting Quiet Hours

1. Verify timezone settings
2. Check `quiet_hours_start` and `quiet_hours_end` in subscription
3. Verify `isQuietHours()` method logic

## Support

For issues or questions, check:
- AWS SNS Documentation: https://docs.aws.amazon.com/sns/
- Web Push API: https://web.dev/push-notifications-overview/

