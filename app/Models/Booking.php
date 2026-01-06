<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

final class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'booking_number',
        'status',
        'booking_type',
        'event_id',
        'venue_id',
        'performer_id',
        'user_id',
        'contact_name',
        'contact_email',
        'contact_phone',
        'contact_company',
        'event_date',
        'start_time',
        'end_time',
        'event_type',
        'expected_guests',
        'expected_audience',
        'ticket_quantity',
        'ticket_type',
        'price_per_ticket',
        'payment_status',
        'total_amount',
        'currency',
        'paid_amount',
        'payment_method',
        'transaction_id',
        'payment_date',
        'refund_amount',
        'refund_date',
        'notes',
        'special_requests',
        'setup_requirements',
        'catering_requirements',
        'performance_requirements',
        'sound_requirements',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
        'workspace_id',
        'created_by',
        'metadata',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(Performer::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Computed attributes for frontend compatibility
    public function getContactInfoAttribute(): array
    {
        return [
            'name' => $this->contact_name,
            'email' => $this->contact_email,
            'phone' => $this->contact_phone,
            'company' => $this->contact_company,
        ];
    }

    public function getPaymentAttribute(): array
    {
        return [
            'status' => $this->payment_status,
            'totalAmount' => $this->total_amount,
            'currency' => $this->currency,
            'paidAmount' => $this->paid_amount,
            'paymentMethod' => $this->payment_method,
            'transactionId' => $this->transaction_id,
            'paymentDate' => $this->payment_date?->toISOString(),
            'refundAmount' => $this->refund_amount,
            'refundDate' => $this->refund_date?->toISOString(),
        ];
    }

    // Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('booking_type', $type);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('event_date', $date);
    }

    public function scopeForDateRange($query, string $from, string $to)
    {
        return $query->whereBetween('event_date', [$from, $to]);
    }

    public function scopeEventBookings($query)
    {
        return $query->where('booking_type', 'event');
    }

    public function scopeVenueBookings($query)
    {
        return $query->where('booking_type', 'venue');
    }

    public function scopePerformerBookings($query)
    {
        return $query->where('booking_type', 'performer');
    }

    // Helper methods
    public function isEventBooking(): bool
    {
        return $this->booking_type === 'event';
    }

    public function isVenueBooking(): bool
    {
        return $this->booking_type === 'venue';
    }

    public function isPerformerBooking(): bool
    {
        return $this->booking_type === 'performer';
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isPartiallyPaid(): bool
    {
        return $this->payment_status === 'partially_paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function markAsConfirmed(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function markAsCancelled(?string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    protected static function boot(): void
    {
        parent::boot();

        self::creating(function ($booking) {
            if (empty($booking->booking_number)) {
                $booking->booking_number = 'BK-'.mb_strtoupper(Str::random(8));
            }
        });
    }

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'price_per_ticket' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'payment_date' => 'datetime',
            'refund_date' => 'datetime',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'special_requests' => 'array',
            'setup_requirements' => 'array',
            'catering_requirements' => 'array',
            'performance_requirements' => 'array',
            'sound_requirements' => 'array',
        ];
    }
}
