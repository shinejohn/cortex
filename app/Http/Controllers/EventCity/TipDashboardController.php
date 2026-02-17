<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventCity\StoreQrFlyerRequest;
use App\Models\Performer;
use App\Services\EventCity\ConversionFunnelService;
use App\Services\EventCity\FanCaptureService;
use App\Services\EventCity\QrFlyerService;
use App\Services\EventCity\TipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class TipDashboardController extends Controller
{
    public function __construct(
        private readonly TipService $tipService,
        private readonly FanCaptureService $fanCaptureService,
        private readonly QrFlyerService $qrFlyerService,
        private readonly ConversionFunnelService $funnelService
    ) {}

    public function index(Request $request): Response
    {
        $performer = $this->getPerformerForUser($request);

        if (! $performer) {
            abort(403, 'You must be a performer to access the tip jar dashboard.');
        }

        return Inertia::render('event-city/dashboard/tip-jar', [
            'performer' => $performer,
            'stats' => $this->tipService->getPerformerTipStats($performer),
            'recentTips' => $this->tipService->getRecentTips($performer, 10),
            'funnelMetrics' => $this->funnelService->getFunnelMetrics($performer),
            'stripePublicKey' => config('services.stripe.key'),
        ]);
    }

    public function fans(Request $request): Response
    {
        $performer = $this->getPerformerForUser($request);

        if (! $performer) {
            abort(403);
        }

        return Inertia::render('event-city/dashboard/tip-jar', [
            'performer' => $performer,
            'fans' => $this->fanCaptureService->getFanList(
                $performer,
                $request->input('source'),
                25
            ),
            'activeTab' => 'fans',
        ]);
    }

    public function qrFlyers(Request $request): Response
    {
        $performer = $this->getPerformerForUser($request);

        if (! $performer) {
            abort(403);
        }

        return Inertia::render('event-city/dashboard/tip-jar', [
            'performer' => $performer,
            'qrFlyers' => $performer->qrFlyers()->latest()->get(),
            'templates' => $this->qrFlyerService->getAvailableTemplates(),
            'activeTab' => 'qr-flyers',
        ]);
    }

    public function generateFlyer(StoreQrFlyerRequest $request): JsonResponse
    {
        $performer = $this->getPerformerForUser($request);

        if (! $performer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $flyer = $this->qrFlyerService->generateFlyer($performer, $request->validated());

        return response()->json(['success' => true, 'flyer' => $flyer]);
    }

    public function exportFans(Request $request): StreamedResponse
    {
        $performer = $this->getPerformerForUser($request);

        if (! $performer) {
            abort(403);
        }

        $csv = $this->fanCaptureService->exportFansCsv($performer);

        return response()->streamDownload(function () use ($csv): void {
            echo $csv;
        }, 'fans-export-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function getPerformerForUser(Request $request): ?Performer
    {
        $user = $request->user();
        $workspaceId = $user->current_workspace_id;

        return Performer::where('workspace_id', $workspaceId)
            ->where('tips_enabled', true)
            ->first()
            ?? Performer::where('created_by', $user->id)->first();
    }
}
