<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Crm\SmbBusinessController;
use App\Http\Controllers\Api\V1\Crm\CustomerController;
use App\Http\Controllers\Api\V1\Crm\DealController;
use App\Http\Controllers\Api\V1\Crm\CampaignController;
use App\Http\Controllers\Api\V1\Crm\InteractionController;
use App\Http\Controllers\Api\V1\Crm\TaskController;
use App\Http\Controllers\Api\V1\Crm\BusinessHoursController;
use App\Http\Controllers\Api\V1\Crm\BusinessPhotoController;
use App\Http\Controllers\Api\V1\Crm\BusinessReviewController;
use App\Http\Controllers\Api\V1\Crm\BusinessAttributeController;
use Illuminate\Support\Facades\Route;

Route::prefix('crm')->group(function () {
    // SMB Businesses
    Route::prefix('businesses')->group(function () {
        Route::get('/', [SmbBusinessController::class, 'index']);
        Route::get('/search', [SmbBusinessController::class, 'search']);
        Route::get('/{smbBusiness}', [SmbBusinessController::class, 'show']);
        Route::post('/', [SmbBusinessController::class, 'store']);
        Route::put('/{smbBusiness}', [SmbBusinessController::class, 'update']);
        Route::delete('/{smbBusiness}', [SmbBusinessController::class, 'destroy']);
        Route::get('/{smbBusiness}/customers', [SmbBusinessController::class, 'customers']);
        Route::get('/{smbBusiness}/reviews', [BusinessReviewController::class, 'index']);
        Route::post('/{smbBusiness}/reviews', [BusinessReviewController::class, 'store']);
        Route::get('/{smbBusiness}/hours', [BusinessHoursController::class, 'index']);
        Route::put('/{smbBusiness}/hours', [BusinessHoursController::class, 'update']);
        Route::get('/{smbBusiness}/photos', [BusinessPhotoController::class, 'index']);
        Route::post('/{smbBusiness}/photos', [BusinessPhotoController::class, 'store']);
        Route::delete('/business-photos/{businessPhoto}', [BusinessPhotoController::class, 'destroy']);
        Route::get('/{smbBusiness}/attributes', [BusinessAttributeController::class, 'index']);
        Route::put('/{smbBusiness}/attributes', [BusinessAttributeController::class, 'update']);
    });

    // Customers
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index']);
        Route::get('/search', [CustomerController::class, 'search']);
        Route::get('/{customer}', [CustomerController::class, 'show']);
        Route::post('/', [CustomerController::class, 'store']);
        Route::put('/{customer}', [CustomerController::class, 'update']);
        Route::delete('/{customer}', [CustomerController::class, 'destroy']);
        Route::get('/{customer}/interactions', [CustomerController::class, 'interactions']);
        Route::get('/{customer}/deals', [CustomerController::class, 'deals']);
        Route::get('/{customer}/tasks', [CustomerController::class, 'tasks']);
        Route::get('/{customer}/campaigns', [CustomerController::class, 'campaigns']);
    });

    // Deals
    Route::prefix('deals')->group(function () {
        Route::get('/', [DealController::class, 'index']);
        Route::get('/pipeline', [DealController::class, 'pipeline']);
        Route::get('/{deal}', [DealController::class, 'show']);
        Route::post('/', [DealController::class, 'store']);
        Route::put('/{deal}', [DealController::class, 'update']);
        Route::delete('/{deal}', [DealController::class, 'destroy']);
        Route::patch('/{deal}/stage', [DealController::class, 'stage']);
    });

    // Campaigns
    Route::prefix('campaigns')->group(function () {
        Route::get('/', [CampaignController::class, 'index']);
        Route::get('/{campaign}', [CampaignController::class, 'show']);
        Route::post('/', [CampaignController::class, 'store']);
        Route::put('/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/{campaign}', [CampaignController::class, 'destroy']);
        Route::post('/{campaign}/send', [CampaignController::class, 'send']);
        Route::get('/{campaign}/recipients', [CampaignController::class, 'recipients']);
        Route::get('/{campaign}/analytics', [CampaignController::class, 'analytics']);
    });

    // Interactions
    Route::prefix('interactions')->group(function () {
        Route::get('/', [InteractionController::class, 'index']);
        Route::get('/by-customer/{customerId}', [InteractionController::class, 'byCustomer']);
        Route::get('/by-business/{businessId}', [InteractionController::class, 'byBusiness']);
        Route::get('/{interaction}', [InteractionController::class, 'show']);
        Route::post('/', [InteractionController::class, 'store']);
        Route::put('/{interaction}', [InteractionController::class, 'update']);
        Route::delete('/{interaction}', [InteractionController::class, 'destroy']);
    });

    // Tasks
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::get('/by-customer/{customerId}', [TaskController::class, 'byCustomer']);
        Route::get('/by-user/{userId}', [TaskController::class, 'byUser']);
        Route::get('/{task}', [TaskController::class, 'show']);
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{task}', [TaskController::class, 'update']);
        Route::delete('/{task}', [TaskController::class, 'destroy']);
        Route::patch('/{task}/complete', [TaskController::class, 'complete']);
        Route::patch('/{task}/assign', [TaskController::class, 'assign']);
    });
});


