<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Crm;

use App\Models\Customer;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_customers(): void
    {
        $user = User::factory()->create();
        $tenant = Tenant::factory()->create();
        Customer::factory()->count(5)->create(['tenant_id' => $tenant->id]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/crm/customers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta',
            ]);
    }

    public function test_user_can_create_customer(): void
    {
        $user = User::factory()->create();
        $tenant = Tenant::factory()->create();
        
        // Ensure user belongs to tenant
        $user->update(['tenant_id' => $tenant->id]);
        
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/crm/customers', [
                'tenant_id' => $tenant->id,
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        $this->assertDatabaseHas('customers', [
            'email' => 'john@example.com',
        ]);
    }
}

