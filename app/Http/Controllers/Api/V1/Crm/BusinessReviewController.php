<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreBusinessReviewRequest;
use App\Http\Resources\Api\V1\Crm\BusinessReviewResource;
use App\Models\BusinessReview;
use App\Models\SmbBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessReviewController extends BaseController
{
    public function index(Request $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $reviews = $smbBusiness->reviews()->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));
        return $this->paginated($reviews);
    }

    public function store(StoreBusinessReviewRequest $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $review = $smbBusiness->reviews()->create($request->validated());
        return $this->success(new BusinessReviewResource($review), 'Review added successfully', 201);
    }
}


