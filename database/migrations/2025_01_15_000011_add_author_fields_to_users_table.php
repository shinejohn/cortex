<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Check if columns already exist
            if (Schema::hasColumn('users', 'bio')) {
                return;
            }
            $table->text('bio')->nullable()->after('email');
            $table->string('author_slug')->nullable()->unique()->after('bio');
            $table->decimal('trust_score', 5, 2)->default(0.00)->after('author_slug');
            $table->enum('trust_tier', ['bronze', 'silver', 'gold', 'platinum'])->nullable()->after('trust_score');
            $table->boolean('is_verified_author')->default(false)->after('trust_tier');
            $table->json('author_metadata')->nullable()->after('is_verified_author');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'author_slug',
                'trust_score',
                'trust_tier',
                'is_verified_author',
                'author_metadata',
            ]);
        });
    }
};

