<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class TicketPlan extends Model
{
    /** @use HasFactory<\Database\Factories\TicketPlanFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'max_quantity',
        'available_quantity',
        'is_active',
        'metadata',
        'sort_order',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(TicketOrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('available_quantity', '>', 0);
    }

    public function scopeForEvent($query, string $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    public function scopeOrderBySortOrder($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    public function getIsFreeAttribute(): bool
    {
        return $this->price === 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        return $this->is_free ? 'Free' : '$'.number_format($this->price, 2);
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
