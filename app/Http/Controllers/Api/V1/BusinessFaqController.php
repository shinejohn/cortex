<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreBusinessFaqRequest;
use App\Http\Requests\Api\V1\UpdateBusinessFaqRequest;
use App\Http\Resources\Api\V1\BusinessFaqResource;
use App\Models\Business;
use App\Models\BusinessFaq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessFaqController extends BaseController
{
    public function index(Request $request, Business $business): JsonResponse
    {
        $faqs = $business->faqs()->active()->orderBy('display_order')->get();
        return $this->success(BusinessFaqResource::collection($faqs));
    }

    public function store(StoreBusinessFaqRequest $request, Business $business): JsonResponse
    {
        $faq = $business->faqs()->create($request->validated());
        return $this->success(new BusinessFaqResource($faq), 'FAQ added successfully', 201);
    }

    public function update(UpdateBusinessFaqRequest $request, BusinessFaq $businessFaq): JsonResponse
    {
        $this->authorize('update', $businessFaq->business);
        $businessFaq->update($request->validated());
        return $this->success(new BusinessFaqResource($businessFaq), 'FAQ updated successfully');
    }
}


