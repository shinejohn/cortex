<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreTenantRequest;
use App\Http\Requests\Api\V1\UpdateTenantRequest;
use App\Http\Resources\Api\V1\TenantResource;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Tenants
 * 
 * Tenant management endpoints for multi-tenant CRM operations.
 */
final class TenantController extends BaseController
{
    /**
     * List tenants (super admin only).
     * 
     * @queryParam is_active boolean Filter by active status. Example: true
     * @queryParam per_page integer Items per page. Example: 20
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {...}
     * }
     * 
     * @authenticated
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Tenant::class);

        $query = Tenant::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $tenants = $query->paginate($request->get('per_page', 20));

        return $this->paginated($tenants);
    }

    /**
     * Get tenant details.
     * 
     * @urlParam tenant string required The tenant UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Tenant Name",
     *     "is_active": true
     *   }
     * }
     * 
     * @authenticated
     */
    public function show(Tenant $tenant): JsonResponse
    {
        $this->authorize('view', $tenant);

        return $this->success(new TenantResource($tenant));
    }

    /**
     * Create tenant.
     * 
     * @bodyParam name string required The tenant name. Example: Acme Corp
     * @bodyParam domain string The tenant domain. Example: acme.example.com
     * @bodyParam is_active boolean Whether the tenant is active. Example: true
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Tenant created successfully",
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Acme Corp"
     *   }
     * }
     * 
     * @authenticated
     */
    public function store(StoreTenantRequest $request): JsonResponse
    {
        $this->authorize('create', Tenant::class);

        $tenant = Tenant::create($request->validated());

        return $this->success(new TenantResource($tenant), 'Tenant created successfully', 201);
    }

    /**
     * Update tenant settings.
     * 
     * @urlParam tenant string required The tenant UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The tenant name. Example: Updated Tenant Name
     * @bodyParam is_active boolean Whether the tenant is active. Example: true
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Tenant updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateTenantRequest $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $this->authorize('update', $tenant);

        $tenant->update($request->validated());

        return $this->success(new TenantResource($tenant), 'Tenant updated successfully');
    }

    /**
     * Delete tenant.
     * 
     * @urlParam tenant string required The tenant UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204 No Content
     * 
     * @authenticated
     */
    public function destroy(string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $this->authorize('delete', $tenant);

        $tenant->delete();

        return $this->noContent();
    }
}
