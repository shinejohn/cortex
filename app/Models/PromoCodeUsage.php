<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PromoCodeUsage extends Model
{
    /** @use HasFactory<\Database\Factories\PromoCodeUsageFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'promo_code_id',
        'user_id',
        'ticket_order_id',
        'discount_amount',
        'original_amount',
        'final_amount',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_amount' => 'decimal:2',
            'original_amount' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'used_at' => 'datetime',
        ];
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ticketOrder(): BelongsTo
    {
        return $this->belongsTo(TicketOrder::class);
    }
}

