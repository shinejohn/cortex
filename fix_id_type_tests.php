<?php

/**
 * Script to fix ID type mismatches in tests
 * Checks actual model ID types and updates tests accordingly
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$testFiles = [
    'AdClick', 'AdCreative', 'AdImpression', 'AdInventory', 'AdPlacement', 
    'Advertisement', 'ArticleCommentLike', 'CalendarFollower', 'CalendarRole',
    'ClassifiedImage', 'ClassifiedPayment', 'CouponUsage', 'DayNewsPost', 'Workspace'
];

$results = [];

foreach ($testFiles as $modelName) {
    try {
        $model = new ("App\Models\\{$modelName}")();
        $incrementing = $model->getIncrementing();
        $results[$modelName] = $incrementing ? 'integer' : 'uuid';
    } catch (\Throwable $e) {
        $results[$modelName] = 'error';
    }
}

foreach ($results as $model => $type) {
    echo "{$model}: {$type}\n";
}

