<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use App\Models\OrganizationRelationship;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class OrganizationService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Get all content related to an organization
     */
    public function getOrganizationContent(
        Business $organization,
        array $contentTypes = [],
        array $relationshipTypes = []
    ): array {
        $cacheKey = "org_content:{$organization->id}:".md5(serialize([$contentTypes, $relationshipTypes]));
        
        return $this->cacheService->remember($cacheKey, now()->addHours(1), function () use ($organization, $contentTypes, $relationshipTypes) {
            $query = OrganizationRelationship::where('organization_id', $organization->id);
            
            if (!empty($contentTypes)) {
                $query->whereIn('relatable_type', $contentTypes);
            }
            
            if (!empty($relationshipTypes)) {
                $query->whereIn('relationship_type', $relationshipTypes);
            }
            
            $relationships = $query->with('relatable')->get();
            
            return $relationships->groupBy('relatable_type')->map(function ($group) {
                return $group->pluck('relatable')->filter();
            })->toArray();
        });
    }

    /**
     * Get organization hierarchy (parent and children)
     */
    public function getOrganizationHierarchy(Business $organization): array
    {
        $cacheKey = "org_hierarchy:{$organization->id}";
        
        return $this->cacheService->remember($cacheKey, now()->addHours(6), function () use ($organization) {
            $hierarchy = [
                'organization' => $organization,
                'parent' => $organization->parentOrganization,
                'children' => $organization->childOrganizations,
                'ancestors' => $this->getAncestors($organization),
                'descendants' => $this->getDescendants($organization),
            ];
            
            return $hierarchy;
        });
    }

    /**
     * Get content for organization and all related organizations (hierarchy)
     */
    public function getOrganizationContentWithHierarchy(
        Business $organization,
        array $contentTypes = []
    ): array {
        $hierarchy = $this->getOrganizationHierarchy($organization);
        $organizationIds = collect([
            $organization->id,
            $hierarchy['parent']?->id,
            ...$hierarchy['children']->pluck('id'),
        ])->filter()->unique();
        
        $query = OrganizationRelationship::whereIn('organization_id', $organizationIds);
        
        if (!empty($contentTypes)) {
            $query->whereIn('relatable_type', $contentTypes);
        }
        
        $relationships = $query->with(['organization', 'relatable'])->get();
        
        return $relationships->groupBy('organization_id')->map(function ($group, $orgId) {
            return [
                'organization' => $group->first()->organization,
                'content' => $group->groupBy('relatable_type')->map(function ($items) {
                    return $items->pluck('relatable')->filter();
                }),
            ];
        })->toArray();
    }

    /**
     * Create organization relationship
     */
    public function createRelationship(
        \Illuminate\Database\Eloquent\Model $relatable,
        Business $organization,
        string $relationshipType = 'related',
        bool $isPrimary = false,
        array $metadata = []
    ): OrganizationRelationship {
        return $relatable->relateToOrganization($organization, $relationshipType, $isPrimary, $metadata);
    }

    /**
     * Get organizations by type and level
     */
    public function getOrganizationsByTypeAndLevel(
        string $type,
        string $level = null,
        int $limit = 50
    ): Collection {
        $query = Business::organizations()->byOrganizationType($type);
        
        if ($level) {
            $query->byOrganizationLevel($level);
        }
        
        return $query->limit($limit)->get();
    }

    /**
     * Search organizations
     */
    public function searchOrganizations(
        string $query,
        array $filters = []
    ): Collection {
        $searchQuery = Business::organizations()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            });
        
        if (isset($filters['type'])) {
            $searchQuery->byOrganizationType($filters['type']);
        }
        
        if (isset($filters['level'])) {
            $searchQuery->byOrganizationLevel($filters['level']);
        }
        
        if (isset($filters['category'])) {
            $searchQuery->where('organization_category', $filters['category']);
        }
        
        return $searchQuery->get();
    }

    /**
     * Get ancestors (parent organizations up the hierarchy)
     */
    private function getAncestors(Business $organization): Collection
    {
        $ancestors = collect();
        $current = $organization->parentOrganization;
        
        while ($current) {
            $ancestors->push($current);
            $current = $current->parentOrganization;
        }
        
        return $ancestors;
    }

    /**
     * Get descendants (child organizations down the hierarchy)
     */
    private function getDescendants(Business $organization): Collection
    {
        $descendants = collect();
        $children = $organization->childOrganizations;
        
        foreach ($children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($this->getDescendants($child));
        }
        
        return $descendants;
    }
}

