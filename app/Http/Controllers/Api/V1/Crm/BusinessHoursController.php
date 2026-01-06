<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreBusinessHoursRequest;
use App\Http\Requests\Api\V1\UpdateBusinessHoursRequest;
use App\Http\Resources\Api\V1\Crm\BusinessHoursResource;
use App\Models\BusinessHours;
use App\Models\SmbBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessHoursController extends BaseController
{
    public function index(Request $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $hours = $smbBusiness->hours;
        return $this->success($hours ? new BusinessHoursResource($hours) : null);
    }

    public function update(UpdateBusinessHoursRequest $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('update', $smbBusiness);
        $hours = $smbBusiness->hours()->updateOrCreate(['smb_business_id' => $smbBusiness->id], $request->validated());
        return $this->success(new BusinessHoursResource($hours), 'Business hours updated successfully');
    }
}


