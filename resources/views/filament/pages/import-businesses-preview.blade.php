<div class="space-y-4">
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ number_format($this->importSummary['total_businesses'] ?? 0) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Businesses</div>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-success-600 dark:text-success-400">
                {{ number_format($this->importSummary['total_regions'] ?? 0) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Regions</div>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-info-600 dark:text-info-400">
                {{ isset($this->parsedData['exported_at']) ? \Carbon\Carbon::parse($this->parsedData['exported_at'])->format('M j, Y') : '-' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Export Date</div>
        </div>
    </div>

    @php
        $sampleNames = $this->importSummary['sample_names'] ?? [];
    @endphp

    @if(count($sampleNames) > 0)
        <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            #
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Business Name
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    @foreach($sampleNames as $index => $name)
                        <tr>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                {{ $index + 1 }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {{ $name }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        @if(($this->importSummary['total_businesses'] ?? 0) > 10)
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Showing first 10 of {{ number_format($this->importSummary['total_businesses']) }} businesses.
            </p>
        @endif
    @endif
</div>
