<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\HubMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class HubController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Hub::query()
            ->with(['workspace', 'createdBy', 'sections'])
            ->withCount(['members', 'events', 'follows']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ILIKE', "%{$request->input('search')}%")
                    ->orWhere('description', 'ILIKE', "%{$request->input('search')}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->boolean('verified')) {
            $query->verified();
        }

        $hubs = $query->published()
            ->active()
            ->latest('published_at')
            ->paginate(12);

        return Inertia::render('event-city/hubs/index', [
            'hubs' => $hubs,
            'filters' => [
                'search' => $request->input('search'),
                'category' => $request->input('category'),
                'featured' => $request->boolean('featured'),
                'verified' => $request->boolean('verified'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('event-city/hubs/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'about' => 'nullable|string',
            'social_links' => 'nullable|array',
            'design_settings' => 'nullable|array',
            'monetization_settings' => 'nullable|array',
            'analytics_enabled' => 'boolean',
            'articles_enabled' => 'boolean',
            'community_enabled' => 'boolean',
            'events_enabled' => 'boolean',
            'gallery_enabled' => 'boolean',
            'performers_enabled' => 'boolean',
            'venues_enabled' => 'boolean',
        ]);

        $user = $request->user();
        $workspace = $user->currentWorkspace ?? $user->workspaces->first();

        if (!$workspace) {
            return redirect()->back()->withErrors(['workspace' => 'You must belong to a workspace to create a hub.']);
        }

        $hub = Hub::create([
            ...$validated,
            'workspace_id' => $workspace->id,
            'created_by' => $user->id,
            'slug' => Hub::generateUniqueSlug($validated['name']),
            'is_active' => true,
            'published_at' => now(),
        ]);

        // Create default owner member
        $hub->members()->create([
            'user_id' => $user->id,
            'role' => HubMember::ROLE_OWNER,
            'joined_at' => now(),
            'is_active' => true,
        ]);

        return redirect()->route('hubs.show', $hub->slug)
            ->with('success', 'Hub created successfully.');
    }

    public function show(Request $request, string $slug): Response
    {
        $hub = Hub::where('slug', $slug)
            ->with(['workspace', 'createdBy', 'sections', 'members.user'])
            ->withCount(['members', 'events', 'follows'])
            ->published()
            ->active()
            ->firstOrFail();

        $isMember = false;
        $userRole = null;
        if ($request->user()) {
            $member = $hub->members()->where('user_id', $request->user()->id)->active()->first();
            $isMember = $member !== null;
            $userRole = $member?->role;
        }

        return Inertia::render('event-city/hubs/show', [
            'hub' => $hub,
            'isMember' => $isMember,
            'userRole' => $userRole,
        ]);
    }

    public function edit(Request $request, Hub $hub): Response
    {
        $this->authorize('update', $hub);

        return Inertia::render('event-city/hubs/edit', [
            'hub' => $hub->load(['sections', 'members.user']),
        ]);
    }

    public function update(Request $request, Hub $hub): RedirectResponse
    {
        $this->authorize('update', $hub);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'about' => 'nullable|string',
            'social_links' => 'nullable|array',
            'design_settings' => 'nullable|array',
            'monetization_settings' => 'nullable|array',
            'analytics_enabled' => 'boolean',
            'articles_enabled' => 'boolean',
            'community_enabled' => 'boolean',
            'events_enabled' => 'boolean',
            'gallery_enabled' => 'boolean',
            'performers_enabled' => 'boolean',
            'venues_enabled' => 'boolean',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $hub->name) {
            $validated['slug'] = Hub::generateUniqueSlug($validated['name']);
        }

        $hub->update($validated);

        return redirect()->route('hubs.show', $hub->slug)
            ->with('success', 'Hub updated successfully.');
    }

    public function destroy(Hub $hub): RedirectResponse
    {
        $this->authorize('delete', $hub);

        $hub->delete();

        return redirect()->route('hubs.index')
            ->with('success', 'Hub deleted successfully.');
    }
}
