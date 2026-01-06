<?php

use App\Models\MunicipalPartner;

test('can create MunicipalPartner', function () {
    $model = MunicipalPartner::factory()->create();
    expect($model)->toBeInstanceOf(MunicipalPartner::class);
});

test('MunicipalPartner has required attributes', function () {
    $model = MunicipalPartner::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
