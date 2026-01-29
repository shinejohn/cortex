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
        Schema::create('business_photos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('smb_business_id');
            
            $table->string('photo_reference'); // Google Places photo reference
            $table->integer('width');
            $table->integer('height');
            $table->json('html_attributions')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
            
$1// FK DISABLED: $2
            $table->index('smb_business_id');
            $table->index(['smb_business_id', 'is_primary']);
            $table->index(['smb_business_id', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_photos');
    }
};
