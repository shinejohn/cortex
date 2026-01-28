<?php

declare(strict_types=1);

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiGatewayClient
{
    protected string $url;
    protected string $token;
    protected int $timeout;
    protected string $platform;

    public function __construct(string $url, string $token, int $timeout = 120)
    {
        $this->url = rtrim($url, '/');
        $this->token = $token;
        $this->timeout = $timeout;
        $this->platform = config('ai-tools-core.platform', 'unknown');
    }

    /**
     * Send a query to the AI Gateway
     */
    public function query(string $query, array $context = []): array
    {
        return $this->send('POST', '/api/ai/query', [
            'query' => $query,
            'context' => $context,
            'platform' => $this->platform,
        ]);
    }

    /**
     * Execute an agent task via the Gateway
     */
    public function agent(string $prompt, array $tools = []): array
    {
        return $this->send('POST', '/api/ai/agent', [
            'prompt' => $prompt,
            'tools' => $tools,
            'platform' => $this->platform,
        ]);
    }

    /**
     * Trigger a workflow
     */
    public function workflow(string $workflow, array $parameters = []): array
    {
        return $this->send('POST', '/api/ai/workflow', [
            'workflow' => $workflow,
            'parameters' => $parameters,
            'platform' => $this->platform,
        ]);
    }

    /**
     * Get available tools from the Gateway
     */
    public function getTools(): array
    {
        return $this->send('GET', '/api/ai/tools');
    }

    protected function send(string $method, string $endpoint, array $data = []): array
    {
        try {
            $response = Http::withToken($this->token)
                        ->timeout($this->timeout)
                        ->withHeaders([
                            'X-Platform-ID' => $this->platform,
                            'Accept' => 'application/json',
                        ])
                ->$method($this->url . $endpoint, $data);

            if ($response->failed()) {
                Log::error('AI Gateway Error', [
                    'endpoint' => $endpoint,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'error' => true,
                    'message' => "Gateway error: {$response->status()}",
                    'details' => $response->json(),
                ];
            }

            return $response->json();

        } catch (\Exception $e) {
            Log::error('AI Gateway Connection Failed', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => true,
                'message' => 'Connection to AI Gateway failed',
            ];
        }
    }
}
