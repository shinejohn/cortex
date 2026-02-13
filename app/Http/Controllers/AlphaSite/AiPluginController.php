<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class AiPluginController extends Controller
{
    /**
     * Return ai-plugin.json for the resolved business or platform.
     */
    public function show(Request $request): JsonResponse
    {
        /** @var Business|null $business */
        $business = $request->attributes->get('resolved_business');

        if ($business) {
            return response()->json($this->buildBusinessPlugin($business));
        }

        return response()->json($this->buildPlatformPlugin());
    }

    /**
     * Build ai-plugin.json for a specific business.
     *
     * @return array<string, mixed>
     */
    private function buildBusinessPlugin(Business $business): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');

        return [
            'schema_version' => 'v1',
            'name_for_human' => $business->name,
            'name_for_model' => Str::slug($business->name),
            'description_for_human' => $business->description ?? $business->name.' on AlphaSite',
            'description_for_model' => 'Get information about '.$business->name
                .($business->city ? ' located in '.$business->city.', '.$business->state : '')
                .'. Includes business details, hours, reviews, and contact information.',
            'auth' => [
                'type' => 'none',
            ],
            'api' => [
                'type' => 'openapi',
                'url' => 'https://'.$domain.'/business/'.$business->slug.'/openapi.json',
            ],
            'logo_url' => 'https://'.$domain.'/images/alphasite-logo.png',
            'contact_email' => $business->email ?? 'support@alphasite.com',
            'legal_info_url' => 'https://'.$domain.'/legal',
        ];
    }

    /**
     * Build ai-plugin.json for the AlphaSite platform.
     *
     * @return array<string, mixed>
     */
    private function buildPlatformPlugin(): array
    {
        $domain = config('alphasite.domain', 'alphasite.com');

        return [
            'schema_version' => 'v1',
            'name_for_human' => 'AlphaSite Business Directory',
            'name_for_model' => 'alphasite',
            'description_for_human' => 'Search and discover local businesses, read reviews, find contact information, and explore communities.',
            'description_for_model' => 'AlphaSite is a comprehensive business directory platform. Use it to search for businesses by name, location, or industry. Get business details including hours, reviews, ratings, contact information, and community insights.',
            'auth' => [
                'type' => 'none',
            ],
            'api' => [
                'type' => 'openapi',
                'url' => 'https://'.$domain.'/openapi.json',
            ],
            'logo_url' => 'https://'.$domain.'/images/alphasite-logo.png',
            'contact_email' => 'support@alphasite.com',
            'legal_info_url' => 'https://'.$domain.'/legal',
        ];
    }
}
