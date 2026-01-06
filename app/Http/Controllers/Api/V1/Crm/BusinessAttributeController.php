<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\UpdateBusinessAttributeRequest;
use App\Http\Resources\Api\V1\Crm\BusinessAttributeResource;
use App\Models\BusinessAttribute;
use App\Models\SmbBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessAttributeController extends BaseController
{
    public function index(Request $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $attributes = $smbBusiness->attributes;
        return $this->success($attributes ? new BusinessAttributeResource($attributes) : null);
    }

    public function update(UpdateBusinessAttributeRequest $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('update', $smbBusiness);
        $attributes = $smbBusiness->attributes()->updateOrCreate(['smb_business_id' => $smbBusiness->id], $request->validated());
        return $this->success(new BusinessAttributeResource($attributes), 'Business attributes updated successfully');
    }
}


