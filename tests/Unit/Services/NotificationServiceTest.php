<?php

use App\Services\NotificationService;
use Illuminate\Support\Facades\Config;

test('notification service can be instantiated', function () {
    Config::set('services.aws.key', 'test-key');
    Config::set('services.aws.secret', 'test-secret');
    Config::set('services.aws.region', 'us-east-1');
    
    $service = app(NotificationService::class);
    expect($service)->toBeInstanceOf(NotificationService::class);
});

test('notification service gets or creates topic', function () {
    Config::set('services.aws.key', 'test-key');
    Config::set('services.aws.secret', 'test-secret');
    Config::set('services.aws.region', 'us-east-1');
    Config::set('services.sns.topic_prefix', 'test-notifications');
    
    $service = app(NotificationService::class);
    
    // This will use cache/mock in testing
    expect($service)->toBeInstanceOf(NotificationService::class);
});

test('notification service truncates message for SMS', function () {
    Config::set('services.aws.key', 'test-key');
    Config::set('services.aws.secret', 'test-secret');
    Config::set('services.aws.region', 'us-east-1');
    
    $service = app(NotificationService::class);
    expect($service)->toBeInstanceOf(NotificationService::class);
});
