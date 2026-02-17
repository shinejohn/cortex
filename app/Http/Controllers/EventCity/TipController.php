<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventCity\StoreTipRequest;
use App\Models\Performer;
use App\Models\Tip;
use App\Services\EventCity\FanCaptureService;
use App\Services\EventCity\TipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

final class TipController extends Controller
{
    public function __construct(
        private readonly TipService $tipService,
        private readonly FanCaptureService $fanCaptureService
    ) {}

    /**
     * Create a Stripe payment intent for a tip.
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'performer_id' => ['required', 'exists:performers,id'],
            'amount_cents' => ['required', 'integer', 'min:100', 'max:100000'],
        ]);

        $performer = Performer::findOrFail($request->performer_id);

        if (! $performer->tips_enabled || ! $performer->workspace) {
            return response()->json(['error' => 'This performer cannot receive tips at this time.'], 422);
        }

        try {
            $paymentIntent = $this->tipService->createPaymentIntent(
                $performer,
                $request->integer('amount_cents'),
                ['event_id' => $request->input('event_id')]
            );

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (Throwable $e) {
            return response()->json(['error' => 'Failed to create payment. Please try again.'], 500);
        }
    }

    /**
     * Store a completed tip (called after Stripe confirms payment on the frontend).
     */
    public function store(StoreTipRequest $request): JsonResponse
    {
        $performer = Performer::findOrFail($request->performer_id);

        $fan = $this->fanCaptureService->captureOrFindFan($performer, [
            'name' => $request->fan_name,
            'email' => $request->fan_email,
            'phone' => $request->fan_phone,
            'source' => 'tip',
        ]);

        $tip = Tip::create([
            'performer_id' => $performer->id,
            'fan_id' => $fan->id,
            'event_id' => $request->event_id,
            'amount_cents' => $request->integer('amount_cents'),
            'platform_fee_cents' => 0,
            'status' => 'pending',
            'stripe_payment_intent_id' => $request->payment_intent_id,
            'fan_message' => $request->fan_message,
            'is_anonymous' => $request->boolean('is_anonymous'),
        ]);

        return response()->json([
            'success' => true,
            'tip_id' => $tip->id,
        ]);
    }
}
