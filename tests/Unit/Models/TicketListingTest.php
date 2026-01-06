<?php

use App\Models\TicketListing;

test('can create TicketListing', function () {
    $model = TicketListing::factory()->create();
    expect($model)->toBeInstanceOf(TicketListing::class);
});

test('TicketListing has required attributes', function () {
    $model = TicketListing::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
