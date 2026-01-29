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
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('smb_business_id')->nullable();
            
            // Customer Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            
            // CRM Fields
            $table->enum('lifecycle_stage', ['lead', 'mql', 'sql', 'customer'])->default('lead');
            $table->integer('lead_score')->default(0);
            $table->enum('lead_source', ['organic', 'paid', 'referral', 'direct'])->nullable();
            $table->boolean('email_opted_in')->default(false);
            $table->boolean('sms_opted_in')->default(false);
            $table->decimal('lifetime_value', 10, 2)->default(0);
            $table->json('tags')->nullable();
            $table->json('custom_fields')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
// FK DISABLED
// FK DISABLED
            $table->index('tenant_id');
            $table->index('smb_business_id');
            $table->index('lifecycle_stage');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
