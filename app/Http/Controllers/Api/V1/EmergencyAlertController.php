<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreEmergencyAlertRequest;
use App\Http\Resources\Api\V1\EmergencyAlertResource;
use App\Models\EmergencyAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EmergencyAlertController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = EmergencyAlert::query()->with(['community', 'creator']);

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'active');
        }

        $alerts = $query->orderBy('published_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($alerts);
    }

    public function show(EmergencyAlert $emergencyAlert): JsonResponse
    {
        return $this->success(new EmergencyAlertResource($emergencyAlert->load(['community', 'creator'])));
    }

    public function store(StoreEmergencyAlertRequest $request): JsonResponse
    {
        $this->authorize('create', EmergencyAlert::class);
        $alert = EmergencyAlert::create([
            'community_id' => $request->community_id,
            'created_by' => $request->user()->id,
            'priority' => $request->priority,
            'title' => $request->title,
            'message' => $request->message,
            'status' => 'active',
            'published_at' => now(),
        ]);

        return $this->success(new EmergencyAlertResource($alert), 'Emergency alert created successfully', 201);
    }
}


