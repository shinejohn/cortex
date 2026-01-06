<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\Customer;
use App\Models\Deal;
use App\Models\Interaction;
use App\Models\SmbBusiness;
use App\Models\Task;
use App\Models\Tenant;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Complete CRM Customer Journey
 * 
 * This test simulates a complete customer lifecycle:
 * 1. Create SMB Business
 * 2. Create Customer (lead stage)
 * 3. Add interactions
 * 4. Create deal
 * 5. Update deal stages
 * 6. Create tasks
 * 7. Complete tasks
 * 8. Convert deal to won
 * 9. Update customer lifecycle stage
 */
final class CRMCustomerJourneyTest extends IntegrationTestCase
{
    public function test_complete_customer_lifecycle_from_lead_to_customer(): void
    {
        // Setup: Create tenant
        $tenant = Tenant::factory()->create();
        $this->user->update(['tenant_id' => $tenant->id]);

        // Step 1: Create SMB Business
        $businessResponse = $this->authenticatedJson('POST', '/api/v1/crm/businesses', [
            'tenant_id' => $tenant->id,
            'google_place_id' => 'ChIJ' . \Illuminate\Support\Str::random(27),
            'display_name' => 'Test Restaurant',
            'latitude' => 25.7617,
            'longitude' => -80.1918,
            'formatted_address' => '123 Main St, Miami, FL',
        ]);

        $businessResponse->assertStatus(201);
        $businessId = $businessResponse->json('data.id');

        // Step 2: Create Customer (lead stage)
        $customerResponse = $this->authenticatedJson('POST', '/api/v1/crm/customers', [
            'tenant_id' => $tenant->id,
            'smb_business_id' => $businessId,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'lifecycle_stage' => 'lead',
            'lead_source' => 'organic',
        ]);

        $customerResponse->assertStatus(201);
        $customerId = $customerResponse->json('data.id');
        $this->assertEquals('lead', $customerResponse->json('data.lifecycle_stage'));

        // Step 3: Add interaction (phone call)
        $interactionResponse = $this->authenticatedJson('POST', '/api/v1/crm/interactions', [
            'tenant_id' => $tenant->id,
            'customer_id' => $customerId,
            'type' => 'call',
            'subject' => 'Initial Contact',
            'description' => 'Called to discuss services',
            'direction' => 'outbound',
        ]);

        $interactionResponse->assertStatus(201);
        $interactionId = $interactionResponse->json('data.id');

        // Step 4: Create deal
        $dealResponse = $this->authenticatedJson('POST', '/api/v1/crm/deals', [
            'tenant_id' => $tenant->id,
            'customer_id' => $customerId,
            'name' => 'Website Redesign',
            'amount' => 5000.00,
            'currency' => 'USD',
            'stage' => 'prospecting',
            'expected_close_date' => now()->addDays(30)->toDateString(),
        ]);

        $dealResponse->assertStatus(201);
        $dealId = $dealResponse->json('data.id');
        $this->assertEquals('prospecting', $dealResponse->json('data.stage'));

        // Step 5: Update deal stage
        $updateDealResponse = $this->authenticatedJson('PATCH', "/api/v1/crm/deals/{$dealId}/stage", [
            'stage' => 'qualification',
            'probability' => 25,
        ]);

        $updateDealResponse->assertStatus(200);
        $this->assertEquals('qualification', $updateDealResponse->json('data.stage'));

        // Step 6: Create task
        $taskResponse = $this->authenticatedJson('POST', '/api/v1/crm/tasks', [
            'tenant_id' => $tenant->id,
            'customer_id' => $customerId,
            'title' => 'Send Proposal',
            'description' => 'Email proposal to customer',
            'priority' => 'high',
            'due_date' => now()->addDays(3)->toDateString(),
        ]);

        $taskResponse->assertStatus(201);
        $taskId = $taskResponse->json('data.id');
        $this->assertEquals('pending', $taskResponse->json('data.status'));

        // Step 7: Complete task
        $completeTaskResponse = $this->authenticatedJson('PATCH', "/api/v1/crm/tasks/{$taskId}/complete", []);

        $completeTaskResponse->assertStatus(200);
        $this->assertEquals('completed', $completeTaskResponse->json('data.status'));

        // Step 8: Move deal to won
        $wonDealResponse = $this->authenticatedJson('PATCH', "/api/v1/crm/deals/{$dealId}/stage", [
            'stage' => 'won',
            'probability' => 100,
        ]);

        $wonDealResponse->assertStatus(200);
        $this->assertEquals('won', $wonDealResponse->json('data.stage'));

        // Step 9: Update customer lifecycle stage to customer
        $updateCustomerResponse = $this->authenticatedJson('PUT', "/api/v1/crm/customers/{$customerId}", [
            'lifecycle_stage' => 'customer',
        ]);

        $updateCustomerResponse->assertStatus(200);
        $this->assertEquals('customer', $updateCustomerResponse->json('data.lifecycle_stage'));

        // Step 10: Verify all relationships
        $customerDetailsResponse = $this->authenticatedJson('GET', "/api/v1/crm/customers/{$customerId}");
        $customerDetailsResponse->assertStatus(200);
        $customerData = $customerDetailsResponse->json('data');

        $this->assertEquals($businessId, $customerData['smb_business_id']);
        $this->assertEquals('customer', $customerData['lifecycle_stage']);

        // Verify interactions exist
        $interactionsResponse = $this->authenticatedJson('GET', "/api/v1/crm/customers/{$customerId}/interactions");
        $interactionsResponse->assertStatus(200);
        $this->assertCount(1, $interactionsResponse->json('data'));

        // Verify deals exist
        $dealsResponse = $this->authenticatedJson('GET', "/api/v1/crm/customers/{$customerId}/deals");
        $dealsResponse->assertStatus(200);
        $this->assertCount(1, $dealsResponse->json('data'));
        $this->assertEquals('won', $dealsResponse->json('data.0.stage'));

        // Verify tasks exist
        $tasksResponse = $this->authenticatedJson('GET', "/api/v1/crm/customers/{$customerId}/tasks");
        $tasksResponse->assertStatus(200);
        $this->assertCount(1, $tasksResponse->json('data'));
        $this->assertEquals('completed', $tasksResponse->json('data.0.status'));
    }
}


