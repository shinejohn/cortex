<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GamificationService;
use App\Services\LoyaltyService;
use App\Services\ProfileService;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService,
        private readonly GamificationService $gamificationService,
        private readonly LoyaltyService $loyaltyService,
        private readonly ReferralService $referralService
    ) {}

    /**
     * Display user profile
     */
    public function show(Request $request, User $user): Response
    {
        $profile = $this->profileService->getProfile($user);
        $stats = $this->profileService->getStats($user);
        $activity = $this->profileService->getActivity($user, 10)->map(function ($item) {
            return [
                'id' => $item['id'] ?? uniqid(),
                'type' => $item['type'] ?? 'activity',
                'description' => $item['description'] ?? 'Activity',
                'created_at' => $item['created_at'] ?? now()->toISOString(),
            ];
        });

        // Get gamification data
        $userLevel = $this->gamificationService->getUserLevel($user);
        $achievements = $this->gamificationService->getUserAchievements($user);
        $points = $user->total_points ?? 0;

        // Get loyalty programs
        $loyaltyPrograms = $this->loyaltyService->getUserPrograms($user->id);

        // Get referrals
        $referrals = $this->referralService->getReferrals($user);

        return Inertia::render('downtown-guide/profile/show', [
            'user' => $profile,
            'stats' => $stats,
            'activity' => $activity,
            'level' => $userLevel,
            'achievements' => $achievements,
            'points' => $points,
            'loyaltyPrograms' => $loyaltyPrograms,
            'referrals' => $referrals,
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Display current user's profile
     */
    public function me(Request $request): Response
    {
        return $this->show($request, $request->user());
    }

    /**
     * Update user profile
     */
    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $this->profileService->updateProfile($request->user(), $validated);

        return redirect()
            ->route('downtown-guide.profile.me')
            ->with('success', 'Profile updated successfully!');
    }
}

