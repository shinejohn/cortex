<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreBusinessSurveyRequest;
use App\Http\Resources\Api\V1\BusinessSurveyResource;
use App\Models\Business;
use App\Models\BusinessSurvey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessSurveyController extends BaseController
{
    public function index(Request $request, Business $business): JsonResponse
    {
        $surveys = $business->surveys()->where('is_active', true)->paginate($request->get('per_page', 20));
        return $this->paginated($surveys);
    }

    public function store(StoreBusinessSurveyRequest $request, Business $business): JsonResponse
    {
        $survey = $business->surveys()->create($request->validated());
        return $this->success(new BusinessSurveyResource($survey), 'Survey created successfully', 201);
    }

    public function responses(Request $request, BusinessSurvey $businessSurvey): JsonResponse
    {
        $responses = $businessSurvey->responses()->paginate($request->get('per_page', 20));
        return $this->paginated($responses);
    }
}


