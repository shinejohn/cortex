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
        Schema::table('social_groups', function (Blueprint $table) {
            $table->foreignUuid('event_id')->nullable()->after('settings')->constrained('events')->nullOnDelete();
            $table->index('event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('social_groups', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropIndex(['event_id']);
            $table->dropColumn('event_id');
        });
    }
};
