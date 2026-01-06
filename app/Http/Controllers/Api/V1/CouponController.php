<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreCouponRequest;
use App\Http\Requests\Api\V1\UpdateCouponRequest;
use App\Http\Resources\Api\V1\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CouponController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query()->with(['user', 'business', 'regions']);

        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        $coupons = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->paginated($coupons);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $coupon->increment('views_count');
        return $this->success(new CouponResource($coupon->load(['user', 'business', 'regions'])));
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $coupon = Coupon::create($request->validated());

        if ($request->has('region_ids')) {
            $coupon->regions()->attach($request->region_ids);
        }

        return $this->success(new CouponResource($coupon), 'Coupon created successfully', 201);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('update', $coupon);
        $coupon->update($request->validated());
        return $this->success(new CouponResource($coupon), 'Coupon updated successfully');
    }

    public function claim(Request $request, Coupon $coupon): JsonResponse
    {
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return $this->error('Coupon usage limit reached', 'USAGE_LIMIT_REACHED');
        }

        $coupon->increment('used_count');
        $coupon->usages()->create(['user_id' => $request->user()->id]);

        return $this->success(new CouponResource($coupon), 'Coupon claimed successfully');
    }
}


