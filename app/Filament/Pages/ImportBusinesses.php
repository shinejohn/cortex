<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\Business;
use App\Models\Region;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ViewField;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Facades\Blade;
use UnitEnum;

/**
 * @property-read Schema $form
 */
final class ImportBusinesses extends Page
{
    /** @var array<string, mixed>|null */
    public ?array $data = [];

    /** @var array<string, mixed> */
    public array $parsedData = [];

    /** @var array<string, mixed> */
    public array $importSummary = [
        'total_regions' => 0,
        'total_businesses' => 0,
        'sample_names' => [],
    ];

    protected static ?string $title = 'Import Businesses';

    protected static ?string $navigationLabel = 'Import Businesses';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowUpTray;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 5;

    protected string $view = 'filament.pages.import-businesses';

    public function mount(): void
    {
        $this->form->fill([
            'json_file' => null,
            'preserve_uuids' => true,
            'skip_duplicates' => true,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Wizard::make([
                    Step::make('Upload')
                        ->icon('heroicon-o-document-arrow-up')
                        ->description('Upload the businesses JSON export file')
                        ->schema([
                            Section::make('JSON File')
                                ->description('Upload the JSON file exported from the source application.')
                                ->schema([
                                    FileUpload::make('json_file')
                                        ->label('Businesses JSON File')
                                        ->acceptedFileTypes(['application/json'])
                                        ->maxSize(51200) // 50MB
                                        ->disk('local')
                                        ->directory('tmp')
                                        ->required()
                                        ->helperText('Upload a .json file (max 50MB) exported from the Export Businesses page.'),
                                ])
                                ->columnSpanFull()
                                ->footerActions([
                                    \Filament\Actions\Action::make('parse_json')
                                        ->label('Parse File')
                                        ->action(fn () => $this->parseJsonFile())
                                        ->color('primary'),
                                ]),

                            Section::make('Preview')
                                ->description('Preview of the uploaded data')
                                ->schema([
                                    ViewField::make('preview')
                                        ->view('filament.pages.import-businesses-preview'),
                                ])
                                ->visible(fn () => ! empty($this->parsedData))
                                ->columnSpanFull(),
                        ]),

                    Step::make('Options')
                        ->icon('heroicon-o-cog-6-tooth')
                        ->description('Configure import settings')
                        ->schema([
                            Section::make('Import Settings')
                                ->schema([
                                    Toggle::make('preserve_uuids')
                                        ->label('Preserve Original UUIDs')
                                        ->helperText('Keep the original UUID identifiers from the source. Recommended for migration.')
                                        ->default(true),

                                    Toggle::make('skip_duplicates')
                                        ->label('Skip Duplicates')
                                        ->helperText('Skip businesses that already exist with the same google_place_id.')
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
                                        ->view('filament.pages.import-businesses-summary'),
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

    public function parseJsonFile(): void
    {
        $filePath = $this->data['json_file'] ?? null;

        if (empty($filePath)) {
            Notification::make()
                ->title('No file uploaded')
                ->body('Please upload a JSON file first.')
                ->warning()
                ->send();

            return;
        }

        $disk = Storage::disk('local');

        if (! $disk->exists($filePath)) {
            Notification::make()
                ->title('File not found')
                ->body('The uploaded file could not be found.')
                ->danger()
                ->send();

            return;
        }

        $content = $disk->get($filePath);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Notification::make()
                ->title('Invalid JSON')
                ->body('The file does not contain valid JSON: ' . json_last_error_msg())
                ->danger()
                ->send();

            return;
        }

        if (! isset($data['businesses']) || ! is_array($data['businesses'])) {
            Notification::make()
                ->title('Invalid format')
                ->body('The JSON file must contain a "businesses" array.')
                ->danger()
                ->send();

            return;
        }

        $this->parsedData = $data;

        $sampleNames = array_slice(
            array_column($data['businesses'], 'name'),
            0,
            10
        );

        $this->importSummary = [
            'total_regions' => count($data['regions'] ?? []),
            'total_businesses' => count($data['businesses']),
            'sample_names' => $sampleNames,
        ];

        Notification::make()
            ->title('File Parsed')
            ->body(sprintf(
                'Found %d businesses and %d regions.',
                count($data['businesses']),
                count($data['regions'] ?? [])
            ))
            ->success()
            ->send();
    }

    public function startImport(): void
    {
        if (empty($this->parsedData['businesses'])) {
            Notification::make()
                ->title('No data to import')
                ->body('Please upload and parse a valid JSON file first.')
                ->danger()
                ->send();

            return;
        }

        $preserveUuids = $this->data['preserve_uuids'] ?? true;
        $skipDuplicates = $this->data['skip_duplicates'] ?? true;

        $regionsCreated = 0;
        $regionsMatched = 0;
        $businessesCreated = 0;
        $businessesSkipped = 0;

        try {
            DB::transaction(function () use ($preserveUuids, $skipDuplicates, &$regionsCreated, &$regionsMatched, &$businessesCreated, &$businessesSkipped) {
                // Step 1: Import regions - build old ID → new ID map
                $regionIdMap = [];
                $regions = $this->parsedData['regions'] ?? [];

                // Topological sort: process regions in dependency order
                // so parents are always created before their children
                $regions = $this->sortRegionsByHierarchy($regions);

                foreach ($regions as $regionData) {
                    $oldId = $regionData['id'];
                    $existing = Region::query()->where('slug', $regionData['slug'])->first();

                    if ($existing) {
                        $regionIdMap[$oldId] = $existing->id;
                        $regionsMatched++;

                        continue;
                    }

                    $newRegionData = [
                        'name' => $regionData['name'],
                        'slug' => $regionData['slug'],
                        'type' => $regionData['type'],
                        'description' => $regionData['description'] ?? null,
                        'is_active' => $regionData['is_active'] ?? true,
                        'display_order' => $regionData['display_order'] ?? 0,
                        'metadata' => $regionData['metadata'] ?? null,
                        'latitude' => $regionData['latitude'] ?? null,
                        'longitude' => $regionData['longitude'] ?? null,
                    ];

                    // Map parent_id through the ID map
                    if (! empty($regionData['parent_id']) && isset($regionIdMap[$regionData['parent_id']])) {
                        $newRegionData['parent_id'] = $regionIdMap[$regionData['parent_id']];
                    }

                    $region = new Region($newRegionData);

                    if ($preserveUuids) {
                        $region->id = $oldId;
                    }

                    $region->save();

                    $regionIdMap[$oldId] = $region->id;
                    $regionsCreated++;
                }

                // Step 2: Import businesses
                $sharedFields = [
                    'google_place_id', 'name', 'slug', 'description', 'website', 'phone',
                    'email', 'address', 'city', 'state', 'postal_code', 'country',
                    'latitude', 'longitude', 'categories', 'rating', 'reviews_count',
                    'opening_hours', 'images', 'serp_metadata',
                    'data_id', 'data_cid', 'lsig', 'provider_id',
                    'local_services_cid', 'local_services_bid', 'local_services_pid',
                    'serp_source', 'serp_last_synced_at',
                    'primary_type', 'type_id', 'type_ids',
                    'price_level', 'open_state', 'hours_display',
                    'google_badge', 'service_area', 'years_in_business', 'bookings_nearby',
                    'verification_status', 'verified_at', 'claimed_at', 'is_verified',
                    'service_options', 'reserve_url', 'order_online_url',
                    'status', 'claimable_type', 'claimable_id',
                ];

                foreach ($this->parsedData['businesses'] as $businessData) {
                    // Skip duplicates by google_place_id
                    if ($skipDuplicates && ! empty($businessData['google_place_id'])) {
                        $exists = Business::query()
                            ->where('google_place_id', $businessData['google_place_id'])
                            ->exists();

                        if ($exists) {
                            $businessesSkipped++;

                            continue;
                        }
                    }

                    // Build attributes from shared fields only
                    $attributes = [];
                    foreach ($sharedFields as $field) {
                        if (array_key_exists($field, $businessData)) {
                            $attributes[$field] = $businessData[$field];
                        }
                    }

                    // workspace_id is always null for imported businesses
                    $attributes['workspace_id'] = null;

                    $business = new Business($attributes);

                    if ($preserveUuids && ! empty($businessData['id'])) {
                        $business->id = $businessData['id'];
                    }

                    $business->save();

                    // Attach region pivots
                    $regionIds = $businessData['region_ids'] ?? [];
                    $mappedRegionIds = [];
                    foreach ($regionIds as $oldRegionId) {
                        if (isset($regionIdMap[$oldRegionId])) {
                            $mappedRegionIds[] = $regionIdMap[$oldRegionId];
                        }
                    }

                    if (! empty($mappedRegionIds)) {
                        $pivotRows = array_map(fn (string $regionId) => [
                            'business_id' => $business->id,
                            'region_id' => $regionId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ], $mappedRegionIds);

                        DB::table('business_region')->insert($pivotRows);
                    }

                    $businessesCreated++;
                }
            });
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Import Failed')
                ->body('An error occurred: ' . $e->getMessage())
                ->danger()
                ->send();

            return;
        }

        // Clean up the uploaded file
        $filePath = $this->data['json_file'] ?? null;
        if ($filePath) {
            Storage::disk('local')->delete($filePath);
        }

        Notification::make()
            ->title('Import Complete')
            ->body(sprintf(
                'Regions: %d created, %d matched. Businesses: %d created, %d skipped.',
                $regionsCreated,
                $regionsMatched,
                $businessesCreated,
                $businessesSkipped
            ))
            ->success()
            ->send();

        // Reset state
        $this->parsedData = [];
        $this->importSummary = [
            'total_regions' => 0,
            'total_businesses' => 0,
            'sample_names' => [],
        ];
        $this->form->fill([
            'json_file' => null,
            'preserve_uuids' => true,
            'skip_duplicates' => true,
        ]);

        $this->redirect(route('filament.admin.resources.businesses.index'));
    }

    /**
     * Sort regions so parents always come before their children (topological sort).
     *
     * @param  array<int, array<string, mixed>>  $regions
     * @return array<int, array<string, mixed>>
     */
    private function sortRegionsByHierarchy(array $regions): array
    {
        $indexed = [];
        foreach ($regions as $region) {
            $indexed[$region['id']] = $region;
        }

        $sorted = [];
        $processed = [];

        // Keep processing until all regions are sorted or we can't make progress
        $maxPasses = count($regions) + 1;
        $pass = 0;

        while (count($sorted) < count($regions) && $pass < $maxPasses) {
            foreach ($indexed as $id => $region) {
                if (isset($processed[$id])) {
                    continue;
                }

                $parentId = $region['parent_id'] ?? null;

                // Process if: no parent, parent already processed, or parent not in this dataset
                if ($parentId === null || isset($processed[$parentId]) || ! isset($indexed[$parentId])) {
                    $sorted[] = $region;
                    $processed[$id] = true;
                }
            }

            $pass++;
        }

        return $sorted;
    }
}
