<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

/*
|--------------------------------------------------------------------------
| Health Check Routes
|--------------------------------------------------------------------------
|
| These routes are used for health checks by load balancers and monitoring
|
*/

Route::get('/healthcheck', function () {
    $checks = [
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ];

    // Database check
    try {
        DB::connection()->getPdo();
        $checks['database'] = 'ok';
    } catch (\Exception $e) {
        $checks['database'] = 'error';
        $checks['database_error'] = $e->getMessage();
    }

    // Redis check
    try {
        Redis::connection()->ping();
        $checks['redis'] = 'ok';
    } catch (\Exception $e) {
        $checks['redis'] = 'error';
        $checks['redis_error'] = $e->getMessage();
    }

    $statusCode = ($checks['database'] === 'ok' && $checks['redis'] === 'ok') ? 200 : 503;

    return response()->json($checks, $statusCode);
})->name('healthcheck');

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
})->name('health');

