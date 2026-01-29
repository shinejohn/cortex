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
        Schema::create('alphasite_fourcalls_integrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            $table->string('organization_id')->comment('4calls.ai organization ID');
            $table->string('coordinator_id')->nullable()->comment('Default coordinator ID');
            $table->text('api_key')->comment('Encrypted API key for 4calls.ai');
            $table->string('service_package', 50)->comment('ai_receptionist, ai_sales, ai_business_suite, ai_enterprise');
            $table->string('status', 50)->default('active')->comment('active, suspended, cancelled');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique('business_id');
            $table->index('organization_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alphasite_fourcalls_integrations');
    }
};
