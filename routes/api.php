<?php

declare(strict_types=1);

use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OrganizationRelationshipController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Organization Routes
Route::prefix('organizations')->group(function () {
    Route::get('/search', [OrganizationController::class, 'search']);
    Route::get('/{organization}/content', [OrganizationController::class, 'getContent']);
    Route::post('/{organization}/relate', [OrganizationController::class, 'relate']);
    Route::get('/{organization}/hierarchy', [OrganizationController::class, 'hierarchy']);
});

// Organization Relationship Routes
Route::prefix('organization-relationships')->group(function () {
    Route::post('/', [OrganizationRelationshipController::class, 'store']);
    Route::post('/bulk', [OrganizationRelationshipController::class, 'bulkStore']);
    Route::put('/{relationship}', [OrganizationRelationshipController::class, 'update']);
    Route::delete('/{relationship}', [OrganizationRelationshipController::class, 'destroy']);
});

