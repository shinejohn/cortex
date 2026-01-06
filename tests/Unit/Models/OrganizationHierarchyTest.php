<?php

use App\Models\OrganizationHierarchy;

test('can create OrganizationHierarchy', function () {
    $model = OrganizationHierarchy::factory()->create();
    expect($model)->toBeInstanceOf(OrganizationHierarchy::class);
});

test('OrganizationHierarchy has required attributes', function () {
    $model = OrganizationHierarchy::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
