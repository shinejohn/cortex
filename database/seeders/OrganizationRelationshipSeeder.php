<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\OrganizationRelationship;
use Illuminate\Database\Seeder;

final class OrganizationRelationshipSeeder extends Seeder
{
    /**
     * Seed organization relationships.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->count() < 2) {
            $this->command->warn('⚠ Need at least 2 businesses. Run BusinessSeeder first.');

            return;
        }

        // Create relationships for 20% of businesses
        $businessesToRelate = $businesses->random((int) ceil($businesses->count() * 0.2));

        foreach ($businessesToRelate as $business) {
            $relatedBusiness = $businesses->where('id', '!=', $business->id)->random();

            OrganizationRelationship::firstOrCreate(
                [
                    'organization_id' => $business->id,
                    'relatable_id' => $relatedBusiness->id,
                    'relatable_type' => Business::class,
                ],
                OrganizationRelationship::factory()->make([
                    'organization_id' => $business->id,
                    'relatable_id' => $relatedBusiness->id,
                    'relatable_type' => Business::class,
                ])->toArray()
            );
        }

        $totalRelationships = OrganizationRelationship::count();
        $this->command->info("✓ Total organization relationships: {$totalRelationships}");
    }
}
