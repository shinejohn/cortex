<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Region;
use Inertia\Inertia;
use Inertia\Response;

final class ContentCreatorStubController extends Controller
{
    public function adCreate(): Response
    {
        return $this->renderStub('ad', 'Ad Campaign', [
            'AI-generated ad copy from business profile',
            'Compliance checking for advertising standards',
            'Creative builder for all ad sizes (728x90, 300x600, 300x250, 320x50)',
            'Audience targeting recommendations',
            'Budget optimization and performance forecasting',
        ]);
    }

    public function announcementCreate(): Response
    {
        return $this->renderStub('announcement', 'Announcement', [
            'AI-assisted announcement writing',
            'Auto-classification: business update, community notice, government announcement',
            'Multi-region targeting based on scope',
            'Cross-platform routing to Day.News and DowntownGuide',
        ]);
    }

    public function couponCreate(): Response
    {
        return $this->renderStub('coupon', 'Coupon / Promotion', [
            'AI-generated promotional copy from deal details',
            'Automatic promo code generation',
            'Expiration date management',
            'Regional targeting for distribution',
            'Redemption tracking integration',
        ]);
    }

    public function classifiedCreate(): Response
    {
        return $this->renderStub('classified', 'Classified Listing', [
            'AI-optimized listing title and description from brief input',
            'Auto-categorization of listing type',
            'Market-based pricing suggestions',
            'SEO-optimized listing for search visibility',
            'Image enhancement suggestions',
        ]);
    }

    public function legalNoticeCreate(): Response
    {
        return $this->renderStub('legal_notice', 'Legal Notice / Public Notice', [
            'Template-based legal notice creation',
            'Compliance verification for jurisdictional requirements',
            'Multi-publication scheduling',
            'Proof of publication generation',
            'Auto-routing to appropriate community publications',
        ]);
    }

    private function renderStub(string $contentType, string $label, array $plannedFeatures): Response
    {
        $regions = Region::orderBy('name')->get(['id', 'name', 'type', 'metadata']);

        return Inertia::render('Creator/ComingSoon', [
            'contentType' => $contentType,
            'contentLabel' => $label,
            'plannedFeatures' => $plannedFeatures,
            'regions' => $regions,
        ]);
    }
}
