<?php

declare(strict_types=1);

use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\User;
use App\Models\Event;
use App\Models\TicketOrder;
use App\Services\PromoCodeService;

test('can view promo codes index page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    PromoCode::factory()->count(5)->create();

    $response = $this->get('/promo-codes');
    $response->assertStatus(200);
});

test('authenticated user can create promo code', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $promoData = [
        'code' => 'TEST20',
        'description' => 'Test Promo Code',
        'type' => 'percentage',
        'value' => 20,
        'is_active' => true,
    ];

    $response = $this->post('/promo-codes', $promoData);
    $response->assertRedirect();
    
    $this->assertDatabaseHas('promo_codes', [
        'code' => 'TEST20',
        'type' => 'percentage',
        'value' => 20,
    ]);
});

test('can validate promo code via API', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'VALID20',
        'type' => 'percentage',
        'value' => 20,
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDay(),
    ]);

    $response = $this->postJson('/api/promo-codes/validate', [
        'code' => 'VALID20',
        'amount' => 100,
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'valid' => true,
    ]);
    $response->assertJsonStructure([
        'valid',
        'promo_code' => ['id', 'code', 'type', 'value'],
        'discount',
        'final_amount',
    ]);
});

test('invalid promo code returns error', function () {
    $response = $this->postJson('/api/promo-codes/validate', [
        'code' => 'INVALID',
        'amount' => 100,
    ]);

    $response->assertStatus(404);
    $response->assertJson([
        'valid' => false,
        'message' => 'Invalid promo code.',
    ]);
});

test('expired promo code returns error', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'EXPIRED',
        'is_active' => true,
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->postJson('/api/promo-codes/validate', [
        'code' => 'EXPIRED',
        'amount' => 100,
    ]);

    $response->assertStatus(400);
    $response->assertJson([
        'valid' => false,
    ]);
});

test('percentage promo code calculates discount correctly', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'PERCENT20',
        'type' => 'percentage',
        'value' => 20,
        'is_active' => true,
    ]);

    $service = app(PromoCodeService::class);
    $result = $service->validateCode('PERCENT20', 100);

    expect($result['valid'])->toBeTrue();
    expect($result['discount'])->toBe(20.0);
    expect($result['final_amount'])->toBe(80.0);
});

test('fixed promo code calculates discount correctly', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'FIXED10',
        'type' => 'fixed',
        'value' => 10,
        'is_active' => true,
    ]);

    $service = app(PromoCodeService::class);
    $result = $service->validateCode('FIXED10', 100);

    expect($result['valid'])->toBeTrue();
    expect($result['discount'])->toBe(10.0);
    expect($result['final_amount'])->toBe(90.0);
});

test('promo code respects usage limit', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'LIMITED',
        'usage_limit' => 2,
        'used_count' => 2,
        'is_active' => true,
    ]);

    $service = app(PromoCodeService::class);
    $result = $service->validateCode('LIMITED', 100);

    expect($result['valid'])->toBeFalse();
});

test('promo code usage is tracked', function () {
    $user = User::factory()->create();
    $promoCode = PromoCode::factory()->create([
        'code' => 'TRACKED',
        'is_active' => true,
    ]);
    $order = TicketOrder::factory()->create([
        'user_id' => $user->id,
    ]);

    $service = app(PromoCodeService::class);
    $service->applyCode($promoCode, $order, $user);

    $this->assertDatabaseHas('promo_code_usages', [
        'promo_code_id' => $promoCode->id,
        'user_id' => $user->id,
        'ticket_order_id' => $order->id,
    ]);

    $promoCode->refresh();
    expect($promoCode->used_count)->toBe(1);
});

test('promo code respects minimum purchase amount', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'MIN100',
        'min_purchase' => 100,
        'is_active' => true,
    ]);

    $service = app(PromoCodeService::class);
    $result = $service->validateCode('MIN100', 50);

    expect($result['valid'])->toBeFalse();
});

test('promo code respects maximum discount', function () {
    $promoCode = PromoCode::factory()->create([
        'code' => 'MAX10',
        'type' => 'percentage',
        'value' => 50,
        'max_discount' => 10,
        'is_active' => true,
    ]);

    $service = app(PromoCodeService::class);
    $result = $service->validateCode('MAX10', 100);

    expect($result['valid'])->toBeTrue();
    expect($result['discount'])->toBe(10.0); // Capped at max_discount
});

test('promo code can be event-specific', function () {
    $event = Event::factory()->create();
    $promoCode = PromoCode::factory()->create([
        'code' => 'EVENTSPECIFIC',
        'applicable_to' => [$event->id],
        'is_active' => true,
    ]);

    $service = app(PromoCodeService::class);
    
    // Valid for specific event
    $result = $service->validateCode('EVENTSPECIFIC', 100, $event->id);
    expect($result['valid'])->toBeTrue();
    
    // Invalid for different event
    $otherEvent = Event::factory()->create();
    $result = $service->validateCode('EVENTSPECIFIC', 100, $otherEvent->id);
    expect($result['valid'])->toBeFalse();
});

test('authenticated user can update promo code', function () {
    $user = User::factory()->create();
    $promoCode = PromoCode::factory()->create();

    $this->actingAs($user);

    $response = $this->put("/promo-codes/{$promoCode->id}", [
        'code' => 'UPDATED',
        'description' => 'Updated Description',
        'type' => 'percentage',
        'value' => 25,
        'is_active' => true,
    ]);

    $response->assertRedirect();
    
    $this->assertDatabaseHas('promo_codes', [
        'id' => $promoCode->id,
        'code' => 'UPDATED',
        'value' => 25,
    ]);
});

test('authenticated user can delete promo code', function () {
    $user = User::factory()->create();
    $promoCode = PromoCode::factory()->create();

    $this->actingAs($user);

    $response = $this->delete("/promo-codes/{$promoCode->id}");
    $response->assertRedirect();
    
    $this->assertDatabaseMissing('promo_codes', [
        'id' => $promoCode->id,
    ]);
});
