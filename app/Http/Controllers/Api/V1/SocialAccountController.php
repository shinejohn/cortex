<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreSocialAccountRequest;
use App\Http\Resources\Api\V1\SocialAccountResource;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SocialAccountController extends BaseController
{
    /**
     * List connected social accounts.
     */
    public function index(Request $request, User $user): JsonResponse
    {
        $this->authorize('view', $user);

        $accounts = $user->socialAccounts;

        return $this->success(SocialAccountResource::collection($accounts));
    }

    /**
     * Connect social account.
     */
    public function store(StoreSocialAccountRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $account = $user->socialAccounts()->create($request->validated());

        return $this->success(new SocialAccountResource($account), 'Social account connected successfully', 201);
    }

    /**
     * Disconnect social account.
     */
    public function destroy(SocialAccount $socialAccount): JsonResponse
    {
        $this->authorize('delete', $socialAccount);

        $socialAccount->delete();

        return $this->noContent();
    }
}


