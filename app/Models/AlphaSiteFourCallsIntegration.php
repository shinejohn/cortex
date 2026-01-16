<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AlphaSiteFourCallsIntegration extends Model
{
    use HasUuid;

    protected $table = 'alphasite_fourcalls_integrations';

    protected $fillable = [
        'business_id',
        'organization_id',
        'coordinator_id',
        'api_key',
        'service_package',
        'status',
        'activated_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the business that owns this integration
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Check if integration is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Get decrypted API key
     */
    public function getDecryptedApiKey(): string
    {
        return decrypt($this->api_key);
    }
}
