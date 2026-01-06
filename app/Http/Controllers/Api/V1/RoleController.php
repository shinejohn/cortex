<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreRoleRequest;
use App\Http\Requests\Api\V1\UpdateRoleRequest;
use App\Http\Resources\Api\V1\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RoleController extends BaseController
{
    /**
     * List available roles.
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::all();

        return $this->success(RoleResource::collection($roles));
    }

    /**
     * Get role.
     */
    public function show(Role $role): JsonResponse
    {
        return $this->success(new RoleResource($role));
    }

    /**
     * Create custom role.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->validated());

        return $this->success(new RoleResource($role), 'Role created successfully', 201);
    }

    /**
     * Update role permissions.
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->validated());

        return $this->success(new RoleResource($role), 'Role updated successfully');
    }
}


