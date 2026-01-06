<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Crm;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\StoreSmbBusinessRequest;
use App\Http\Requests\Api\V1\UpdateSmbBusinessRequest;
use App\Http\Resources\Api\V1\Crm\SmbBusinessResource;
use App\Models\SmbBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SmbBusinessController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = SmbBusiness::query()->with(['tenant']);

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('fibonacco_status')) {
            $query->where('fibonacco_status', $request->fibonacco_status);
        }

        $businesses = $query->orderBy('display_name')->paginate($request->get('per_page', 20));

        return $this->paginated($businesses);
    }

    public function show(SmbBusiness $smbBusiness): JsonResponse
    {
        return $this->success(new SmbBusinessResource($smbBusiness->load(['tenant', 'customers', 'hours', 'photos', 'reviews'])));
    }

    public function store(StoreSmbBusinessRequest $request): JsonResponse
    {
        $business = SmbBusiness::create($request->validated());
        return $this->success(new SmbBusinessResource($business), 'SMB business created successfully', 201);
    }

    public function update(UpdateSmbBusinessRequest $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('update', $smbBusiness);
        $smbBusiness->update($request->validated());
        return $this->success(new SmbBusinessResource($smbBusiness), 'SMB business updated successfully');
    }

    public function destroy(SmbBusiness $smbBusiness): JsonResponse
    {
        $this->authorize('delete', $smbBusiness);
        $smbBusiness->delete();
        return $this->noContent();
    }

    public function customers(Request $request, SmbBusiness $smbBusiness): JsonResponse
    {
        $customers = $smbBusiness->customers()->paginate($request->get('per_page', 20));
        return $this->paginated($customers);
    }

    public function search(Request $request): JsonResponse
    {
        $query = SmbBusiness::query();

        if ($request->has('q')) {
            $query->where('display_name', 'like', '%'.$request->q.'%');
        }

        $businesses = $query->limit(20)->get();
        return $this->success(SmbBusinessResource::collection($businesses));
    }
}


