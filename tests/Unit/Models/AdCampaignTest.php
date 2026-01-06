<?php

use App\Models\AdCampaign;

test('can create AdCampaign', function () {
    $model = AdCampaign::factory()->create();
    expect($model)->toBeInstanceOf(AdCampaign::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('AdCampaign has required attributes', function () {
    $model = AdCampaign::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('AdCampaign can be updated', function () {
    $model = AdCampaign::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
