<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class DomainDnsCheck extends Model
{
    use HasUuid;

    protected $fillable = [
        'business_domain_id',
        'passed',
        'results',
        'failure_reason',
    ];

    public function businessDomain(): BelongsTo
    {
        return $this->belongsTo(BusinessDomain::class);
    }

    protected function casts(): array
    {
        return [
            'passed' => 'boolean',
            'results' => 'array',
        ];
    }
}
