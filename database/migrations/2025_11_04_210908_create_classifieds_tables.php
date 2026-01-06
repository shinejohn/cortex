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
        if (Schema::hasTable('classifieds')) {
            return;
        }
        
        Schema::create('classifieds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('workspace_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('category', [
                'for_sale',
                'housing',
                'jobs',
                'services',
                'community',
                'personals',
            ]);
            $table->string('subcategory')->nullable();
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2)->nullable();
            $table->string('price_type')->nullable(); // fixed, negotiable, contact_for_pricing
            $table->string('condition')->nullable(); // new, like_new, excellent, good, fair, poor
            $table->string('location');
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'pending_payment', 'active', 'expired', 'sold', 'removed'])->default('draft');
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index(['status', 'posted_at']);
            $table->index(['user_id', 'status']);
            $table->index('expires_at');
        });

        // Classified images table
        Schema::create('classified_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('classified_id')->constrained('classifieds')->cascadeOnDelete();
            $table->string('image_path');
            $table->string('image_disk')->default('public');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['classified_id', 'order']);
        });

        // Classified regions pivot table
        Schema::create('classified_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('classified_id')->constrained('classifieds')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('days')->default(7); // How many days to show in this region
            $table->timestamps();

            $table->unique(['classified_id', 'region_id']);
        });

        // Classified payments table
        Schema::create('classified_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('classified_id')->constrained('classifieds')->cascadeOnDelete();
            $table->foreignUuid('workspace_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_checkout_session_id')->nullable();
            $table->integer('amount'); // in cents
            $table->string('currency', 3)->default('usd');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->json('regions_data')->nullable(); // Store region and days info
            $table->unsignedInteger('total_days')->default(7);
            $table->timestamps();

            $table->index('classified_id');
            $table->index('workspace_id');
            $table->index('stripe_checkout_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classified_payments');
        Schema::dropIfExists('classified_region');
        Schema::dropIfExists('classified_images');
        Schema::dropIfExists('classifieds');
    }
};

