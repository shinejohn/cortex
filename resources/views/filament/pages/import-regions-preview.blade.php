<div class="space-y-4">
    {{-- Summary Stats - access Livewire properties directly --}}
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ number_format($this->importSummary['total_rows'] ?? 0) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-success-600 dark:text-success-400">
                {{ number_format($this->importSummary['unique_states'] ?? 0) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Unique States</div>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-info-600 dark:text-info-400">
                {{ number_format($this->importSummary['unique_counties'] ?? 0) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Unique Counties</div>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {{ number_format($this->importSummary['unique_cities'] ?? 0) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Unique Cities</div>
        </div>
    </div>

    {{-- Preview Table - access Livewire properties directly --}}
    @php
        $rows = array_slice($this->parsedRows, 0, 10);
    @endphp

    @if(count($rows) > 0)
        <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Community
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            City
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            County
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            State
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Population
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Type
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    @foreach($rows as $row)
                        <tr>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {{ $row['Community'] ?? '-' }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {{ $row['City'] ?? '-' }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {{ $row['County'] ?? '-' }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {{ $row['State'] ?? '-' }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {{ isset($row['Population']) ? number_format((int) $row['Population']) : '-' }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm">
                                @if(isset($row['Type']))
                                    <span @class([
                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                        'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100' => $row['Type'] === 'major',
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' => $row['Type'] === 'secondary',
                                    ])>
                                        {{ ucfirst($row['Type']) }}
                                    </span>
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        @if(($this->importSummary['total_rows'] ?? 0) > 10)
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Showing first 10 rows of {{ number_format($this->importSummary['total_rows']) }} total rows.
            </p>
        @endif
    @else
        <div class="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
            <p class="text-gray-500 dark:text-gray-400">No data to preview.</p>
        </div>
    @endif
</div>
