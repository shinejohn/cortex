<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\TicketPlanController;
use App\Http\Controllers\Api\V1\TicketOrderController;
use App\Http\Controllers\Api\V1\PromoCodeController;
use Illuminate\Support\Facades\Route;

Route::prefix('ticket-plans')->group(function () {
    Route::get('/', [TicketPlanController::class, 'index']);
    Route::get('/{ticketPlan}', [TicketPlanController::class, 'show']);
    Route::post('/events/{event}', [TicketPlanController::class, 'store']);
    Route::put('/{ticketPlan}', [TicketPlanController::class, 'update']);
    Route::delete('/{ticketPlan}', [TicketPlanController::class, 'destroy']);
});

Route::prefix('ticket-orders')->group(function () {
    Route::get('/', [TicketOrderController::class, 'index']);
    Route::get('/{ticketOrder}', [TicketOrderController::class, 'show']);
    Route::post('/', [TicketOrderController::class, 'store']);
});

Route::prefix('promo-codes')->group(function () {
    Route::get('/', [PromoCodeController::class, 'index']);
    Route::post('/validate', [PromoCodeController::class, 'validate']);
});


