<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('coupons')->group(function () {
    Route::get('/', [CouponController::class, 'index']);
    Route::get('/{coupon}', [CouponController::class, 'show']);
    Route::post('/', [CouponController::class, 'store']);
    Route::put('/{coupon}', [CouponController::class, 'update']);
    Route::post('/{coupon}/claim', [CouponController::class, 'claim']);
});


