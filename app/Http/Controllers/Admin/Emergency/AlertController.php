<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Emergency;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\EmergencyAlert;
use App\Services\EmergencyBroadcastService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class AlertController extends Controller
{
    public function __construct(
        private readonly EmergencyBroadcastService $emergencyService
    ) {}

    public function index(Request $request): Response
    {
        $alerts = EmergencyAlert::query()
            ->with('community:id,name')
            ->when($request->community_id, fn($q, $c) => $q->where('community_id', $c))
            ->when($request->priority, fn($q, $p) => $q->where('priority', $p))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Admin/Emergency/Alerts/Index', [
            'alerts' => $alerts,
            'filters' => $request->only(['community_id', 'priority', 'status']),
            'communities' => Community::select('id', 'name')->orderBy('name')->get(),
            'priorities' => ['critical', 'urgent', 'advisory', 'info'],
            'statuses' => ['draft', 'active', 'expired', 'cancelled'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Emergency/Alerts/Create', [
            'communities' => Community::select('id', 'name')->orderBy('name')->get(),
            'priorities' => [
                ['value' => 'critical', 'label' => 'Critical', 'color' => 'red', 'description' => 'Imminent threat to life/safety'],
                ['value' => 'urgent', 'label' => 'Urgent', 'color' => 'orange', 'description' => 'Significant event requiring attention'],
                ['value' => 'advisory', 'label' => 'Advisory', 'color' => 'yellow', 'description' => 'Awareness recommended'],
                ['value' => 'info', 'label' => 'Info', 'color' => 'blue', 'description' => 'General notice'],
            ],
            'categories' => ['weather', 'crime', 'health', 'utility', 'traffic', 'government', 'school', 'amber'],
            'channels' => ['email', 'sms'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'community_id' => 'required|exists:communities,id',
            'priority' => 'required|in:critical,urgent,advisory,info',
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'instructions' => 'nullable|string',
            'source' => 'nullable|string',
            'source_url' => 'nullable|url',
            'expires_at' => 'nullable|date|after:now',
            'channels' => 'required|array|min:1',
            'publish_immediately' => 'boolean',
        ]);

        $alert = $this->emergencyService->createAlert($validated, auth()->id());
        $message = ($validated['publish_immediately'] ?? false)
            ? 'Alert published and broadcast initiated.'
            : 'Alert saved as draft.';

        return redirect()
            ->route('admin.emergency.alerts.show', $alert)
            ->with('success', $message);
    }

    public function show(EmergencyAlert $alert): Response
    {
        $alert->load(['community', 'creator', 'municipalPartner']);

        return Inertia::render('Admin/Emergency/Alerts/Show', [
            'alert' => $alert,
            'deliveryStats' => $this->emergencyService->getDeliveryStats($alert),
            'auditLog' => $alert->auditLogs()->with('user')->latest()->limit(20)->get(),
        ]);
    }

    public function publish(EmergencyAlert $alert): RedirectResponse
    {
        if ($alert->status !== 'draft') {
            return back()->with('error', 'Only draft alerts can be published.');
        }

        $this->emergencyService->publishAlert($alert, auth()->id());

        return back()->with('success', 'Alert published and broadcast initiated.');
    }

    public function cancel(Request $request, EmergencyAlert $alert): RedirectResponse
    {
        if (!in_array($alert->status, ['draft', 'active'])) {
            return back()->with('error', 'This alert cannot be cancelled.');
        }

        $this->emergencyService->cancelAlert($alert, auth()->id(), $request->input('reason'));

        return back()->with('success', 'Alert cancelled.');
    }
}
