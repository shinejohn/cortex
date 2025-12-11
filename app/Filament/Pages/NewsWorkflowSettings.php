<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\NewsWorkflowSetting;
use BackedEnum;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * @property-read Schema $form
 */
final class NewsWorkflowSettings extends Page
{
    /**
     * Configuration for workflow phases with their database keys and descriptions.
     *
     * @var array<string, array{label: string, description: string, config_key: string}>
     */
    private const WORKFLOW_PHASES = [
        'business_discovery_enabled' => [
            'label' => 'Business Discovery',
            'description' => 'Discover local businesses for news sourcing (Phase 1)',
            'config_key' => 'news-workflow.business_discovery.enabled',
        ],
        'news_collection_enabled' => [
            'label' => 'News Collection',
            'description' => 'Collect news articles from discovered businesses (Phase 2)',
            'config_key' => 'news-workflow.news_collection.enabled',
        ],
        'shortlisting_enabled' => [
            'label' => 'Shortlisting',
            'description' => 'AI-powered relevance scoring and shortlisting (Phase 3)',
            'config_key' => 'news-workflow.shortlisting.enabled',
        ],
        'fact_checking_enabled' => [
            'label' => 'Fact Checking',
            'description' => 'Verify claims before publication (Phase 4)',
            'config_key' => 'news-workflow.fact_checking.enabled',
        ],
        'final_selection_enabled' => [
            'label' => 'Final Selection',
            'description' => 'Quality evaluation and final article selection (Phase 5)',
            'config_key' => 'news-workflow.final_selection.enabled',
        ],
        'article_generation_enabled' => [
            'label' => 'Article Generation',
            'description' => 'AI-powered article writing (Phase 6)',
            'config_key' => 'news-workflow.article_generation.enabled',
        ],
        'publishing_enabled' => [
            'label' => 'Publishing',
            'description' => 'Auto-publish high-quality articles (Phase 7)',
            'config_key' => 'news-workflow.publishing.enabled',
        ],
        'event_extraction_enabled' => [
            'label' => 'Event Extraction',
            'description' => 'Extract events from news articles',
            'config_key' => 'news-workflow.event_extraction.enabled',
        ],
        'unsplash_enabled' => [
            'label' => 'Unsplash Images',
            'description' => 'Fetch images from Unsplash for articles',
            'config_key' => 'news-workflow.unsplash.enabled',
        ],
    ];

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    protected static ?string $title = 'Workflow Settings';

    protected static ?string $navigationLabel = 'Workflow Settings';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 4;

    protected string $view = 'filament.pages.news-workflow-settings';

    public function mount(): void
    {
        $this->loadSettings();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('News Pipeline')
                    ->description('Control the main news workflow phases. Disabling a phase will skip it during processing.')
                    ->icon('heroicon-o-newspaper')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                $this->createToggle('business_discovery_enabled'),
                                $this->createToggle('news_collection_enabled'),
                                $this->createToggle('shortlisting_enabled'),
                                $this->createToggle('fact_checking_enabled'),
                                $this->createToggle('final_selection_enabled'),
                                $this->createToggle('article_generation_enabled'),
                                $this->createToggle('publishing_enabled'),
                            ]),
                    ]),

                Section::make('Additional Features')
                    ->description('Control supplementary features of the news workflow.')
                    ->icon('heroicon-o-puzzle-piece')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                $this->createToggle('event_extraction_enabled'),
                                $this->createToggle('unsplash_enabled'),
                            ]),
                    ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        foreach (self::WORKFLOW_PHASES as $key => $config) {
            $value = $this->data[$key] ?? false;
            NewsWorkflowSetting::set($key, (bool) $value, $config['description']);
        }

        // Clear config cache to apply changes immediately
        NewsWorkflowSetting::clearCache();

        Notification::make()
            ->title('Settings saved')
            ->body('Workflow settings have been updated successfully.')
            ->success()
            ->send();
    }

    /**
     * Create a toggle component for a workflow phase.
     */
    private function createToggle(string $key): Toggle
    {
        $config = self::WORKFLOW_PHASES[$key];

        return Toggle::make($key)
            ->label($config['label'])
            ->helperText($config['description'])
            ->default(true);
    }

    /**
     * Load current settings from database, falling back to config defaults.
     */
    private function loadSettings(): void
    {
        $data = [];

        foreach (self::WORKFLOW_PHASES as $key => $config) {
            // Try to get from database first, fall back to config
            $dbValue = NewsWorkflowSetting::get($key);

            if ($dbValue !== null) {
                $data[$key] = (bool) $dbValue;
            } else {
                // Fall back to current config value
                $data[$key] = (bool) config($config['config_key'], true);
            }
        }

        $this->form->fill($data);
    }
}
