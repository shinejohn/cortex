<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Agent;

use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\Facades\Log;
use Throwable;

class AgentRunner
{
    public function __construct(
        protected ToolRegistry $registry
    ) {
    }

    /**
     * Run agent with tools
     */
    public function run(
        string $prompt,
        array $tools = [],
        ?array $model = null,
        ?string $systemPrompt = null
    ): AgentResult {
        $model = $model ?? config('ai-tools-core.default_model', ['openrouter', 'anthropic/claude-3-sonnet']);
        $tools = empty($tools) ? $this->registry->names() : $tools;
        // Check if prism helper exists, otherwise fail gracefully (Prism library dependency)
        if (!function_exists('prism')) {
            throw new \RuntimeException("Prism library not installed or helpers unavailable.");
        }

        $prismTools = $this->registry->getPrismTools($tools);
        $systemPrompt = $systemPrompt ?? $this->buildSystemPrompt($tools);

        try {
            $response = prism()
                ->text()
                ->using(...$model)
                ->withSystemPrompt($systemPrompt)
                ->withTools($prismTools)
                ->withPrompt($prompt)
                ->generate();

            return new AgentResult(
                output: $response->text,
                toolCalls: $response->steps
            );

        } catch (Throwable $e) {
            Log::error("Agent execution failed", [
                'error' => $e->getMessage(),
                'prompt' => substr($prompt, 0, 100) . '...',
            ]);

            throw $e;
        }
    }

    protected function buildSystemPrompt(array $tools): string
    {
        $toolDescriptions = $this->registry->getDescriptions($tools);
        $platform = config('ai-tools-core.platform', 'unknown');

        return <<<PROMPT
You are an AI assistant for the {$platform} platform.
You have access to the following tools:

{$toolDescriptions}

Use these tools to answer the user's request.
Always verify database schema before querying.
If you cannot complete a task, explain why.
PROMPT;
    }
}
