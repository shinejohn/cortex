<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add state/state_code to communities (needed for rollout)
        if (! Schema::hasColumn('communities', 'state')) {
            Schema::table('communities', function (Blueprint $table) {
                $table->string('state', 2)->nullable()->after('name');
                $table->string('state_code', 2)->nullable()->after('state');
            });
        }

        // Step 2: Add community_id to regions (regions belong to communities)
        if (! Schema::hasColumn('regions', 'community_id')) {
            Schema::table('regions', function (Blueprint $table) {
                $table->uuid('community_id')->nullable()->after('id');
                $table->index('community_id');
            });
        }

        // Step 3: Add community_id to businesses
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'community_id')) {
                $table->uuid('community_id')->nullable()->after('id');
                $table->index('community_id');
            }
        });

        // Step 4: Create communities from regions and link (for regions that don't have community)
        $stateCodeMap = [
            'Alabama' => 'AL', 'Alaska' => 'AK', 'Arizona' => 'AZ', 'Arkansas' => 'AR',
            'California' => 'CA', 'Colorado' => 'CO', 'Connecticut' => 'CT', 'Delaware' => 'DE',
            'Florida' => 'FL', 'Georgia' => 'GA', 'Hawaii' => 'HI', 'Idaho' => 'ID',
            'Illinois' => 'IL', 'Indiana' => 'IN', 'Iowa' => 'IA', 'Kansas' => 'KS',
            'Kentucky' => 'KY', 'Louisiana' => 'LA', 'Maine' => 'ME', 'Maryland' => 'MD',
            'Massachusetts' => 'MA', 'Michigan' => 'MI', 'Minnesota' => 'MN', 'Mississippi' => 'MS',
            'Missouri' => 'MO', 'Montana' => 'MT', 'Nebraska' => 'NE', 'Nevada' => 'NV',
            'New Hampshire' => 'NH', 'New Jersey' => 'NJ', 'New Mexico' => 'NM', 'New York' => 'NY',
            'North Carolina' => 'NC', 'North Dakota' => 'ND', 'Ohio' => 'OH', 'Oklahoma' => 'OK',
            'Oregon' => 'OR', 'Pennsylvania' => 'PA', 'Rhode Island' => 'RI', 'South Carolina' => 'SC',
            'South Dakota' => 'SD', 'Tennessee' => 'TN', 'Texas' => 'TX', 'Utah' => 'UT',
            'Vermont' => 'VT', 'Virginia' => 'VA', 'Washington' => 'WA', 'West Virginia' => 'WV',
            'Wisconsin' => 'WI', 'Wyoming' => 'WY', 'District of Columbia' => 'DC',
        ];

        $regions = DB::table('regions')->whereNull('community_id')->get();
        foreach ($regions as $region) {
            $stateCode = null;
            if ($region->type === 'state' && isset($stateCodeMap[$region->name])) {
                $stateCode = $stateCodeMap[$region->name];
            } elseif ($region->parent_id) {
                $parent = DB::table('regions')->where('id', $region->parent_id)->first();
                while ($parent && $parent->type !== 'state') {
                    $parent = DB::table('regions')->where('id', $parent->parent_id)->first();
                }
                if ($parent && isset($stateCodeMap[$parent->name])) {
                    $stateCode = $stateCodeMap[$parent->name];
                }
            }

            $community = DB::table('communities')->where('slug', $region->slug)->first();
            if (! $community) {
                $communityId = (string) Illuminate\Support\Str::uuid();
                $slug = $region->slug;
                $uniqueSlug = $slug;
                $counter = 0;
                while (DB::table('communities')->where('slug', $uniqueSlug)->exists()) {
                    $counter++;
                    $uniqueSlug = $slug.'-'.$counter;
                }
                $defaultWorkspace = DB::table('workspaces')->value('id');
                $defaultUser = DB::table('users')->value('id');
                if (! $defaultWorkspace || ! $defaultUser) {
                    continue; // Skip if no workspace/user - cannot create community
                }
                DB::table('communities')->insert([
                    'id' => $communityId,
                    'name' => $region->name,
                    'slug' => $uniqueSlug,
                    'description' => 'Geographic community for '.$region->name,
                    'state' => $stateCode,
                    'state_code' => $stateCode,
                    'is_active' => true,
                    'workspace_id' => $defaultWorkspace,
                    'created_by' => $defaultUser,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('regions')->where('id', $region->id)->update(['community_id' => $communityId]);
            } else {
                if ($stateCode && ! $community->state_code) {
                    DB::table('communities')->where('id', $community->id)->update([
                        'state' => $stateCode,
                        'state_code' => $stateCode,
                        'updated_at' => now(),
                    ]);
                }
                DB::table('regions')->where('id', $region->id)->update(['community_id' => $community->id]);
            }
        }

        // Step 5: Backfill businesses from business_region -> region -> community
        $businessIds = DB::table('businesses')
            ->whereNull('community_id')
            ->pluck('id');

        foreach ($businessIds as $businessId) {
            $communityId = DB::table('business_region')
                ->join('regions', 'regions.id', '=', 'business_region.region_id')
                ->where('business_region.business_id', $businessId)
                ->whereNotNull('regions.community_id')
                ->value('regions.community_id');

            if ($communityId) {
                DB::table('businesses')->where('id', $businessId)->update(['community_id' => $communityId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (Schema::hasColumn('businesses', 'community_id')) {
                $table->dropIndex(['community_id']);
                $table->dropColumn('community_id');
            }
        });

        if (Schema::hasColumn('regions', 'community_id')) {
            Schema::table('regions', function (Blueprint $table) {
                $table->dropIndex(['community_id']);
                $table->dropColumn('community_id');
            });
        }

        if (Schema::hasColumn('communities', 'state')) {
            Schema::table('communities', function (Blueprint $table) {
                $table->dropColumn(['state', 'state_code']);
            });
        }
    }
};
