<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TicketOrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\TicketOrderItemFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'ticket_order_id',
        'ticket_plan_id',
        'quantity',
        'unit_price',
        'total_price',
        'ticket_code',
        'qr_code',
    ];

    public function ticketOrder(): BelongsTo
    {
        return $this->belongsTo(TicketOrder::class);
    }

    public function ticketPlan(): BelongsTo
    {
        return $this->belongsTo(TicketPlan::class);
    }

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }
}
