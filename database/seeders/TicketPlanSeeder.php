<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Event;
use App\Models\TicketPlan;
use Illuminate\Database\Seeder;

final class TicketPlanSeeder extends Seeder
{
    public function run(): void
    {
        $events = Event::published()->upcoming()->take(10)->get();

        foreach ($events as $event) {
            $ticketPlans = [
                [
                    'name' => 'General Admission',
                    'description' => 'Standard entry to the event',
                    'price' => fake()->randomFloat(2, 25, 50),
                    'max_quantity' => 200,
                    'available_quantity' => fake()->numberBetween(150, 200),
                    'sort_order' => 1,
                ],
                [
                    'name' => 'VIP Package',
                    'description' => 'Premium seating with exclusive access and complimentary refreshments',
                    'price' => fake()->randomFloat(2, 100, 150),
                    'max_quantity' => 50,
                    'available_quantity' => fake()->numberBetween(30, 50),
                    'sort_order' => 2,
                ],
            ];

            if (fake()->boolean(40)) {
                $ticketPlans[] = [
                    'name' => 'Free Community Preview',
                    'description' => 'Limited availability, standing room only',
                    'price' => 0,
                    'max_quantity' => 25,
                    'available_quantity' => fake()->numberBetween(10, 25),
                    'sort_order' => 0,
                ];
            }

            foreach ($ticketPlans as $planData) {
                TicketPlan::create([
                    'event_id' => $event->id,
                    'name' => $planData['name'],
                    'description' => $planData['description'],
                    'price' => $planData['price'],
                    'max_quantity' => $planData['max_quantity'],
                    'available_quantity' => $planData['available_quantity'],
                    'is_active' => true,
                    'sort_order' => $planData['sort_order'],
                ]);
            }
        }
    }
}
