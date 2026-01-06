<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'smb_business_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'lifecycle_stage',
        'lead_score',
        'lead_source',
        'email_opted_in',
        'sms_opted_in',
        'lifetime_value',
        'tags',
        'custom_fields',
    ];

    protected function casts(): array
    {
        return [
            'email_opted_in' => 'boolean',
            'sms_opted_in' => 'boolean',
            'lifetime_value' => 'decimal:2',
            'tags' => 'array',
            'custom_fields' => 'array',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function smbBusiness(): BelongsTo
    {
        return $this->belongsTo(SmbBusiness::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function campaignRecipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
