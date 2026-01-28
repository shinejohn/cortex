<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class TenantControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_tenants(): void
    {
        $user = User::factory()->create();
        Tenant::factory()->count(5)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/tenants');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta',
            ]);
    }

    public function test_user_can_create_tenant(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tenants', [
                'name' => 'Test Tenant',
                'subdomain' => 'test-tenant',
                'email' => 'test@example.com',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        $this->assertDatabaseHas('tenants', [
            'name' => 'Test Tenant',
        ]);
    }

    public function test_user_can_view_tenant(): void
    {
        $user = User::factory()->create();
        $tenant = Tenant::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/tenants/{$tenant->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                ],
            ]);
    }

    public function test_user_can_update_tenant(): void
    {
        $user = User::factory()->create();
        $tenant = Tenant::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/tenants/{$tenant->id}", [
                'name' => 'Updated Tenant',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'name' => 'Updated Tenant',
        ]);
    }

    public function test_user_can_delete_tenant(): void
    {
        $user = User::factory()->create();
        $tenant = Tenant::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/v1/tenants/{$tenant->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('tenants', [
            'id' => $tenant->id,
        ]);
    }

    public function test_tenant_creation_requires_name(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tenants', []);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'data' => [
                    'errors' => [
                        'name' => [],
                    ],
                ],
            ]);
    }
}


