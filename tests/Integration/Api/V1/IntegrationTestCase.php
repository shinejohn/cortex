<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class IntegrationTestCase extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create authenticated user for all tests
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('integration-test')->plainTextToken;
    }

    protected function authenticatedJson(string $method, string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('Authorization', "Bearer {$this->token}")
            ->json($method, $uri, $data);
    }

    protected function assertApiSuccess(\Illuminate\Testing\TestResponse $response): void
    {
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    protected function assertApiCreated(\Illuminate\Testing\TestResponse $response): void
    {
        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'message', 'data']);
    }

    protected function assertApiError(\Illuminate\Testing\TestResponse $response, int $status = 400): void
    {
        $response->assertStatus($status)
            ->assertJsonStructure(['success', 'message']);
    }

    protected function getResponseData(\Illuminate\Testing\TestResponse $response): array
    {
        return $response->json('data', []);
    }
}

