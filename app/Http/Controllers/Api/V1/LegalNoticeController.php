<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreLegalNoticeRequest;
use App\Http\Requests\Api\V1\UpdateLegalNoticeRequest;
use App\Http\Resources\Api\V1\LegalNoticeResource;
use App\Models\LegalNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class LegalNoticeController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = LegalNotice::query()->with(['user', 'workspace', 'regions']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notices = $query->active()->orderBy('publish_date', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($notices);
    }

    public function show(LegalNotice $legalNotice): JsonResponse
    {
        $legalNotice->increment('views_count');
        return $this->success(new LegalNoticeResource($legalNotice->load(['user', 'workspace', 'regions'])));
    }

    public function store(StoreLegalNoticeRequest $request): JsonResponse
    {
        $notice = LegalNotice::create($request->validated());

        if ($request->has('region_ids')) {
            $notice->regions()->attach($request->region_ids);
        }

        return $this->success(new LegalNoticeResource($notice), 'Legal notice created successfully', 201);
    }

    public function update(UpdateLegalNoticeRequest $request, LegalNotice $legalNotice): JsonResponse
    {
        $this->authorize('update', $legalNotice);
        $legalNotice->update($request->validated());
        return $this->success(new LegalNoticeResource($legalNotice), 'Legal notice updated successfully');
    }
}


