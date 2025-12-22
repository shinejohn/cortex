<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\CrossDomainAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

final class CrossDomainAuthController extends Controller
{
    public function __construct(
        private readonly CrossDomainAuthService $authService
    ) {}

    /**
     * Sync authentication from another domain
     */
    public function sync(Request $request): RedirectResponse
    {
        $token = $request->query('token');
        $returnUrl = $request->query('return', '/');
        $currentDomain = $request->getHost();

        if (!$token) {
            Log::warning('Cross-domain auth sync attempted without token', [
                'domain' => $currentDomain,
                'ip' => $request->ip(),
            ]);

            return redirect($returnUrl)->with('error', 'Invalid authentication token.');
        }

        // Validate token and get user
        $user = $this->authService->validateAndUseToken($token, $currentDomain);

        if (!$user) {
            Log::warning('Cross-domain auth sync failed - invalid token', [
                'domain' => $currentDomain,
                'ip' => $request->ip(),
            ]);

            return redirect($returnUrl)->with('error', 'Authentication token expired or invalid.');
        }

        // Log the user in
        Auth::login($user);

        // Regenerate session to prevent fixation attacks
        $request->session()->regenerate();

        // Clear cross-domain auth URLs from session after successful sync
        $request->session()->forget('cross_domain_auth_urls');
        $request->session()->forget('cross_domain_auth_token');

        Log::info('Cross-domain auth sync successful', [
            'user_id' => $user->id,
            'domain' => $currentDomain,
        ]);

        // Return a simple success response (for iframe) or redirect (for direct access)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' || $request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect($returnUrl)->with('success', 'Successfully logged in.');
    }

    /**
     * Handle logout sync across domains
     */
    public function logoutSync(Request $request): RedirectResponse
    {
        $currentDomain = $request->getHost();
        $returnUrl = $request->query('return', '/');

        // Logout current session
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Clear logout URLs from session
        $request->session()->forget('cross_domain_logout_urls');

        Log::info('Cross-domain logout sync', [
            'domain' => $currentDomain,
        ]);

        // Return a simple success response (for iframe) or redirect (for direct access)
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' || $request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect($returnUrl)->with('success', 'Successfully logged out.');
    }
}
