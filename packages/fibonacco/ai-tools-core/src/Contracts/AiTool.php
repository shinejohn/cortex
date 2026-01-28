<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Contracts;

interface AiTool
{
    /**
     * Unique tool identifier (e.g., 'database_query')
     */
    public function name(): string;

    /**
     * Human-readable description for AI
     */
    public function description(): string;

    /**
     * Parameter definitions
     * 
     * Format: [
     *   'param_name' => [
     *     'type' => 'string|integer|boolean|array|enum',
     *     'description' => 'What this param does',
     *     'required' => true|false,
     *     'enum' => ['option1', 'option2'], // for enum type only
     *   ]
     * ]
     */
    public function parameters(): array;

    /**
     * Execute the tool
     */
    public function execute(array $parameters): mixed;

    /**
     * Convert to Prism Tool for LLM
     */
    public function toPrismTool(): \Prism\Prism\Tool;

    /**
     * Tool category for organization
     */
    public function category(): string;

    /**
     * Whether tool requires authenticated user
     */
    public function requiresAuth(): bool;

    /**
     * Required permission (null = no permission needed)
     */
    public function permission(): ?string;
}
