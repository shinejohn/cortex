<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\EmergencyAlertController;
use Illuminate\Support\Facades\Route;

Route::prefix('emergency-alerts')->group(function () {
    Route::get('/', [EmergencyAlertController::class, 'index']);
    Route::get('/{emergencyAlert}', [EmergencyAlertController::class, 'show']);
    Route::post('/', [EmergencyAlertController::class, 'store']);
});


