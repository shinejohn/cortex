<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Services\News\WorkflowSettingsService;
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
     * Configuration for workflow phases with their labels and descriptions.
     *
     * @var array<string, array{label: string, description: string}>
     */
    private const WORKFLOW_PHASES = [
        'business_discovery' => [
            'label' => 'Business Discovery',
            'description' => 'Discover local businesses for news sourcing (Phase 1)',
        ],
        'news_collection' => [
            'label' => 'News Collection',
            'description' => 'Collect news articles from discovered businesses (Phase 2)',
        ],
        'shortlisting' => [
            'label' => 'Shortlisting',
            'description' => 'AI-powered relevance scoring and shortlisting (Phase 3)',
        ],
        'fact_checking' => [
            'label' => 'Fact Checking',
            'description' => 'Verify claims before publication (Phase 4)',
        ],
        'final_selection' => [
            'label' => 'Final Selection',
            'description' => 'Quality evaluation and final article selection (Phase 5)',
        ],
        'article_generation' => [
            'label' => 'Article Generation',
            'description' => 'AI-powered article writing (Phase 6)',
        ],
        'publishing' => [
            'label' => 'Publishing',
            'description' => 'Auto-publish high-quality articles (Phase 7)',
        ],
        'event_extraction' => [
            'label' => 'Event Extraction',
            'description' => 'Extract events from news articles',
        ],
        'unsplash' => [
            'label' => 'Unsplash Images',
            'description' => 'Fetch images from Unsplash for articles',
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

    public function __construct(
        private readonly WorkflowSettingsService $workflowSettings = new WorkflowSettingsService
    ) {}

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
                                $this->createToggle('business_discovery'),
                                $this->createToggle('news_collection'),
                                $this->createToggle('shortlisting'),
                                $this->createToggle('fact_checking'),
                                $this->createToggle('final_selection'),
                                $this->createToggle('article_generation'),
                                $this->createToggle('publishing'),
                            ]),
                    ]),

                Section::make('Additional Features')
                    ->description('Control supplementary features of the news workflow.')
                    ->icon('heroicon-o-puzzle-piece')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                $this->createToggle('event_extraction'),
                                $this->createToggle('unsplash'),
                            ]),
                    ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        foreach (array_keys(self::WORKFLOW_PHASES) as $phase) {
            $value = $this->data[$phase] ?? false;
            $this->workflowSettings->setPhaseEnabled($phase, (bool) $value);
        }

        Notification::make()
            ->title('Settings saved')
            ->body('Workflow settings have been updated successfully.')
            ->success()
            ->send();
    }

    /**
     * Create a toggle component for a workflow phase.
     */
    private function createToggle(string $phase): Toggle
    {
        $config = self::WORKFLOW_PHASES[$phase];

        return Toggle::make($phase)
            ->label($config['label'])
            ->helperText($config['description'])
            ->default(true);
    }

    /**
     * Load current settings using the service.
     */
    private function loadSettings(): void
    {
        $data = $this->workflowSettings->getAllPhaseStatuses();
        $this->form->fill($data);
    }
}
