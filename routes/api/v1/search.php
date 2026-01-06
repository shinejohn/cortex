<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\SearchController;
use Illuminate\Support\Facades\Route;

Route::prefix('search')->group(function () {
    Route::get('/', [SearchController::class, 'search']);
});


