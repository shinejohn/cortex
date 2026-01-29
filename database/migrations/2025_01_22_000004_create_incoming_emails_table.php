<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('incoming_emails')) {
            Schema::create('incoming_emails', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('mailbox');
                $table->string('message_id')->nullable();
                $table->string('from_address');
                $table->string('from_name')->nullable();
                $table->string('to_address')->nullable();
                $table->text('subject')->nullable();
                $table->timestamp('email_date')->nullable();
                $table->timestamp('received_at')->useCurrent();
                $table->longText('body_text')->nullable();
                $table->longText('body_html')->nullable();
                $table->jsonb('headers')->nullable();
                $table->jsonb('attachments')->nullable();
                $table->string('email_type', 30)->nullable();
                $table->uuid('source_id')->nullable();
$1// FK DISABLED: $2
                $table->uuid('collection_method_id')->nullable();
                $table->string('processing_status', 20)->default('pending');
                $table->timestamp('processed_at')->nullable();
                $table->text('processing_error')->nullable();
                $table->boolean('is_confirmation')->default(false);
                $table->boolean('confirmation_clicked')->default(false);
                $table->text('confirmation_url')->nullable();
                $table->integer('items_extracted')->default(0);
                $table->jsonb('raw_content_ids')->nullable();
                $table->boolean('is_spam')->default(false);
                $table->timestamps();
                $table->index('from_address');
                $table->index('processing_status');
                $table->index('is_confirmation');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('incoming_emails');
    }
};
