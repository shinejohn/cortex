<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreBusinessPhotoRequest;
use App\Http\Resources\Api\V1\Crm\BusinessPhotoResource;
use App\Models\BusinessPhoto;
use App\Models\SmbBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessPhotoController extends BaseController
{
    public function index(Request $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $photos = $smbBusiness->photos()->paginate($request->get('per_page', 20));
        return $this->paginated($photos);
    }

    public function store(StoreBusinessPhotoRequest $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('update', $smbBusiness);
        $photo = $smbBusiness->photos()->create($request->validated());
        return $this->success(new BusinessPhotoResource($photo), 'Photo uploaded successfully', 201);
    }

    public function destroy(BusinessPhoto $businessPhoto): JsonResponse
    {
        $this->authorize('delete', $businessPhoto->smbBusiness);
        $businessPhoto->delete();
        return $this->noContent();
    }
}


