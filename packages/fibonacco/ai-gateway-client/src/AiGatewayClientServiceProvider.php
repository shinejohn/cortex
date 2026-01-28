<?php

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Foundation\Application;

class AiGatewayClientServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/ai-gateway-client.php', 'ai-gateway-client');

        $this->app->singleton('ai-gateway-client', function (Application $app) {
            $config = $app['config']['ai-gateway-client'];

            return new AiGatewayClient(
                $config['url'],
                $config['token'],
                $config['timeout'] ?? 120
            );
        });

        $this->app->alias('ai-gateway-client', AiGatewayClient::class);
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/ai-gateway-client.php' => config_path('ai-gateway-client.php'),
            ], 'ai-gateway-client-config');
        }
    }
}
