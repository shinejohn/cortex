<div class="space-y-6">
    @php
        $summary = $this->importSummary ?? [];
        $options = [
            'preserve_uuids' => $this->data['preserve_uuids'] ?? true,
            'skip_duplicates' => $this->data['skip_duplicates'] ?? true,
        ];
    @endphp

    {{-- Import Summary --}}
    <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            What will be imported
        </h3>

        <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
                <div class="text-3xl font-bold text-success-600 dark:text-success-400">
                    {{ number_format($summary['total_regions'] ?? 0) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Regions</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {{ number_format($summary['total_businesses'] ?? 0) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Businesses</div>
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
                @if($options['preserve_uuids'] ?? false)
                    <span class="flex-shrink-0 text-success-500 font-bold">[+]</span>
                    <span class="text-gray-700 dark:text-gray-300">Original UUIDs will be preserved</span>
                @else
                    <span class="flex-shrink-0 text-gray-400 font-bold">[-]</span>
                    <span class="text-gray-500 dark:text-gray-400">New UUIDs will be generated</span>
                @endif
            </li>

            <li class="flex items-center gap-2">
                @if($options['skip_duplicates'] ?? false)
                    <span class="flex-shrink-0 text-success-500 font-bold">[+]</span>
                    <span class="text-gray-700 dark:text-gray-300">Duplicates will be skipped (matched by google_place_id)</span>
                @else
                    <span class="flex-shrink-0 text-warning-500 font-bold">[!]</span>
                    <span class="text-gray-700 dark:text-gray-300">All businesses will be imported (may create duplicates)</span>
                @endif
            </li>
        </ul>
    </div>

    {{-- Info --}}
    <div class="rounded-lg border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20">
        <div class="flex items-start gap-3">
            <span class="flex-shrink-0 text-info-500 font-bold">[i]</span>
            <div class="text-sm text-info-700 dark:text-info-300">
                <p class="font-medium">Import Process</p>
                <p class="mt-1">
                    Regions are matched by <strong>slug</strong>. Existing regions will be reused, new ones will be created.
                    Parent regions are processed first to maintain hierarchy.
                </p>
                <p class="mt-1">
                    Imported businesses will have <strong>workspace_id</strong> set to null.
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
                    Click "Start Import" to begin. The import runs within a database transaction
                    and will be rolled back if any errors occur.
                </p>
            </div>
        </div>
    </div>
</div>
