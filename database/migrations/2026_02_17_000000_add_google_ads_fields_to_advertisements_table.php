<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->string('type')->default('local')->after('id'); // local, google, network
            $table->text('external_code')->nullable()->after('type'); // For script tags
            $table->json('config')->nullable()->after('external_code'); // Extra settings
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn(['type', 'external_code', 'config']);
        });
    }
};
