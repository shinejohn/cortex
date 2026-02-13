<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class LlmsTxtController extends Controller
{
    /**
     * Return llms.txt for the resolved business or platform.
     */
    public function show(Request $request): Response
    {
        /** @var Business|null $business */
        $business = $request->attributes->get('resolved_business');

        if ($business) {
            $text = $this->buildBusinessLlmsTxt($business);
        } else {
            $text = $this->buildPlatformLlmsTxt();
        }

        return response($text, 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    /**
     * Build llms.txt content for a specific business.
     */
    private function buildBusinessLlmsTxt(Business $business): string
    {
        $lines = [];
        $lines[] = '# '.$business->name;
        $lines[] = '';

        if ($business->description) {
            $lines[] = '> '.$business->description;
            $lines[] = '';
        }

        // Location
        $locationParts = array_filter([
            $business->address,
            $business->city,
            $business->state,
            $business->postal_code,
        ]);

        if (! empty($locationParts)) {
            $lines[] = '## Location';
            $lines[] = implode(', ', $locationParts);
            $lines[] = '';
        }

        // Contact
        if ($business->phone || $business->email || $business->website) {
            $lines[] = '## Contact';
            if ($business->phone) {
                $lines[] = '- Phone: '.$business->phone;
            }
            if ($business->email) {
                $lines[] = '- Email: '.$business->email;
            }
            if ($business->website) {
                $lines[] = '- Website: '.$business->website;
            }
            $lines[] = '';
        }

        // Hours
        $openingHours = $business->opening_hours;
        if (is_array($openingHours) && ! empty($openingHours)) {
            $lines[] = '## Hours';
            foreach ($openingHours as $day => $times) {
                if (is_array($times)) {
                    $open = $times['open'] ?? $times['opens'] ?? null;
                    $close = $times['close'] ?? $times['closes'] ?? null;
                    if ($open && $close) {
                        $lines[] = '- '.ucfirst((string) $day).': '.$open.' - '.$close;
                    }
                } elseif (is_string($times)) {
                    $lines[] = '- '.ucfirst((string) $day).': '.$times;
                }
            }
            $lines[] = '';
        }

        // About
        $industry = $business->industry?->name;
        if ($industry || $business->price_level || $business->rating) {
            $lines[] = '## About';
            if ($industry) {
                $lines[] = '- Industry: '.$industry;
            }
            if ($business->price_level) {
                $lines[] = '- Price Range: '.$business->price_level;
            }
            if ($business->rating) {
                $line = '- Rating: '.$business->rating.'/5';
                if ($business->reviews_count) {
                    $line .= ' ('.$business->reviews_count.' reviews)';
                }
                $lines[] = $line;
            }
            $lines[] = '';
        }

        $lines[] = '---';
        $lines[] = 'Powered by AlphaSite.com';

        return implode("\n", $lines);
    }

    /**
     * Build llms.txt content for the AlphaSite platform.
     */
    private function buildPlatformLlmsTxt(): string
    {
        $lines = [];
        $lines[] = '# AlphaSite';
        $lines[] = '';
        $lines[] = '> AlphaSite is an AI-powered business directory and website generation platform. It helps local businesses establish a professional online presence with auto-generated pages, AI chat capabilities, and CRM tools.';
        $lines[] = '';
        $lines[] = '## Platform';
        $lines[] = '- AlphaSite provides business listings, reviews, community pages, and industry directories.';
        $lines[] = '- Each business can have a dedicated subdomain with full business information.';
        $lines[] = '- AI-powered features include business chat, customer interaction tracking, and smart recommendations.';
        $lines[] = '';
        $lines[] = '## URL Structure';
        $lines[] = '- /city/{slug} - City landing page with featured businesses and categories';
        $lines[] = '- /city/{city-slug}/{category-slug} - City + Category page with business listings';
        $lines[] = '- /state/{state} - State page listing all cities';
        $lines[] = '- /county/{slug} - County landing page with cities and categories';
        $lines[] = '- /county/{county-slug}/{category-slug} - County + Category page';
        $lines[] = '- /business/{slug} - Individual business page';
        $lines[] = '- /directory - Full business directory';
        $lines[] = '';
        $lines[] = '## API';
        $lines[] = '- Business search and directory data available via structured endpoints.';
        $lines[] = '- OpenAPI specification: /.well-known/ai-plugin.json';
        $lines[] = '';
        $lines[] = '## Fibonacco Ecosystem';
        $lines[] = '- [Day.News](https://day.news) - Local news and community journalism';
        $lines[] = '- [GoEventCity](https://goeventcity.com) - Local events and entertainment discovery';
        $lines[] = '- [DowntownsGuide](https://downtownsguide.com) - Downtown area guides and business districts';
        $lines[] = '- [Go Local Voices](https://golocalvoices.com) - Community voices and local perspectives';
        $lines[] = '';
        $lines[] = '---';
        $lines[] = 'Powered by Fibonacco';

        return implode("\n", $lines);
    }
}
