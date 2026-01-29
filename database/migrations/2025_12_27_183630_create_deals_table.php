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
        Schema::create('deals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            $table->string('name');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('stage', ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])->default('prospecting');
            $table->integer('probability')->default(0); // 0-100
            $table->date('expected_close_date')->nullable();
            $table->date('actual_close_date')->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->json('custom_fields')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
// FK DISABLED
// FK DISABLED
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('stage');
            $table->index('expected_close_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
