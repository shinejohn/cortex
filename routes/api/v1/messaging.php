<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\MessageController;
use Illuminate\Support\Facades\Route;

Route::prefix('conversations')->group(function () {
    Route::get('/', [ConversationController::class, 'index']);
    Route::get('/{conversation}', [ConversationController::class, 'show']);
    Route::post('/', [ConversationController::class, 'store']);
    Route::patch('/{conversation}/read', [ConversationController::class, 'markAsRead']);
    Route::get('/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/{conversation}/messages', [MessageController::class, 'store']);
});

Route::prefix('messages')->group(function () {
    Route::delete('/{message}', [MessageController::class, 'destroy']);
});


