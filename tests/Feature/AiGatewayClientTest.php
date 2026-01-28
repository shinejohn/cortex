<?php

use Fibonacco\AiGatewayClient\AiGatewayFacade;
use Illuminate\Support\Facades\Http;

test('it can query the ai gateway', function () {
    Http::fake([
        'ai-gateway.fibonacco.com/*' => Http::response(['result' => 'Success'], 200),
    ]);

    $response = AiGatewayFacade::query('Hello world');

    expect($response)
        ->toBeArray()
        ->toHaveKey('result', 'Success');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://ai-gateway.fibonacco.com/api/ai/query' &&
            $request->method() === 'POST' &&
            $request->hasHeader('X-Platform-ID', 'daynews') &&
            $request['query'] === 'Hello world';
    });
});

test('it can run an agent task', function () {
    Http::fake([
        'ai-gateway.fibonacco.com/*' => Http::response(['output' => 'Done'], 200),
    ]);

    $response = AiGatewayFacade::agent('Do something', ['tool_1']);

    expect($response)
        ->toBeArray()
        ->toHaveKey('output', 'Done');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://ai-gateway.fibonacco.com/api/ai/agent' &&
            $request['prompt'] === 'Do something' &&
            $request['tools'] === ['tool_1'];
    });
});

test('it handles gateway errors gracefully', function () {
    Http::fake([
        'ai-gateway.fibonacco.com/*' => Http::response(['error' => 'Server Error'], 500),
    ]);

    $response = AiGatewayFacade::query('Fail me');

    expect($response)
        ->toBeArray()
        ->toHaveKey('error', true)
        ->toHaveKey('message', 'Gateway error: 500');
});

