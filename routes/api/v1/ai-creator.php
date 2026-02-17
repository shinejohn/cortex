<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AiCreatorController;
use App\Http\Controllers\Api\ContentModerationController;
use Illuminate\Support\Facades\Route;

// AI Creator Assistant API
Route::prefix('ai-creator')->group(function () {
    Route::post('/sessions', [AiCreatorController::class, 'createSession']);
    Route::post('/sessions/{session}/analyze', [AiCreatorController::class, 'analyze']);
    Route::post('/sessions/{session}/fact-check', [AiCreatorController::class, 'factCheck']);
    Route::post('/sessions/{session}/generate', [AiCreatorController::class, 'generate']);
    Route::post('/sessions/{session}/headlines', [AiCreatorController::class, 'headlines']);
    Route::post('/sessions/{session}/seo', [AiCreatorController::class, 'seo']);
    Route::post('/sessions/{session}/images', [AiCreatorController::class, 'images']);
    Route::post('/sessions/{session}/parse-event', [AiCreatorController::class, 'parseEvent']);
    Route::post('/sessions/{session}/match-venue', [AiCreatorController::class, 'matchVenue']);
    Route::post('/sessions/{session}/match-performer', [AiCreatorController::class, 'matchPerformer']);
    Route::post('/sessions/{session}/check-compliance', [AiCreatorController::class, 'checkCompliance']);
});

// Content Moderation API
Route::prefix('moderation')->group(function () {
    Route::get('/{contentType}/{contentId}', [ContentModerationController::class, 'status']);
    Route::post('/{logId}/feedback', [ContentModerationController::class, 'feedback']);
    Route::get('/pending', [ContentModerationController::class, 'pending']);
});
