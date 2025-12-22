<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

final class OrganizationRelationship extends Model
{
    /** @use HasFactory<\Database\Factories\OrganizationRelationshipFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'relatable_type',
        'relatable_id',
        'relationship_type',
        'is_primary',
        'metadata',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'organization_id');
    }

    public function relatable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeByRelationshipType($query, string $type)
    {
        return $query->where('relationship_type', $type);
    }

    public function scopeByRelatableType($query, string $type)
    {
        return $query->where('relatable_type', $type);
    }

    public function scopeForOrganization($query, string $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'metadata' => 'array',
        ];
    }
}

