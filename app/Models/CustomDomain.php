<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CustomDomain extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'business_id',
        'domain',
        'status',
        'ssl_certificate_id',
        'verified_at',
        'dns_verified',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->dns_verified;
    }

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'dns_verified' => 'boolean',
        ];
    }
}
