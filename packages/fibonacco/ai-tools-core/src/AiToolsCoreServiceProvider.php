<?php

namespace Fibonacco\AiToolsCore;

use Fibonacco\AiToolsCore\Agent\AgentRunner;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Fibonacco\AiToolsCore\Tools\Infrastructure\DatabaseQueryTool;
use Fibonacco\AiToolsCore\Tools\Infrastructure\DatabaseSchemaTool;
use Illuminate\Support\ServiceProvider;

class AiToolsCoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/ai-tools-core.php', 'ai-tools-core');

        $this->app->singleton(ToolRegistry::class);
        $this->app->singleton(AgentRunner::class);
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/ai-tools-core.php' => config_path('ai-tools-core.php'),
            ], 'ai-tools-core-config');
        }

        // Register default infrastructure tools
        $registry = $this->app->make(ToolRegistry::class);
        $registry->registerMany([
            new DatabaseQueryTool(),
            new DatabaseSchemaTool(),
        ]);
    }
}
