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
        Schema::table('performers', function (Blueprint $table) {
            $table->string('cover_image')->nullable()->after('profile_image');
            $table->json('social_links')->nullable()->after('bio');
            $table->string('website')->nullable()->after('social_links');
            $table->string('booking_contact_email')->nullable()->after('website');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('performers', function (Blueprint $table) {
            $table->dropColumn(['cover_image', 'social_links', 'website', 'booking_contact_email']);
        });
    }
};
