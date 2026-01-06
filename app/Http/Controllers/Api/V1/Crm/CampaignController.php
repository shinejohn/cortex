<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreCampaignRequest;
use App\Http\Requests\Api\V1\UpdateCampaignRequest;
use App\Http\Resources\Api\V1\Crm\CampaignResource;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CampaignController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Campaign::query()->with(['tenant']);

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($campaigns);
    }

    public function show(Campaign $campaign): JsonResponse
    {
        return $this->success(new CampaignResource($campaign->load(['tenant', 'recipients'])));
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $campaign = Campaign::create($request->validated());
        return $this->success(new CampaignResource($campaign), 'Campaign created successfully', 201);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        $this->authorize('update', $campaign);
        $campaign->update($request->validated());
        return $this->success(new CampaignResource($campaign), 'Campaign updated successfully');
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        $this->authorize('delete', $campaign);
        $campaign->delete();
        return $this->noContent();
    }

    public function send(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorize('update', $campaign);
        // TODO: Implement campaign sending logic
        return $this->success(new CampaignResource($campaign), 'Campaign sent successfully');
    }

    public function recipients(Request $request, Campaign $campaign): JsonResponse
    {
        $recipients = $campaign->recipients()->with('customer')->paginate($request->get('per_page', 20));
        return $this->paginated($recipients);
    }

    public function analytics(Campaign $campaign): JsonResponse
    {
        // TODO: Implement analytics
        return $this->success(['sent' => 0, 'opened' => 0, 'clicked' => 0]);
    }
}


