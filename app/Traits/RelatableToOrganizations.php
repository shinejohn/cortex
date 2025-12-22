<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Business;
use App\Models\OrganizationRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Collection;

trait RelatableToOrganizations
{
    /**
     * Get organization relationships for this model
     */
    public function organizationRelationships(): MorphMany
    {
        return $this->morphMany(OrganizationRelationship::class, 'relatable');
    }

    /**
     * Get organizations related to this model
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(
            Business::class,
            'organization_relationships',
            'relatable_id',
            'organization_id'
        )
        ->where('relatable_type', static::class)
        ->withPivot(['relationship_type', 'is_primary', 'metadata', 'created_at', 'updated_at'])
        ->withTimestamps();
    }

    /**
     * Get primary organization
     */
    public function primaryOrganization(): ?Business
    {
        return $this->organizations()
            ->wherePivot('is_primary', true)
            ->first();
    }

    /**
     * Relate this model to an organization
     */
    public function relateToOrganization(
        Business $organization,
        string $relationshipType = 'related',
        bool $isPrimary = false,
        array $metadata = []
    ): OrganizationRelationship {
        return $this->organizationRelationships()->create([
            'organization_id' => $organization->id,
            'relationship_type' => $relationshipType,
            'is_primary' => $isPrimary,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get related organizations by relationship type
     */
    public function getRelatedOrganizations(string $relationshipType = null): Collection
    {
        $query = $this->organizationRelationships()->with('organization');
        
        if ($relationshipType) {
            $query->where('relationship_type', $relationshipType);
        }
        
        return $query->get()->pluck('organization');
    }

    /**
     * Remove relationship to an organization
     */
    public function removeOrganizationRelationship(Business $organization, ?string $relationshipType = null): bool
    {
        $query = $this->organizationRelationships()->where('organization_id', $organization->id);
        
        if ($relationshipType) {
            $query->where('relationship_type', $relationshipType);
        }
        
        return $query->delete() > 0;
    }

    /**
     * Check if model is related to an organization
     */
    public function isRelatedToOrganization(Business $organization, ?string $relationshipType = null): bool
    {
        $query = $this->organizationRelationships()->where('organization_id', $organization->id);
        
        if ($relationshipType) {
            $query->where('relationship_type', $relationshipType);
        }
        
        return $query->exists();
    }
}

