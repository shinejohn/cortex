<?php

use App\Models\PromoCode;

test('can create PromoCode', function () {
    $model = PromoCode::factory()->create();
    expect($model)->toBeInstanceOf(PromoCode::class);
    expect($model->id)->toBeString();
});

test('PromoCode has required attributes', function () {
    $model = PromoCode::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
