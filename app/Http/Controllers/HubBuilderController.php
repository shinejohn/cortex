<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\HubSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class HubBuilderController extends Controller
{
    public function show(Hub $hub): Response
    {
        $this->authorize('update', $hub);

        $hub->load(['sections', 'members.user', 'roles']);

        return Inertia::render('event-city/hubs/builder', [
            'hub' => $hub,
        ]);
    }

    public function updateDesign(Hub $hub, Request $request): RedirectResponse
    {
        $this->authorize('update', $hub);

        $validated = $request->validate([
            'design_settings' => 'required|array',
            'design_settings.theme' => 'nullable|string',
            'design_settings.colors' => 'nullable|array',
            'design_settings.layout' => 'nullable|string',
            'design_settings.fonts' => 'nullable|array',
        ]);

        $hub->update([
            'design_settings' => array_merge($hub->design_settings ?? [], $validated['design_settings']),
        ]);

        return redirect()->back()->with('success', 'Design settings updated.');
    }

    public function updateSections(Hub $hub, Request $request): RedirectResponse
    {
        $this->authorize('update', $hub);

        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'nullable|uuid|exists:hub_sections,id',
            'sections.*.type' => 'required|string|in:'.implode(',', HubSection::TYPES),
            'sections.*.title' => 'required|string|max:255',
            'sections.*.description' => 'nullable|string',
            'sections.*.content' => 'nullable|array',
            'sections.*.settings' => 'nullable|array',
            'sections.*.is_visible' => 'boolean',
            'sections.*.sort_order' => 'integer',
        ]);

        foreach ($validated['sections'] as $index => $sectionData) {
            if (isset($sectionData['id'])) {
                $section = HubSection::where('hub_id', $hub->id)
                    ->where('id', $sectionData['id'])
                    ->first();

                if ($section) {
                    $section->update([
                        'type' => $sectionData['type'],
                        'title' => $sectionData['title'],
                        'description' => $sectionData['description'] ?? null,
                        'content' => $sectionData['content'] ?? null,
                        'settings' => $sectionData['settings'] ?? null,
                        'is_visible' => $sectionData['is_visible'] ?? true,
                        'sort_order' => $sectionData['sort_order'] ?? $index,
                    ]);
                }
            } else {
                HubSection::create([
                    'hub_id' => $hub->id,
                    'type' => $sectionData['type'],
                    'title' => $sectionData['title'],
                    'description' => $sectionData['description'] ?? null,
                    'content' => $sectionData['content'] ?? null,
                    'settings' => $sectionData['settings'] ?? null,
                    'is_visible' => $sectionData['is_visible'] ?? true,
                    'sort_order' => $sectionData['sort_order'] ?? $index,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Sections updated.');
    }

    public function deleteSection(Hub $hub, HubSection $section): RedirectResponse
    {
        $this->authorize('update', $hub);

        if ($section->hub_id !== $hub->id) {
            abort(404);
        }

        $section->delete();

        return redirect()->back()->with('success', 'Section deleted.');
    }

    public function preview(Hub $hub): Response
    {
        $this->authorize('update', $hub);

        $hub->load(['sections', 'workspace', 'createdBy']);

        return Inertia::render('event-city/hubs/preview', [
            'hub' => $hub,
        ]);
    }

    public function publish(Hub $hub): RedirectResponse
    {
        $this->authorize('update', $hub);

        $hub->update([
            'published_at' => now(),
            'is_active' => true,
        ]);

        return redirect()->route('hubs.show', $hub->slug)
            ->with('success', 'Hub published successfully.');
    }
}
