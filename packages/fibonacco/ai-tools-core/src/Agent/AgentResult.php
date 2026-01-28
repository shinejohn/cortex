<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Agent;

class AgentResult
{
    public function __construct(
        public readonly string $output,
        public readonly array $toolCalls = []
    ) {
    }
}
