<?php

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
        Schema::create('business_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('smb_business_id');
            
            $table->string('author_name');
            $table->string('author_url')->nullable();
            $table->string('language', 10)->default('en');
            $table->string('profile_photo_url')->nullable();
            $table->integer('rating'); // 1-5
            $table->string('relative_time_description')->nullable();
            $table->text('text');
            $table->bigInteger('time'); // Unix timestamp
            
            $table->timestamps();
            
// FK DISABLED
            $table->index('smb_business_id');
            $table->index('rating');
            $table->index('time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_reviews');
    }
};
