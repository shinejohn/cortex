<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\TicketOrder;
use App\Models\User;

final class PromoCodeService
{
    public function validateCode(string $code, float $amount, ?string $eventId = null): array
    {
        $promoCode = PromoCode::where('code', strtoupper($code))->first();

        if (!$promoCode) {
            return [
                'valid' => false,
                'message' => 'Invalid promo code.',
            ];
        }

        if (!$promoCode->isValid()) {
            return [
                'valid' => false,
                'message' => 'This promo code is no longer valid.',
            ];
        }

        // Check if applicable to event
        if ($eventId && $promoCode->applicable_to) {
            if (!in_array($eventId, $promoCode->applicable_to)) {
                return [
                    'valid' => false,
                    'message' => 'This promo code is not applicable to this event.',
                ];
            }
        }

        $discount = $promoCode->calculateDiscount($amount);

        return [
            'valid' => true,
            'promo_code' => $promoCode,
            'discount' => $discount,
            'final_amount' => $amount - $discount,
        ];
    }

    public function applyCode(PromoCode $promoCode, TicketOrder $order, User $user): PromoCodeUsage
    {
        $discount = $promoCode->calculateDiscount((float) $order->subtotal);

        // Record usage
        $usage = PromoCodeUsage::create([
            'promo_code_id' => $promoCode->id,
            'user_id' => $user->id,
            'ticket_order_id' => $order->id,
            'discount_amount' => $discount,
            'original_amount' => $order->subtotal,
            'final_amount' => $order->subtotal - $discount,
            'used_at' => now(),
        ]);

        // Increment usage count
        $promoCode->increment('used_count');

        return $usage;
    }

    public function createCode(array $data): PromoCode
    {
        if (empty($data['code'])) {
            $data['code'] = PromoCode::generateUniqueCode();
        } else {
            $data['code'] = strtoupper($data['code']);
        }

        return PromoCode::create($data);
    }

    public function updateCode(PromoCode $promoCode, array $data): PromoCode
    {
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $promoCode->update($data);

        return $promoCode;
    }
}

