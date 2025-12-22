<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class PromoCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PromoCode::query();

        if ($request->filled('search')) {
            $query->where('code', 'ILIKE', "%{$request->input('search')}%");
        }

        if ($request->boolean('active_only')) {
            $query->active();
        }

        $promoCodes = $query->latest()->paginate(20);

        return Inertia::render('event-city/promo-codes/index', [
            'promoCodes' => $promoCodes,
            'filters' => [
                'search' => $request->input('search'),
                'active_only' => $request->boolean('active_only'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('event-city/promo-codes/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:promo_codes,code',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'applicable_to' => 'nullable|array',
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = PromoCode::generateUniqueCode();
        }

        $promoCode = PromoCode::create($validated);

        return redirect()->route('promo-codes.show', $promoCode)
            ->with('success', 'Promo code created successfully.');
    }

    public function show(PromoCode $promoCode): Response
    {
        $promoCode->loadCount('usages');

        return Inertia::render('event-city/promo-codes/show', [
            'promoCode' => $promoCode,
        ]);
    }

    public function edit(PromoCode $promoCode): Response
    {
        return Inertia::render('event-city/promo-codes/edit', [
            'promoCode' => $promoCode,
        ]);
    }

    public function update(Request $request, PromoCode $promoCode): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:promo_codes,code,'.$promoCode->id,
            'description' => 'nullable|string',
            'type' => 'sometimes|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'applicable_to' => 'nullable|array',
        ]);

        $promoCode->update($validated);

        return redirect()->route('promo-codes.show', $promoCode)
            ->with('success', 'Promo code updated successfully.');
    }

    public function destroy(PromoCode $promoCode): RedirectResponse
    {
        $promoCode->delete();

        return redirect()->route('promo-codes.index')
            ->with('success', 'Promo code deleted successfully.');
    }

    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'event_id' => 'nullable|uuid|exists:events,id',
        ]);

        $promoCode = PromoCode::where('code', strtoupper($validated['code']))->first();

        if (!$promoCode) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid promo code.',
            ], 404);
        }

        if (!$promoCode->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'This promo code is no longer valid.',
            ], 400);
        }

        // Check if applicable to event
        if ($validated['event_id'] && $promoCode->applicable_to) {
            if (!in_array($validated['event_id'], $promoCode->applicable_to)) {
                return response()->json([
                    'valid' => false,
                    'message' => 'This promo code is not applicable to this event.',
                ], 400);
            }
        }

        $discount = $promoCode->calculateDiscount((float) $validated['amount']);

        return response()->json([
            'valid' => true,
            'promo_code' => [
                'id' => $promoCode->id,
                'code' => $promoCode->code,
                'type' => $promoCode->type,
                'value' => $promoCode->value,
            ],
            'discount' => $discount,
            'final_amount' => (float) $validated['amount'] - $discount,
        ]);
    }
}
