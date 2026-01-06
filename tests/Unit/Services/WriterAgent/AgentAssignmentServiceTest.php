<?php

use App\Services\WriterAgent\AgentAssignmentService;

test('AgentAssignmentService can be instantiated', function () {
    $service = app(App\Services\WriterAgent\AgentAssignmentService::class);
    expect($service)->toBeInstanceOf(App\Services\WriterAgent\AgentAssignmentService::class);
});
