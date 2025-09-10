<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Events\Registered;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\Workspace\WorkspaceInvitationService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Laravel\Socialite\Facades\Socialite;

final class SocialiteController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirect(string $provider, Request $request)
    {
        if (! $this->hasProvider($provider)) {
            abort(404);
        }

        // Store invitation token in session if present
        $invitationToken = $request->input('invitation');
        if ($invitationToken) {
            session(['socialite_invitation' => $invitationToken]);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the callback from the provider.
     */
    public function callback(string $provider)
    {
        try {
            $socialiteUser = Socialite::driver($provider)->user();

            // Retrieve invitation token from session
            $invitationToken = session('socialite_invitation');

            // Check if user already has a social account
            $socialAccount = SocialAccount::where('provider', $provider)
                ->where('provider_id', $socialiteUser->getId())
                ->first();

            // If we have a social account, get the user
            if ($socialAccount) {
                $user = $socialAccount->user;
                Auth::login($user);

                // Handle invitation for existing user
                return $this->handlePostAuthInvitation($invitationToken, $user);
            }

            // Check if user exists by email
            $user = User::where('email', $socialiteUser->getEmail())->first();

            // If no user with this email, create one
            if (! $user) {
                $user = User::create([
                    'name' => $socialiteUser->getName() ?? $socialiteUser->getNickname() ?? 'User',
                    'email' => $socialiteUser->getEmail(),
                    'password' => Hash::make(Password::random(32)),
                ]);

                event(new Registered($user, $invitationToken));
            }

            // Create social account if it doesn't exist
            if (! $user->socialAccounts()->where('provider', $provider)->exists()) {
                $user->socialAccounts()->create([
                    'provider' => $provider,
                    'provider_id' => $socialiteUser->getId(),
                    'name' => $socialiteUser->getName() ?? $socialiteUser->getNickname(),
                    'token' => $socialiteUser->token,
                    'refresh_token' => $socialiteUser->refreshToken ?? null,
                    'avatar' => $socialiteUser->getAvatar(),
                    'expires_at' => isset($socialiteUser->expiresIn) ? now()->addSeconds($socialiteUser->expiresIn) : null,
                ]);
            }

            Auth::login($user);

            // Handle invitation after login
            return $this->handlePostAuthInvitation($invitationToken, $user);
        } catch (Exception $e) {
            // Clear invitation from session on error
            session()->forget('socialite_invitation');

            return redirect()->route('login')->withErrors([
                'email' => 'Unable to login with '.ucfirst($provider).'. Please try again or use another method.',
            ]);
        }
    }

    protected function hasProvider(string $provider): bool
    {
        return in_array($provider, config('makerkit.auth.socialite.providers'));
    }

    /**
     * Handle invitation after authentication
     */
    private function handlePostAuthInvitation(?string $invitationToken, User $user)
    {
        // Clear invitation from session
        session()->forget('socialite_invitation');

        if ($invitationToken) {
            $invitationService = app(WorkspaceInvitationService::class);
            $result = $invitationService->acceptInvitationByToken($invitationToken, $user);

            $message = $result->wasSuccessful()
                ? 'Successfully joined the workspace!'
                : 'Could not join workspace. The invitation may be invalid or expired.';

            $messageType = $result->wasSuccessful() ? 'success' : 'warning';

            return redirect()->intended(route('dashboard'))
                ->with($messageType, $message);
        }

        // Set current workspace to the first workspace membership if available (normal login flow)
        $firstMembership = $user->workspaceMemberships()->first();
        if ($firstMembership) {
            $user->current_workspace_id = $firstMembership->workspace_id;
            $user->save();
        }

        return redirect()->intended(route('dashboard'));
    }
}
