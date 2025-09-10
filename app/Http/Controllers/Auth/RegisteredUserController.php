<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Events\Registered;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Workspace\WorkspaceInvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

final class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/register', [
            'providers' => config('makerkit.auth.socialite.providers'),
            'magicLinkEnabled' => config('makerkit.auth.magiclink.enabled'),
            'invitation' => $request->query('invitation'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', Rules\Password::defaults()],
            'invitation' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user, $request->invitation));

        Auth::login($user);

        // Handle workspace invitation if present
        return $this->handleWorkspaceInvitation($request->invitation, $user);
    }

    private function handleWorkspaceInvitation(?string $invitationToken, User $user): RedirectResponse
    {
        if ($invitationToken) {
            $invitationService = app(WorkspaceInvitationService::class);
            $result = $invitationService->acceptInvitationByToken($invitationToken, $user);

            if ($result->wasSuccessful()) {
                return redirect()->route('home')
                    ->with('success', 'Welcome! You have successfully joined the workspace.');
            }

            return redirect()->route('home')
                ->with('warning', 'Account created successfully, but could not join workspace. The invitation may be invalid or expired.');
        }

        return redirect()->route('home');
    }
}
