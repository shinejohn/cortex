<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\LegalNotice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class LegalNoticeController extends Controller
{
    /**
     * Display legal notices listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $type = $request->get('type', 'all');
        $status = $request->get('status', 'active');
        $search = $request->get('search', '');

        $query = LegalNotice::query()
            ->with(['user', 'regions'])
            ->orderBy('publish_date', 'desc');

        // Filter by status
        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'expires_soon') {
            $query->expiresSoon();
        } else {
            $query->where('status', $status);
        }

        // Filter by type
        if ($type !== 'all') {
            $query->byType($type);
        }

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('case_number', 'like', "%{$search}%");
            });
        }

        $notices = $query->paginate(20)->withQueryString();

        return Inertia::render('day-news/legal-notices/index', [
            'notices' => $notices,
            'filters' => [
                'type' => $type,
                'status' => $status,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show legal notice creation form
     */
    public function create(): Response
    {
        return Inertia::render('day-news/legal-notices/create');
    }

    /**
     * Store new legal notice
     */
    public function store(\App\Http\Requests\DayNews\StoreLegalNoticeRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $notice = LegalNotice::create([
            'user_id' => $request->user()->id,
            'workspace_id' => $request->user()->currentWorkspace?->id,
            'type' => $validated['type'],
            'case_number' => $validated['case_number'] ?? null,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'court' => $validated['court'] ?? null,
            'publish_date' => $validated['publish_date'],
            'expiry_date' => $validated['expiry_date'] ?? null,
            'status' => 'active',
            'metadata' => $validated['metadata'] ?? null,
        ]);

        // Attach regions
        if (!empty($validated['region_ids'])) {
            $notice->regions()->attach($validated['region_ids']);
        } else {
            $currentRegion = $request->attributes->get('detected_region');
            if ($currentRegion) {
                $notice->regions()->attach($currentRegion->id);
            }
        }

        return redirect()
            ->route('day-news.legal-notices.show', $notice->id)
            ->with('success', 'Legal notice published successfully!');
    }

    /**
     * Display single legal notice
     */
    public function show(Request $request, LegalNotice $notice): Response
    {
        $notice->load(['user', 'regions']);
        $notice->incrementViewsCount();

        return Inertia::render('day-news/legal-notices/show', [
            'notice' => $notice,
        ]);
    }
}

