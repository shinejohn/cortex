<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class EmergencyDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'alert_id',
        'subscription_id',
        'channel',
        'status',
        'external_id',
        'sent_at',
        'delivered_at',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function alert(): BelongsTo
    {
        return $this->belongsTo(EmergencyAlert::class, 'alert_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(EmergencySubscription::class, 'subscription_id');
    }
}
