<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\Advertising\CampaignController as AdCampaignController;
use App\Http\Controllers\Admin\Advertising\CreativeController;
use App\Http\Controllers\Admin\Advertising\PlacementController;
use App\Http\Controllers\Admin\Advertising\ReportController;
use App\Http\Controllers\Admin\Email\CampaignController as EmailCampaignController;
use App\Http\Controllers\Admin\Email\SubscriberController;
use App\Http\Controllers\Admin\Email\TemplateController;
use App\Http\Controllers\Admin\Emergency\AlertController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes (Inertia Pages)
|--------------------------------------------------------------------------
|
| Admin routes for advertising, email, and emergency systems
| These are separate from Filament admin panel
|
*/

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Advertising routes
    Route::prefix('advertising')->name('advertising.')->group(function () {
        Route::resource('campaigns', AdCampaignController::class);
        Route::post('campaigns/{campaign}/status', [AdCampaignController::class, 'updateStatus'])->name('campaigns.status');
        Route::resource('creatives', CreativeController::class);
        Route::resource('placements', PlacementController::class);
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/campaign/{campaign}', [ReportController::class, 'campaign'])->name('reports.campaign');
    });

    // Email routes
    Route::prefix('email')->name('email.')->group(function () {
        Route::resource('campaigns', EmailCampaignController::class);
        Route::post('campaigns/generate-digest', [EmailCampaignController::class, 'generateDigest'])->name('campaigns.generate-digest');
        Route::post('campaigns/generate-newsletter', [EmailCampaignController::class, 'generateNewsletter'])->name('campaigns.generate-newsletter');
        Route::resource('subscribers', SubscriberController::class);
        Route::resource('templates', TemplateController::class);
    });

    // Emergency routes
    Route::prefix('emergency')->name('emergency.')->group(function () {
        Route::resource('alerts', AlertController::class);
        Route::post('alerts/{alert}/publish', [AlertController::class, 'publish'])->name('alerts.publish');
        Route::post('alerts/{alert}/cancel', [AlertController::class, 'cancel'])->name('alerts.cancel');
    });
});

