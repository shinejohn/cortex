<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Email;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\EmailCampaign;
use App\Models\EmailTemplate;
use App\Services\EmailGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class CampaignController extends Controller
{
    public function __construct(
        private readonly EmailGeneratorService $emailService
    ) {}

    public function index(Request $request): Response
    {
        $campaigns = EmailCampaign::query()
            ->with('community:id,name')
            ->when($request->community_id, fn($q, $c) => $q->where('community_id', $c))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Admin/Email/Campaigns/Index', [
            'campaigns' => $campaigns,
            'filters' => $request->only(['community_id', 'type', 'status']),
            'communities' => Community::select('id', 'name')->orderBy('name')->get(),
            'types' => ['daily_digest', 'breaking_news', 'weekly_newsletter', 'smb_report', 'custom'],
            'statuses' => ['draft', 'scheduled', 'sending', 'sent', 'cancelled'],
        ]);
    }

    public function show(EmailCampaign $campaign): Response
    {
        $campaign->load(['community', 'template']);

        return Inertia::render('Admin/Email/Campaigns/Show', [
            'campaign' => $campaign,
            'stats' => [
                'open_rate' => $campaign->open_rate,
                'click_rate' => $campaign->click_rate,
                'bounce_rate' => $campaign->delivered_count > 0
                    ? round(($campaign->bounced_count / $campaign->delivered_count) * 100, 2)
                    : 0,
            ],
        ]);
    }

    public function generateDigest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'community_id' => 'required|exists:communities,id',
        ]);

        $community = Community::findOrFail($validated['community_id']);
        $campaign = $this->emailService->generateDailyDigest($community);

        return redirect()
            ->route('admin.email.campaigns.show', $campaign)
            ->with('success', 'Daily digest generated and scheduled.');
    }

    public function generateNewsletter(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'community_id' => 'required|exists:communities,id',
        ]);

        $community = Community::findOrFail($validated['community_id']);
        $campaign = $this->emailService->generateWeeklyNewsletter($community);

        return redirect()
            ->route('admin.email.campaigns.show', $campaign)
            ->with('success', 'Weekly newsletter generated and scheduled.');
    }
}
