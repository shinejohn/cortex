<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreBusinessSubscriptionRequest;
use App\Http\Resources\Api\V1\BusinessSubscriptionResource;
use App\Models\Business;
use App\Models\BusinessSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessSubscriptionController extends BaseController
{
    public function show(Request $request, Business $business): JsonResponse
    {
        $subscription = $business->subscription;
        return $this->success($subscription ? new BusinessSubscriptionResource($subscription) : null);
    }

    public function store(StoreBusinessSubscriptionRequest $request, Business $business): JsonResponse
    {
        $subscription = $business->subscription()->create($request->validated());
        return $this->success(new BusinessSubscriptionResource($subscription), 'Subscription created successfully', 201);
    }

    public function destroy(Request $request, Business $business): JsonResponse
    {
        $this->authorize('update', $business);
        $business->subscription?->delete();
        return $this->noContent();
    }
}


