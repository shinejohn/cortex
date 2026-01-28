<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PollOption extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'poll_id',
        'business_id',
        'name',
        'description',
        'image_url',
        'website_url',
        'participation_tier',
        'is_sponsored',
        'sponsorship_amount',
        'special_offer',
        'vote_count',
        'rank',
        'display_order',
    ];

    protected $casts = [
        'is_sponsored' => 'boolean',
    ];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
