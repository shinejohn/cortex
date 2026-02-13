<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AlphasiteCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class SeedAlphasiteCategories extends Command
{
    protected $signature = 'community:seed-categories';

    protected $description = 'Seed standard business categories into the alphasite_categories table';

    public function handle(): int
    {
        $categories = $this->getCategories();

        $this->info("Seeding {$categories->count()} business categories...");
        $this->newLine();

        $bar = $this->output->createProgressBar($categories->count());
        $bar->start();

        $created = 0;
        $existing = 0;

        foreach ($categories as $index => $category) {
            $record = AlphasiteCategory::firstOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'singular_name' => $category['singular_name'],
                    'slug' => $category['slug'],
                    'icon' => $category['icon'],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]
            );

            if ($record->wasRecentlyCreated) {
                $created++;
            } else {
                $existing++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Result', 'Count'],
            [
                ['Categories Created', $created],
                ['Already Existed', $existing],
                ['Total', $categories->count()],
            ]
        );

        return Command::SUCCESS;
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{name: string, singular_name: string, slug: string, icon: string}>
     */
    private function getCategories(): \Illuminate\Support\Collection
    {
        $raw = [
            ['Plumbers', 'Plumber', "\xF0\x9F\x94\xA7"],
            ['Electricians', 'Electrician', "\xE2\x9A\xA1"],
            ['Restaurants', 'Restaurant', "\xF0\x9F\x8D\xBD\xEF\xB8\x8F"],
            ['Attorneys', 'Attorney', "\xE2\x9A\x96\xEF\xB8\x8F"],
            ['Dentists', 'Dentist', "\xF0\x9F\xA6\xB7"],
            ['Auto Repair', 'Auto Repair Shop', "\xF0\x9F\x94\xA9"],
            ['Real Estate Agents', 'Real Estate Agent', "\xF0\x9F\x8F\xA0"],
            ['Hair Salons', 'Hair Salon', "\xE2\x9C\x82\xEF\xB8\x8F"],
            ['HVAC', 'HVAC Technician', "\xE2\x9D\x84\xEF\xB8\x8F"],
            ['Landscapers', 'Landscaper', "\xF0\x9F\x8C\xBF"],
            ['Roofers', 'Roofer', "\xF0\x9F\x8F\x97\xEF\xB8\x8F"],
            ['Pest Control', 'Pest Control Service', "\xF0\x9F\x90\x9C"],
            ['Accountants', 'Accountant', "\xF0\x9F\x93\x8A"],
            ['Insurance Agents', 'Insurance Agent', "\xF0\x9F\x9B\xA1\xEF\xB8\x8F"],
            ['Veterinarians', 'Veterinarian', "\xF0\x9F\x90\xBE"],
            ['Chiropractors', 'Chiropractor', "\xF0\x9F\xA6\xB4"],
            ['Photographers', 'Photographer', "\xF0\x9F\x93\xB8"],
            ['Gyms & Fitness', 'Gym', "\xF0\x9F\x92\xAA"],
            ['Cleaning Services', 'Cleaning Service', "\xF0\x9F\xA7\xB9"],
            ['Moving Companies', 'Moving Company', "\xF0\x9F\x9A\x9A"],
            ['Florists', 'Florist', "\xF0\x9F\x92\x90"],
            ['Pet Grooming', 'Pet Groomer', "\xF0\x9F\x90\xA9"],
            ['Tutoring', 'Tutor', "\xF0\x9F\x93\x9A"],
            ['Wedding Venues', 'Wedding Venue', "\xF0\x9F\x92\x92"],
            ['Coffee Shops', 'Coffee Shop', "\xE2\x98\x95"],
            ['Bakeries', 'Bakery', "\xF0\x9F\xA5\x90"],
            ['Bars & Nightlife', 'Bar', "\xF0\x9F\x8D\xB8"],
            ['Day Care', 'Day Care Center', "\xF0\x9F\x91\xB6"],
            ['Tax Services', 'Tax Service', "\xF0\x9F\x92\xB0"],
            ['Towing Services', 'Towing Service', "\xF0\x9F\x9A\x97"],
            ['Locksmiths', 'Locksmith', "\xF0\x9F\x94\x91"],
            ['Painting', 'Painter', "\xF0\x9F\x8E\xA8"],
            ['Yoga Studios', 'Yoga Studio', "\xF0\x9F\xA7\x98"],
            ['Martial Arts', 'Martial Arts Studio', "\xF0\x9F\xA5\x8B"],
            ['Medical Clinics', 'Medical Clinic', "\xF0\x9F\x8F\xA5"],
            ['Pharmacies', 'Pharmacy', "\xF0\x9F\x92\x8A"],
            ['Banks & Credit Unions', 'Bank', "\xF0\x9F\x8F\xA6"],
            ['Car Wash', 'Car Wash', "\xF0\x9F\x9A\xBF"],
            ['Dry Cleaners', 'Dry Cleaner', "\xF0\x9F\x91\x94"],
            ['Print Shops', 'Print Shop', "\xF0\x9F\x96\xA8\xEF\xB8\x8F"],
            ['Storage Facilities', 'Storage Facility', "\xF0\x9F\x93\xA6"],
            ['Travel Agencies', 'Travel Agency', "\xE2\x9C\x88\xEF\xB8\x8F"],
            ['IT Services', 'IT Service Provider', "\xF0\x9F\x92\xBB"],
            ['Web Design', 'Web Designer', "\xF0\x9F\x8C\x90"],
            ['Catering', 'Caterer', "\xF0\x9F\x8D\xB1"],
            ['Event Planners', 'Event Planner', "\xF0\x9F\x8E\x89"],
            ['Home Inspectors', 'Home Inspector', "\xF0\x9F\x94\x8D"],
            ['Appliance Repair', 'Appliance Repair Service', "\xF0\x9F\x94\xA7"],
            ['Funeral Homes', 'Funeral Home', "\xF0\x9F\x95\x8A\xEF\xB8\x8F"],
            ['Notary Services', 'Notary', "\xF0\x9F\x93\x9D"],
        ];

        return collect($raw)->map(fn (array $item) => [
            'name' => $item[0],
            'singular_name' => $item[1],
            'slug' => Str::slug($item[0]),
            'icon' => $item[2],
        ]);
    }
}
