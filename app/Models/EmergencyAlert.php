<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

final class EmergencyAlert extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'community_id',
        'created_by',
        'municipal_partner_id',
        'priority',
        'category',
        'title',
        'message',
        'instructions',
        'source',
        'source_url',
        'status',
        'published_at',
        'expires_at',
        'delivery_channels',
        'email_sent',
        'sms_sent',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'delivery_channels' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model): void {
            $model->uuid = $model->uuid ?? Str::uuid()->toString();
        });
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function municipalPartner(): BelongsTo
    {
        return $this->belongsTo(MunicipalPartner::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(EmergencyDelivery::class, 'alert_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(EmergencyAuditLog::class, 'alert_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && ($this->expires_at === null || $this->expires_at > now());
    }

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'critical' => 'red',
            'urgent' => 'orange',
            'advisory' => 'yellow',
            'info' => 'blue',
            default => 'gray',
        };
    }
}
