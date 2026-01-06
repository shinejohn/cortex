<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class NewsletterSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscriber_id',
        'tier',
        'price',
        'stripe_subscription_id',
        'status',
        'started_at',
        'cancelled_at',
        'current_period_end',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'started_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'current_period_end' => 'datetime',
    ];

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(EmailSubscriber::class, 'subscriber_id');
    }
}
