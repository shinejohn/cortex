<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AIService
{
    private const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    private const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
    
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Generate content using OpenAI
     */
    public function generateWithOpenAI(string $prompt, array $options = []): string
    {
        $cacheKey = 'ai:openai:' . md5($prompt . serialize($options));
        
        return $this->cacheService->remember($cacheKey, 3600, function () use ($prompt, $options) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                    'Content-Type' => 'application/json',
                ])->post(self::OPENAI_API_URL, [
                    'model' => $options['model'] ?? 'gpt-4',
                    'messages' => [
                        ['role' => 'system', 'content' => $options['system'] ?? 'You are a helpful assistant.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => $options['temperature'] ?? 0.7,
                    'max_tokens' => $options['max_tokens'] ?? 1000,
                ]);

                if ($response->successful()) {
                    return $response->json()['choices'][0]['message']['content'] ?? '';
                }

                Log::error('OpenAI API error', ['response' => $response->body()]);
                return '';
            } catch (\Exception $e) {
                Log::error('OpenAI API exception', ['error' => $e->getMessage()]);
                return '';
            }
        });
    }

    /**
     * Generate content using Anthropic Claude
     */
    public function generateWithAnthropic(string $prompt, array $options = []): string
    {
        $cacheKey = 'ai:anthropic:' . md5($prompt . serialize($options));
        
        return $this->cacheService->remember($cacheKey, 3600, function () use ($prompt, $options) {
            try {
                $response = Http::withHeaders([
                    'x-api-key' => config('services.anthropic.api_key'),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ])->post(self::ANTHROPIC_API_URL, [
                    'model' => $options['model'] ?? 'claude-3-opus-20240229',
                    'max_tokens' => $options['max_tokens'] ?? 1000,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

                if ($response->successful()) {
                    return $response->json()['content'][0]['text'] ?? '';
                }

                Log::error('Anthropic API error', ['response' => $response->body()]);
                return '';
            } catch (\Exception $e) {
                Log::error('Anthropic API exception', ['error' => $e->getMessage()]);
                return '';
            }
        });
    }

    /**
     * Generate business page content
     */
    public function generateBusinessContent(\App\Models\Business $business, string $contentType = 'description'): string
    {
        $prompt = match ($contentType) {
            'description' => $this->buildBusinessDescriptionPrompt($business),
            'about' => $this->buildBusinessAboutPrompt($business),
            'services' => $this->buildBusinessServicesPrompt($business),
            'seo' => $this->buildBusinessSeoPrompt($business),
            default => $this->buildBusinessDescriptionPrompt($business),
        };

        // Use OpenAI by default, fallback to Anthropic if needed
        $content = $this->generateWithOpenAI($prompt, [
            'model' => 'gpt-4',
            'max_tokens' => 500,
        ]);

        if (empty($content)) {
            $content = $this->generateWithAnthropic($prompt, [
                'model' => 'claude-3-opus-20240229',
                'max_tokens' => 500,
            ]);
        }

        return $content;
    }

    /**
     * Generate FAQ answers
     */
    public function generateFaqAnswer(\App\Models\Business $business, string $question): string
    {
        $prompt = "As a representative of {$business->name}, located at {$business->address}, please provide a helpful and accurate answer to the following question: {$question}";
        
        return $this->generateWithOpenAI($prompt, [
            'model' => 'gpt-4',
            'max_tokens' => 300,
        ]);
    }

    /**
     * Analyze customer interaction sentiment
     */
    public function analyzeSentiment(string $text): array
    {
        $prompt = "Analyze the sentiment of the following text and return a JSON object with 'sentiment' (positive/negative/neutral), 'score' (0-1), and 'key_points' (array): {$text}";
        
        $response = $this->generateWithOpenAI($prompt, [
            'model' => 'gpt-4',
            'max_tokens' => 200,
        ]);

        $decoded = json_decode($response, true);
        return $decoded ?: ['sentiment' => 'neutral', 'score' => 0.5, 'key_points' => []];
    }

    /**
     * Generate customer insights
     */
    public function generateCustomerInsights(\App\Models\SMBCrmCustomer $customer): array
    {
        $prompt = "Based on the customer data for {$customer->first_name} {$customer->last_name}, generate insights including health score, lifetime value prediction, and churn risk. Return JSON.";
        
        $response = $this->generateWithOpenAI($prompt, [
            'model' => 'gpt-4',
            'max_tokens' => 300,
        ]);

        $decoded = json_decode($response, true);
        return $decoded ?: [
            'health_score' => 75,
            'lifetime_value' => 0,
            'churn_risk' => 0.3,
        ];
    }

    /**
     * Build business description prompt
     */
    private function buildBusinessDescriptionPrompt(\App\Models\Business $business): string
    {
        return "Write a compelling, SEO-friendly description for {$business->name}, a business located at {$business->address}. " .
               "Include information about their services, what makes them unique, and why customers should visit. " .
               "Keep it concise (2-3 paragraphs) and engaging.";
    }

    /**
     * Build business about prompt
     */
    private function buildBusinessAboutPrompt(\App\Models\Business $business): string
    {
        return "Write an 'About Us' section for {$business->name}. Include their history, mission, values, and what sets them apart. " .
               "Make it personal and engaging (3-4 paragraphs).";
    }

    /**
     * Build business services prompt
     */
    private function buildBusinessServicesPrompt(\App\Models\Business $business): string
    {
        return "List and describe the services offered by {$business->name}. Format as a clear, organized list with brief descriptions for each service.";
    }

    /**
     * Build business SEO prompt
     */
    private function buildBusinessSeoPrompt(\App\Models\Business $business): string
    {
        return "Generate SEO-optimized meta title and description for {$business->name}, located at {$business->address}. " .
               "Include relevant keywords naturally. Return as JSON with 'title' and 'description' fields.";
    }
}

