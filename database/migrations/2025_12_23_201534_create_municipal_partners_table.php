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
        Schema::create('municipal_partners', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->enum('type', ['municipality', 'law_enforcement', 'school_district', 'utility', 'other']);
            $table->json('community_ids'); // communities they can broadcast to
            $table->unsignedBigInteger('primary_contact_id')->nullable();
            $table->string('api_key_hash')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('allowed_categories')->nullable();
            $table->json('allowed_priorities')->nullable();
            $table->boolean('requires_approval')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'is_verified']);
        });

        // Add foreign key to emergency_alerts
        Schema::table('emergency_alerts', function (Blueprint $table) {
// FK DISABLED
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergency_alerts', function (Blueprint $table) {
            $table->dropForeign(['municipal_partner_id']);
        });

        Schema::dropIfExists('municipal_partners');
    }
};
