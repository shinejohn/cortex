<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\TipReceived;
use App\Models\Fan;
use App\Models\Performer;
use App\Models\Tip;
use App\Services\StripeConnectService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\PaymentIntent;

final class TipService
{
    public function __construct(
        private readonly StripeConnectService $stripeService
    ) {}

    /**
     * Create a Stripe payment intent for a tip
     */
    public function createPaymentIntent(Performer $performer, int $amountCents, array $metadata = []): PaymentIntent
    {
        $workspace = $performer->workspace;

        return $this->stripeService->createTipPaymentIntent($workspace, $amountCents, array_merge([
            'type' => 'tip',
            'performer_id' => $performer->id,
        ], $metadata));
    }

    /**
     * Handle a successful tip payment
     */
    public function handleTipSucceeded(Tip $tip, string $chargeId, int $stripeFee): void
    {
        DB::transaction(function () use ($tip, $chargeId, $stripeFee) {
            $tip->markAsSucceeded($chargeId, $stripeFee);

            // Update fan stats
            $tip->fan->increment('tip_count');
            $tip->fan->increment('total_tips_given_cents', $tip->amount_cents);
            $tip->fan->update(['last_interaction_at' => now()]);

            // Update performer stats
            $tip->performer->increment('total_tip_count');
            $tip->performer->increment('total_tips_received_cents', $tip->amount_cents);

            event(new TipReceived($tip));
        });

        Log::info('Tip succeeded', ['tip_id' => $tip->id, 'amount' => $tip->amount_cents]);
    }

    /**
     * Handle a failed tip payment
     */
    public function handleTipFailed(Tip $tip): void
    {
        $tip->markAsFailed();
        Log::info('Tip failed', ['tip_id' => $tip->id]);
    }

    /**
     * Get tip statistics for a performer
     */
    public function getPerformerTipStats(Performer $performer): array
    {
        $tips = $performer->tips()->succeeded();

        return [
            'total_tips' => $performer->total_tip_count,
            'total_received_cents' => $performer->total_tips_received_cents,
            'total_fans' => $performer->total_fans_captured,
            'average_tip_cents' => $performer->total_tip_count > 0
                ? (int) ($performer->total_tips_received_cents / $performer->total_tip_count)
                : 0,
            'tips_this_month' => $tips->where('created_at', '>=', now()->startOfMonth())->count(),
            'revenue_this_month' => $tips->where('created_at', '>=', now()->startOfMonth())->sum('amount_cents'),
        ];
    }

    /**
     * Get recent tips for a performer
     */
    public function getRecentTips(Performer $performer, int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return $performer->tips()
            ->with('fan')
            ->succeeded()
            ->latest()
            ->limit($limit)
            ->get();
    }
}
