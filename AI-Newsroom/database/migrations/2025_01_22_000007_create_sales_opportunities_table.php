<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_opportunities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('business_name');
            $table->foreignId('community_id')->nullable()->constrained()->nullOnDelete();
            $table->string('opportunity_type', 50);
            $table->string('quality', 20)->default('warm');
            $table->integer('priority_score')->default(50);
            $table->uuid('trigger_content_id')->nullable();
            $table->foreign('trigger_content_id')->references('id')->on('raw_content')->nullOnDelete();
            $table->text('trigger_description')->nullable();
            $table->text('article_headline')->nullable();
            $table->text('article_url')->nullable();
            $table->text('recommended_action')->nullable();
            $table->text('suggested_script')->nullable();
            $table->jsonb('talking_points')->nullable();
            $table->string('recommended_product', 50)->nullable();
            $table->string('status', 20)->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('first_contact_at')->nullable();
            $table->timestamp('next_followup_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->string('outcome', 30)->nullable();
            $table->decimal('deal_value', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->jsonb('activity_log')->nullable();
            $table->timestamps();
            $table->index(['status', 'quality']);
            $table->index(['assigned_to', 'status']);
            $table->index('next_followup_at');
        });
    }

    public function down(): void { Schema::dropIfExists('sales_opportunities'); }
};
