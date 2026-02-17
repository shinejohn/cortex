<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('performers', function (Blueprint $table) {
            $table->string('landing_page_slug')->nullable()->unique()->after('status');
            $table->boolean('landing_page_published')->default(false)->after('landing_page_slug');
            $table->boolean('tips_enabled')->default(false)->after('landing_page_published');
            $table->unsignedBigInteger('total_tips_received_cents')->default(0)->after('tips_enabled');
            $table->unsignedInteger('total_tip_count')->default(0)->after('total_tips_received_cents');
            $table->unsignedInteger('total_fans_captured')->default(0)->after('total_tip_count');
        });
    }

    public function down(): void
    {
        Schema::table('performers', function (Blueprint $table) {
            $table->dropColumn([
                'landing_page_slug',
                'landing_page_published',
                'tips_enabled',
                'total_tips_received_cents',
                'total_tip_count',
                'total_fans_captured',
            ]);
        });
    }
};
