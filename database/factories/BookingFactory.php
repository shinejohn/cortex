<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
final class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $bookingTypes = ['event', 'venue', 'performer'];
        $bookingType = fake()->randomElement($bookingTypes);
        $eventDate = fake()->dateTimeBetween('-30 days', '+60 days');
        $totalAmount = fake()->randomFloat(2, 50, 5000);
        $paidAmount = fake()->randomFloat(2, 0, $totalAmount);

        $specialRequests = [
            'Vegetarian catering options',
            'Extra microphones needed',
            'Stage lighting requirements',
            'Parking for equipment van',
            'Security arrangements',
            'Photo/video permission',
            'Sound check at 6 PM',
            'Green room required',
        ];

        $setupRequirements = [
            'Round table setup',
            'Theater-style seating',
            'Stage platform',
            'Dance floor area',
            'Reception area',
            'Bar setup',
            'Cocktail table arrangement',
        ];

        $paymentMethods = ['credit_card', 'bank_transfer', 'paypal', 'check', 'cash'];

        return [
            'status' => fake()->randomElement(['pending', 'confirmed', 'confirmed', 'cancelled']),
            'booking_type' => $bookingType,
            'contact_name' => fake()->name(),
            'contact_email' => fake()->email(),
            'contact_phone' => fake()->phoneNumber(),
            'contact_company' => fake()->optional(0.4)->company(),
            'event_date' => $eventDate,
            'start_time' => fake()->time('H:i'),
            'end_time' => fake()->time('H:i'),
            'event_type' => fake()->randomElement(['Wedding', 'Corporate', 'Birthday', 'Concert', 'Workshop', 'private', 'public']),
            'expected_guests' => fake()->numberBetween(20, 500),
            'expected_audience' => fake()->numberBetween(50, 1000),
            'ticket_quantity' => $bookingType === 'event' ? fake()->numberBetween(1, 10) : null,
            'ticket_type' => $bookingType === 'event' ? fake()->randomElement(['General', 'VIP', 'Student', 'Senior']) : null,
            'price_per_ticket' => $bookingType === 'event' ? fake()->randomFloat(2, 15, 150) : null,
            'payment_status' => fake()->randomElement(['pending', 'paid', 'partially_paid']),
            'total_amount' => $totalAmount,
            'currency' => 'USD',
            'paid_amount' => $paidAmount,
            'payment_method' => fake()->randomElement($paymentMethods),
            'transaction_id' => fake()->optional(0.7)->regexify('[A-Z0-9]{12}'),
            'payment_date' => $paidAmount > 0 ? fake()->dateTimeBetween('-30 days', 'now') : null,
            'notes' => fake()->optional(0.6)->paragraph(),
            'special_requests' => fake()->randomElements($specialRequests, fake()->numberBetween(0, 3)),
            'setup_requirements' => $bookingType === 'venue' ? fake()->randomElements($setupRequirements, fake()->numberBetween(1, 3)) : null,
            'catering_requirements' => $bookingType === 'venue' ? fake()->optional(0.5)->randomElements([
                'Buffet style',
                'Plated dinner',
                'Cocktail reception',
                'Coffee service',
                'Full bar',
            ], 2) : null,
            'performance_requirements' => $bookingType === 'performer' ? fake()->optional(0.6)->randomElements([
                'Piano on stage',
                'Full drum kit',
                'Guitar amplifiers',
                'Wireless microphones',
                'Monitor speakers',
            ], 2) : null,
            'sound_requirements' => $bookingType === 'performer' ? fake()->optional(0.7)->randomElements([
                'Professional sound system',
                'Stage monitors',
                'Mixing board access',
                'Wireless mics',
                'Direct input boxes',
            ], 2) : null,
            'confirmed_at' => fake()->optional(0.6)->dateTimeBetween('-20 days', 'now'),
            'cancelled_at' => fake()->optional(0.1)->dateTimeBetween('-15 days', 'now'),
            'cancellation_reason' => fake()->optional(0.1)->randomElement([
                'Weather conditions',
                'Venue unavailable',
                'Client request',
                'Performer illness',
                'Payment issues',
            ]),
            'workspace_id' => null, // Will be set in seeder
            'created_by' => null, // Will be set in seeder
        ];
    }

    public function eventBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'booking_type' => 'event',
            'event_id' => Event::factory(),
            'venue_id' => null,
            'performer_id' => null,
            'ticket_quantity' => fake()->numberBetween(1, 10),
            'ticket_type' => fake()->randomElement(['General', 'VIP', 'Student', 'Senior']),
            'price_per_ticket' => fake()->randomFloat(2, 15, 150),
        ]);
    }

    public function venueBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'booking_type' => 'venue',
            'venue_id' => null, // Will be set in seeder
            'event_id' => null,
            'performer_id' => null,
            'ticket_quantity' => null,
            'ticket_type' => null,
            'price_per_ticket' => null,
        ]);
    }

    public function performerBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'booking_type' => 'performer',
            'performer_id' => null, // Will be set in seeder
            'event_id' => null,
            'venue_id' => null,
            'ticket_quantity' => null,
            'ticket_type' => null,
            'price_per_ticket' => null,
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'confirmed_at' => fake()->dateTimeBetween('-20 days', 'now'),
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'paid',
            'paid_amount' => $attributes['total_amount'],
            'payment_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'transaction_id' => fake()->regexify('[A-Z0-9]{12}'),
        ]);
    }
}
