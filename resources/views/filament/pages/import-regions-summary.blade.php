<div class="space-y-6">
    @php
        $summary = $this->importSummary ?? [];
        $options = [
            'enable_geocoding' => $this->data['enable_geocoding'] ?? true,
            'mark_active' => $this->data['mark_active'] ?? true,
            'store_metadata' => $this->data['store_metadata'] ?? true,
            'parent_region_id' => $this->data['parent_region_id'] ?? null,
        ];
    @endphp

    {{-- Import Summary --}}
    <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            What will be imported
        </h3>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="text-center">
                <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {{ number_format($summary['unique_states'] ?? 0) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">States</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-info-600 dark:text-info-400">
                    {{ number_format($summary['unique_counties'] ?? 0) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Counties</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-success-600 dark:text-success-400">
                    {{ number_format($summary['unique_cities'] ?? 0) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Cities</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-warning-600 dark:text-warning-400">
                    {{ number_format($summary['total_rows'] ?? 0) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
            </div>
        </div>
    </div>

    {{-- Options Summary --}}
    <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Import Settings
        </h3>

        <ul class="space-y-3">
            <li class="flex items-center gap-2">
                @if($options['enable_geocoding'] ?? false)
                    <span class="flex-shrink-0 text-success-500 font-bold">[+]</span>
                    <span class="text-gray-700 dark:text-gray-300">Geocoding enabled - coordinates will be fetched in the background</span>
                @else
                    <span class="flex-shrink-0 text-gray-400 font-bold">[-]</span>
                    <span class="text-gray-500 dark:text-gray-400">Geocoding disabled</span>
                @endif
            </li>

            <li class="flex items-center gap-2">
                @if($options['mark_active'] ?? false)
                    <span class="flex-shrink-0 text-success-500 font-bold">[+]</span>
                    <span class="text-gray-700 dark:text-gray-300">Regions will be marked as active</span>
                @else
                    <span class="flex-shrink-0 text-gray-400 font-bold">[-]</span>
                    <span class="text-gray-500 dark:text-gray-400">Regions will be inactive</span>
                @endif
            </li>

            <li class="flex items-center gap-2">
                @if($options['store_metadata'] ?? false)
                    <span class="flex-shrink-0 text-success-500 font-bold">[+]</span>
                    <span class="text-gray-700 dark:text-gray-300">CSV metadata (Population, Est_SMBs, Type, Notes) will be stored</span>
                @else
                    <span class="flex-shrink-0 text-gray-400 font-bold">[-]</span>
                    <span class="text-gray-500 dark:text-gray-400">CSV metadata will not be stored</span>
                @endif
            </li>

            <li class="flex items-center gap-2">
                @if($options['parent_region_id'] ?? null)
                    <span class="flex-shrink-0 text-info-500 font-bold">[+]</span>
                    <span class="text-gray-700 dark:text-gray-300">Regions will be nested under a parent region</span>
                @else
                    <span class="flex-shrink-0 text-gray-400 font-bold">[i]</span>
                    <span class="text-gray-500 dark:text-gray-400">States will be created as top-level regions</span>
                @endif
            </li>
        </ul>
    </div>

    {{-- Hierarchy Info --}}
    <div class="rounded-lg border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20">
        <div class="flex items-start gap-3">
            <span class="flex-shrink-0 text-info-500 font-bold">[i]</span>
            <div class="text-sm text-info-700 dark:text-info-300">
                <p class="font-medium">Hierarchy Structure</p>
                <p class="mt-1">
                    Regions will be created with the following hierarchy:
                    <strong>State</strong> → <strong>County</strong> → <strong>City</strong>
                </p>
                <p class="mt-1">
                    If a Community name differs from the City name, it will be created as a <strong>Neighborhood</strong> under the City.
                </p>
            </div>
        </div>
    </div>

    {{-- Warning --}}
    <div class="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
        <div class="flex items-start gap-3">
            <span class="flex-shrink-0 text-warning-500 font-bold">[!]</span>
            <div class="text-sm text-warning-700 dark:text-warning-300">
                <p class="font-medium">Ready to Import</p>
                <p class="mt-1">
                    Click "Start Import" to begin. The import will run in the background.
                    You'll receive a notification when it's complete.
                </p>
            </div>
        </div>
    </div>
</div>
