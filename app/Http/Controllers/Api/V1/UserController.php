<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Users
 * 
 * User management endpoints for viewing, creating, updating, and managing user profiles.
 */
final class UserController extends BaseController
{
    /**
     * List all users (admin only).
     * 
     * @queryParam search string Search by name or email. Example: john
     * @queryParam per_page integer Items per page. Example: 20
     * @queryParam page integer Page number. Example: 1
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [...],
     *   "meta": {
     *     "current_page": 1,
     *     "total": 100
     *   }
     * }
     * 
     * @authenticated
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        // Apply filters
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%');
            });
        }

        $users = $query->paginate($request->get('per_page', 20));

        return $this->paginated($users);
    }

    /**
     * Get user by ID.
     * 
     * @urlParam user string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "John Doe",
     *     "email": "john@example.com"
     *   }
     * }
     * 
     * @authenticated
     */
    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return $this->success(new UserResource($user->load(['workspaces', 'tenant'])));
    }

    /**
     * Get current authenticated user.
     * 
     * Returns the authenticated user's profile with workspaces and tenant information.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "John Doe",
     *     "email": "john@example.com",
     *     "workspaces": [],
     *     "tenant": null
     *   }
     * }
     * 
     * @authenticated
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load(['workspaces', 'tenant'])));
    }

    /**
     * Create new user (admin only).
     * 
     * @bodyParam name string required The user's full name. Example: John Doe
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password (min 8 characters). Example: Password123!
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "User created successfully",
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "John Doe",
     *     "email": "john@example.com"
     *   }
     * }
     * 
     * @authenticated
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        return $this->success(new UserResource($user), 'User created successfully', 201);
    }

    /**
     * Update user profile.
     * 
     * @urlParam user string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The user's full name. Example: John Doe
     * @bodyParam email string The user's email address. Example: john@example.com
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "User updated successfully",
     *   "data": {...}
     * }
     * 
     * @authenticated
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $user->update($request->validated());

        return $this->success(new UserResource($user->load(['workspaces', 'tenant'])), 'User updated successfully');
    }

    /**
     * Delete user (soft delete).
     * 
     * @urlParam user string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     * 
     * @authenticated
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return $this->noContent();
    }

    /**
     * Get user's published posts.
     * 
     * @urlParam user string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
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
    public function posts(Request $request, User $user): JsonResponse
    {
        $this->authorize('view', $user);

        $posts = $user->authoredDayNewsPosts()
            ->where('status', 'published')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($posts);
    }

    /**
     * Get user activity feed.
     * 
     * Returns a feed of user's recent activities (posts, comments, likes, etc.).
     * 
     * @urlParam user string required The user UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": []
     * }
     * 
     * @authenticated
     */
    public function activity(Request $request, User $user): JsonResponse
    {
        $this->authorize('view', $user);

        // TODO: Implement activity feed
        return $this->success([]);
    }
}

