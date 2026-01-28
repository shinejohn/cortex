<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools;

use Fibonacco\AiToolsCore\Contracts\AiTool;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Prism\Prism\Tool;
use Throwable;

abstract class BaseTool implements AiTool
{
    protected string $toolCategory = 'general';
    protected bool $authRequired = false;
    protected ?string $requiredPermission = null;
    protected bool $logExecutions = true;

    /**
     * Convert to Prism Tool definition
     */
    public function toPrismTool(): Tool
    {
        $tool = Tool:: as($this->name())->for($this->description());

        foreach ($this->parameters() as $name => $config) {
            $desc = $config['description'] ?? '';
            $req = $config['required'] ?? false;

            $tool = match ($config['type']) {
                'string' => $tool->withStringParameter($name, $desc, $req),
                'integer', 'number' => $tool->withNumberParameter($name, $desc, $req),
                'boolean' => $tool->withBooleanParameter($name, $desc, $req),
                'array' => $tool->withArrayParameter($name, $desc, $req),
                'enum' => $tool->withEnumParameter($name, $config['enum'] ?? [], $desc, $req),
                default => $tool->withStringParameter($name, $desc, $req),
            };
        }

        return $tool->using(fn(...$args) => $this->safeExecute($this->mapArgs($args)));
    }

    /**
     * Map positional arguments to named parameters
     */
    protected function mapArgs(array $args): array
    {
        $keys = array_keys($this->parameters());
        $mapped = [];
        foreach ($args as $i => $v) {
            if (isset($keys[$i])) {
                $mapped[$keys[$i]] = $v;
            }
        }
        return $mapped;
    }

    /**
     * Safe execution with logging, validation, error handling
     */
    protected function safeExecute(array $params): string
    {
        $start = microtime(true);
        $toolName = $this->name();

        try {
            // Validate parameters
            $this->validateParameters($params);

            // Check authentication
            if ($this->authRequired && !auth()->check()) {
                throw new \RuntimeException("Tool '{$toolName}' requires authentication");
            }

            // Check permission
            if ($this->requiredPermission && !auth()->user()?->can($this->requiredPermission)) {
                throw new \RuntimeException("Permission denied for tool '{$toolName}'");
            }

            // Execute
            $result = $this->execute($params);

            // Log success
            if ($this->logExecutions) {
                Log::info("AI Tool: {$toolName}", [
                    'tool' => $toolName,
                    'category' => $this->category(),
                    'duration_ms' => round((microtime(true) - $start) * 1000, 2),
                    'platform' => config('ai-tools-core.platform', 'unknown'),
                    'user_id' => auth()->id(),
                ]);
            }

            return $this->formatResult($result);

        } catch (ValidationException $e) {
            Log::warning("AI Tool validation failed: {$toolName}", [
                'errors' => $e->errors(),
            ]);
            return json_encode([
                'error' => true,
                'type' => 'validation',
                'message' => implode(', ', array_map(fn($errs) => implode(', ', $errs), $e->errors())),
            ]);

        } catch (Throwable $e) {
            Log::error("AI Tool error: {$toolName}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return json_encode([
                'error' => true,
                'type' => 'execution',
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Validate parameters against schema
     */
    protected function validateParameters(array $params): void
    {
        $rules = [];

        foreach ($this->parameters() as $name => $config) {
            $ruleSet = [];

            if ($config['required'] ?? false) {
                $ruleSet[] = 'required';
            } else {
                $ruleSet[] = 'nullable';
            }

            $ruleSet[] = match ($config['type']) {
                'string' => 'string',
                'integer' => 'integer',
                'number' => 'numeric',
                'boolean' => 'boolean',
                'array' => 'array',
                'enum' => 'in:' . implode(',', $config['enum'] ?? []),
                default => 'string',
            };

            $rules[$name] = implode('|', $ruleSet);
        }

        $validator = Validator::make($params, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Format result for LLM consumption
     */
    protected function formatResult(mixed $result): string
    {
        if (is_string($result)) {
            return $result;
        }
        return json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }

    public function category(): string
    {
        return $this->toolCategory;
    }

    public function requiresAuth(): bool
    {
        return $this->authRequired;
    }

    public function permission(): ?string
    {
        return $this->requiredPermission;
    }
}
