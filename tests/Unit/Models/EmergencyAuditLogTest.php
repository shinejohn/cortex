<?php

use App\Models\EmergencyAuditLog;

test('can create EmergencyAuditLog', function () {
    $model = EmergencyAuditLog::factory()->create();
    expect($model)->toBeInstanceOf(EmergencyAuditLog::class);
});

test('EmergencyAuditLog has required attributes', function () {
    $model = EmergencyAuditLog::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
