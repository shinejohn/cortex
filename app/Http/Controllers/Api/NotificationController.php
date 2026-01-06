<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationSubscription;
use App\Services\NotificationService;
use App\Services\WebPushService;
use App\Services\PhoneVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService,
        private WebPushService $webPushService,
        private PhoneVerificationService $phoneService
    ) {}

    /**
     * Get VAPID public key for browser push registration
     */
    public function getVapidKey(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('services.webpush.public_key'),
        ]);
    }

    /**
     * Register browser push subscription
     */
    public function registerWebPush(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:daynews,goeventcity,downtownguide,alphasite',
            'community_id' => 'required|string|max:100',
            'endpoint' => 'required|url',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
            'notification_types' => 'array',
        ]);

        $subscription = NotificationSubscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'],
                'community_id' => $validated['community_id'],
            ],
            [
                'web_push_endpoint' => $validated['endpoint'],
                'web_push_p256dh' => $validated['keys']['p256dh'],
                'web_push_auth' => $validated['keys']['auth'],
                'notification_types' => $validated['notification_types'] ?? ['breaking_news', 'events', 'deals'],
                'status' => 'active',
            ]
        );

        return response()->json([
            'success' => true,
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Request phone verification
     */
    public function requestPhoneVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|regex:/^\+1[0-9]{10}$/',
            'platform' => 'required|in:daynews,goeventcity,downtownguide,alphasite',
        ]);

        try {
            $this->phoneService->sendVerificationCode(
                $validated['phone_number'],
                $validated['platform']
            );

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 429);
        }
    }

    /**
     * Verify phone and subscribe to SMS
     */
    public function verifyPhoneAndSubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|regex:/^\+1[0-9]{10}$/',
            'code' => 'required|string|size:6',
            'platform' => 'required|in:daynews,goeventcity,downtownguide,alphasite',
            'community_id' => 'required|string|max:100',
            'notification_types' => 'array',
        ]);

        // Verify code
        if (!$this->phoneService->verifyCode($validated['phone_number'], $validated['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code',
            ], 400);
        }

        // Subscribe to SNS topic
        $subscriptionArn = $this->notificationService->subscribePhoneToSMS(
            $validated['phone_number'],
            $validated['platform'],
            $validated['community_id']
        );

        if (!$subscriptionArn) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe to SMS notifications',
            ], 500);
        }

        // Save subscription
        $subscription = NotificationSubscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'],
                'community_id' => $validated['community_id'],
            ],
            [
                'phone_number' => $validated['phone_number'],
                'phone_verified' => true,
                'phone_verified_at' => now(),
                'sns_sms_subscription_arn' => $subscriptionArn,
                'notification_types' => $validated['notification_types'] ?? ['breaking_news', 'events', 'deals'],
                'status' => 'active',
            ]
        );

        return response()->json([
            'success' => true,
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request, NotificationSubscription $subscription): JsonResponse
    {
        $this->authorize('update', $subscription);

        $validated = $request->validate([
            'notification_types' => 'array',
            'frequency' => 'in:instant,daily_digest,weekly_digest',
            'quiet_hours_start' => 'date_format:H:i',
            'quiet_hours_end' => 'date_format:H:i',
            'status' => 'in:active,paused',
        ]);

        $subscription->update($validated);

        return response()->json([
            'success' => true,
            'subscription' => $subscription->fresh(),
        ]);
    }

    /**
     * Unsubscribe
     */
    public function unsubscribe(Request $request, NotificationSubscription $subscription): JsonResponse
    {
        $this->authorize('delete', $subscription);

        // Unsubscribe from SNS if SMS was enabled
        if ($subscription->sns_sms_subscription_arn) {
            $this->notificationService->unsubscribe($subscription->sns_sms_subscription_arn);
        }

        $subscription->update(['status' => 'unsubscribed']);

        return response()->json([
            'success' => true,
            'message' => 'Successfully unsubscribed',
        ]);
    }

    /**
     * Get user's subscriptions
     */
    public function getSubscriptions(Request $request): JsonResponse
    {
        $subscriptions = NotificationSubscription::where('user_id', $request->user()->id)
            ->where('status', '!=', 'unsubscribed')
            ->get();

        return response()->json([
            'subscriptions' => $subscriptions,
        ]);
    }
}
