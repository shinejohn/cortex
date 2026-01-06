<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\Region;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class RegionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_regions(): void
    {
        $user = User::factory()->create();
        Region::factory()->count(5)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/regions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta',
            ]);
    }

    public function test_user_can_search_regions(): void
    {
        $user = User::factory()->create();
        Region::factory()->create(['name' => 'Miami']);
        Region::factory()->create(['name' => 'Orlando']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/regions/search?q=Miami');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_user_can_view_region(): void
    {
        $user = User::factory()->create();
        $region = Region::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/regions/{$region->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                ],
            ]);
    }

    public function test_user_can_create_region(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/regions', [
                'name' => 'Test Region',
                'state' => 'FL',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        $this->assertDatabaseHas('regions', [
            'name' => 'Test Region',
        ]);
    }

    public function test_region_creation_requires_name(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/regions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}


