<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Business;
use App\Models\City;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class SeedCitiesFromBusinesses extends Command
{
    protected $signature = 'community:seed-cities
                            {--link : Also link businesses to their city records by setting city_id}';

    protected $description = 'Create City records from distinct city+state combinations in the businesses table';

    public function handle(): int
    {
        $shouldLink = (bool) $this->option('link');

        $this->info('Scanning businesses for distinct city+state combinations...');

        $cityCombinations = Business::query()
            ->whereNotNull('city')
            ->whereNotNull('state')
            ->where('city', '!=', '')
            ->where('state', '!=', '')
            ->selectRaw('DISTINCT city, state')
            ->get();

        if ($cityCombinations->isEmpty()) {
            $this->info('No city+state combinations found in businesses.');

            return Command::SUCCESS;
        }

        $this->info("Found {$cityCombinations->count()} distinct city+state combinations.");
        $this->newLine();

        $bar = $this->output->createProgressBar($cityCombinations->count());
        $bar->start();

        $created = 0;
        $existing = 0;
        $linked = 0;

        foreach ($cityCombinations as $combo) {
            $slug = Str::slug("{$combo->city}-{$combo->state}");

            $city = City::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $combo->city,
                    'state' => mb_strtoupper($combo->state),
                    'slug' => $slug,
                    'is_active' => true,
                ]
            );

            if ($city->wasRecentlyCreated) {
                $created++;
            } else {
                $existing++;
            }

            if ($shouldLink) {
                $updated = Business::where('city', $combo->city)
                    ->where('state', $combo->state)
                    ->whereNull('city_id')
                    ->update(['city_id' => $city->id]);

                $linked += $updated;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $rows = [
            ['Cities Created', $created],
            ['Cities Already Existed', $existing],
        ];

        if ($shouldLink) {
            $rows[] = ['Businesses Linked', $linked];
        }

        $this->table(['Result', 'Count'], $rows);

        return Command::SUCCESS;
    }
}
