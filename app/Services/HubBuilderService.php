<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Hub;
use App\Models\HubSection;
use Illuminate\Support\Collection;

final class HubBuilderService
{
    public function updateDesignSettings(Hub $hub, array $settings): Hub
    {
        $hub->update([
            'design_settings' => array_merge($hub->design_settings ?? [], $settings),
        ]);

        return $hub;
    }

    public function updateSections(Hub $hub, array $sectionsData): Collection
    {
        $sections = collect();

        foreach ($sectionsData as $index => $sectionData) {
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
                    $sections->push($section);
                }
            } else {
                $section = HubSection::create([
                    'hub_id' => $hub->id,
                    'type' => $sectionData['type'],
                    'title' => $sectionData['title'],
                    'description' => $sectionData['description'] ?? null,
                    'content' => $sectionData['content'] ?? null,
                    'settings' => $sectionData['settings'] ?? null,
                    'is_visible' => $sectionData['is_visible'] ?? true,
                    'sort_order' => $sectionData['sort_order'] ?? $index,
                ]);
                $sections->push($section);
            }
        }

        return $sections;
    }

    public function deleteSection(Hub $hub, HubSection $section): bool
    {
        if ($section->hub_id !== $hub->id) {
            return false;
        }

        return $section->delete();
    }

    public function updateMonetizationSettings(Hub $hub, array $settings): Hub
    {
        $hub->update([
            'monetization_settings' => array_merge($hub->monetization_settings ?? [], $settings),
        ]);

        return $hub;
    }
}

