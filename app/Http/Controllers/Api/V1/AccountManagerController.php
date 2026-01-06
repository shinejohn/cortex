<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreAccountManagerRequest;
use App\Http\Requests\Api\V1\UpdateAccountManagerRequest;
use App\Http\Resources\Api\V1\AccountManagerResource;
use App\Models\AccountManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AccountManagerController extends BaseController
{
    /**
     * List account managers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AccountManager::query();

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $managers = $query->with(['tenant', 'user'])->paginate($request->get('per_page', 20));

        return $this->paginated($managers);
    }

    /**
     * Get account manager.
     */
    public function show(AccountManager $accountManager): JsonResponse
    {
        return $this->success(new AccountManagerResource($accountManager->load(['tenant', 'user'])));
    }

    /**
     * Assign account manager.
     */
    public function store(StoreAccountManagerRequest $request): JsonResponse
    {
        $manager = AccountManager::create($request->validated());

        return $this->success(new AccountManagerResource($manager->load(['tenant', 'user'])), 'Account manager assigned successfully', 201);
    }

    /**
     * Update account manager.
     */
    public function update(UpdateAccountManagerRequest $request, AccountManager $accountManager): JsonResponse
    {
        $accountManager->update($request->validated());

        return $this->success(new AccountManagerResource($accountManager->load(['tenant', 'user'])), 'Account manager updated successfully');
    }

    /**
     * Get manager's clients.
     */
    public function clients(AccountManager $accountManager): JsonResponse
    {
        // TODO: Implement client relationship
        return $this->success([]);
    }
}


