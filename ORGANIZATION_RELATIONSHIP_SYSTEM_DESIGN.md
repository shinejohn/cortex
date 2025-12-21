# Organization Relationship System Design

**Generated:** 2025-12-20  
**Purpose:** Design a comprehensive polymorphic relationship system to link all content types (articles, events, coupons, ads, announcements, tickets, achievements, etc.) to businesses/organizations at local, regional, and national levels

---

## Executive Summary

This document designs a unified organization relationship system that allows any content type to be related to businesses/organizations. The system supports:
- **Local Businesses (SMBs)** - Small and medium businesses
- **Government Organizations** - Local, county, state, federal, law enforcement
- **National Organizations** - Large corporations, non-profits, religious organizations
- **Cross-Application Sharing** - Content related to the same organization visible across all applications

**Key Innovation:** Polymorphic relationship system (`relatable`) that allows any model to relate to businesses/organizations, enabling unified content discovery and cross-application integration.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Design Goals](#design-goals)
3. [Database Schema Design](#database-schema-design)
4. [Model Extensions](#model-extensions)
5. [Service Layer Design](#service-layer-design)
6. [API Design](#api-design)
7. [Frontend Component Design](#frontend-component-design)
8. [Implementation Strategy](#implementation-strategy)

---

## Current State Analysis

### Existing Business Relationships

#### Direct Relationships
- ✅ `Event` → `business_id` (via `venue_id` or direct)
- ✅ `Coupon` → `business_id` (direct)
- ✅ `Advertisement` → `business_id` (polymorphic via `advertable`)
- ⚠️ `DayNewsPost` → No direct business relationship
- ⚠️ `Announcement` → No direct business relationship
- ⚠️ `TicketPlan` → No direct business relationship (via Event)
- ⚠️ `Achievement` → No business relationship

#### Current Business Model Structure
```php
Business Model:
- workspace_id
- google_place_id
- name, slug, description
- address, city, state, postal_code, country
- latitude, longitude
- categories (JSON)
- rating, reviews_count
- verification_status, verified_at, claimed_at
```

**Limitations:**
- No support for organization hierarchy (local vs national)
- No support for organization types (business, government, non-profit, religious)
- No unified way to relate content to organizations
- Limited cross-application content discovery

---

## Design Goals

### Primary Goals

1. **Unified Relationship System** - Single polymorphic relationship system for all content types
2. **Multi-Level Organizations** - Support local, regional, and national organizations
3. **Organization Types** - Support businesses, government, non-profits, religious organizations
4. **Cross-Application Discovery** - Content related to same organization visible across all apps
5. **Backward Compatibility** - Maintain existing direct relationships where they exist
6. **Performance** - Efficient queries for organization-related content

### Use Cases

1. **Local Business Content**
   - Show all articles, events, coupons related to "Joe's Pizza"
   - Display across DowntownsGuide, DayNews, GoEventCity

2. **Government Organization Content**
   - Show all articles, events related to "City of Springfield"
   - Display announcements, legal notices from city government

3. **National Organization Content**
   - Show all articles, events related to "Rotary International"
   - Display local chapter events alongside national organization news

4. **Cross-Application Discovery**
   - User views "IBM" on DowntownsGuide → See IBM-related events on GoEventCity
   - User views "City Hall" on DayNews → See City Hall events on GoEventCity

---

## Database Schema Design

### 1. Extend Business Model

**Add to `businesses` table:**

```sql
-- Organization hierarchy and type
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS organization_type VARCHAR(50) DEFAULT 'business';
-- Values: 'business', 'government', 'non_profit', 'religious', 'educational', 'healthcare', 'other'

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS organization_level VARCHAR(50) DEFAULT 'local';
-- Values: 'local', 'regional', 'state', 'national', 'international'

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES businesses(id);
-- For organization hierarchies (e.g., local Rotary chapter → Rotary International)

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS organization_category VARCHAR(100);
-- Specific category: 'city_government', 'county_government', 'state_government', 
-- 'federal_government', 'law_enforcement', 'fire_department', 'school_district', etc.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_organization BOOLEAN DEFAULT false;
-- Flag to distinguish regular businesses from organizations

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS organization_identifier VARCHAR(255);
-- For government: FIPS code, EIN for non-profits, etc.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS organization_hierarchy JSON;
-- Store full hierarchy path: ["Rotary International", "District 123", "Springfield Chapter"]

-- Indexes
CREATE INDEX idx_businesses_organization_type ON businesses(organization_type);
CREATE INDEX idx_businesses_organization_level ON businesses(organization_level);
CREATE INDEX idx_businesses_parent_organization ON businesses(parent_organization_id);
CREATE INDEX idx_businesses_is_organization ON businesses(is_organization);
```

### 2. Create Organization Relationships Table

**New table: `organization_relationships`**

```sql
CREATE TABLE organization_relationships (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES businesses(id),
    relatable_type VARCHAR(100) NOT NULL,
    -- Values: 'App\\Models\\DayNewsPost', 'App\\Models\\Event', 'App\\Models\\Coupon',
    -- 'App\\Models\\Advertisement', 'App\\Models\\Announcement', 'App\\Models\\TicketPlan',
    -- 'App\\Models\\Achievement', 'App\\Models\\Deal', etc.
    relatable_id UUID NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'related',
    -- Values: 'related', 'sponsored', 'featured', 'partner', 'host', 'organizer', 'venue'
    -- 'sponsor', 'author', 'source', 'subject'
    is_primary BOOLEAN DEFAULT false,
    -- Primary relationship (e.g., event organizer vs event sponsor)
    metadata JSON,
    -- Additional relationship data: role, contribution, etc.
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(organization_id, relatable_type, relatable_id, relationship_type)
);

CREATE INDEX idx_org_relationships_organization ON organization_relationships(organization_id);
CREATE INDEX idx_org_relationships_relatable ON organization_relationships(relatable_type, relatable_id);
CREATE INDEX idx_org_relationships_type ON organization_relationships(relationship_type);
CREATE INDEX idx_org_relationships_primary ON organization_relationships(is_primary);
```

### 3. Create Organization Hierarchy Table

**New table: `organization_hierarchies`**

```sql
CREATE TABLE organization_hierarchies (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES businesses(id),
    parent_id UUID REFERENCES businesses(id),
    level INTEGER NOT NULL DEFAULT 0,
    -- 0 = root, 1 = first level child, etc.
    path VARCHAR(500),
    -- Full path: "Rotary International > District 123 > Springfield Chapter"
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(organization_id, parent_id)
);

CREATE INDEX idx_org_hierarchies_organization ON organization_hierarchies(organization_id);
CREATE INDEX idx_org_hierarchies_parent ON organization_hierarchies(parent_id);
CREATE INDEX idx_org_hierarchies_level ON organization_hierarchies(level);
```

### 4. Migration Strategy

**Phase 1: Extend Business Model**
```php
// Migration: add_organization_fields_to_businesses_table.php
Schema::table('businesses', function (Blueprint $table) {
    $table->string('organization_type')->default('business')->after('status');
    $table->string('organization_level')->default('local')->after('organization_type');
    $table->uuid('parent_organization_id')->nullable()->after('organization_level');
    $table->string('organization_category')->nullable()->after('parent_organization_id');
    $table->boolean('is_organization')->default(false)->after('organization_category');
    $table->string('organization_identifier')->nullable()->after('is_organization');
    $table->json('organization_hierarchy')->nullable()->after('organization_identifier');
    
    $table->foreign('parent_organization_id')->references('id')->on('businesses');
    $table->index('organization_type');
    $table->index('organization_level');
    $table->index('parent_organization_id');
    $table->index('is_organization');
});
```

**Phase 2: Create Organization Relationships Table**
```php
// Migration: create_organization_relationships_table.php
Schema::create('organization_relationships', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('organization_id');
    $table->string('relatable_type');
    $table->uuid('relatable_id');
    $table->string('relationship_type')->default('related');
    $table->boolean('is_primary')->default(false);
    $table->json('metadata')->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    $table->foreign('organization_id')->references('id')->on('businesses');
    $table->unique(['organization_id', 'relatable_type', 'relatable_id', 'relationship_type']);
    $table->index(['relatable_type', 'relatable_id']);
    $table->index('relationship_type');
    $table->index('is_primary');
});
```

**Phase 3: Migrate Existing Relationships**
```php
// Migration: migrate_existing_business_relationships.php
// Migrate existing direct relationships to organization_relationships table

// Events with venue_id (if venue has business_id)
// Coupons with business_id
// Advertisements with business_id
// etc.
```

---

## Model Extensions

### 1. Extend Business Model

```php
// app/Models/Business.php

protected $fillable = [
    // ... existing fields
    'organization_type',      // business, government, non_profit, etc.
    'organization_level',     // local, regional, state, national, international
    'parent_organization_id',  // For hierarchies
    'organization_category',   // city_government, county_government, etc.
    'is_organization',        // Flag for organizations vs regular businesses
    'organization_identifier', // FIPS code, EIN, etc.
    'organization_hierarchy', // JSON hierarchy path
];

// Relationships
public function parentOrganization(): BelongsTo
{
    return $this->belongsTo(Business::class, 'parent_organization_id');
}

public function childOrganizations(): HasMany
{
    return $this->hasMany(Business::class, 'parent_organization_id');
}

public function organizationRelationships(): HasMany
{
    return $this->hasMany(OrganizationRelationship::class, 'organization_id');
}

public function relatedContent(string $type = null): MorphMany
{
    $query = $this->morphMany(OrganizationRelationship::class, 'organization');
    if ($type) {
        $query->where('relatable_type', $type);
    }
    return $query;
}

// Scopes
public function scopeOrganizations($query)
{
    return $query->where('is_organization', true);
}

public function scopeByOrganizationType($query, string $type)
{
    return $query->where('organization_type', $type);
}

public function scopeByOrganizationLevel($query, string $level)
{
    return $query->where('organization_level', $level);
}

public function scopeGovernment($query)
{
    return $query->where('organization_type', 'government');
}

public function scopeNational($query)
{
    return $query->where('organization_level', 'national')
        ->orWhere('organization_level', 'international');
}

public function scopeLocal($query)
{
    return $query->where('organization_level', 'local');
}
```

### 2. Create OrganizationRelationship Model

```php
// app/Models/OrganizationRelationship.php

final class OrganizationRelationship extends Model
{
    use HasUuid, SoftDeletes;

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
}
```

### 3. Create Trait for Relatable Models

```php
// app/Traits/RelatableToOrganizations.php

trait RelatableToOrganizations
{
    public function organizationRelationships(): MorphMany
    {
        return $this->morphMany(OrganizationRelationship::class, 'relatable');
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(
            Business::class,
            'organization_relationships',
            'relatable_id',
            'organization_id'
        )
        ->where('relatable_type', static::class)
        ->withPivot(['relationship_type', 'is_primary', 'metadata'])
        ->withTimestamps();
    }

    public function primaryOrganization(): BelongsTo
    {
        return $this->belongsTo(
            Business::class,
            'organization_id'
        )->whereHas('organizationRelationships', function ($q) {
            $q->where('relatable_type', static::class)
              ->where('relatable_id', $this->id)
              ->where('is_primary', true);
        });
    }

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

    public function getRelatedOrganizations(string $relationshipType = null): Collection
    {
        $query = $this->organizationRelationships()->with('organization');
        
        if ($relationshipType) {
            $query->where('relationship_type', $relationshipType);
        }
        
        return $query->get()->pluck('organization');
    }
}
```

### 4. Apply Trait to Models

```php
// app/Models/DayNewsPost.php
use RelatableToOrganizations;

// app/Models/Event.php
use RelatableToOrganizations;

// app/Models/Coupon.php
use RelatableToOrganizations;

// app/Models/Advertisement.php
use RelatableToOrganizations;

// app/Models/Announcement.php
use RelatableToOrganizations;

// app/Models/TicketPlan.php
use RelatableToOrganizations;

// app/Models/Achievement.php
use RelatableToOrganizations;

// app/Models/Deal.php (new)
use RelatableToOrganizations;
```

---

## Service Layer Design

### 1. OrganizationService

```php
// app/Services/OrganizationService.php

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
        $cacheKey = "org_content:{$organization->id}:" . md5(serialize([$contentTypes, $relationshipTypes]));
        
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
                return $group->pluck('relatable');
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
                    return $items->pluck('relatable');
                }),
            ];
        })->toArray();
    }

    /**
     * Create organization relationship
     */
    public function createRelationship(
        Model $relatable,
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
```

---

## API Design

### Organization Content APIs

#### GET /api/organizations/{id}/content
**Description:** Get all content related to an organization

**Query Parameters:**
- `types` (array) - Content types: `articles`, `events`, `coupons`, `ads`, `announcements`, `tickets`, `achievements`
- `relationship_types` (array) - Relationship types: `related`, `sponsored`, `featured`, `partner`, `host`, `organizer`
- `include_hierarchy` (boolean) - Include content from parent/child organizations

**Response:**
```json
{
    "organization": {
        "id": "uuid",
        "name": "IBM",
        "organization_type": "business",
        "organization_level": "national",
        "hierarchy": ["IBM", "IBM North America", "IBM Springfield Office"]
    },
    "content": {
        "articles": [
            {
                "id": "uuid",
                "title": "IBM Opens New Office",
                "relationship_type": "related",
                "is_primary": true
            }
        ],
        "events": [
            {
                "id": "uuid",
                "title": "IBM Tech Conference",
                "relationship_type": "organizer",
                "is_primary": true
            }
        ],
        "coupons": [],
        "announcements": []
    },
    "hierarchy_content": {
        "parent": {
            "organization": {...},
            "content": {...}
        },
        "children": [
            {
                "organization": {...},
                "content": {...}
            }
        ]
    }
}
```

#### POST /api/organizations/{id}/relate
**Description:** Create relationship between organization and content

**Request Body:**
```json
{
    "relatable_type": "App\\Models\\DayNewsPost",
    "relatable_id": "uuid",
    "relationship_type": "related",
    "is_primary": false,
    "metadata": {
        "role": "subject",
        "contribution": "featured"
    }
}
```

#### GET /api/organizations/search
**Description:** Search organizations

**Query Parameters:**
- `q` (string) - Search query
- `type` (string) - Organization type
- `level` (string) - Organization level
- `category` (string) - Organization category

**Response:**
```json
{
    "data": [
        {
            "id": "uuid",
            "name": "City of Springfield",
            "organization_type": "government",
            "organization_level": "local",
            "organization_category": "city_government",
            "content_count": {
                "articles": 50,
                "events": 25,
                "announcements": 100
            }
        }
    ]
}
```

---

## Frontend Component Design

### 1. OrganizationContentDisplay Component

```typescript
// resources/js/components/shared/organization/OrganizationContentDisplay.tsx

interface OrganizationContentDisplayProps {
    organization: {
        id: string;
        name: string;
        organization_type: string;
        organization_level: string;
    };
    contentTypes?: string[];
    relationshipTypes?: string[];
    includeHierarchy?: boolean;
    showFilters?: boolean;
}

export function OrganizationContentDisplay({
    organization,
    contentTypes = ['articles', 'events', 'coupons'],
    relationshipTypes = [],
    includeHierarchy = false,
    showFilters = true,
}: OrganizationContentDisplayProps) {
    // Fetch organization content
    // Display tabs for each content type
    // Show filters for relationship types
    // Display hierarchy content if enabled
}
```

### 2. OrganizationSelector Component

```typescript
// resources/js/components/shared/organization/OrganizationSelector.tsx

interface OrganizationSelectorProps {
    onSelect: (organization: Organization) => void;
    organizationType?: string;
    organizationLevel?: string;
    allowCreate?: boolean;
}

export function OrganizationSelector({
    onSelect,
    organizationType,
    organizationLevel,
    allowCreate = false,
}: OrganizationSelectorProps) {
    // Search organizations
    // Display organization list
    // Allow selection
    // Optionally allow creating new organization
}
```

### 3. RelatedOrganizations Component

```typescript
// resources/js/components/shared/organization/RelatedOrganizations.tsx

interface RelatedOrganizationsProps {
    relatable: {
        id: string;
        type: string;
    };
    showRelationshipType?: boolean;
    maxDisplay?: number;
}

export function RelatedOrganizations({
    relatable,
    showRelationshipType = true,
    maxDisplay = 5,
}: RelatedOrganizationsProps) {
    // Fetch related organizations
    // Display organization cards
    // Show relationship type badges
}
```

### 4. OrganizationHierarchy Component

```typescript
// resources/js/components/shared/organization/OrganizationHierarchy.tsx

interface OrganizationHierarchyProps {
    organization: Organization;
    showContentCount?: boolean;
    onSelect?: (organization: Organization) => void;
}

export function OrganizationHierarchy({
    organization,
    showContentCount = true,
    onSelect,
}: OrganizationHierarchyProps) {
    // Display organization hierarchy tree
    // Show parent and children
    // Display content counts
    // Allow navigation
}
```

---

## Implementation Strategy

### Phase 1: Database Schema (Week 1)

1. **Extend Business Model**
   - Add organization fields to `businesses` table
   - Create migration
   - Update Business model

2. **Create Organization Relationships Table**
   - Create migration
   - Create OrganizationRelationship model
   - Add indexes

3. **Create Organization Hierarchy Table**
   - Create migration
   - Create OrganizationHierarchy model

### Phase 2: Model Extensions (Week 1-2)

1. **Create RelatableToOrganizations Trait**
   - Implement trait
   - Add methods for relationship management

2. **Apply Trait to Models**
   - DayNewsPost
   - Event
   - Coupon
   - Advertisement
   - Announcement
   - TicketPlan
   - Achievement
   - Deal (new)

3. **Extend Business Model**
   - Add organization relationships
   - Add scopes
   - Add hierarchy methods

### Phase 3: Service Layer (Week 2)

1. **Create OrganizationService**
   - Implement content retrieval
   - Implement hierarchy management
   - Implement search

2. **Create OrganizationRelationshipService**
   - Implement relationship creation
   - Implement relationship queries
   - Implement relationship updates

### Phase 4: API Layer (Week 2-3)

1. **Create OrganizationController**
   - Implement content endpoints
   - Implement search endpoints
   - Implement relationship endpoints

2. **Create OrganizationRelationshipController**
   - Implement CRUD operations
   - Implement bulk operations

### Phase 5: Frontend Components (Week 3-4)

1. **Create Shared Components**
   - OrganizationContentDisplay
   - OrganizationSelector
   - RelatedOrganizations
   - OrganizationHierarchy

2. **Integrate into Applications**
   - DowntownsGuide
   - DayNews
   - GoEventCity
   - Alphasite
   - Connect
   - Serve
   - Joyous.news

### Phase 6: Migration & Data Population (Week 4)

1. **Migrate Existing Relationships**
   - Events → Organizations
   - Coupons → Organizations
   - Advertisements → Organizations

2. **Create Seed Data**
   - Government organizations
   - National organizations
   - Organization hierarchies

---

## Example Use Cases

### Use Case 1: Local Business Content

**Scenario:** User views "Joe's Pizza" on DowntownsGuide

**Backend:**
```php
$organization = Business::where('slug', 'joes-pizza')->first();
$content = app(OrganizationService::class)->getOrganizationContent(
    $organization,
    ['articles', 'events', 'coupons', 'deals']
);
```

**Frontend:**
```tsx
<OrganizationContentDisplay
    organization={organization}
    contentTypes={['articles', 'events', 'coupons', 'deals']}
/>
```

**Result:** Shows all articles, events, coupons, and deals related to Joe's Pizza across all applications

---

### Use Case 2: Government Organization Content

**Scenario:** User views "City of Springfield" on DayNews

**Backend:**
```php
$organization = Business::government()
    ->where('name', 'City of Springfield')
    ->first();
    
$content = app(OrganizationService::class)->getOrganizationContentWithHierarchy(
    $organization,
    ['articles', 'events', 'announcements', 'legal_notices']
);
```

**Frontend:**
```tsx
<OrganizationContentDisplay
    organization={organization}
    contentTypes={['articles', 'events', 'announcements', 'legal_notices']}
    includeHierarchy={true}
/>
```

**Result:** Shows all city-related content, including content from city departments (children organizations)

---

### Use Case 3: National Organization with Local Chapters

**Scenario:** User views "Rotary International" on GoEventCity

**Backend:**
```php
$organization = Business::national()
    ->where('name', 'Rotary International')
    ->first();
    
$content = app(OrganizationService::class)->getOrganizationContentWithHierarchy(
    $organization,
    ['articles', 'events']
);
```

**Frontend:**
```tsx
<>
    <OrganizationHierarchy organization={organization} />
    <OrganizationContentDisplay
        organization={organization}
        contentTypes={['articles', 'events']}
        includeHierarchy={true}
    />
</>
```

**Result:** Shows Rotary International content plus content from all local chapters

---

### Use Case 4: Cross-Application Discovery

**Scenario:** User searches for "IBM" on DowntownsGuide

**Backend:**
```php
$organizations = app(OrganizationService::class)->searchOrganizations('IBM');
$content = [];
foreach ($organizations as $org) {
    $content[$org->id] = app(OrganizationService::class)->getOrganizationContent(
        $org,
        ['articles', 'events', 'coupons']
    );
}
```

**Frontend:**
```tsx
<>
    {organizations.map(org => (
        <OrganizationCard
            key={org.id}
            organization={org}
            contentPreview={content[org.id]}
        />
    ))}
</>
```

**Result:** Shows IBM-related content from all applications (DowntownsGuide, DayNews, GoEventCity)

---

## Benefits

### For Users

1. **Unified Content Discovery** - Find all content related to an organization in one place
2. **Cross-Application Integration** - See organization content across all applications
3. **Organization Context** - Understand organization hierarchy and relationships

### For Applications

1. **Content Enrichment** - Automatically surface related content
2. **SEO Benefits** - Better content linking and organization
3. **User Engagement** - More content discovery opportunities

### For Business Owners

1. **Content Aggregation** - See all content related to their business
2. **Cross-Promotion** - Content visible across multiple applications
3. **Analytics** - Track content performance across applications

---

## Conclusion

This organization relationship system provides:

✅ **Unified Relationship System** - Single polymorphic system for all content types  
✅ **Multi-Level Support** - Local, regional, national organizations  
✅ **Organization Types** - Businesses, government, non-profits, religious  
✅ **Cross-Application Discovery** - Content visible across all applications  
✅ **Hierarchy Support** - Parent/child organization relationships  
✅ **Backward Compatible** - Works with existing direct relationships  
✅ **Performance Optimized** - Caching and efficient queries  

**Estimated Implementation:** 4 weeks  
**Estimated Effort Reduction:** 60-70% for cross-application content discovery

---

**Design Generated:** 2025-12-20  
**Status:** ✅ **COMPLETE**  
**Next Steps:** Begin Phase 1 implementation

