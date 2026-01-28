<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\TenantController;
use App\Http\Controllers\Api\V1\AccountManagerController;
use Illuminate\Support\Facades\Route;

Route::prefix('tenants')->group(function () {
    Route::get('/', [TenantController::class, 'index']);
    Route::get('/{tenant}', [TenantController::class, 'show']);
    Route::post('/', [TenantController::class, 'store']);
    Route::put('/{tenant}', [TenantController::class, 'update']);
    Route::delete('/{tenant}', [TenantController::class, 'destroy']);
});

Route::prefix('account-managers')->group(function () {
    Route::get('/', [AccountManagerController::class, 'index']);
    Route::get('/{accountManager}', [AccountManagerController::class, 'show']);
    Route::post('/', [AccountManagerController::class, 'store']);
    Route::put('/{accountManager}', [AccountManagerController::class, 'update']);
    Route::get('/{accountManager}/clients', [AccountManagerController::class, 'clients']);
});

Route::prefix('roles')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\RoleController::class, 'index']);
    Route::get('/{role}', [\App\Http\Controllers\Api\V1\RoleController::class, 'show']);
    Route::post('/', [\App\Http\Controllers\Api\V1\RoleController::class, 'store']);
    Route::put('/{role}', [\App\Http\Controllers\Api\V1\RoleController::class, 'update']);
});


