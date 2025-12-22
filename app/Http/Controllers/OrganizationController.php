<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Business;
use App\Services\OrganizationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

final class OrganizationController extends Controller
{
    public function __construct(
        private readonly OrganizationService $organizationService
    ) {}

    /**
     * Get all content related to an organization
     */
    public function getContent(Request $request, Business $organization): JsonResponse|Response
    {
        $contentTypes = $request->input('types', []);
        $relationshipTypes = $request->input('relationship_types', []);
        $includeHierarchy = $request->boolean('include_hierarchy', false);

        if ($includeHierarchy) {
            $content = $this->organizationService->getOrganizationContentWithHierarchy(
                $organization,
                $contentTypes
            );
        } else {
            $content = $this->organizationService->getOrganizationContent(
                $organization,
                $contentTypes,
                $relationshipTypes
            );
        }

        $hierarchy = $this->organizationService->getOrganizationHierarchy($organization);

        if ($request->wantsJson()) {
            return response()->json([
                'organization' => $organization,
                'content' => $content,
                'hierarchy' => $hierarchy,
            ]);
        }

        return Inertia::render('organizations/content', [
            'organization' => $organization,
            'content' => $content,
            'hierarchy' => $hierarchy,
        ]);
    }

    /**
     * Create relationship between organization and content
     */
    public function relate(Request $request, Business $organization): JsonResponse
    {
        $request->validate([
            'relatable_type' => 'required|string',
            'relatable_id' => 'required|uuid',
            'relationship_type' => 'required|string|in:related,sponsored,featured,partner,host,organizer,venue,sponsor,author,source,subject',
            'is_primary' => 'boolean',
            'metadata' => 'array',
        ]);

        $relatableClass = $request->input('relatable_type');
        $relatableId = $request->input('relatable_id');
        
        $relatable = $relatableClass::findOrFail($relatableId);

        $relationship = $this->organizationService->createRelationship(
            $relatable,
            $organization,
            $request->input('relationship_type'),
            $request->boolean('is_primary', false),
            $request->input('metadata', [])
        );

        return response()->json([
            'message' => 'Relationship created successfully',
            'relationship' => $relationship->load('relatable'),
        ], 201);
    }

    /**
     * Search organizations
     */
    public function search(Request $request): JsonResponse|Response
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'type' => 'nullable|string',
            'level' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $organizations = $this->organizationService->searchOrganizations(
            $request->input('q'),
            $request->only(['type', 'level', 'category'])
        );

        // Get content counts for each organization
        $organizationsWithCounts = $organizations->map(function ($org) {
            $content = $this->organizationService->getOrganizationContent($org);
            return [
                'id' => $org->id,
                'name' => $org->name,
                'organization_type' => $org->organization_type,
                'organization_level' => $org->organization_level,
                'organization_category' => $org->organization_category,
                'content_count' => [
                    'articles' => count($content['App\Models\DayNewsPost'] ?? []),
                    'events' => count($content['App\Models\Event'] ?? []),
                    'coupons' => count($content['App\Models\Coupon'] ?? []),
                    'announcements' => count($content['App\Models\Announcement'] ?? []),
                ],
            ];
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $organizationsWithCounts,
            ]);
        }

        return Inertia::render('organizations/search', [
            'organizations' => $organizationsWithCounts,
            'query' => $request->input('q'),
        ]);
    }

    /**
     * Get organization hierarchy
     */
    public function hierarchy(Business $organization): JsonResponse|Response
    {
        $hierarchy = $this->organizationService->getOrganizationHierarchy($organization);

        if (request()->wantsJson()) {
            return response()->json($hierarchy);
        }

        return Inertia::render('organizations/hierarchy', [
            'hierarchy' => $hierarchy,
        ]);
    }
}

