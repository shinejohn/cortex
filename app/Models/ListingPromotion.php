<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

final class ListingPromotion extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'promotable_type',
        'promotable_id',
        'tier',
        'community_id',
        'start_date',
        'end_date',
        'price_paid',
        'purchased_by',
        'status',
        'stripe_payment_id',
    ];

    public function promotable(): MorphTo
    {
        return $this->morphTo();
    }

    public function purchaser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purchased_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeHeadliner(Builder $query): Builder
    {
        return $query->where('tier', 'headliner');
    }

    public function scopePriority(Builder $query): Builder
    {
        return $query->where('tier', 'priority');
    }

    public function scopeForCommunity(Builder $query, ?string $communityId): Builder
    {
        if ($communityId === null) {
            return $query->whereNull('community_id');
        }

        return $query->where('community_id', $communityId);
    }

    public function scopeCurrentlyActive(Builder $query): Builder
    {
        $today = Carbon::today()->toDateString();

        return $query->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today);
    }

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'price_paid' => 'decimal:2',
        ];
    }
}
