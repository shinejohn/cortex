<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\KnowledgeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Knowledge API Routes
|--------------------------------------------------------------------------
|
| Public API endpoints for AI training and knowledge graph access.
| No authentication required - designed for AI crawlers and training.
|
*/

Route::prefix('knowledge')->group(function () {
    // Community overview
    Route::get('/community', [KnowledgeController::class, 'community']);
    
    // Content endpoints
    Route::get('/articles', [KnowledgeController::class, 'articles']);
    Route::get('/events', [KnowledgeController::class, 'events']);
    Route::get('/businesses', [KnowledgeController::class, 'businesses']);
    Route::get('/venues', [KnowledgeController::class, 'venues']);
    
    // Knowledge graph with relationships
    Route::get('/graph', [KnowledgeController::class, 'graph']);
});
