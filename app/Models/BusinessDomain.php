<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

final class BusinessDomain extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'business_id',
        'domain_name',
        'domain_source',
        'status',
        'cloudflare_registration_id',
        'purchase_price',
        'purchase_currency',
        'registration_date',
        'expiration_date',
        'auto_renew',
        'dns_verified_at',
        'ssl_provisioned_at',
        'last_dns_check_at',
        'dns_check_method',
        'dns_instructions',
        'is_primary',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function dnsChecks(): HasMany
    {
        return $this->hasMany(DomainDnsCheck::class);
    }

    public function latestDnsCheck(): HasOne
    {
        return $this->hasOne(DomainDnsCheck::class)->latestOfMany();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPurchased(): bool
    {
        return $this->domain_source === 'purchased';
    }

    public function isExternal(): bool
    {
        return $this->domain_source === 'external';
    }

    protected function casts(): array
    {
        return [
            'dns_instructions' => 'array',
            'purchase_price' => 'decimal:2',
            'is_primary' => 'boolean',
            'auto_renew' => 'boolean',
            'registration_date' => 'date',
            'expiration_date' => 'date',
            'dns_verified_at' => 'datetime',
            'ssl_provisioned_at' => 'datetime',
            'last_dns_check_at' => 'datetime',
        ];
    }
}
