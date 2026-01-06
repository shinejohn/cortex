<?php

use App\Services\AlphaSite\TemplateService;

test('TemplateService can be instantiated', function () {
    $service = app(AlphaSite\TemplateService::class);
    expect($service)->toBeInstanceOf(AlphaSite\TemplateService::class);
});
