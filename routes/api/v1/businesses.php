<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\BusinessController;
use App\Http\Controllers\Api\V1\BusinessSubscriptionController;
use App\Http\Controllers\Api\V1\BusinessTemplateController;
use App\Http\Controllers\Api\V1\BusinessFaqController;
use App\Http\Controllers\Api\V1\BusinessSurveyController;
use App\Http\Controllers\Api\V1\AchievementController;
use Illuminate\Support\Facades\Route;

Route::prefix('businesses')->group(function () {
    Route::get('/', [BusinessController::class, 'index']);
    Route::get('/search', [BusinessController::class, 'search']);
    Route::get('/nearby', [BusinessController::class, 'nearby']);
    Route::get('/{business}', [BusinessController::class, 'show']);
    Route::post('/', [BusinessController::class, 'store']);
    Route::put('/{business}', [BusinessController::class, 'update']);
    Route::delete('/{business}', [BusinessController::class, 'destroy']);
    
    Route::get('/{business}/subscription', [BusinessSubscriptionController::class, 'show']);
    Route::post('/{business}/subscription', [BusinessSubscriptionController::class, 'store']);
    Route::delete('/{business}/subscription', [BusinessSubscriptionController::class, 'destroy']);
    
    Route::post('/{business}/apply-template', [BusinessTemplateController::class, 'applyTemplate']);
    
    Route::get('/{business}/faqs', [BusinessFaqController::class, 'index']);
    Route::post('/{business}/faqs', [BusinessFaqController::class, 'store']);
    Route::put('/business-faqs/{businessFaq}', [BusinessFaqController::class, 'update']);
    
    Route::get('/{business}/surveys', [BusinessSurveyController::class, 'index']);
    Route::post('/{business}/surveys', [BusinessSurveyController::class, 'store']);
    Route::get('/business-surveys/{businessSurvey}/responses', [BusinessSurveyController::class, 'responses']);
    
    Route::get('/{business}/achievements', [AchievementController::class, 'businessAchievements']);
});

Route::prefix('business-templates')->group(function () {
    Route::get('/', [BusinessTemplateController::class, 'index']);
});

Route::prefix('achievements')->group(function () {
    Route::get('/', [AchievementController::class, 'index']);
});


