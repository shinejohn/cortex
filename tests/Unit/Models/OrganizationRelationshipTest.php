<?php

use App\Models\OrganizationRelationship;

test('can create OrganizationRelationship', function () {
    $model = OrganizationRelationship::factory()->create();
    expect($model)->toBeInstanceOf(OrganizationRelationship::class);
});

test('OrganizationRelationship has required attributes', function () {
    $model = OrganizationRelationship::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
