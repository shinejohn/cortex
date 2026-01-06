<?php

use App\Services\WriterAgent\AgentGenerationService;

test('AgentGenerationService can be instantiated', function () {
    $service = app(App\Services\WriterAgent\AgentGenerationService::class);
    expect($service)->toBeInstanceOf(App\Services\WriterAgent\AgentGenerationService::class);
});
