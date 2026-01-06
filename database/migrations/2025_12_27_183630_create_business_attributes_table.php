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
        Schema::create('business_attributes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('smb_business_id');
            
            $table->string('attribute_key');
            $table->text('attribute_value')->nullable();
            $table->enum('attribute_type', ['boolean', 'string', 'array'])->default('string');
            
            $table->timestamps();
            
            $table->foreign('smb_business_id')->references('id')->on('smb_businesses')->cascadeOnDelete();
            $table->unique(['smb_business_id', 'attribute_key']);
            $table->index('smb_business_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_attributes');
    }
};
