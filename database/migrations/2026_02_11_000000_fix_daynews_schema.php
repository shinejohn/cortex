<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ensure classified_categories table exists with correct schema (UUID id)
        Schema::dropIfExists('classified_categories');

        Schema::create('classified_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Fix Coupons Table: Add is_verified if missing
        Schema::table('coupons', function (Blueprint $table) {
            if (! Schema::hasColumn('coupons', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('status');
            }
        });

        // 3. Fix Classifieds Table: Add classified_category_id if missing
        Schema::table('classifieds', function (Blueprint $table) {
            if (! Schema::hasColumn('classifieds', 'classified_category_id')) {
                $table->uuid('classified_category_id')->nullable()->after('user_id');
            }
        });

        // 4. Seed Categories and Migrate Data
        $categories = [
            'For Sale' => 'for_sale',
            'Housing' => 'housing',
            'Jobs' => 'jobs',
            'Services' => 'services',
            'Community' => 'community',
            'Personals' => 'personals',
        ];

        foreach ($categories as $name => $slug) {
            // Check if category exists
            $exists = DB::table('classified_categories')->where('slug', $slug)->first();

            if (! $exists) {
                $catId = Str::uuid()->toString();
                DB::table('classified_categories')->insert([
                    'id' => $catId,
                    'name' => $name,
                    'slug' => $slug,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $catId = $exists->id;
            }

            // Update existing classifieds that use the old string category column
            if (Schema::hasColumn('classifieds', 'category')) {
                DB::table('classifieds')
                    ->where('category', $slug)
                    ->update(['classified_category_id' => $catId]);
            }
        }

        // 5. Drop conflicting column 'category' from classifieds
        Schema::table('classifieds', function (Blueprint $table) {
            if (Schema::hasColumn('classifieds', 'category')) {
                // Drop index first to avoid SQLite error
                try {
                    $table->dropIndex(['category', 'status']);
                } catch (Exception $e) {
                    // Index might not exist or verify logic needed, but proceeding
                }

                $table->dropColumn('category');
            }
        });
    }

    public function down(): void
    {
        // Restore 'category' column if missing
        Schema::table('classifieds', function (Blueprint $table) {
            if (! Schema::hasColumn('classifieds', 'category')) {
                $table->enum('category', [
                    'for_sale',
                    'housing',
                    'jobs',
                    'services',
                    'community',
                    'personals',
                ])->nullable();
            }
        });

        // Drop relation column
        Schema::table('classifieds', function (Blueprint $table) {
            if (Schema::hasColumn('classifieds', 'classified_category_id')) {
                $table->dropColumn('classified_category_id');
            }
        });

        // Remove is_verified from coupons
        Schema::table('coupons', function (Blueprint $table) {
            if (Schema::hasColumn('coupons', 'is_verified')) {
                $table->dropColumn('is_verified');
            }
        });

        // We do not drop classified_categories table here to avoid data loss if it existed before
    }
};
