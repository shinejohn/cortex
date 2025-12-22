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
        Schema::create('legal_notices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('workspace_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', [
                'foreclosure',
                'probate',
                'name_change',
                'business_formation',
                'public_hearing',
                'zoning',
                'tax_sale',
                'other',
            ]);
            $table->string('case_number')->nullable();
            $table->string('title');
            $table->text('content');
            $table->string('court')->nullable();
            $table->date('publish_date');
            $table->date('expiry_date')->nullable();
            $table->enum('status', ['active', 'expires_soon', 'expired', 'removed'])->default('active');
            $table->json('metadata')->nullable(); // Store additional case-specific data
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['status', 'publish_date']);
            $table->index(['publish_date', 'expiry_date']);
            $table->index('case_number');
        });

        Schema::create('legal_notice_region', function (Blueprint $table) {
            $table->id();
            $table->uuid('legal_notice_id')->constrained('legal_notices')->cascadeOnDelete();
            $table->foreignUuid('region_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['legal_notice_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legal_notice_region');
        Schema::dropIfExists('legal_notices');
    }
};

