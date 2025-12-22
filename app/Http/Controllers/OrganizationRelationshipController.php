<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\OrganizationRelationship;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

final class OrganizationRelationshipController extends Controller
{
    /**
     * Create a new relationship
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'organization_id' => 'required|uuid|exists:businesses,id',
            'relatable_type' => 'required|string',
            'relatable_id' => 'required|uuid',
            'relationship_type' => 'required|string|in:related,sponsored,featured,partner,host,organizer,venue,sponsor,author,source,subject',
            'is_primary' => 'boolean',
            'metadata' => 'array',
        ]);

        $organization = Business::findOrFail($request->input('organization_id'));
        $relatableClass = $request->input('relatable_type');
        $relatable = $relatableClass::findOrFail($request->input('relatable_id'));

        $relationship = $relatable->relateToOrganization(
            $organization,
            $request->input('relationship_type'),
            $request->boolean('is_primary', false),
            $request->input('metadata', [])
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Relationship created successfully',
                'relationship' => $relationship->load(['organization', 'relatable']),
            ], 201);
        }

        return redirect()->back()->with('success', 'Relationship created successfully');
    }

    /**
     * Update a relationship
     */
    public function update(Request $request, OrganizationRelationship $relationship): JsonResponse|RedirectResponse
    {
        $request->validate([
            'relationship_type' => 'sometimes|string|in:related,sponsored,featured,partner,host,organizer,venue,sponsor,author,source,subject',
            'is_primary' => 'boolean',
            'metadata' => 'array',
        ]);

        $relationship->update($request->only(['relationship_type', 'is_primary', 'metadata']));

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Relationship updated successfully',
                'relationship' => $relationship->load(['organization', 'relatable']),
            ]);
        }

        return redirect()->back()->with('success', 'Relationship updated successfully');
    }

    /**
     * Delete a relationship
     */
    public function destroy(OrganizationRelationship $relationship): JsonResponse|RedirectResponse
    {
        $relationship->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Relationship deleted successfully',
            ]);
        }

        return redirect()->back()->with('success', 'Relationship deleted successfully');
    }

    /**
     * Bulk create relationships
     */
    public function bulkStore(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'organization_id' => 'required|uuid|exists:businesses,id',
            'relationships' => 'required|array',
            'relationships.*.relatable_type' => 'required|string',
            'relationships.*.relatable_id' => 'required|uuid',
            'relationships.*.relationship_type' => 'required|string|in:related,sponsored,featured,partner,host,organizer,venue,sponsor,author,source,subject',
            'relationships.*.is_primary' => 'boolean',
            'relationships.*.metadata' => 'array',
        ]);

        $organization = Business::findOrFail($request->input('organization_id'));
        $created = [];

        foreach ($request->input('relationships') as $relData) {
            $relatableClass = $relData['relatable_type'];
            $relatable = $relatableClass::findOrFail($relData['relatable_id']);

            $relationship = $relatable->relateToOrganization(
                $organization,
                $relData['relationship_type'],
                $relData['is_primary'] ?? false,
                $relData['metadata'] ?? []
            );

            $created[] = $relationship;
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Relationships created successfully',
                'relationships' => $created,
            ], 201);
        }

        return redirect()->back()->with('success', count($created).' relationships created successfully');
    }
}

