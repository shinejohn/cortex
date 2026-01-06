<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Requests\Api\V1\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\ResetPasswordRequest;
use App\Http\Requests\Api\V1\MagicLinkRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

/**
 * @group Authentication
 * 
 * Authentication endpoints for user registration, login, password management, and session management.
 */
final class AuthController extends BaseController
{
    /**
     * Register a new user account.
     * 
     * @bodyParam name string required The user's full name. Example: John Doe
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password (min 8 characters). Example: Password123!
     * @bodyParam password_confirmation string required Password confirmation. Example: Password123!
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "User registered successfully",
     *   "data": {
     *     "user": {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "name": "John Doe",
     *       "email": "john@example.com"
     *     },
     *     "token": "1|randomtokenstring"
     *   }
     * }
     * 
     * @response 422 {
     *   "success": false,
     *   "message": "Validation Failed",
     *   "errors": {
     *     "email": ["The email has already been taken."]
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'User registered successfully', 201);
    }

    /**
     * Authenticate user and create access token.
     * 
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password. Example: Password123!
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "user": {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "name": "John Doe",
     *       "email": "john@example.com"
     *     },
     *     "token": "1|randomtokenstring"
     *   }
     * }
     * 
     * @response 422 {
     *   "success": false,
     *   "message": "Validation Failed",
     *   "errors": {
     *     "email": ["The provided credentials are incorrect."]
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Login successful');
    }

    /**
     * Logout user (revoke current access token).
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Logged out successfully",
     *   "data": null
     * }
     * 
     * @authenticated
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * Logout from all devices (revoke all tokens).
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Logged out from all devices successfully",
     *   "data": null
     * }
     * 
     * @authenticated
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return $this->success(null, 'Logged out from all devices successfully');
    }

    /**
     * Refresh authentication token.
     * 
     * Revokes the current token and issues a new one.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Token refreshed successfully",
     *   "data": {
     *     "token": "2|newrandomtokenstring"
     *   }
     * }
     * 
     * @authenticated
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        $token = $request->user()->createToken('api-token')->plainTextToken;

        return $this->success([
            'token' => $token,
        ], 'Token refreshed successfully');
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
    public function user(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load(['workspaces', 'tenant'])));
    }

    /**
     * Request password reset link.
     * 
     * Sends a password reset link to the user's email address.
     * 
     * @bodyParam email string required The user's email address. Example: john@example.com
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Password reset link sent to your email",
     *   "data": null
     * }
     * 
     * @unauthenticated
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success(null, 'Password reset link sent to your email');
        }

        return $this->error('Unable to send password reset link', 'PASSWORD_RESET_ERROR');
    }

    /**
     * Reset password with token.
     * 
     * Resets the user's password using the token from the password reset email.
     * 
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam token string required The password reset token from email.
     * @bodyParam password string required The new password (min 8 characters). Example: NewPassword123!
     * @bodyParam password_confirmation string required Password confirmation. Example: NewPassword123!
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Password reset successfully",
     *   "data": null
     * }
     * 
     * @unauthenticated
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, 'Password reset successfully');
        }

        return $this->error('Unable to reset password', 'PASSWORD_RESET_ERROR');
    }

    /**
     * Request magic link for passwordless authentication.
     * 
     * @bodyParam email string required The user's email address. Example: john@example.com
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Magic link sent to your email",
     *   "data": null
     * }
     * 
     * @unauthenticated
     */
    public function requestMagicLink(MagicLinkRequest $request): JsonResponse
    {
        // TODO: Implement magic link logic
        return $this->error('Magic link not yet implemented', 'NOT_IMPLEMENTED');
    }

    /**
     * Verify magic link token.
     * 
     * @bodyParam token string required The magic link token from email.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Authentication successful",
     *   "data": {
     *     "user": {...},
     *     "token": "1|randomtokenstring"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function verifyMagicLink(Request $request): JsonResponse
    {
        // TODO: Implement magic link verification
        return $this->error('Magic link verification not yet implemented', 'NOT_IMPLEMENTED');
    }

    /**
     * Social login (OAuth).
     * 
     * Authenticate using OAuth providers (Google, Facebook, etc.).
     * 
     * @urlParam provider string required The OAuth provider. Example: google
     * @bodyParam access_token string required The OAuth access token from the provider.
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "user": {...},
     *     "token": "1|randomtokenstring"
     *   }
     * }
     * 
     * @unauthenticated
     */
    public function socialLogin(Request $request, string $provider): JsonResponse
    {
        // TODO: Implement social login
        return $this->error('Social login not yet implemented', 'NOT_IMPLEMENTED');
    }

    /**
     * List active sessions.
     * 
     * Returns all active authentication tokens for the current user.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "api-token",
     *       "last_used_at": "2025-12-29T10:00:00Z",
     *       "created_at": "2025-12-28T10:00:00Z"
     *     }
     *   ]
     * }
     * 
     * @authenticated
     */
    public function sessions(Request $request): JsonResponse
    {
        $sessions = $request->user()->tokens()->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->toISOString(),
                'created_at' => $token->created_at->toISOString(),
            ];
        });

        return $this->success($sessions);
    }

    /**
     * Revoke a specific session.
     * 
     * Revokes a specific authentication token by ID.
     * 
     * @urlParam id integer required The session/token ID. Example: 1
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Session revoked successfully",
     *   "data": null
     * }
     * 
     * @response 404 {
     *   "success": false,
     *   "message": "Session not found"
     * }
     * 
     * @authenticated
     */
    public function revokeSession(Request $request, int $id): JsonResponse
    {
        $token = $request->user()->tokens()->find($id);

        if (!$token) {
            return $this->notFound('Session not found');
        }

        $token->delete();

        return $this->success(null, 'Session revoked successfully');
    }
}

