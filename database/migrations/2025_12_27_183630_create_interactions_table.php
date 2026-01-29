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
        Schema::create('interactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            $table->enum('type', ['email', 'phone', 'meeting', 'note', 'task', 'social'])->default('note');
            $table->string('subject');
            $table->text('description')->nullable();
            $table->enum('direction', ['inbound', 'outbound'])->default('inbound');
            $table->integer('duration_minutes')->nullable();
            $table->enum('outcome', ['positive', 'neutral', 'negative', 'no_response'])->nullable();
            $table->string('next_action')->nullable();
            $table->date('next_action_date')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
// FK DISABLED
// FK DISABLED
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
};
