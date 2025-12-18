<?php

declare(strict_types=1);

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\WriterAgent;

it('can create a writer agent', function () {
    $agent = WriterAgent::factory()->create([
        'name' => 'Sarah Mitchell',
        'writing_style' => WriterAgent::STYLE_CONVERSATIONAL,
    ]);

    expect($agent->name)->toBe('Sarah Mitchell');
    expect($agent->writing_style)->toBe(WriterAgent::STYLE_CONVERSATIONAL);
    expect($agent->is_active)->toBeTrue();
});

it('auto generates slug from name', function () {
    $agent = WriterAgent::factory()->create([
        'name' => 'John Smith',
    ]);

    expect($agent->slug)->toBe('john-smith');
});

it('auto generates unique slugs even with similar names', function () {
    $agent1 = WriterAgent::factory()->create(['name' => 'John Smith']);
    $agent2 = WriterAgent::factory()->create(['name' => 'John A. Smith']);

    expect($agent1->slug)->toBe('john-smith');
    expect($agent2->slug)->toBe('john-a-smith');
});

it('auto generates unique slugs for duplicate names', function () {
    $agent1 = WriterAgent::factory()->create(['name' => 'John Smith']);
    $agent2 = WriterAgent::factory()->create(['name' => 'John Smith']);

    expect($agent1->slug)->toBe('john-smith');
    expect($agent2->slug)->toBe('john-smith-1');
});

it('auto generates avatar url using DiceBear', function () {
    $agent = WriterAgent::factory()->create([
        'name' => 'Sarah Mitchell',
        'avatar' => null,
    ]);

    expect($agent->avatar_url)->toContain('api.dicebear.com');
    expect($agent->avatar_url)->toContain('Sarah');
    expect($agent->avatar_url)->toContain('Mitchell');
});

it('uses custom avatar url when provided', function () {
    $agent = WriterAgent::factory()->create([
        'avatar' => 'https://example.com/avatar.jpg',
    ]);

    expect($agent->avatar_url)->toBe('https://example.com/avatar.jpg');
});

it('can have regions via many-to-many relationship', function () {
    $agent = WriterAgent::factory()->create();
    $region1 = Region::factory()->create();
    $region2 = Region::factory()->create();

    $agent->regions()->attach([$region1->id, $region2->id]);

    expect($agent->regions)->toHaveCount(2);
    expect($agent->regions->pluck('id')->toArray())->toContain($region1->id);
    expect($agent->regions->pluck('id')->toArray())->toContain($region2->id);
});

it('can have posts via hasMany relationship', function () {
    $agent = WriterAgent::factory()->create();

    DayNewsPost::factory()->create(['writer_agent_id' => $agent->id]);
    DayNewsPost::factory()->create(['writer_agent_id' => $agent->id]);

    expect($agent->posts)->toHaveCount(2);
});

it('has active scope', function () {
    WriterAgent::factory()->create(['is_active' => true]);
    WriterAgent::factory()->create(['is_active' => false]);

    expect(WriterAgent::active()->count())->toBe(1);
});

it('has forRegion scope', function () {
    $region = Region::factory()->create();
    $agent = WriterAgent::factory()->create();
    $agent->regions()->attach($region->id);

    WriterAgent::factory()->create(); // Agent without region

    expect(WriterAgent::forRegion($region->id)->count())->toBe(1);
});

it('has forCategory scope', function () {
    WriterAgent::factory()->create(['categories' => ['local_news', 'sports']]);
    WriterAgent::factory()->create(['categories' => ['business', 'health']]);

    expect(WriterAgent::forCategory('sports')->count())->toBe(1);
    expect(WriterAgent::forCategory('business')->count())->toBe(1);
    expect(WriterAgent::forCategory('weather')->count())->toBe(0);
});

it('can check if agent handles category', function () {
    $agent = WriterAgent::factory()->create([
        'categories' => ['local_news', 'sports', 'community'],
    ]);

    expect($agent->handlesCategory('sports'))->toBeTrue();
    expect($agent->handlesCategory('weather'))->toBeFalse();
    expect($agent->handlesCategory(['sports', 'weather']))->toBeTrue();
});

it('casts prompts as array', function () {
    $agent = WriterAgent::factory()->create([
        'prompts' => [
            'system_prompt' => 'You are a journalist.',
            'style_instructions' => 'Write clearly.',
        ],
    ]);

    expect($agent->prompts)->toBeArray();
    expect($agent->system_prompt)->toBe('You are a journalist.');
    expect($agent->style_instructions)->toBe('Write clearly.');
});

it('casts categories as array', function () {
    $agent = WriterAgent::factory()->create([
        'categories' => ['local_news', 'sports'],
    ]);

    expect($agent->categories)->toBeArray();
    expect($agent->categories)->toContain('local_news');
    expect($agent->categories)->toContain('sports');
});
