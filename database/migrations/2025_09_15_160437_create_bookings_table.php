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
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('booking_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'refunded'])->default('pending');
            $table->enum('booking_type', ['event', 'venue', 'performer']);

            // Booking relationships (polymorphic-like but explicit) - workspace-centric
            $table->foreignUuid('event_id')->nullable()->constrained('events')->onDelete('cascade');
            $table->foreignUuid('venue_id')->nullable()->constrained('venues')->onDelete('cascade');
            $table->foreignUuid('performer_id')->nullable()->constrained('performers')->onDelete('cascade');
            $table->foreignUuid('workspace_id')->constrained('workspaces')->onDelete('cascade');
            $table->foreignUuid('created_by')->nullable()->constrained('users')->onDelete('set null');

            // Contact information
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone')->nullable();
            $table->string('contact_company')->nullable();

            // Event details (for venue and performer bookings)
            $table->date('event_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('event_type')->nullable();
            $table->integer('expected_guests')->nullable();
            $table->integer('expected_audience')->nullable(); // For performer bookings

            // Event booking specific fields
            $table->integer('ticket_quantity')->nullable();
            $table->string('ticket_type')->nullable();
            $table->decimal('price_per_ticket', 10, 2)->nullable();

            // Payment information
            $table->enum('payment_status', ['pending', 'paid', 'partially_paid', 'failed', 'refunded', 'cancelled'])->default('pending');
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->decimal('refund_amount', 10, 2)->default(0);
            $table->timestamp('refund_date')->nullable();

            // Additional information
            $table->text('notes')->nullable();
            $table->json('special_requests')->nullable();
            $table->json('setup_requirements')->nullable(); // For venue bookings
            $table->json('catering_requirements')->nullable(); // For venue bookings
            $table->json('performance_requirements')->nullable(); // For performer bookings
            $table->json('sound_requirements')->nullable(); // For performer bookings

            // Status timestamps
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['booking_type', 'status']);
            $table->index(['event_date', 'status']);
            $table->index('payment_status');
            $table->index('contact_email');
            $table->index(['venue_id', 'event_date']);
            $table->index(['performer_id', 'event_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
