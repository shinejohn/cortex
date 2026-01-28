<?php

namespace App\Providers;

use App\AiTools\Domain\ArticleTool;
use App\AiTools\Domain\BusinessTool;
use App\AiTools\Domain\NewsroomTool;
use App\AiTools\Domain\OpportunityTool;
use App\AiTools\Domain\PollTool;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\ServiceProvider;

class AiToolsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // This provider depends on AiToolsCoreServiceProvider being booted or bound
        // The core provider registers the singleton, so we resolve it here.

        $registry = $this->app->make(ToolRegistry::class);

        $registry->registerMany([
            new BusinessTool(),
            new ArticleTool(),
            new PollTool(),
            new OpportunityTool(),
            new NewsroomTool(),
        ]);
    }
}
