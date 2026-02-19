<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ActivityController;
use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\BillingSummaryController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\DealController;
use App\Http\Controllers\Api\V1\HealthScoreController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\QuoteController;
use App\Http\Controllers\Api\V1\RecommendationController;
use App\Http\Controllers\Api\V1\RevenueStatsController;
use App\Http\Controllers\Api\V1\SmbFullProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Command Center API Routes (Publishing Platform)
|--------------------------------------------------------------------------
|
| Deals, Quotes, Invoices, Contacts, Activities, Notifications,
| Health Scores, Activity Log, Revenue Stats
|
*/

// Deals & Pipeline
Route::apiResource('deals', DealController::class);
Route::get('deals/{deal}/activities', [DealController::class, 'activities']);

// Quotes
Route::apiResource('quotes', QuoteController::class);
Route::post('quotes/{quote}/send', [QuoteController::class, 'send']);
Route::post('quotes/{quote}/convert-to-invoice', [QuoteController::class, 'convertToInvoice']);

// Invoices
Route::apiResource('invoices', InvoiceController::class);
Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send']);
Route::post('invoices/{invoice}/record-payment', [InvoiceController::class, 'recordPayment']);

// Contacts
Route::apiResource('contacts', ContactController::class);

// Activities
Route::apiResource('activities', ActivityController::class);
Route::post('activities/{activity}/complete', [ActivityController::class, 'complete']);

// Notifications
Route::get('notifications', [NotificationController::class, 'index']);
Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

// SMB Intelligence Hub APIs
Route::get('smb/{smbBusiness}/full-profile', [SmbFullProfileController::class, 'fullProfile']);
Route::get('smb/{smbBusiness}/ai-context', [SmbFullProfileController::class, 'aiContext']);
Route::get('smb/{smbBusiness}/intelligence-summary', [SmbFullProfileController::class, 'intelligenceSummary']);
Route::patch('smb/{smbBusiness}/profile/{section}', [SmbFullProfileController::class, 'updateSection']);
Route::post('smb/{smbBusiness}/enrich', [SmbFullProfileController::class, 'enrich']);

// SMB Dashboard APIs
Route::get('smb/{smbBusiness}/health-score', [HealthScoreController::class, 'show']);
Route::get('smb/{smbBusiness}/activity-log', [ActivityLogController::class, 'index']);
Route::get('smb/{smbBusiness}/revenue-stats', [RevenueStatsController::class, 'index']);
Route::get('smb/{smbBusiness}/recommendations', [RecommendationController::class, 'index']);
Route::get('smb/{smbBusiness}/billing', [BillingSummaryController::class, 'show']);
