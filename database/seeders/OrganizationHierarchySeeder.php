<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\OrganizationHierarchy;
use Illuminate\Database\Seeder;

final class OrganizationHierarchySeeder extends Seeder
{
    /**
     * Seed organization hierarchies.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->count() < 2) {
            $this->command->warn('⚠ Need at least 2 businesses. Run BusinessSeeder first.');
            return;
        }

        // Create hierarchies for 10% of businesses
        $businessesToHierarchize = $businesses->random(ceil($businesses->count() * 0.1));

        foreach ($businessesToHierarchize as $business) {
            $childBusiness = $businesses->where('id', '!=', $business->id)->random();

            OrganizationHierarchy::firstOrCreate(
                [
                    'parent_id' => $business->id,
                    'child_id' => $childBusiness->id,
                ],
                OrganizationHierarchy::factory()->make([
                    'parent_id' => $business->id,
                    'child_id' => $childBusiness->id,
                ])->toArray()
            );
        }

        $totalHierarchies = OrganizationHierarchy::count();
        $this->command->info("✓ Total organization hierarchies: {$totalHierarchies}");
    }
}


