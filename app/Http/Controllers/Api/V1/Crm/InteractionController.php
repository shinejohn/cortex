<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreInteractionRequest;
use App\Http\Requests\Api\V1\UpdateInteractionRequest;
use App\Http\Resources\Api\V1\Crm\InteractionResource;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class InteractionController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Interaction::query()->with(['tenant', 'customer']);

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $interactions = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($interactions);
    }

    public function show(Interaction $interaction): JsonResponse
    {
        return $this->success(new InteractionResource($interaction->load(['tenant', 'customer'])));
    }

    public function store(StoreInteractionRequest $request): JsonResponse
    {
        $interaction = Interaction::create($request->validated());
        return $this->success(new InteractionResource($interaction), 'Interaction logged successfully', 201);
    }

    public function update(UpdateInteractionRequest $request, Interaction $interaction): JsonResponse
    {
        $this->authorize('update', $interaction);
        $interaction->update($request->validated());
        return $this->success(new InteractionResource($interaction), 'Interaction updated successfully');
    }

    public function destroy(Interaction $interaction): JsonResponse
    {
        $this->authorize('delete', $interaction);
        $interaction->delete();
        return $this->noContent();
    }

    public function byCustomer(string $customerId): JsonResponse
    {
        $interactions = Interaction::where('customer_id', $customerId)->orderBy('created_at', 'desc')->get();
        return $this->success(InteractionResource::collection($interactions));
    }

    public function byBusiness(string $businessId): JsonResponse
    {
        // TODO: Implement business-based interactions
        return $this->success([]);
    }
}


