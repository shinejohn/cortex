<?php

declare(strict_types=1);

namespace App\Services\WriterAgent;

use App\Models\Region;
use App\Models\WriterAgent;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Schema\RawSchema;

final class AgentGenerationService
{
    private const CLIENT_TIMEOUT = 60;

    private const ALL_CATEGORIES = [
        'local_news',
        'business',
        'sports',
        'entertainment',
        'community',
        'education',
        'health',
        'politics',
        'crime',
        'weather',
        'events',
    ];

    /**
     * Generate a new writer agent using AI.
     *
     * @param  array{region_ids?: array<string>, categories?: array<string>, writing_style?: string}  $options
     */
    public function generateAgent(array $options = []): WriterAgent
    {
        // Get target regions and categories
        $regions = $this->resolveRegions($options['region_ids'] ?? null);
        $categories = $options['categories'] ?? $this->selectCategories($regions);
        $writingStyle = $options['writing_style'] ?? $this->selectWritingStyle();

        // Generate agent profile using AI
        $profile = $this->generateAgentProfile($regions, $categories, $writingStyle);

        // Create the agent
        $agent = DB::transaction(function () use ($profile, $regions, $categories, $writingStyle) {
            $agent = WriterAgent::create([
                'name' => $profile['name'],
                'bio' => $profile['bio'],
                'writing_style' => $writingStyle,
                'persona_traits' => $profile['persona_traits'],
                'expertise_areas' => $profile['expertise_areas'],
                'categories' => $categories,
                'prompts' => $this->generatePrompts($profile, $writingStyle),
                'is_active' => true,
            ]);

            // Attach regions with first one as primary
            if ($regions->isNotEmpty()) {
                $regionData = [];
                $isFirst = true;
                foreach ($regions as $region) {
                    $regionData[$region->id] = ['is_primary' => $isFirst];
                    $isFirst = false;
                }
                $agent->regions()->attach($regionData);
            }

            return $agent;
        });

        Log::info('Generated new writer agent', [
            'agent_id' => $agent->id,
            'name' => $agent->name,
            'regions' => $regions->pluck('name')->toArray(),
            'categories' => $categories,
        ]);

        return $agent;
    }

    /**
     * Identify coverage gaps in regions and categories.
     *
     * @return array{regions: Collection, categories: array<string>}
     */
    public function identifyGaps(): array
    {
        // Find regions with least agent coverage
        $regionCoverage = DB::table('writer_agent_region')
            ->join('writer_agents', 'writer_agents.id', '=', 'writer_agent_region.writer_agent_id')
            ->where('writer_agents.is_active', true)
            ->select('region_id', DB::raw('COUNT(*) as agent_count'))
            ->groupBy('region_id')
            ->pluck('agent_count', 'region_id');

        $underservedRegions = Region::active()
            ->get()
            ->sortBy(fn (Region $region) => $regionCoverage->get($region->id, 0))
            ->take(5);

        // Find categories with least coverage
        $categoryCoverage = [];
        foreach (self::ALL_CATEGORIES as $category) {
            $categoryCoverage[$category] = WriterAgent::active()
                ->forCategory($category)
                ->count();
        }

        asort($categoryCoverage);
        $underservedCategories = array_slice(array_keys($categoryCoverage), 0, 5);

        return [
            'regions' => $underservedRegions,
            'categories' => $underservedCategories,
        ];
    }

    /**
     * Resolve regions from IDs or find underserved ones.
     *
     * @param  array<string>|null  $regionIds
     */
    private function resolveRegions(?array $regionIds): Collection
    {
        if ($regionIds !== null && count($regionIds) > 0) {
            return Region::whereIn('id', $regionIds)->get();
        }

        // Auto-select underserved regions
        $gaps = $this->identifyGaps();

        return $gaps['regions']->take(3);
    }

    /**
     * Select categories based on gaps.
     *
     * @return array<string>
     */
    private function selectCategories(?Collection $regions): array
    {
        $gaps = $this->identifyGaps();

        return array_slice($gaps['categories'], 0, 4);
    }

    /**
     * Select a writing style, preferring less common styles.
     */
    private function selectWritingStyle(): string
    {
        $styleCounts = WriterAgent::active()
            ->select('writing_style', DB::raw('COUNT(*) as count'))
            ->groupBy('writing_style')
            ->pluck('count', 'writing_style');

        $styles = WriterAgent::WRITING_STYLES;
        usort($styles, fn ($a, $b) => ($styleCounts->get($a, 0) <=> $styleCounts->get($b, 0)));

        return $styles[0];
    }

    /**
     * Generate agent profile using AI.
     *
     * @param  array<string>  $categories
     * @return array{name: string, bio: string, persona_traits: array<string, string>, expertise_areas: array<string>}
     */
    private function generateAgentProfile(Collection $regions, array $categories, string $writingStyle): array
    {
        try {
            $regionNames = $regions->pluck('name')->implode(', ') ?: 'general coverage';
            $categoryList = implode(', ', $categories);

            $prompt = <<<PROMPT
Generate a realistic journalist/writer profile for a local news writer with the following characteristics:

- Coverage area: {$regionNames}
- Categories: {$categoryList}
- Writing style: {$writingStyle}

Create a believable American journalist persona with:
1. A realistic full name (first and last name)
2. A professional bio (2-3 sentences describing their journalism background and interests)
3. Personality traits that affect their writing
4. Areas of expertise based on the categories

The persona should feel like a real local news journalist.
PROMPT;

            $model = config('news-workflow.ai_models.scoring', ['anthropic', 'claude-sonnet-4-20250514']);

            $response = prism()
                ->structured()
                ->using(...$model)
                ->withClientOptions(['timeout' => self::CLIENT_TIMEOUT])
                ->withPrompt($prompt)
                ->withSchema(new RawSchema('agent_profile', [
                    'type' => 'object',
                    'properties' => [
                        'name' => [
                            'type' => 'string',
                            'description' => 'Full name of the journalist (first and last name)',
                        ],
                        'bio' => [
                            'type' => 'string',
                            'description' => 'Professional bio (2-3 sentences)',
                        ],
                        'persona_traits' => [
                            'type' => 'object',
                            'properties' => [
                                'tone' => [
                                    'type' => 'string',
                                    'enum' => ['friendly', 'professional', 'authoritative', 'empathetic', 'engaging'],
                                ],
                                'voice' => [
                                    'type' => 'string',
                                    'enum' => ['active', 'balanced', 'measured', 'direct'],
                                ],
                                'approach' => [
                                    'type' => 'string',
                                    'enum' => ['fact-focused', 'narrative', 'analytical', 'community-oriented', 'investigative'],
                                ],
                            ],
                            'required' => ['tone', 'voice', 'approach'],
                        ],
                        'expertise_areas' => [
                            'type' => 'array',
                            'description' => 'List of 3-5 specific expertise areas',
                            'items' => ['type' => 'string'],
                        ],
                    ],
                    'required' => ['name', 'bio', 'persona_traits', 'expertise_areas'],
                ]))
                ->generate();

            return $response->structured;
        } catch (Exception $e) {
            Log::warning('AI profile generation failed, using fallback', [
                'error' => $e->getMessage(),
            ]);

            // Fallback to simple generated profile
            return $this->generateFallbackProfile($writingStyle);
        }
    }

    /**
     * Generate fallback profile without AI.
     *
     * @return array{name: string, bio: string, persona_traits: array<string, string>, expertise_areas: array<string>}
     */
    private function generateFallbackProfile(string $writingStyle): array
    {
        $firstNames = ['Sarah', 'Michael', 'Emily', 'James', 'Jessica', 'David', 'Amanda', 'Christopher', 'Jennifer', 'Matthew'];
        $lastNames = ['Mitchell', 'Thompson', 'Garcia', 'Anderson', 'Wilson', 'Martinez', 'Taylor', 'Brown', 'Davis', 'Miller'];

        $name = $firstNames[array_rand($firstNames)].' '.$lastNames[array_rand($lastNames)];

        return [
            'name' => $name,
            'bio' => "{$name} is a dedicated local journalist with years of experience covering community news and events. They are committed to bringing accurate, timely reporting to readers.",
            'persona_traits' => [
                'tone' => 'professional',
                'voice' => 'balanced',
                'approach' => 'fact-focused',
            ],
            'expertise_areas' => ['local news', 'community events', 'public affairs'],
        ];
    }

    /**
     * Generate prompts for the agent based on their profile.
     *
     * @param  array{name: string, bio: string, persona_traits: array<string, string>, expertise_areas: array<string>}  $profile
     * @return array{system_prompt: string, style_instructions: string}
     */
    private function generatePrompts(array $profile, string $writingStyle): array
    {
        $tone = $profile['persona_traits']['tone'] ?? 'professional';
        $voice = $profile['persona_traits']['voice'] ?? 'balanced';
        $approach = $profile['persona_traits']['approach'] ?? 'fact-focused';
        $expertise = implode(', ', $profile['expertise_areas'] ?? []);

        $systemPrompt = "You are {$profile['name']}, a local news journalist. {$profile['bio']} Your writing reflects your expertise in {$expertise}.";

        $styleInstructions = match ($writingStyle) {
            WriterAgent::STYLE_FORMAL => "Write in a formal, traditional journalistic style. Use proper AP style guidelines. Maintain objectivity and avoid colloquialisms. Your tone is {$tone} and your approach is {$approach}.",
            WriterAgent::STYLE_CASUAL => "Write in a conversational, accessible style while maintaining journalistic integrity. Connect with readers personally. Your tone is {$tone} and your voice is {$voice}.",
            WriterAgent::STYLE_INVESTIGATIVE => "Write with depth and thoroughness. Ask probing questions and present findings methodically. Your approach is {$approach} with an investigative edge.",
            WriterAgent::STYLE_CONVERSATIONAL => "Write as if speaking directly to a neighbor. Be warm, engaging, and relatable while delivering important local news. Your tone is {$tone}.",
            default => "Write clearly and engagingly for a local audience. Your tone is {$tone}, your voice is {$voice}, and your approach is {$approach}.",
        };

        return [
            'system_prompt' => $systemPrompt,
            'style_instructions' => $styleInstructions,
        ];
    }
}
