<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Events\Registered;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Notifications\MagicLinkNotification;
use App\Services\CrossDomainAuthService;
use App\Services\Workspace\WorkspaceInvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use MagicLink\Actions\LoginAction;
use MagicLink\MagicLink;

final class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private readonly CrossDomainAuthService $crossDomainAuthService
    ) {}
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('event-city/auth/login', [
            'providers' => config('makerkit.auth.socialite.providers'),
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'invitation' => $request->query('invitation'),
        ]);
    }

    public function createMagicLink(Request $request): Response
    {
        return Inertia::render('event-city/auth/magic-link', [
            'status' => $request->session()->get('status'),
            'error' => $request->session()->get('error'),
            'invitation' => $request->query('invitation'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        // Handle workspace invitation if present
        $invitationToken = $request->input('invitation');

        $message = null;
        $messageType = null;

        if ($invitationToken) {
            $invitationService = app(WorkspaceInvitationService::class);
            $result = $invitationService->acceptInvitationByToken($invitationToken, $user);

            $message = $result->wasSuccessful()
                ? 'Successfully joined the workspace!'
                : 'Could not join workspace. The invitation may be invalid or expired.';

            $messageType = $result->wasSuccessful() ? 'success' : 'warning';
        }

        // Set current workspace to the first workspace membership if available (normal login flow)
        $firstMembership = $user->workspaceMemberships()->first();
        if ($firstMembership) {
            $user->current_workspace_id = $firstMembership->workspace_id;
            $user->save();
        }

        // Generate cross-domain auth token and sync to other domains
        $this->syncAuthToOtherDomains($user, $request);

        return redirect()->intended(route('home', absolute: false))
            ->with($messageType, $message);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Sync logout to other domains
        $this->syncLogoutToOtherDomains($request);

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Sync authentication to other domains after login
     */
    private function syncAuthToOtherDomains(User $user, Request $request): void
    {
        try {
            $sourceDomain = $request->getHost();
            $result = $this->crossDomainAuthService->generateToken($user, $sourceDomain);
            
            $tokenRecord = $result['token_record'];
            $plainToken = $result['plain_token'];
            
            // Generate auth URLs for other domains
            $authUrls = $this->crossDomainAuthService->getAuthUrls(
                $plainToken,
                $sourceDomain,
                $request->get('return', '/')
            );

            // Store token and URLs in session for frontend to handle redirects
            $request->session()->put('cross_domain_auth_token', $plainToken);
            $request->session()->put('cross_domain_auth_urls', $authUrls);
        } catch (\Exception $e) {
            // Log error but don't fail login
            \Log::error('Failed to sync auth to other domains', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
        }
    }

    /**
     * Sync logout to other domains
     */
    private function syncLogoutToOtherDomains(Request $request): void
    {
        try {
            $currentDomain = $request->getHost();
            $allDomains = $this->crossDomainAuthService->getAllDomains();
            $targetDomains = array_filter($allDomains, fn($domain) => $domain !== $currentDomain);

            $logoutUrls = [];
            foreach ($targetDomains as $domain) {
                $protocol = config('app.env') === 'local' ? 'http' : 'https';
                $logoutUrls[] = "{$protocol}://{$domain}/cross-domain-auth/logout-sync?return=" . urlencode('/');
            }

            // Store logout URLs in session for frontend
            $request->session()->put('cross_domain_logout_urls', $logoutUrls);
        } catch (\Exception $e) {
            \Log::error('Failed to sync logout to other domains', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function generateMagicLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $invitationToken = $request->query('invitation');

        $user = User::firstWhere('email', $request->email);

        if (! $user) {
            $user = User::create([
                'name' => explode('@', $request->email)[0],
                'email' => $request->email,
            ]);

            event(new Registered($user, $invitationToken));
        }

        $action = new LoginAction($user);

        // Use custom redirect handler if invitation is present
        if ($invitationToken) {
            $action->response(redirect()->route('auth.magic-link.callback', ['invitation' => $invitationToken]));
        } else {
            $action->response(redirect('/home'));
        }

        $magicLink = MagicLink::create($action)->url;

        Notification::send($user, new MagicLinkNotification($magicLink));

        return redirect()->back()->with('status', 'Magic link sent to user.')
            ->with('invitation', $invitationToken);
    }

    /**
     * Handle magic link callback with invitation processing
     */
    public function magicLinkCallback(Request $request): RedirectResponse
    {
        // User should already be authenticated by the magic link action
        if (! Auth::check()) {
            return redirect()->route('login')->withErrors(['error' => 'Authentication required']);
        }

        $user = Auth::user();
        $invitationToken = $request->query('invitation');

        $message = null;
        $messageType = null;

        if ($invitationToken) {
            $invitationService = app(WorkspaceInvitationService::class);
            $result = $invitationService->acceptInvitationByToken($invitationToken, $user);

            $message = $result->wasSuccessful()
                ? 'Successfully joined the workspace!'
                : 'Could not join workspace. The invitation may be invalid or expired.';

            $messageType = $result->wasSuccessful() ? 'success' : 'warning';
        }

        // Set current workspace to the first workspace membership if available (normal login flow)
        $firstMembership = $user->workspaceMemberships()->first();
        if ($firstMembership) {
            $user->current_workspace_id = $firstMembership->workspace_id;
            $user->save();
        }

        // Generate cross-domain auth token and sync to other domains
        $this->syncAuthToOtherDomains($user, $request);

        return redirect()->route('home')
            ->with($messageType, $message);
    }
}
