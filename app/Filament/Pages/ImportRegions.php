<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Jobs\Regions\ProcessRegionImportJob;
use App\Models\Region;
use BackedEnum;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ViewField;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\HtmlString;
use UnitEnum;

/**
 * @property-read Schema $form
 */
final class ImportRegions extends Page
{
    /** @var array<string, mixed>|null */
    public ?array $data = [];

    /** @var array<int, array<string, mixed>> */
    public array $parsedRows = [];

    /** @var array<string, int> */
    public array $importSummary = [
        'total_rows' => 0,
        'unique_states' => 0,
        'unique_counties' => 0,
        'unique_cities' => 0,
    ];

    protected static ?string $title = 'Import Regions';

    protected static ?string $navigationLabel = 'Import Regions';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowUpTray;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.import-regions';

    public function mount(): void
    {
        $this->form->fill([
            'csv_content' => '',
            'parent_region_id' => null,
            'enable_geocoding' => true,
            'mark_active' => true,
            'store_metadata' => true,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Wizard::make([
                    Step::make('Upload CSV')
                        ->icon('heroicon-o-document-arrow-up')
                        ->description('Upload your regions CSV file')
                        ->schema([
                            Section::make('CSV Data')
                                ->description('Paste CSV content with columns: Community, City, County, State, Population (optional), Est_SMBs (optional), Type (optional), Notes (optional)')
                                ->schema([
                                    Textarea::make('csv_content')
                                        ->label('CSV Content')
                                        ->placeholder("Day,Date,Community,City,County,State,Population,Est_SMBs,Type,Notes\n1,2025-12-01,Gainesville,Gainesville,Alachua,FL,150647,16026,major,Primary launch")
                                        ->required()
                                        ->rows(10)
                                        ->live(debounce: 500)
                                        ->helperText('Paste your CSV content here including the header row'),
                                ])
                                ->columnSpanFull()
                                ->footerActions([
                                    \Filament\Actions\Action::make('parse_csv')
                                        ->label('Parse CSV')
                                        ->action(fn () => $this->parseCSVContent())
                                        ->color('primary'),
                                ]),

                            Section::make('Preview')
                                ->description('Preview of the uploaded data')
                                ->schema([
                                    ViewField::make('preview')
                                        ->view('filament.pages.import-regions-preview'),
                                ])
                                ->visible(fn () => ! empty($this->parsedRows))
                                ->columnSpanFull(),
                        ]),

                    Step::make('Options')
                        ->icon('heroicon-o-cog-6-tooth')
                        ->description('Configure import settings')
                        ->schema([
                            Section::make('Import Settings')
                                ->schema([
                                    Select::make('parent_region_id')
                                        ->label('Nest Under Parent Region (Optional)')
                                        ->placeholder('Select a parent region...')
                                        ->options(fn () => Region::query()
                                            ->whereIn('type', ['state', 'county'])
                                            ->orderBy('name')
                                            ->pluck('name', 'id')
                                            ->toArray())
                                        ->searchable()
                                        ->helperText('If selected, all imported states will be nested under this region. Leave empty to create top-level states.'),

                                    Toggle::make('enable_geocoding')
                                        ->label('Enable Geocoding')
                                        ->helperText('Automatically fetch latitude/longitude coordinates for each region using Google Maps API. This will dispatch background jobs.')
                                        ->default(true),

                                    Toggle::make('mark_active')
                                        ->label('Mark Regions as Active')
                                        ->helperText('Set imported regions as active immediately.')
                                        ->default(true),

                                    Toggle::make('store_metadata')
                                        ->label('Store CSV Metadata')
                                        ->helperText('Store Population, Est_SMBs, Type, and Notes in the region metadata field.')
                                        ->default(true),
                                ])
                                ->columnSpanFull(),
                        ]),

                    Step::make('Import')
                        ->icon('heroicon-o-check-circle')
                        ->description('Review and start import')
                        ->schema([
                            Section::make('Summary')
                                ->description('Review the import before starting')
                                ->schema([
                                    ViewField::make('final_summary')
                                        ->view('filament.pages.import-regions-summary'),
                                ])
                                ->columnSpanFull(),
                        ]),
                ])
                    ->submitAction(new HtmlString(Blade::render(<<<'BLADE'
                        <x-filament::button
                            type="button"
                            wire:click="startImport"
                            wire:loading.attr="disabled"
                        >
                            <span wire:loading.remove wire:target="startImport">Start Import</span>
                            <span wire:loading wire:target="startImport">Processing...</span>
                        </x-filament::button>
                    BLADE))),
            ])
            ->statePath('data');
    }

    public function parseCSVContent(): void
    {
        // Access data directly from the statePath property
        $content = $this->data['csv_content'] ?? '';

        if (empty(mb_trim($content))) {
            Notification::make()
                ->title('No content')
                ->body('Please paste CSV content first.')
                ->warning()
                ->send();

            $this->parsedRows = [];
            $this->resetSummary();

            return;
        }

        $lines = preg_split('/\r\n|\r|\n/', mb_trim($content));

        if (count($lines) < 2) {
            Notification::make()
                ->title('Invalid CSV')
                ->body('CSV must have at least a header row and one data row')
                ->danger()
                ->send();

            return;
        }

        // Parse header
        $headerLine = array_shift($lines);
        $headers = str_getcsv($headerLine);
        $headers = array_map('trim', $headers);

        // Parse data rows
        $rows = [];
        foreach ($lines as $line) {
            if (empty(mb_trim($line))) {
                continue;
            }

            $data = str_getcsv($line);

            if (count($data) >= 4) {
                // Pad data if needed
                while (count($data) < count($headers)) {
                    $data[] = '';
                }
                // Trim to header count
                $data = array_slice($data, 0, count($headers));

                $row = array_combine($headers, $data);
                if ($row !== false) {
                    $rows[] = $row;
                }
            }
        }

        $this->parsedRows = $rows;
        $this->calculateSummary();

        Notification::make()
            ->title('CSV Parsed')
            ->body(sprintf('Found %d rows', count($rows)))
            ->success()
            ->send();
    }

    public function startImport(): void
    {
        if (empty($this->parsedRows)) {
            Notification::make()
                ->title('No data to import')
                ->body('Please upload a valid CSV file first.')
                ->danger()
                ->send();

            return;
        }

        // Dispatch the import job
        ProcessRegionImportJob::dispatch(
            rows: $this->parsedRows,
            options: [
                'enable_geocoding' => $this->data['enable_geocoding'] ?? true,
                'mark_active' => $this->data['mark_active'] ?? true,
                'store_metadata' => $this->data['store_metadata'] ?? true,
                'parent_region_id' => $this->data['parent_region_id'] ?? null,
            ],
            userId: auth()->id()
        );

        Notification::make()
            ->title('Import Started')
            ->body(sprintf(
                'Processing %d rows. You will receive a notification when the import is complete.',
                count($this->parsedRows)
            ))
            ->success()
            ->send();

        // Reset form
        $this->parsedRows = [];
        $this->resetSummary();
        $this->form->fill([
            'csv_content' => '',
            'parent_region_id' => null,
            'enable_geocoding' => true,
            'mark_active' => true,
            'store_metadata' => true,
        ]);

        // Redirect to regions list
        $this->redirect(route('filament.admin.resources.regions.index'));
    }

    private function calculateSummary(): void
    {
        $states = [];
        $counties = [];
        $cities = [];

        foreach ($this->parsedRows as $row) {
            $state = mb_trim($row['State'] ?? '');
            $county = mb_trim($row['County'] ?? '');
            $city = mb_trim($row['City'] ?? '');

            if ($state) {
                $states[$state] = true;
            }
            if ($state && $county) {
                $counties["{$state}-{$county}"] = true;
            }
            if ($state && $county && $city) {
                $cities["{$state}-{$county}-{$city}"] = true;
            }
        }

        $this->importSummary = [
            'total_rows' => count($this->parsedRows),
            'unique_states' => count($states),
            'unique_counties' => count($counties),
            'unique_cities' => count($cities),
        ];
    }

    private function resetSummary(): void
    {
        $this->importSummary = [
            'total_rows' => 0,
            'unique_states' => 0,
            'unique_counties' => 0,
            'unique_cities' => 0,
        ];
    }
}
