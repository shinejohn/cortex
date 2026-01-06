<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\NewsArticleController;
use Illuminate\Support\Facades\Route;

Route::prefix('news-articles')->group(function () {
    Route::get('/', [NewsArticleController::class, 'index']);
    Route::get('/{newsArticle}', [NewsArticleController::class, 'show']);
    Route::post('/', [NewsArticleController::class, 'store']);
    Route::put('/{newsArticle}', [NewsArticleController::class, 'update']);
    Route::patch('/{newsArticle}/approve', [NewsArticleController::class, 'approve']);
    Route::patch('/{newsArticle}/reject', [NewsArticleController::class, 'reject']);
});


