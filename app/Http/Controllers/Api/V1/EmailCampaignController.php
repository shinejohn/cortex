<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreEmailCampaignRequest;
use App\Http\Resources\Api\V1\EmailCampaignResource;
use App\Models\EmailCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EmailCampaignController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = EmailCampaign::query()->with(['community', 'template']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($campaigns);
    }

    public function show(EmailCampaign $emailCampaign): JsonResponse
    {
        return $this->success(new EmailCampaignResource($emailCampaign->load(['community', 'template'])));
    }

    public function store(StoreEmailCampaignRequest $request): JsonResponse
    {
        $campaign = EmailCampaign::create($request->validated());
        return $this->success(new EmailCampaignResource($campaign), 'Email campaign created successfully', 201);
    }

    public function send(Request $request, EmailCampaign $emailCampaign): JsonResponse
    {
        $this->authorize('update', $emailCampaign);
        // TODO: Implement campaign sending
        return $this->success(new EmailCampaignResource($emailCampaign), 'Campaign sent');
    }
}


