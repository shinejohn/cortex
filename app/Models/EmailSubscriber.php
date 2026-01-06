<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

final class EmailSubscriber extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'email',
        'first_name',
        'last_name',
        'community_id',
        'business_id',
        'type',
        'status',
        'confirmed_at',
        'unsubscribed_at',
        'unsubscribe_reason',
        'preferences',
        'source',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'preferences' => 'array',
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

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function sends(): HasMany
    {
        return $this->hasMany(EmailSend::class, 'subscriber_id');
    }

    public function newsletterSubscription(): HasOne
    {
        return $this->hasOne(NewsletterSubscription::class, 'subscriber_id');
    }

    public function emergencySubscription(): HasOne
    {
        return $this->hasOne(EmergencySubscription::class, 'subscriber_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}") ?: $this->email;
    }

    public function wantsDigest(): bool
    {
        return ($this->preferences['daily_digest'] ?? true) && $this->status === 'active';
    }

    public function wantsBreakingNews(): bool
    {
        return ($this->preferences['breaking_news'] ?? true) && $this->status === 'active';
    }

    public function wantsNewsletter(): bool
    {
        return ($this->preferences['weekly_newsletter'] ?? false) && $this->status === 'active';
    }
}
