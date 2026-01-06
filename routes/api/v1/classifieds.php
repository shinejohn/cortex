<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ClassifiedController;
use Illuminate\Support\Facades\Route;

Route::prefix('classifieds')->group(function () {
    Route::get('/', [ClassifiedController::class, 'index']);
    Route::get('/{classified}', [ClassifiedController::class, 'show']);
    Route::post('/', [ClassifiedController::class, 'store']);
    Route::put('/{classified}', [ClassifiedController::class, 'update']);
    Route::delete('/{classified}', [ClassifiedController::class, 'destroy']);
    Route::post('/{classified}/renew', [ClassifiedController::class, 'renew']);
});


