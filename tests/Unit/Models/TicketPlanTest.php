<?php

use App\Models\TicketPlan;

test('can create TicketPlan', function () {
    $model = TicketPlan::factory()->create();
    expect($model)->toBeInstanceOf(TicketPlan::class);
    expect($model->id)->toBeString();
});

test('TicketPlan has required attributes', function () {
    $model = TicketPlan::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
