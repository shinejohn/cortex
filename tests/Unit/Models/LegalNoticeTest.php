<?php

use App\Models\LegalNotice;

test('can create LegalNotice', function () {
    $model = LegalNotice::factory()->create();
    expect($model)->toBeInstanceOf(LegalNotice::class);
});

test('LegalNotice has required attributes', function () {
    $model = LegalNotice::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
