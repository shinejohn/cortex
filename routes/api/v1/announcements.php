<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::prefix('announcements')->group(function () {
    Route::get('/', [AnnouncementController::class, 'index']);
    Route::get('/{announcement}', [AnnouncementController::class, 'show']);
    Route::post('/', [AnnouncementController::class, 'store']);
    Route::put('/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('/{announcement}', [AnnouncementController::class, 'destroy']);
});


