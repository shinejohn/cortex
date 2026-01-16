<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Services\AlphaSite\FourCallsIntegrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Webhook controller for handling 4calls.ai webhook events
 */
final class FourCallsWebhookController extends Controller
{
    public function __construct(
        private readonly FourCallsIntegrationService $integrationService
    ) {}

    /**
     * Handle incoming webhooks from 4calls.ai
     */
    public function handle(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('X-4Calls-Signature');
        $secret = config('fourcalls.webhook_secret');
        
        if ($secret && !$this->verifySignature($request->getContent(), $signature, $secret)) {
            Log::warning('Invalid 4calls.ai webhook signature', [
                'signature' => $signature,
            ]);
            abort(401, 'Invalid signature');
        }

        $eventType = $request->input('event');
        $data = $request->input('data', []);

        // Prevent duplicate processing
        $eventId = $request->input('id');
        if ($eventId && Cache::has("fourcalls_webhook_{$eventId}")) {
            return response()->json(['status' => 'already_processed']);
        }

        try {
            switch ($eventType) {
                case 'call.completed':
                    $this->handleCallCompleted($data);
                    break;
                    
                case 'call.failed':
                    $this->handleCallFailed($data);
                    break;
                    
                case 'appointment.created':
                    $this->handleAppointmentCreated($data);
                    break;
                    
                case 'appointment.cancelled':
                    $this->handleAppointmentCancelled($data);
                    break;
                    
                case 'contact.created':
                case 'contact.updated':
                    $this->handleContactUpdated($data);
                    break;
                    
                case 'coordinator.activated':
                    $this->handleCoordinatorActivated($data);
                    break;
                    
                case 'coordinator.deactivated':
                    $this->handleCoordinatorDeactivated($data);
                    break;
                    
                default:
                    Log::info('Unhandled 4calls.ai webhook event', [
                        'event' => $eventType,
                        'data' => $data,
                    ]);
            }

            // Mark event as processed
            if ($eventId) {
                Cache::put("fourcalls_webhook_{$eventId}", true, now()->addHours(24));
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Error processing 4calls.ai webhook', [
                'event' => $eventType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle call completed event
     */
    private function handleCallCompleted(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        $callData = $data['call'] ?? [];
        
        if (!$organizationId) {
            return;
        }

        // Find business by organization_id
        $integration = \App\Models\AlphaSiteFourCallsIntegration::where('organization_id', $organizationId)->first();
        
        if (!$integration) {
            Log::warning('4calls.ai webhook: Organization not found', [
                'organization_id' => $organizationId,
            ]);
            return;
        }

        // Create interaction record in CRM
        $business = $integration->business;
        
        // You can extend this to create interaction records
        // For now, just log it
        Log::info('Call completed for business', [
            'business_id' => $business->id,
            'call_id' => $callData['id'] ?? null,
            'duration' => $callData['duration'] ?? null,
        ]);
    }

    /**
     * Handle call failed event
     */
    private function handleCallFailed(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        
        if (!$organizationId) {
            return;
        }

        Log::warning('Call failed', [
            'organization_id' => $organizationId,
            'error' => $data['error'] ?? null,
        ]);
    }

    /**
     * Handle appointment created event
     */
    private function handleAppointmentCreated(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        $appointment = $data['appointment'] ?? [];
        
        if (!$organizationId) {
            return;
        }

        $integration = \App\Models\AlphaSiteFourCallsIntegration::where('organization_id', $organizationId)->first();
        
        if ($integration) {
            Log::info('Appointment created for business', [
                'business_id' => $integration->business_id,
                'appointment_id' => $appointment['id'] ?? null,
            ]);
        }
    }

    /**
     * Handle appointment cancelled event
     */
    private function handleAppointmentCancelled(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        
        if (!$organizationId) {
            return;
        }

        Log::info('Appointment cancelled', [
            'organization_id' => $organizationId,
            'appointment_id' => $data['appointment_id'] ?? null,
        ]);
    }

    /**
     * Handle contact created/updated event
     */
    private function handleContactUpdated(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        $contact = $data['contact'] ?? [];
        
        if (!$organizationId) {
            return;
        }

        $integration = \App\Models\AlphaSiteFourCallsIntegration::where('organization_id', $organizationId)->first();
        
        if ($integration) {
            Log::info('Contact updated for business', [
                'business_id' => $integration->business_id,
                'contact_id' => $contact['id'] ?? null,
            ]);
        }
    }

    /**
     * Handle coordinator activated event
     */
    private function handleCoordinatorActivated(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        $coordinatorId = $data['coordinator_id'] ?? null;
        
        if (!$organizationId || !$coordinatorId) {
            return;
        }

        $integration = \App\Models\AlphaSiteFourCallsIntegration::where('organization_id', $organizationId)->first();
        
        if ($integration) {
            Log::info('Coordinator activated', [
                'business_id' => $integration->business_id,
                'coordinator_id' => $coordinatorId,
            ]);
        }
    }

    /**
     * Handle coordinator deactivated event
     */
    private function handleCoordinatorDeactivated(array $data): void
    {
        $organizationId = $data['organization_id'] ?? null;
        $coordinatorId = $data['coordinator_id'] ?? null;
        
        if (!$organizationId || !$coordinatorId) {
            return;
        }

        $integration = \App\Models\AlphaSiteFourCallsIntegration::where('organization_id', $organizationId)->first();
        
        if ($integration) {
            Log::info('Coordinator deactivated', [
                'business_id' => $integration->business_id,
                'coordinator_id' => $coordinatorId,
            ]);
        }
    }

    /**
     * Verify webhook signature
     */
    private function verifySignature(string $payload, ?string $signature, string $secret): bool
    {
        if (!$signature) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        
        return hash_equals($expectedSignature, $signature);
    }
}

