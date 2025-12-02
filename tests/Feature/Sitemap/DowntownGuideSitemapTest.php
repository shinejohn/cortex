<?php

declare(strict_types=1);

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    config(['domains.downtown-guide' => 'downtownguide.test']);
    $this->baseUrl = 'http://downtownguide.test';
});

describe('robots.txt', function () {
    it('returns valid robots.txt with sitemap reference', function () {
        $response = $this->get($this->baseUrl.'/robots.txt');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertSee('User-agent: *');
        $response->assertSee('Allow: /');
        $response->assertSee('Sitemap: https://downtownguide.test/sitemap.xml');
    });
});

describe('sitemap', function () {
    it('returns valid XML sitemap with homepage', function () {
        $response = $this->get($this->baseUrl.'/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml');
        $response->assertSee('<urlset', false);
        $response->assertSee('https://downtownguide.test', false);
    });
});
