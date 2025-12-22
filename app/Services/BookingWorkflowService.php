<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Performer;
use App\Models\Venue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class BookingWorkflowService
{
    /**
     * Booking workflow steps
     */
    public const STEP_INITIAL_REQUEST = 'initial_request';
    public const STEP_QUOTE = 'quote';
    public const STEP_REVIEW = 'review';
    public const STEP_PAYMENT = 'payment';
    public const STEP_CONFIRMATION = 'confirmation';
    public const STEP_COMPLETED = 'completed';

    /**
     * Create a booking draft
     */
    public function createBookingDraft(array $data): Booking
    {
        return Booking::create([
            ...$data,
            'status' => 'draft',
        ]);
    }

    /**
     * Get available steps for a booking type
     */
    public function getStepsForBookingType(string $bookingType): array
    {
        return match ($bookingType) {
            'event' => [
                self::STEP_INITIAL_REQUEST,
                self::STEP_QUOTE,
                self::STEP_REVIEW,
                self::STEP_PAYMENT,
                self::STEP_CONFIRMATION,
                self::STEP_COMPLETED,
            ],
            'venue' => [
                self::STEP_INITIAL_REQUEST,
                self::STEP_QUOTE,
                self::STEP_REVIEW,
                self::STEP_PAYMENT,
                self::STEP_CONFIRMATION,
                self::STEP_COMPLETED,
            ],
            'performer' => [
                self::STEP_INITIAL_REQUEST,
                self::STEP_QUOTE,
                self::STEP_REVIEW,
                self::STEP_PAYMENT,
                self::STEP_CONFIRMATION,
                self::STEP_COMPLETED,
            ],
            default => [],
        };
    }

    /**
     * Get current step for a booking
     */
    public function getCurrentStep(Booking $booking): string
    {
        if ($booking->status === 'completed') {
            return self::STEP_COMPLETED;
        }

        if ($booking->status === 'confirmed' && $booking->payment_status === 'paid') {
            return self::STEP_CONFIRMATION;
        }

        if ($booking->payment_status === 'paid' || $booking->payment_status === 'partially_paid') {
            return self::STEP_PAYMENT;
        }

        if ($booking->status === 'confirmed') {
            return self::STEP_REVIEW;
        }

        if ($booking->total_amount > 0) {
            return self::STEP_QUOTE;
        }

        return self::STEP_INITIAL_REQUEST;
    }

    /**
     * Get progress percentage for a booking
     */
    public function getProgressPercentage(Booking $booking): int
    {
        $steps = $this->getStepsForBookingType($booking->booking_type);
        $currentStep = $this->getCurrentStep($booking);
        $currentIndex = array_search($currentStep, $steps, true);

        if ($currentIndex === false) {
            return 0;
        }

        return (int) (($currentIndex + 1) / count($steps) * 100);
    }

    /**
     * Calculate quote for a booking
     */
    public function calculateQuote(Booking $booking): array
    {
        $basePrice = 0;
        $fees = [];
        $total = 0;

        if ($booking->isEventBooking() && $booking->event) {
            $event = $booking->event;
            $basePrice = $event->price_min ?? 0;
            
            // Calculate based on ticket quantity
            if ($booking->ticket_quantity && $booking->price_per_ticket) {
                $basePrice = $booking->ticket_quantity * $booking->price_per_ticket;
            }
        } elseif ($booking->isVenueBooking() && $booking->venue) {
            $venue = $booking->venue;
            
            // Calculate based on venue pricing
            if ($booking->start_time && $booking->end_time) {
                $start = \Carbon\Carbon::parse($booking->start_time);
                $end = \Carbon\Carbon::parse($booking->end_time);
                $hours = $start->diffInHours($end);
                
                if ($venue->price_per_hour) {
                    $basePrice = $hours * $venue->price_per_hour;
                } elseif ($venue->price_per_event) {
                    $basePrice = $venue->price_per_event;
                } elseif ($venue->price_per_day) {
                    $basePrice = $venue->price_per_day;
                }
            }
        } elseif ($booking->isPerformerBooking() && $booking->performer) {
            $performer = $booking->performer;
            $basePrice = $performer->base_price ?? 0;
            
            // Calculate based on booking hours
            if ($booking->start_time && $booking->end_time) {
                $start = \Carbon\Carbon::parse($booking->start_time);
                $end = \Carbon\Carbon::parse($booking->end_time);
                $hours = max($performer->minimum_booking_hours ?? 1, $start->diffInHours($end));
                
                $basePrice = $hours * ($performer->base_price ?? 0);
            }
        }

        // Add service fees
        $serviceFee = $basePrice * 0.1; // 10% service fee
        $fees[] = [
            'name' => 'Service Fee',
            'amount' => $serviceFee,
            'type' => 'percentage',
            'value' => 10,
        ];

        // Add processing fees if applicable
        $processingFee = 2.50; // Fixed processing fee
        $fees[] = [
            'name' => 'Processing Fee',
            'amount' => $processingFee,
            'type' => 'fixed',
            'value' => $processingFee,
        ];

        $total = $basePrice + $serviceFee + $processingFee;

        return [
            'base_price' => round($basePrice, 2),
            'fees' => $fees,
            'subtotal' => round($basePrice, 2),
            'total_fees' => round($serviceFee + $processingFee, 2),
            'total' => round($total, 2),
            'currency' => $booking->currency ?? 'USD',
        ];
    }

    /**
     * Update booking with quote
     */
    public function updateQuote(Booking $booking): Booking
    {
        $quote = $this->calculateQuote($booking);

        $booking->update([
            'total_amount' => $quote['total'],
            'currency' => $quote['currency'],
            'metadata' => array_merge($booking->metadata ?? [], [
                'quote' => $quote,
                'quote_generated_at' => now()->toISOString(),
            ]),
        ]);

        return $booking->fresh();
    }

    /**
     * Advance booking to next step
     */
    public function advanceToNextStep(Booking $booking): Booking
    {
        $currentStep = $this->getCurrentStep($booking);
        $steps = $this->getStepsForBookingType($booking->booking_type);
        $currentIndex = array_search($currentStep, $steps, true);

        if ($currentIndex === false || $currentIndex >= count($steps) - 1) {
            return $booking;
        }

        $nextStep = $steps[$currentIndex + 1];

        return match ($nextStep) {
            self::STEP_QUOTE => $this->advanceToQuote($booking),
            self::STEP_REVIEW => $this->advanceToReview($booking),
            self::STEP_PAYMENT => $this->advanceToPayment($booking),
            self::STEP_CONFIRMATION => $this->advanceToConfirmation($booking),
            self::STEP_COMPLETED => $this->advanceToCompleted($booking),
            default => $booking,
        };
    }

    /**
     * Advance booking to quote step
     */
    private function advanceToQuote(Booking $booking): Booking
    {
        return $this->updateQuote($booking);
    }

    /**
     * Advance booking to review step
     */
    private function advanceToReview(Booking $booking): Booking
    {
        $booking->update([
            'status' => 'confirmed',
            'metadata' => array_merge($booking->metadata ?? [], [
                'reviewed_at' => now()->toISOString(),
            ]),
        ]);

        return $booking->fresh();
    }

    /**
     * Advance booking to payment step
     */
    private function advanceToPayment(Booking $booking): Booking
    {
        // Payment step is handled by payment processing
        return $booking;
    }

    /**
     * Advance booking to confirmation step
     */
    private function advanceToConfirmation(Booking $booking): Booking
    {
        if ($booking->payment_status === 'paid' || $booking->payment_status === 'partially_paid') {
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'metadata' => array_merge($booking->metadata ?? [], [
                    'confirmed_at' => now()->toISOString(),
                ]),
            ]);
        }

        return $booking->fresh();
    }

    /**
     * Advance booking to completed step
     */
    private function advanceToCompleted(Booking $booking): Booking
    {
        $booking->update([
            'status' => 'completed',
            'metadata' => array_merge($booking->metadata ?? [], [
                'completed_at' => now()->toISOString(),
            ]),
        ]);

        return $booking->fresh();
    }

    /**
     * Get financial breakdown for a booking
     */
    public function getFinancialBreakdown(Booking $booking): array
    {
        $quote = $booking->metadata['quote'] ?? $this->calculateQuote($booking);

        return [
            'base_price' => $quote['base_price'] ?? $booking->total_amount,
            'fees' => $quote['fees'] ?? [],
            'subtotal' => $quote['subtotal'] ?? $booking->total_amount,
            'total_fees' => $quote['total_fees'] ?? 0,
            'discount' => $booking->metadata['discount'] ?? 0,
            'total' => $quote['total'] ?? $booking->total_amount,
            'paid' => $booking->paid_amount ?? 0,
            'remaining' => ($quote['total'] ?? $booking->total_amount) - ($booking->paid_amount ?? 0),
            'currency' => $booking->currency ?? 'USD',
        ];
    }

    /**
     * Validate booking can proceed to next step
     */
    public function canProceedToNextStep(Booking $booking): array
    {
        $currentStep = $this->getCurrentStep($booking);
        $canProceed = false;
        $reason = '';

        return match ($currentStep) {
            self::STEP_INITIAL_REQUEST => [
                'can_proceed' => true,
                'reason' => '',
            ],
            self::STEP_QUOTE => [
                'can_proceed' => $booking->total_amount > 0,
                'reason' => $booking->total_amount > 0 ? '' : 'Quote not generated',
            ],
            self::STEP_REVIEW => [
                'can_proceed' => $booking->status === 'confirmed',
                'reason' => $booking->status === 'confirmed' ? '' : 'Booking not confirmed',
            ],
            self::STEP_PAYMENT => [
                'can_proceed' => $booking->payment_status === 'paid' || $booking->payment_status === 'partially_paid',
                'reason' => ($booking->payment_status === 'paid' || $booking->payment_status === 'partially_paid') ? '' : 'Payment not completed',
            ],
            self::STEP_CONFIRMATION => [
                'can_proceed' => $booking->status === 'confirmed' && ($booking->payment_status === 'paid' || $booking->payment_status === 'partially_paid'),
                'reason' => ($booking->status === 'confirmed' && ($booking->payment_status === 'paid' || $booking->payment_status === 'partially_paid')) ? '' : 'Not ready for confirmation',
            ],
            default => [
                'can_proceed' => false,
                'reason' => 'Already completed',
            ],
        };
    }
}
