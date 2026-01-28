<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessSubscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProvisioningController extends Controller
{
    /**
     * Provision a subscription based on an external CRM order.
     * This endpoint is called by the Learning Center CRM when a payment is processed.
     */
    public function provisionSubscription(Request $request): JsonResponse
    {
        // Simple security check (Shared Secret)
        $secret = $request->header('X-Provisioning-Secret');
        if ($secret !== config('app.provisioning_secret', 'fibonacco-provisioning-secret-2026')) {
            Log::warning('Unauthorized provisioning attempt', ['ip' => $request->ip()]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'business_name' => 'required|string',
            'crm_order_id' => 'required|string',
            'plan_tier' => 'required|string', // basic, standard, premium
            'subscription_id' => 'required|string', // CRM ServiceSubscription ID
            'stripe_subscription_id' => 'nullable|string',
            'started_at' => 'required|date',
            'expires_at' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 1. Find or Create User
            $user = User::firstOrCreate(
                ['email' => $request->email],
                [
                    'name' => $request->business_name . ' Admin',
                    'password' => bcrypt(Str::random(16)), // Temporary password
                    'email_verified_at' => now(),
                ]
            );

            // 2. Find or Create Business
            // We assume a 1:1 mapping for simplicity in this bridge, 
            // or we look up by owner_id if we have better linking.
            $business = Business::where('owner_id', $user->id)
                ->orWhere('email', $request->email)
                ->orWhere('name', $request->business_name)
                ->first();

            if (!$business) {
                // Determine logic to assign to a workspace/tenant if strictly required
                // For now, create a basic business stub
                $business = Business::create([
                    'owner_id' => $user->id,
                    'name' => $request->business_name,
                    'slug' => Str::slug($request->business_name) . '-' . Str::random(4),
                    'email' => $request->email,
                    'is_active' => true,
                    // Default minimal fields
                ]);
            }

            // 3. Provision Subscription
            // Check if existing active subscription
            $existingSub = BusinessSubscription::where('business_id', $business->id)
                ->where('status', 'active')
                ->first();

            if ($existingSub) {
                // Update existing
                $existingSub->update([
                    'tier' => $request->plan_tier,
                    'subscription_expires_at' => $request->expires_at,
                    'auto_renew' => true,
                    // We store the external references
                    'stripe_subscription_id' => $request->stripe_subscription_id,
                ]);
                $subscription = $existingSub;
            } else {
                // Create new
                $subscription = BusinessSubscription::create([
                    'business_id' => $business->id,
                    'tier' => $request->plan_tier,
                    'status' => 'active',
                    'subscription_started_at' => $request->started_at,
                    'subscription_expires_at' => $request->expires_at,
                    'auto_renew' => true,
                    'stripe_subscription_id' => $request->stripe_subscription_id,
                    'crm_reference_id' => $request->crm_order_id, // Assuming extended schema or simply logged
                ]);
            }

            Log::info("Provisioned subscription for {$request->email} via CRM Order {$request->crm_order_id}");

            return response()->json([
                'success' => true,
                'business_id' => $business->id,
                'subscription_id' => $subscription->id,
                'message' => 'Subscription provisioned successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Provisioning failed: " . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
