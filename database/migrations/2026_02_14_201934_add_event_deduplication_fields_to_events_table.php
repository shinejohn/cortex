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
        Schema::table('events', function (Blueprint $table) {
            $table->string('source_url', 2048)->nullable()->after('source_type');
            $table->string('external_id', 255)->nullable()->after('source_url');
            $table->string('content_hash', 64)->nullable()->after('external_id');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->index('external_id');
            $table->index('content_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['external_id']);
            $table->dropIndex(['content_hash']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['source_url', 'external_id', 'content_hash']);
        });
    }
};
