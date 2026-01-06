<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\LegalNoticeController;
use Illuminate\Support\Facades\Route;

Route::prefix('legal-notices')->group(function () {
    Route::get('/', [LegalNoticeController::class, 'index']);
    Route::get('/{legalNotice}', [LegalNoticeController::class, 'show']);
    Route::post('/', [LegalNoticeController::class, 'store']);
    Route::put('/{legalNotice}', [LegalNoticeController::class, 'update']);
});


