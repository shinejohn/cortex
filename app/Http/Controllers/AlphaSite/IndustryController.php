<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use App\Services\BusinessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class IndustryController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService
    ) {}

    /**
     * List all industries
     */
    public function index(): Response
    {
        $industries = Industry::active()
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('alphasite/industries/index', [
            'industries' => $industries,
        ]);
    }

    /**
     * Show industry page
     */
    public function show(string $slug, Request $request): Response
    {
        $industry = Industry::where('slug', $slug)->where('is_active', true)->firstOrFail();
        
        $businesses = $this->businessService->getByIndustry(
            $slug,
            $request->input('city'),
            $request->input('state'),
            24
        );

        return Inertia::render('alphasite/industries/show', [
            'industry' => $industry,
            'businesses' => $businesses,
            'filters' => $request->only(['city', 'state']),
        ]);
    }

    /**
     * Industry by location
     */
    public function byLocation(string $slug, string $city, string $state, Request $request): Response
    {
        $request->merge(['city' => $city, 'state' => $state]);
        return $this->show($slug, $request);
    }
}
