<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\Region;
use App\Models\User;
use App\Services\LocationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

final class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    public function __construct(
        private readonly LocationService $locationService
    ) {}

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $workspaces = $this->getUserWorkspacesData($user);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => mb_trim($message), 'author' => mb_trim($author)],
            'auth' => [
                'user' => $request->user(),
                'passwordEnabled' => config('makerkit.auth.password.enabled'),
                'magicLinkEnabled' => config('makerkit.auth.magiclink.enabled'),
            ],
            'workspaces' => $workspaces,
            'notifications' => fn () => $this->getUserNotifications($user),
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appDomain' => config('app.current_domain', 'event-city'),
            'analytics' => [
                'ga4Id' => config('analytics.ga4.'.config('app.current_domain', 'event-city')),
            ],
            'location' => $this->getLocationData($request),
            'crossDomainAuth' => [
                'urls' => $request->session()->get('cross_domain_auth_urls', []),
                'logoutUrls' => $request->session()->get('cross_domain_logout_urls', []),
            ],
        ];
    }

    private function getUserWorkspacesData(?User $user): array
    {
        if (! $user) {
            return [[], null];
        }

        $memberships = $user->workspaceMemberships()
            ->with('workspace')
            ->get();

        $workspaces = $memberships->map(fn ($membership) => [
            'id' => $membership->workspace->id,
            'name' => $membership->workspace->name,
            'role' => $membership->role,
            'logo' => $membership->workspace->logo,
        ])->toArray();

        $currentWorkspace = null;
        if ($user->current_workspace_id && $user->currentWorkspace) {
            $currentMembership = $memberships->firstWhere('workspace_id', $user->currentWorkspace->id);

            $currentWorkspace = [
                'id' => $user->currentWorkspace->id,
                'name' => $user->currentWorkspace->name,
                'role' => $currentMembership ? $currentMembership->role : null,
                'logo' => $user->currentWorkspace->logo,
                'permissions' => $currentMembership ? $currentMembership->permissions : [],
            ];
        }

        return [
            'enabled' => config('makerkit.workspaces.enabled'),
            'all' => $workspaces,
            'current' => $currentWorkspace,
            'canCreateWorkspaces' => config('makerkit.workspaces.can_create_workspaces'),
        ];
    }

    private function getUserNotifications(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $notifications = Notification::forUser($user->id)
            ->unread()
            ->latest()
            ->limit(10)
            ->get();

        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return [
            'notifications' => $notifications->toArray(),
            'unread_count' => $unreadCount,
        ];
    }

    private function getLocationData(Request $request): array
    {
        $region = $request->attributes->get('detected_region');
        $confirmed = $this->locationService->hasUserConfirmedLocation();

        return [
            'current_region' => $region ? $this->formatRegion($region) : null,
            'confirmed' => $confirmed,
        ];
    }

    private function formatRegion(Region $region): array
    {
        return [
            'id' => $region->id,
            'name' => $region->name,
            'slug' => $region->slug,
            'type' => $region->type,
            'full_name' => $region->full_name,
            'latitude' => $region->latitude,
            'longitude' => $region->longitude,
        ];
    }
}
