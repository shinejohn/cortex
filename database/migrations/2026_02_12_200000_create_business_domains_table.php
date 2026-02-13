<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_domains', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();

            // Domain info
            $table->string('domain_name');
            $table->string('domain_source'); // 'purchased' | 'external'
            $table->string('status')->default('pending_dns'); // pending_purchase, purchased, pending_dns, active, dns_error, expired, transferred_out

            // Cloudflare details (null for external domains)
            $table->string('cloudflare_registration_id')->nullable();
            $table->decimal('purchase_price', 8, 2)->nullable();
            $table->string('purchase_currency', 3)->default('USD');
            $table->date('registration_date')->nullable();
            $table->date('expiration_date')->nullable();
            $table->boolean('auto_renew')->default(true);

            // DNS verification
            $table->timestamp('dns_verified_at')->nullable();
            $table->timestamp('ssl_provisioned_at')->nullable();
            $table->timestamp('last_dns_check_at')->nullable();
            $table->string('dns_check_method'); // 'cname' | 'a_record' | 'cloudflare_managed'
            $table->json('dns_instructions')->nullable();

            // Tracking
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('domain_name');
            $table->index(['business_id', 'is_primary']);
            $table->index('status');
        });

        Schema::create('domain_dns_checks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_domain_id')->constrained('business_domains')->cascadeOnDelete();

            $table->boolean('passed');
            $table->json('results');
            $table->string('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['business_domain_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domain_dns_checks');
        Schema::dropIfExists('business_domains');
    }
};
