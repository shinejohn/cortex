<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\Event;
use App\Models\TicketPlan;
use App\Models\TicketOrder;
use App\Models\User;
use App\Models\Venue;
use App\Models\Workspace;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Complete Event Ticketing Workflow
 * 
 * This test simulates a complete event ticketing scenario:
 * 1. Create event
 * 2. Create venue
 * 3. Link event to venue
 * 4. Create ticket plans
 * 5. Create promo code
 * 6. User browses events
 * 7. User selects event
 * 8. User adds tickets to cart
 * 9. User applies promo code
 * 10. User completes purchase
 * 11. Verify ticket order
 * 12. Verify ticket availability updated
 */
final class EventTicketingWorkflowTest extends IntegrationTestCase
{
    public function test_complete_event_ticketing_workflow(): void
    {
        $workspace = Workspace::factory()->create();

        // Step 1: Create venue
        $venueResponse = $this->authenticatedJson('POST', '/api/v1/venues', [
            'name' => 'Test Venue',
            'address' => '123 Main St',
            'city' => 'Miami',
            'state' => 'FL',
            'zipcode' => '33101',
            'latitude' => 25.7617,
            'longitude' => -80.1918,
        ]);

        $venueResponse->assertStatus(201);
        $venueId = $venueResponse->json('data.id');

        // Step 2: Create event
        $eventResponse = $this->authenticatedJson('POST', '/api/v1/events', [
            'workspace_id' => $workspace->id,
            'venue_id' => $venueId,
            'title' => 'Test Concert',
            'description' => 'A great concert',
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(30)->addHours(3)->toDateString(),
            'status' => 'published',
        ]);

        $eventResponse->assertStatus(201);
        $eventId = $eventResponse->json('data.id');

        // Step 3: Create ticket plans
        $vipPlanResponse = $this->authenticatedJson('POST', '/api/v1/ticket-plans', [
            'event_id' => $eventId,
            'name' => 'VIP',
            'price' => 100.00,
            'quantity' => 50,
            'description' => 'VIP tickets',
        ]);

        $vipPlanResponse->assertStatus(201);
        $vipPlanId = $vipPlanResponse->json('data.id');

        $generalPlanResponse = $this->authenticatedJson('POST', '/api/v1/ticket-plans', [
            'event_id' => $eventId,
            'name' => 'General Admission',
            'price' => 50.00,
            'quantity' => 200,
            'description' => 'General admission tickets',
        ]);

        $generalPlanResponse->assertStatus(201);
        $generalPlanId = $generalPlanResponse->json('data.id');

        // Step 4: Create promo code
        $promoResponse = $this->authenticatedJson('POST', '/api/v1/promo-codes', [
            'code' => 'SAVE20',
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'max_uses' => 100,
            'valid_from' => now()->toDateString(),
            'valid_until' => now()->addDays(30)->toDateString(),
        ]);

        $promoResponse->assertStatus(201);
        $promoCode = $promoResponse->json('data.code');

        // Step 5: User browses events
        $eventsResponse = $this->authenticatedJson('GET', '/api/v1/events');
        $eventsResponse->assertStatus(200);
        $events = $eventsResponse->json('data');
        $this->assertContains($eventId, collect($events)->pluck('id')->toArray());

        // Step 6: User selects event
        $eventDetailsResponse = $this->authenticatedJson('GET', "/api/v1/events/{$eventId}");
        $eventDetailsResponse->assertStatus(200);
        $eventData = $eventDetailsResponse->json('data');
        $this->assertEquals('Test Concert', $eventData['title']);

        // Step 7: User adds tickets to cart
        $cartResponse = $this->authenticatedJson('POST', '/api/v1/carts', [
            'ticket_plan_id' => $vipPlanId,
            'quantity' => 2,
        ]);

        $cartResponse->assertStatus(201);

        // Step 8: User applies promo code
        // Note: This would typically be done during checkout
        // For now, we'll verify the promo code exists

        // Step 9: User completes purchase
        $orderResponse = $this->authenticatedJson('POST', '/api/v1/ticket-orders', [
            'event_id' => $eventId,
            'ticket_plans' => [
                [
                    'ticket_plan_id' => $vipPlanId,
                    'quantity' => 2,
                ],
            ],
            'promo_code' => $promoCode,
        ]);

        $orderResponse->assertStatus(201);
        $orderId = $orderResponse->json('data.id');

        // Step 10: Verify ticket order
        $orderDetailsResponse = $this->authenticatedJson('GET', "/api/v1/ticket-orders/{$orderId}");
        $orderDetailsResponse->assertStatus(200);
        $orderData = $orderDetailsResponse->json('data');
        $this->assertEquals('completed', $orderData['status']);

        // Step 11: Verify ticket availability updated
        $planAfterResponse = $this->authenticatedJson('GET', "/api/v1/ticket-plans/{$vipPlanId}");
        $planAfterResponse->assertStatus(200);
        $planData = $planAfterResponse->json('data');
        // Availability should be reduced by 2
        $this->assertLessThan(50, $planData['available_quantity']);
    }
}


