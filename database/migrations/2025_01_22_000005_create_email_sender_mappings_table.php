<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('email_sender_mappings')) {
            Schema::create('email_sender_mappings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('source_id');
$1// FK DISABLED: $2
                $table->uuid('collection_method_id')->nullable();
                $table->string('sender_email')->nullable();
                $table->string('sender_domain')->nullable();
                $table->string('sender_name_pattern')->nullable();
                $table->integer('priority')->default(0);
                $table->string('expected_content_type', 50)->nullable();
                $table->boolean('is_newsletter')->default(false);
                $table->boolean('is_alert')->default(false);
                $table->boolean('is_active')->default(true);
                $table->integer('emails_matched')->default(0);
                $table->timestamps();
                $table->index('sender_email');
                $table->index('sender_domain');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('email_sender_mappings');
    }
};
