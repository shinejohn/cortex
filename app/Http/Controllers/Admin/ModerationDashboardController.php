<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentComplaint;
use App\Models\ContentInterventionLog;
use App\Models\ContentModerationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ModerationDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $dateRange = $request->get('range', '7d');
        $since = match ($dateRange) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => now()->subDays(7),
        };

        $totalModerated = ContentModerationLog::where('created_at', '>=', $since)->count();
        $totalPassed = ContentModerationLog::passed()->where('created_at', '>=', $since)->count();
        $totalFailed = ContentModerationLog::failed()->where('created_at', '>=', $since)->count();

        return Inertia::render('Admin/Moderation/Dashboard', [
            'stats' => [
                'total_moderated' => $totalModerated,
                'total_passed' => $totalPassed,
                'total_failed' => $totalFailed,
                'fail_rate' => $totalModerated > 0 ? round(($totalFailed / $totalModerated) * 100, 1) : 0,
                'total_complaints' => ContentComplaint::where('created_at', '>=', $since)->count(),
                'active_interventions' => ContentInterventionLog::where('created_at', '>=', $since)
                    ->where('outcome', '!=', ContentInterventionLog::OUTCOME_PROTECTED)
                    ->count(),
                'ai_failures' => ContentModerationLog::where('created_at', '>=', $since)
                    ->where('violation_explanation', 'like', 'AI_FAILURE:%')
                    ->count(),
            ],
            'violationBreakdown' => ContentModerationLog::failed()
                ->where('created_at', '>=', $since)
                ->selectRaw('violation_section, count(*) as count')
                ->groupBy('violation_section')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'recentFailures' => ContentModerationLog::failed()
                ->where('created_at', '>=', $since)
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->paginate(25),
            'contentTypeBreakdown' => ContentModerationLog::where('created_at', '>=', $since)
                ->selectRaw('content_type, decision, count(*) as count')
                ->groupBy('content_type', 'decision')
                ->get(),
            'dateRange' => $dateRange,
        ]);
    }

    public function show(string $contentType, string $contentId): Response
    {
        $logs = ContentModerationLog::where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get();

        $complaints = ContentComplaint::where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->with('complainant:id,name,email')
            ->get();

        $interventions = ContentInterventionLog::where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->get();

        return Inertia::render('Admin/Moderation/ContentDetail', [
            'contentType' => $contentType,
            'contentId' => $contentId,
            'logs' => $logs,
            'complaints' => $complaints,
            'interventions' => $interventions,
        ]);
    }

    public function override(Request $request, string $contentType, string $contentId)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,remove',
            'reason' => 'required|string|max:1000',
        ]);

        $content = $this->resolveContent($contentType, $contentId);
        if (! $content) {
            return back()->withErrors(['content' => 'Content not found']);
        }

        $newStatus = match ($validated['action']) {
            'approve' => 'published',
            'reject' => 'moderation_rejected',
            'remove' => 'moderation_removed',
        };

        $content->update([
            'moderation_status' => $newStatus,
            'moderation_removal_reason' => $validated['action'] !== 'approve'
                ? 'Admin override: '.$validated['reason'] : null,
        ]);

        ContentModerationLog::create([
            'content_type' => $contentType,
            'content_id' => (string) $content->id,
            'user_id' => auth()->id(),
            'trigger' => 'admin_override',
            'content_snapshot' => 'Admin override by '.auth()->user()->name,
            'decision' => $validated['action'] === 'approve' ? 'pass' : 'fail',
            'violation_explanation' => 'ADMIN OVERRIDE: '.$validated['reason'],
            'ai_model' => 'human',
            'processing_ms' => 0,
        ]);

        return back()->with('success', 'Moderation override applied.');
    }

    public function complaints(Request $request): Response
    {
        $complaints = ContentComplaint::with(['complainant:id,name,email'])
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Admin/Moderation/Complaints', [
            'complaints' => $complaints,
        ]);
    }

    public function interventions(Request $request): Response
    {
        $interventions = ContentInterventionLog::orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Admin/Moderation/Interventions', [
            'interventions' => $interventions,
        ]);
    }

    public function analytics(Request $request): Response
    {
        return Inertia::render('Admin/Moderation/Analytics', [
            'dateRange' => $request->get('range', '7d'),
        ]);
    }

    private function resolveContent(string $contentType, string $contentId)
    {
        return match ($contentType) {
            'day_news_post' => \App\Models\DayNewsPost::find($contentId),
            'event' => \App\Models\Event::find($contentId),
            'comment' => \App\Models\ArticleComment::find($contentId),
            default => null,
        };
    }
}
