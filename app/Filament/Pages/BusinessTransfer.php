<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\Business;
use App\Models\Region;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;
use UnitEnum;

/**
 * @property-read Schema $form
 */
final class BusinessTransfer extends Page
{
    /**
     * Fields shared between gec-laravel and platform Business models.
     * Used as a whitelist during import to prevent setting platform-only fields.
     *
     * @var array<int, string>
     */
    private const SHARED_FIELDS = [
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

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    /** @var array<int, array<string, mixed>> */
    public array $previewBusinesses = [];

    public int $previewCount = 0;

    /** @var array{total_regions: int, total_businesses: int, sample_names: array<int, string>} */
    public array $importSummary = [
        'total_regions' => 0,
        'total_businesses' => 0,
        'sample_names' => [],
    ];

    protected static ?string $title = 'Business Transfer';

    protected static ?string $navigationLabel = 'Business Transfer';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowsRightLeft;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 4;

    protected string $view = 'filament.pages.business-transfer';

    public function mount(): void
    {
        $this->form->fill([
            'region_id' => null,
            'status' => 'all',
            'import_file' => null,
            'preserve_uuids' => true,
            'skip_duplicates' => true,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Transfer')
                    ->tabs([
                        Tab::make('Export')
                            ->icon('heroicon-o-arrow-down-tray')
                            ->schema([
                                Section::make('Filters')
                                    ->description('Optionally filter which businesses to export')
                                    ->schema([
                                        Select::make('region_id')
                                            ->label('Region')
                                            ->placeholder('All regions')
                                            ->options(fn () => Region::query()
                                                ->active()
                                                ->orderBy('name')
                                                ->pluck('name', 'id')
                                                ->toArray())
                                            ->searchable()
                                            ->live()
                                            ->afterStateUpdated(fn () => $this->resetExportPreview()),

                                        Select::make('status')
                                            ->label('Status')
                                            ->options([
                                                'all' => 'All',
                                                'active' => 'Active only',
                                                'inactive' => 'Inactive only',
                                            ])
                                            ->default('all')
                                            ->live()
                                            ->afterStateUpdated(fn () => $this->resetExportPreview()),
                                    ])
                                    ->columns(2)
                                    ->footerActions([
                                        \Filament\Actions\Action::make('preview')
                                            ->label('Preview')
                                            ->icon('heroicon-o-eye')
                                            ->color('gray')
                                            ->action(fn () => $this->updatePreview()),
                                    ]),
                            ]),

                        Tab::make('Import')
                            ->icon('heroicon-o-arrow-up-tray')
                            ->schema([
                                Section::make('Archive File')
                                    ->description('Upload the .tar.gz archive exported from the Export tab.')
                                    ->schema([
                                        FileUpload::make('import_file')
                                            ->label('Business Archive')
                                            ->acceptedFileTypes(['application/gzip', 'application/x-gzip', 'application/x-compressed-tar'])
                                            ->maxSize(102400)
                                            ->disk('local')
                                            ->directory('tmp')
                                            ->helperText('Upload a .tar.gz archive (max 100MB).'),

                                        Toggle::make('preserve_uuids')
                                            ->label('Preserve Original UUIDs')
                                            ->helperText('Keep the original UUID identifiers from the source.')
                                            ->default(true),

                                        Toggle::make('skip_duplicates')
                                            ->label('Skip Duplicates')
                                            ->helperText('Skip businesses that already exist with the same google_place_id.')
                                            ->default(true),
                                    ])
                                    ->footerActions([
                                        \Filament\Actions\Action::make('parse_archive')
                                            ->label('Parse Archive')
                                            ->icon('heroicon-o-document-magnifying-glass')
                                            ->action(fn () => $this->parseArchive())
                                            ->color('gray'),

                                        \Filament\Actions\Action::make('start_import')
                                            ->label('Start Import')
                                            ->icon('heroicon-o-arrow-up-tray')
                                            ->action(fn () => $this->startImport())
                                            ->color('primary')
                                            ->visible(fn () => $this->importSummary['total_businesses'] > 0),
                                    ]),
                            ]),
                    ]),
            ])
            ->statePath('data');
    }

    public function updatePreview(): void
    {
        $query = $this->buildExportQuery();

        $this->previewCount = $query->count();
        $this->previewBusinesses = $query->limit(5)
            ->get(['id', 'name', 'city', 'state', 'status'])
            ->toArray();
    }

    public function export(): BinaryFileResponse
    {
        $query = $this->buildExportQuery();
        $totalCount = $query->count();

        if ($totalCount === 0) {
            Notification::make()
                ->title('No businesses to export')
                ->body('No businesses match the selected filters.')
                ->warning()
                ->send();
        }

        $exportId = now()->format('Y-m-d-His').'-'.uniqid();
        $tempDir = storage_path("app/tmp/export-{$exportId}");
        $businessDir = "{$tempDir}/businesses";
        File::ensureDirectoryExists($businessDir);

        // Metadata
        file_put_contents("{$tempDir}/metadata.json", json_encode([
            'exported_at' => now()->toIso8601String(),
            'total_businesses' => $totalCount,
        ], JSON_UNESCAPED_UNICODE));

        // Regions
        $regionIds = DB::table('business_region')
            ->whereIn('business_id', $query->clone()->select('id'))
            ->distinct()
            ->pluck('region_id');

        $regions = Region::query()
            ->whereIn('id', $regionIds)
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('name')
            ->get();

        $regionData = $regions->map(fn (Region $region) => [
            'id' => $region->id,
            'name' => $region->name,
            'slug' => $region->slug,
            'type' => $region->type,
            'parent_id' => $region->parent_id,
            'description' => $region->description,
            'is_active' => $region->is_active,
            'display_order' => $region->display_order,
            'metadata' => $region->metadata,
            'latitude' => $region->latitude,
            'longitude' => $region->longitude,
        ])->values()->toArray();

        file_put_contents("{$tempDir}/regions.json", json_encode($regionData, JSON_UNESCAPED_UNICODE));
        unset($regions, $regionData, $regionIds);

        // Business chunks — 100 per file to keep memory low
        $chunkIndex = 0;
        $query->with('regions:id')->chunk(100, function ($businesses) use ($businessDir, &$chunkIndex) {
            $chunkData = [];

            foreach ($businesses as $business) {
                $attributes = $business->toArray();
                unset($attributes['workspace_id'], $attributes['regions']);
                $attributes['region_ids'] = $business->regions->pluck('id')->values()->toArray();
                $chunkData[] = $attributes;
            }

            $chunkIndex++;
            file_put_contents(
                sprintf('%s/chunk-%04d.json', $businessDir, $chunkIndex),
                json_encode($chunkData, JSON_UNESCAPED_UNICODE)
            );
        });

        // Create tar.gz
        $tarGzPath = storage_path("app/tmp/businesses-export-{$exportId}.tar.gz");
        $result = Process::run(sprintf(
            'tar -czf %s -C %s .',
            escapeshellarg($tarGzPath),
            escapeshellarg($tempDir)
        ));

        File::deleteDirectory($tempDir);

        if ($result->failed()) {
            throw new \RuntimeException('Failed to create export archive: '.$result->errorOutput());
        }

        return response()->download(
            $tarGzPath,
            "businesses-export-{$exportId}.tar.gz",
            ['Content-Type' => 'application/gzip']
        )->deleteFileAfterSend(true);
    }

    public function parseArchive(): void
    {
        $filePath = $this->data['import_file'] ?? null;

        if (empty($filePath)) {
            Notification::make()
                ->title('No file uploaded')
                ->body('Please upload an archive first.')
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

        $tarGzPath = $disk->path($filePath);
        $tempDir = storage_path('app/tmp/import-preview-'.uniqid());
        File::ensureDirectoryExists($tempDir);

        $result = Process::run(sprintf(
            'tar -xzf %s -C %s',
            escapeshellarg($tarGzPath),
            escapeshellarg($tempDir)
        ));

        if ($result->failed()) {
            File::deleteDirectory($tempDir);

            Notification::make()
                ->title('Invalid archive')
                ->body('Could not extract the archive: '.$result->errorOutput())
                ->danger()
                ->send();

            return;
        }

        $totalBusinesses = 0;
        $sampleNames = [];
        $totalRegions = 0;

        // Count regions
        $regionsFile = "{$tempDir}/regions.json";
        if (file_exists($regionsFile)) {
            $regions = json_decode(file_get_contents($regionsFile), true);
            $totalRegions = is_array($regions) ? count($regions) : 0;
            unset($regions);
        }

        // Count businesses across chunks
        $chunkFiles = glob("{$tempDir}/businesses/chunk-*.json") ?: [];
        sort($chunkFiles);

        foreach ($chunkFiles as $chunkFile) {
            $chunk = json_decode(file_get_contents($chunkFile), true);

            if (! is_array($chunk)) {
                continue;
            }

            $totalBusinesses += count($chunk);

            if (count($sampleNames) < 10) {
                foreach ($chunk as $biz) {
                    if (count($sampleNames) >= 10) {
                        break;
                    }
                    $sampleNames[] = $biz['name'] ?? 'Unknown';
                }
            }

            unset($chunk);
        }

        File::deleteDirectory($tempDir);

        $this->importSummary = [
            'total_regions' => $totalRegions,
            'total_businesses' => $totalBusinesses,
            'sample_names' => $sampleNames,
        ];

        Notification::make()
            ->title('Archive Parsed')
            ->body(sprintf(
                'Found %d businesses and %d regions.',
                $totalBusinesses,
                $totalRegions
            ))
            ->success()
            ->send();
    }

    public function startImport(): void
    {
        $filePath = $this->data['import_file'] ?? null;

        if (empty($filePath)) {
            Notification::make()
                ->title('No file')
                ->body('Please upload and parse an archive first.')
                ->danger()
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

        $tarGzPath = $disk->path($filePath);
        $tempDir = storage_path('app/tmp/import-'.uniqid());
        File::ensureDirectoryExists($tempDir);

        $extractResult = Process::run(sprintf(
            'tar -xzf %s -C %s',
            escapeshellarg($tarGzPath),
            escapeshellarg($tempDir)
        ));

        if ($extractResult->failed()) {
            File::deleteDirectory($tempDir);

            Notification::make()
                ->title('Extraction Failed')
                ->body('Could not extract the archive.')
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
            // Import regions
            $regionIdMap = [];
            $regionsFile = "{$tempDir}/regions.json";

            if (file_exists($regionsFile)) {
                $rawRegions = json_decode(file_get_contents($regionsFile), true) ?? [];
                $sortedRegions = $this->sortRegionsByHierarchy($rawRegions);
                unset($rawRegions);

                DB::transaction(function () use ($sortedRegions, $preserveUuids, &$regionIdMap, &$regionsCreated, &$regionsMatched) {
                    foreach ($sortedRegions as $regionData) {
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
                });

                unset($sortedRegions);
            }

            // Import business chunks one file at a time
            $chunkFiles = glob("{$tempDir}/businesses/chunk-*.json") ?: [];
            sort($chunkFiles);

            foreach ($chunkFiles as $chunkFile) {
                $businesses = json_decode(file_get_contents($chunkFile), true);

                if (! is_array($businesses)) {
                    continue;
                }

                DB::transaction(function () use ($businesses, $preserveUuids, $skipDuplicates, $regionIdMap, &$businessesCreated, &$businessesSkipped) {
                    foreach ($businesses as $businessData) {
                        if ($skipDuplicates && ! empty($businessData['google_place_id'])) {
                            if (Business::query()->where('google_place_id', $businessData['google_place_id'])->exists()) {
                                $businessesSkipped++;

                                continue;
                            }
                        }

                        $attributes = [];
                        foreach (self::SHARED_FIELDS as $field) {
                            if (array_key_exists($field, $businessData)) {
                                $attributes[$field] = $businessData[$field];
                            }
                        }

                        $attributes['workspace_id'] = null;

                        $business = new Business($attributes);

                        if ($preserveUuids && ! empty($businessData['id'])) {
                            $business->id = $businessData['id'];
                        }

                        $business->save();

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

                unset($businesses);
            }
        } catch (Throwable $e) {
            File::deleteDirectory($tempDir);

            Notification::make()
                ->title('Import Failed')
                ->body('An error occurred: '.$e->getMessage())
                ->danger()
                ->send();

            return;
        }

        File::deleteDirectory($tempDir);
        $disk->delete($filePath);

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

        $this->resetImportState();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export Archive')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('primary')
                ->action(fn () => $this->export()),
        ];
    }

    /**
     * @return Builder<Business>
     */
    private function buildExportQuery(): Builder
    {
        $query = Business::query();

        $regionId = $this->data['region_id'] ?? null;
        if ($regionId) {
            $query->inRegion($regionId);
        }

        $status = $this->data['status'] ?? 'all';
        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'inactive') {
            $query->inactive();
        }

        return $query->orderBy('name');
    }

    private function resetExportPreview(): void
    {
        $this->previewCount = 0;
        $this->previewBusinesses = [];
    }

    private function resetImportState(): void
    {
        $this->importSummary = [
            'total_regions' => 0,
            'total_businesses' => 0,
            'sample_names' => [],
        ];
    }

    /**
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
        $maxPasses = count($regions) + 1;
        $pass = 0;

        while (count($sorted) < count($regions) && $pass < $maxPasses) {
            foreach ($indexed as $id => $region) {
                if (isset($processed[$id])) {
                    continue;
                }

                $parentId = $region['parent_id'] ?? null;

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
