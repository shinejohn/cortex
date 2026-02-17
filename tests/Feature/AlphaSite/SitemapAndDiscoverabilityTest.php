<?php

declare(strict_types=1);

beforeEach(function () {
    config(['domains.alphasite' => 'alphasite.test']);
});

test('sitemap returns xml', function () {
    $response = $this->get('http://alphasite.test/sitemap.xml');

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/xml');
});

test('sitemap index returns xml', function () {
    $response = $this->get('http://alphasite.test/sitemap-index.xml');

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/xml');
});

test('llms.txt returns text content', function () {
    $response = $this->get('http://alphasite.test/llms.txt');

    $response->assertSuccessful();
    expect(str_starts_with(mb_strtolower($response->headers->get('Content-Type', '')), 'text/plain'))->toBeTrue();
});

test('ai plugin json returns valid json', function () {
    $response = $this->get('http://alphasite.test/.well-known/ai-plugin.json');

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/json');
    $data = $response->json();
    expect($data)->toHaveKey('schema_version');
    expect($data)->toHaveKey('name_for_model');
});
