<x-filament::page>
    {{ $this->form }}

    {{-- Export Preview --}}
    @if($this->previewCount > 0 || !empty($this->previewBusinesses))
        <div class="mt-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Export Preview</h3>

            <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {{ number_format($this->previewCount) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Businesses matching filters</div>
            </div>

            @if(count($this->previewBusinesses) > 0)
                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">City</th>
                                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">State</th>
                                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                            @foreach($this->previewBusinesses as $business)
                                <tr>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ $business['name'] }}</td>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ $business['city'] ?? '-' }}</td>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ $business['state'] ?? '-' }}</td>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm">
                                        <span @class([
                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                            'bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-100' => ($business['status'] ?? '') === 'active',
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' => ($business['status'] ?? '') !== 'active',
                                        ])>
                                            {{ ucfirst($business['status'] ?? 'unknown') }}
                                        </span>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                @if($this->previewCount > 5)
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Showing first 5 of {{ number_format($this->previewCount) }} businesses.
                    </p>
                @endif
            @endif
        </div>
    @endif

    {{-- Import Preview --}}
    @if($this->importSummary['total_businesses'] > 0)
        <div class="mt-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Import Preview</h3>

            <div class="grid grid-cols-2 gap-4">
                <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {{ number_format($this->importSummary['total_businesses']) }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Businesses</div>
                </div>
                <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <div class="text-2xl font-bold text-success-600 dark:text-success-400">
                        {{ number_format($this->importSummary['total_regions']) }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Regions</div>
                </div>
            </div>

            @if(count($this->importSummary['sample_names'] ?? []) > 0)
                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Business Name</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                            @foreach($this->importSummary['sample_names'] as $index => $name)
                                <tr>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ $index + 1 }}</td>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ $name }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                @if($this->importSummary['total_businesses'] > 10)
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Showing first 10 of {{ number_format($this->importSummary['total_businesses']) }} businesses.
                    </p>
                @endif
            @endif
        </div>
    @endif
</x-filament::page>
