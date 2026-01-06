<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\EmailCampaignController;
use Illuminate\Support\Facades\Route;

Route::prefix('email-campaigns')->group(function () {
    Route::get('/', [EmailCampaignController::class, 'index']);
    Route::get('/{emailCampaign}', [EmailCampaignController::class, 'show']);
    Route::post('/', [EmailCampaignController::class, 'store']);
    Route::post('/{emailCampaign}/send', [EmailCampaignController::class, 'send']);
});


