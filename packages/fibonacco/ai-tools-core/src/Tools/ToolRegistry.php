<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools;

use Fibonacco\AiToolsCore\Contracts\AiTool;

class ToolRegistry
{
    /** @var array<string, AiTool> */
    protected array $tools = [];

    /** @var array<string, array<string>> */
    protected array $categories = [];

    /**
     * Register a tool
     */
    public function register(AiTool $tool): self
    {
        $name = $tool->name();
        $this->tools[$name] = $tool;

        $category = $tool->category();
        if (!isset($this->categories[$category])) {
            $this->categories[$category] = [];
        }
        $this->categories[$category][] = $name;

        return $this;
    }

    /**
     * Register multiple tools
     */
    public function registerMany(array $tools): self
    {
        foreach ($tools as $tool) {
            $this->register($tool);
        }
        return $this;
    }

    /**
     * Get tool by name
     */
    public function get(string $name): ?AiTool
    {
        return $this->tools[$name] ?? null;
    }

    /**
     * Get Prism Tool definitions
     */
    public function getPrismTools(?array $names = null): array
    {
        $tools = $names === null
            ? $this->tools
            : array_intersect_key($this->tools, array_flip($names));

        return array_map(
            fn(AiTool $tool) => $tool->toPrismTool(),
            array_values($tools)
        );
    }

    /**
     * Execute tool by name
     */
    public function execute(string $name, array $parameters): mixed
    {
        $tool = $this->get($name);

        if (!$tool) {
            throw new \InvalidArgumentException("Unknown tool: {$name}");
        }

        return $tool->execute($parameters);
    }

    /**
     * Get tool names
     */
    public function names(): array
    {
        return array_keys($this->tools);
    }
}
