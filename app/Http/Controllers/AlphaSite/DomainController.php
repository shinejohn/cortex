<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\Domain\DomainAvailabilityService;
use App\Services\Domain\DomainPurchaseService;
use App\Services\Domain\DomainSupportAiService;
use App\Services\Domain\ExternalDomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DomainController extends Controller
{
    /**
     * Domain management page in the business admin dashboard.
     * Two paths: "I need a domain" or "I have a domain"
     */
    public function index(string $slug): Response
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        return Inertia::render('alphasite/admin/domains/index', [
            'business' => $business,
            'domains' => $business->domains()->withCount('dnsChecks')->get(),
            'alphasiteSubdomain' => $business->slug.'.'.config('alphasite.hostname', 'alphasite.app'),
        ]);
    }

    /**
     * Search for available domains.
     */
    public function search(Request $request, string $slug, DomainAvailabilityService $service): JsonResponse
    {
        $request->validate(['query' => 'required|string|max:63']);

        $business = Business::where('slug', $slug)->firstOrFail();
        $query = $request->input('query');

        if (str_contains($query, '.')) {
            $result = $service->check($query);
            $suggestions = $result['available'] ? [] : $service->suggest($business->name, $business->city);

            return response()->json([
                'primary' => $result,
                'suggestions' => $suggestions,
            ]);
        }

        $suggestions = $service->suggest($query, $business->city);

        return response()->json([
            'primary' => null,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Purchase a domain via Cloudflare. Zero markup.
     */
    public function purchase(Request $request, string $slug, DomainPurchaseService $service): RedirectResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'domain_name' => 'required|string|max:253',
            'contact.first_name' => 'required|string',
            'contact.last_name' => 'required|string',
            'contact.address' => 'required|string',
            'contact.city' => 'required|string',
            'contact.state' => 'required|string',
            'contact.zip' => 'required|string',
            'contact.phone' => 'required|string',
            'contact.email' => 'required|email',
        ]);

        $result = $service->purchase($business, $validated['domain_name'], $validated['contact']);

        if (! $result['success']) {
            return back()->withErrors(['domain' => $result['error']]);
        }

        return redirect()->route('alphasite.domains.index', $business->slug)
            ->with('success', $result['message']);
    }

    /**
     * Connect an external domain.
     */
    public function connectExternal(Request $request, string $slug, ExternalDomainService $service): RedirectResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'domain_name' => 'required|string|max:253',
        ]);

        $result = $service->register($business, $validated['domain_name']);

        if (! $result['success']) {
            return back()->withErrors(['domain' => $result['error']]);
        }

        return redirect()->route('alphasite.domains.index', $business->slug)
            ->with('success', 'Domain added! Follow the DNS instructions below.');
    }

    /**
     * Manual DNS re-check (user clicks "Check Now").
     */
    public function recheckDns(string $slug, string $domainId, ExternalDomainService $service): JsonResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        $domain = $business->domains()->findOrFail($domainId);
        $passed = $service->verifyDns($domain);

        return response()->json([
            'passed' => $passed,
            'status' => $domain->fresh()->status,
            'message' => $passed
                ? 'DNS verified! Your domain is now active.'
                : 'DNS not yet detected. This can take up to 48 hours. We check automatically every 5 minutes.',
        ]);
    }

    /**
     * Set a domain as primary.
     */
    public function setPrimary(string $slug, string $domainId): RedirectResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        $business->domains()->update(['is_primary' => false]);
        $business->domains()->where('id', $domainId)->update(['is_primary' => true]);

        return redirect()->route('alphasite.domains.index', $business->slug)
            ->with('success', 'Primary domain updated.');
    }

    /**
     * Remove a domain from the business.
     * For purchased domains: keeps the registration active, just disconnects from AlphaSite.
     * We don't hold domains hostage.
     */
    public function destroy(string $slug, string $domainId): RedirectResponse
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        $domain = $business->domains()->findOrFail($domainId);

        $domain->delete();

        return redirect()->route('alphasite.domains.index', $business->slug)
            ->with('success', 'Domain disconnected. If this was a purchased domain, the registration remains active.');
    }

    /**
     * AI domain support chat endpoint.
     */
    public function supportChat(Request $request, string $slug, DomainSupportAiService $service): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $business = Business::where('slug', $slug)->firstOrFail();
        $activeDomain = $business->domains()->latest()->first();

        $context = [];
        if ($activeDomain) {
            $context['domain_name'] = $activeDomain->domain_name;
            $context['status'] = $activeDomain->status;
            $context['dns_instructions'] = $activeDomain->dns_instructions;
        }

        $response = $service->ask($request->input('message'), $context);

        return response()->json([
            'success' => true,
            'response' => $response,
        ]);
    }
}
