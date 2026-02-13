<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Business;
use App\Models\BusinessDomain;
use App\Models\CustomDomain;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

final class DomainResolutionMiddleware
{
    /**
     * Reserved subdomains that cannot be used for business resolution.
     *
     * @var array<int, string>
     */
    private const RESERVED_SUBDOMAINS = [
        'www',
        'api',
        'admin',
        'app',
        'mail',
        'proxy',
        'staging',
    ];

    /**
     * Handle an incoming request by resolving the display mode from the domain.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $baseDomain = config('alphasite.domain');

        // 1. Check custom domains first (standalone mode)
        if ($this->isCustomDomain($host, $baseDomain)) {
            return $this->resolveCustomDomain($request, $next, $host);
        }

        // 2. Check subdomain pattern (subdomain mode)
        if ($this->isSubdomain($host, $baseDomain)) {
            return $this->resolveSubdomain($request, $next, $host, $baseDomain);
        }

        // 3. Default to directory mode
        $this->setDirectoryMode($request, $baseDomain);

        return $next($request);
    }

    /**
     * Determine if the host is a custom domain (not the alphasite domain or a subdomain of it).
     */
    private function isCustomDomain(string $host, string $baseDomain): bool
    {
        return $host !== $baseDomain
            && ! str_ends_with($host, '.'.$baseDomain)
            && $host !== 'localhost'
            && ! str_ends_with($host, '.localhost');
    }

    /**
     * Determine if the host is a subdomain of the base alphasite domain.
     */
    private function isSubdomain(string $host, string $baseDomain): bool
    {
        return str_ends_with($host, '.'.$baseDomain) && $host !== $baseDomain;
    }

    /**
     * Resolve a custom domain to a business in standalone mode.
     */
    private function resolveCustomDomain(Request $request, Closure $next, string $host): Response
    {
        // Check legacy custom_domains table first
        $customDomain = CustomDomain::query()
            ->where('domain', $host)
            ->where('status', 'active')
            ->where('dns_verified', true)
            ->with('business')
            ->first();

        $business = $customDomain?->business;

        // Also check business_domains table (Domain Convenience Service)
        if (! $business) {
            $businessDomain = BusinessDomain::query()
                ->where('domain_name', $host)
                ->where('status', 'active')
                ->with('business')
                ->first();

            $business = $businessDomain?->business;
        }

        if (! $business) {
            Log::warning('DomainResolution: Custom domain not found or inactive', [
                'domain' => $host,
            ]);

            $this->setDirectoryMode($request, config('alphasite.domain'));

            return $next($request);
        }

        $request->attributes->set('display_mode', 'standalone');
        $request->attributes->set('resolved_business', $business);
        $request->attributes->set('canonical_url', 'https://'.$host);
        $request->attributes->set('show_alphasite_header', false);
        $request->attributes->set('show_alphasite_footer', false);
        $request->attributes->set('custom_branding', [
            'favicon' => $business->seo_metadata['favicon'] ?? null,
            'site_name' => $business->name,
            'primary_color' => $business->seo_metadata['primary_color'] ?? '#2563EB',
            'logo_url' => $business->images[0] ?? null,
        ]);

        return $next($request);
    }

    /**
     * Resolve a subdomain to a business in subdomain mode.
     */
    private function resolveSubdomain(Request $request, Closure $next, string $host, string $baseDomain): Response
    {
        $subdomain = str_replace('.'.$baseDomain, '', $host);

        if (in_array($subdomain, self::RESERVED_SUBDOMAINS, true)) {
            $this->setDirectoryMode($request, $baseDomain);

            return $next($request);
        }

        $business = Business::query()
            ->where('alphasite_subdomain', $subdomain)
            ->first();

        if (! $business) {
            Log::warning('DomainResolution: Subdomain business not found', [
                'subdomain' => $subdomain,
                'host' => $host,
            ]);

            $this->setDirectoryMode($request, $baseDomain);

            return $next($request);
        }

        $request->attributes->set('display_mode', 'subdomain');
        $request->attributes->set('resolved_business', $business);
        $request->attributes->set('canonical_url', 'https://'.$host);
        $request->attributes->set('show_alphasite_header', true);
        $request->attributes->set('show_alphasite_footer', true);
        $request->attributes->set('custom_branding', null);

        return $next($request);
    }

    /**
     * Set request attributes for directory mode (default).
     */
    private function setDirectoryMode(Request $request, string $baseDomain): void
    {
        $request->attributes->set('display_mode', 'directory');
        $request->attributes->set('resolved_business', null);
        $request->attributes->set('canonical_url', 'https://'.$baseDomain);
        $request->attributes->set('show_alphasite_header', true);
        $request->attributes->set('show_alphasite_footer', true);
        $request->attributes->set('custom_branding', null);
    }
}
