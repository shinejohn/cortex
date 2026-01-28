<?php

declare(strict_types=1);

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\Facades\Facade;

/**
 * @method static array query(string $query, array $context = [])
 * @method static array agent(string $prompt, array $tools = [])
 * @method static array workflow(string $workflow, array $parameters = [])
 * @method static array getTools()
 */
class AiGatewayFacade extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'ai-gateway-client';
    }
}
