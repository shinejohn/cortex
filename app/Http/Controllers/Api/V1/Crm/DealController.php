<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreDealRequest;
use App\Http\Requests\Api\V1\UpdateDealRequest;
use App\Http\Resources\Api\V1\Crm\DealResource;
use App\Models\Deal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DealController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Deal::query()->with(['tenant', 'customer']);

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('stage')) {
            $query->where('stage', $request->stage);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $deals = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($deals);
    }

    public function show(Deal $deal): JsonResponse
    {
        return $this->success(new DealResource($deal->load(['tenant', 'customer'])));
    }

    public function store(StoreDealRequest $request): JsonResponse
    {
        $deal = Deal::create($request->validated());
        return $this->success(new DealResource($deal), 'Deal created successfully', 201);
    }

    public function update(UpdateDealRequest $request, Deal $deal): JsonResponse
    {
        $this->authorize('update', $deal);
        $deal->update($request->validated());
        return $this->success(new DealResource($deal), 'Deal updated successfully');
    }

    public function destroy(Deal $deal): JsonResponse
    {
        $this->authorize('delete', $deal);
        $deal->delete();
        return $this->noContent();
    }

    public function stage(Request $request, Deal $deal): JsonResponse
    {
        $this->authorize('update', $deal);
        $request->validate(['stage' => ['required', 'string']]);
        $deal->update(['stage' => $request->stage]);
        return $this->success(new DealResource($deal), 'Deal stage updated successfully');
    }

    public function pipeline(Request $request): JsonResponse
    {
        $stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
        $pipeline = [];

        foreach ($stages as $stage) {
            $pipeline[$stage] = Deal::where('stage', $stage)
                ->where('tenant_id', $request->user()->tenant_id)
                ->sum('amount');
        }

        return $this->success($pipeline);
    }
}


