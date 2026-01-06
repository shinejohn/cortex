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
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'author_slug')) {
                $table->string('author_slug')->nullable()->unique()->after('bio');
            }
            if (!Schema::hasColumn('users', 'trust_score')) {
                $table->decimal('trust_score', 5, 2)->default(0.00)->after('author_slug');
            }
            if (!Schema::hasColumn('users', 'trust_tier')) {
                $table->enum('trust_tier', ['bronze', 'silver', 'gold', 'platinum'])->nullable()->after('trust_score');
            }
            if (!Schema::hasColumn('users', 'is_verified_author')) {
                $table->boolean('is_verified_author')->default(false)->after('trust_tier');
            }
            if (!Schema::hasColumn('users', 'author_metadata')) {
                $table->json('author_metadata')->nullable()->after('is_verified_author');
            }
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

