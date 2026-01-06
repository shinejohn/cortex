<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CommentController;
use Illuminate\Support\Facades\Route;

Route::prefix('comments')->group(function () {
    Route::get('/', [CommentController::class, 'index']);
    Route::get('/{comment}', [CommentController::class, 'show']);
    Route::post('/', [CommentController::class, 'store']);
    Route::put('/{comment}', [CommentController::class, 'update']);
    Route::delete('/{comment}', [CommentController::class, 'destroy']);
    Route::post('/{comment}/like', [CommentController::class, 'like']);
    Route::delete('/{comment}/like', [CommentController::class, 'unlike']);
    Route::post('/{comment}/report', [CommentController::class, 'report']);
});


