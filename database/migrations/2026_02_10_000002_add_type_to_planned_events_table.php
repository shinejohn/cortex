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
        Schema::table('planned_events', function (Blueprint $table) {
            $table->string('type')->default('planned')->after('user_id');

            $table->index('type');
        });

        // Drop the old unique constraint and create a new one that includes type
        Schema::table('planned_events', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'user_id']);
            $table->unique(['event_id', 'user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('planned_events', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'user_id', 'type']);
            $table->unique(['event_id', 'user_id']);
            $table->dropIndex(['type']);
            $table->dropColumn('type');
        });
    }
};
