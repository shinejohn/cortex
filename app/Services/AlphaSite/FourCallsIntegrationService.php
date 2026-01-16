<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\AlphaSiteFourCallsIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Service for integrating AlphaSite businesses with 4calls.ai API
 */
final class FourCallsIntegrationService
{
    private string $apiUrl;
    private string $apiKey;
    private int $timeout = 30;

    public function __construct()
    {
        $this->apiUrl = config('fourcalls.api_url');
        $this->apiKey = config('fourcalls.api_key');
    }

    /**
     * Create a 4calls.ai organization for an AlphaSite business
     */
    public function createOrganization(Business $business): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post("{$this->apiUrl}/api/coordinator/organizations", [
                'name' => $business->name,
                'phone' => $business->phone,
                'email' => $business->email,
                'address' => $business->address,
                'city' => $business->city,
                'state' => $business->state,
                'postal_code' => $business->postal_code,
                'country' => $business->country ?? 'US',
                'metadata' => [
                    'alphasite_business_id' => $business->id,
                    'alphasite_business_slug' => $business->slug,
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Failed to create 4calls.ai organization', [
                    'business_id' => $business->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                throw new \Exception('Failed to create 4calls.ai organization');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception creating 4calls.ai organization', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get organization details from 4calls.ai
     */
    public function getOrganization(string $organizationId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])
            ->timeout($this->timeout)
            ->get("{$this->apiUrl}/api/coordinator/organizations/{$organizationId}");

            if (!$response->successful()) {
                throw new \Exception('Failed to get organization');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception getting 4calls.ai organization', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a Coordinator (AI assistant) for an organization
     */
    public function createCoordinator(string $organizationId, array $config): array
    {
        try {
            $defaultConfig = config('fourcalls.default_coordinator');
            $coordinatorData = array_merge($defaultConfig, $config);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post("{$this->apiUrl}/api/coordinator/organizations/{$organizationId}/coordinators", $coordinatorData);

            if (!$response->successful()) {
                Log::error('Failed to create coordinator', [
                    'organization_id' => $organizationId,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                throw new \Exception('Failed to create coordinator');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception creating coordinator', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * List all coordinators for an organization
     */
    public function listCoordinators(string $organizationId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])
            ->timeout($this->timeout)
            ->get("{$this->apiUrl}/api/coordinator/organizations/{$organizationId}/coordinators");

            if (!$response->successful()) {
                throw new \Exception('Failed to list coordinators');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception listing coordinators', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Provision AI service for a business
     */
    public function provisionService(Business $business, string $packageSlug): AlphaSiteFourCallsIntegration
    {
        $package = config("fourcalls.packages.{$packageSlug}");
        
        if (!$package) {
            throw new \InvalidArgumentException("Invalid package: {$packageSlug}");
        }

        // Check if integration already exists
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if ($integration) {
            // Update existing integration
            $integration->update([
                'service_package' => $packageSlug,
                'status' => 'active',
                'activated_at' => now(),
            ]);
            return $integration;
        }

        // Create organization in 4calls.ai
        $organization = $this->createOrganization($business);
        $organizationId = $organization['id'] ?? $organization['data']['id'] ?? null;

        if (!$organizationId) {
            throw new \Exception('Failed to get organization ID from 4calls.ai');
        }

        // Create default coordinator
        $coordinator = $this->createCoordinator($organizationId, [
            'role_template' => $package['features']['coordinator_roles'][0] ?? 'receptionist',
            'display_name' => $business->name . ' Assistant',
        ]);
        $coordinatorId = $coordinator['id'] ?? $coordinator['data']['id'] ?? null;

        // Create integration record
        $integration = AlphaSiteFourCallsIntegration::create([
            'business_id' => $business->id,
            'organization_id' => $organizationId,
            'coordinator_id' => $coordinatorId,
            'api_key' => encrypt($this->apiKey), // Store encrypted API key
            'service_package' => $packageSlug,
            'status' => 'active',
            'activated_at' => now(),
        ]);

        return $integration;
    }

    /**
     * Deprovision AI service for a business
     */
    public function deprovisionService(Business $business): bool
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration) {
            return false;
        }

        $integration->update([
            'status' => 'suspended',
        ]);

        return true;
    }

    /**
     * Upgrade or downgrade service package
     */
    public function changeServicePackage(Business $business, string $newPackageSlug): AlphaSiteFourCallsIntegration
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration) {
            // If no integration exists, provision new service
            return $this->provisionService($business, $newPackageSlug);
        }

        $newPackage = config("fourcalls.packages.{$newPackageSlug}");
        
        if (!$newPackage) {
            throw new \InvalidArgumentException("Invalid package: {$newPackageSlug}");
        }

        // Update integration
        $integration->update([
            'service_package' => $newPackageSlug,
            'status' => 'active',
        ]);

        // If new package allows more coordinators, create additional ones
        $currentCoordinators = $this->listCoordinators($integration->organization_id);
        $currentCount = count($currentCoordinators);
        $allowedCount = $newPackage['features']['coordinator_count'] ?? 1;

        if ($allowedCount > $currentCount) {
            $roles = $newPackage['features']['coordinator_roles'] ?? ['receptionist'];
            for ($i = $currentCount; $i < $allowedCount; $i++) {
                $this->createCoordinator($integration->organization_id, [
                    'role_template' => $roles[$i] ?? 'receptionist',
                    'display_name' => $business->name . ' Assistant ' . ($i + 1),
                ]);
            }
        }

        return $integration;
    }

    /**
     * Get call history for a business
     */
    public function getCallHistory(Business $business, array $filters = []): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            return ['data' => [], 'total' => 0];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
            ])
            ->timeout($this->timeout)
            ->get("{$this->apiUrl}/api/coordinator/organizations/{$integration->organization_id}/calls", $filters);

            if (!$response->successful()) {
                return ['data' => [], 'total' => 0];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception getting call history', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Get call statistics for a business
     */
    public function getCallStats(Business $business, array $filters = []): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            return [
                'calls_today' => 0,
                'avg_duration' => 0,
                'booking_rate' => 0,
                'total_calls' => 0,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
            ])
            ->timeout($this->timeout)
            ->get("{$this->apiUrl}/api/coordinator/organizations/{$integration->organization_id}/calls/stats", $filters);

            if (!$response->successful()) {
                return [
                    'calls_today' => 0,
                    'avg_duration' => 0,
                    'booking_rate' => 0,
                    'total_calls' => 0,
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception getting call stats', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return [
                'calls_today' => 0,
                'avg_duration' => 0,
                'booking_rate' => 0,
                'total_calls' => 0,
            ];
        }
    }

    /**
     * Get appointments for a business
     */
    public function getAppointments(Business $business, array $filters = []): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            return ['data' => [], 'total' => 0];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
            ])
            ->timeout($this->timeout)
            ->get("{$this->apiUrl}/api/coordinator/organizations/{$integration->organization_id}/appointments", $filters);

            if (!$response->successful()) {
                return ['data' => [], 'total' => 0];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception getting appointments', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Get contacts for a business
     */
    public function getContacts(Business $business, array $filters = []): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            return ['data' => [], 'total' => 0];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
            ])
            ->timeout($this->timeout)
            ->get("{$this->apiUrl}/api/coordinator/organizations/{$integration->organization_id}/contacts", $filters);

            if (!$response->successful()) {
                return ['data' => [], 'total' => 0];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception getting contacts', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Check availability for real-time operations
     */
    public function checkAvailability(Business $business, array $params): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            return ['available' => false];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post("{$this->apiUrl}/api/coordinator/real-time/availability", array_merge([
                'organization_id' => $integration->organization_id,
            ], $params));

            if (!$response->successful()) {
                return ['available' => false];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception checking availability', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            return ['available' => false];
        }
    }

    /**
     * Create a booking/appointment via real-time API
     */
    public function createBooking(Business $business, array $data): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            throw new \Exception('AI service not active for this business');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post("{$this->apiUrl}/api/coordinator/real-time/booking", array_merge([
                'organization_id' => $integration->organization_id,
            ], $data));

            if (!$response->successful()) {
                throw new \Exception('Failed to create booking');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception creating booking', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a lead via real-time API
     */
    public function createLead(Business $business, array $data): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            throw new \Exception('AI service not active for this business');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . decrypt($integration->api_key),
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post("{$this->apiUrl}/api/coordinator/real-time/lead", array_merge([
                'organization_id' => $integration->organization_id,
            ], $data));

            if (!$response->successful()) {
                throw new \Exception('Failed to create lead');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Exception creating lead', [
                'business_id' => $business->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Send chat message to AI coordinator
     */
    public function sendChatMessage(Business $business, string $message, ?string $conversationId = null): array
    {
        $integration = AlphaSiteFourCallsIntegration::where('business_id', $business->id)->first();
        
        if (!$integration || $integration->status !== 'active') {
            throw new \Exception('AI service not active for this business');
        }

        // TODO: Implement chat API endpoint when available in 4calls.ai
        // For now, return a placeholder response
        return [
            'response' => 'AI chat functionality is being integrated. Please check back soon.',
            'conversation_id' => $conversationId ?? uniqid('chat_'),
        ];
    }
}

