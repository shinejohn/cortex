<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('sales_opportunities')) {
            Schema::create('sales_opportunities', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('region_id');
                $table->uuid('business_id')->nullable();

                // Source content that triggered this opportunity
                $table->string('source_type'); // news_article, event, day_news_post
                $table->uuid('source_id');

                // Classification
                $table->string('opportunity_type'); // award_recognition, new_business, community_event, government_impact, crisis_issue
                $table->integer('priority_score')->default(5); // 1-10
                $table->string('status')->default('new'); // new, contacted, qualified, proposal_sent, won, lost, archived

                // Business info (denormalized for quick access)
                $table->string('business_name')->nullable();
                $table->string('business_contact_email')->nullable();
                $table->string('business_contact_phone')->nullable();

                // Opportunity details
                $table->text('trigger_description');
                $table->text('recommended_action')->nullable();
                $table->text('suggested_script')->nullable();
                $table->json('suggested_products')->nullable(); // advertising packages to offer

                // Assignment
                $table->uuid('assigned_to')->nullable(); // user_id or AI agent
                $table->timestamp('assigned_at')->nullable();

                // Tracking
                $table->timestamp('first_contact_at')->nullable();
                $table->timestamp('last_contact_at')->nullable();
                $table->integer('contact_attempts')->default(0);
                $table->text('notes')->nullable();

                // Outcome
                $table->decimal('deal_value', 10, 2)->nullable();
                $table->uuid('resulting_order_id')->nullable();

                $table->timestamps();
                $table->softDeletes();

// FK DISABLED
// FK DISABLED

                $table->index(['region_id', 'status']);
                $table->index(['business_id', 'status']);
                $table->index(['opportunity_type', 'status']);
                $table->index('priority_score');
                $table->index('created_at');
            });
        }

        // Opportunity activity log
        if (!Schema::hasTable('sales_opportunity_activities')) {
            Schema::create('sales_opportunity_activities', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('opportunity_id');
                $table->uuid('user_id')->nullable();
                $table->string('activity_type'); // status_change, note_added, contact_attempted, email_sent, etc.
                $table->string('old_value')->nullable();
                $table->string('new_value')->nullable();
                $table->text('description')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

// FK DISABLED
                $table->index(['opportunity_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_opportunity_activities');
        Schema::dropIfExists('sales_opportunities');
    }
};
