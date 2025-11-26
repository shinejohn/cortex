<?php

declare(strict_types=1);

namespace App\Console\Commands\NewsWorkflow;

use Exception;
use Illuminate\Console\Command;
use Prism\Prism\Schema\RawSchema;

final class TestOpenRouterCommand extends Command
{
    protected $signature = 'news:test-openrouter';

    protected $description = 'Test OpenRouter AI connectivity and configuration';

    public function handle(): int
    {
        $this->info('Testing OpenRouter configuration...');
        $this->newLine();

        // Check configuration
        $this->line('Checking configuration:');
        $apiKey = config('prism.providers.openrouter.api_key');
        $url = config('prism.providers.openrouter.url');
        $scoringModel = config('news-workflow.ai_models.scoring');
        $outlineModel = config('news-workflow.ai_models.outline');
        $generationModel = config('news-workflow.ai_models.generation');

        $this->table(
            ['Setting', 'Value'],
            [
                ['API Key', $apiKey ? '***'.mb_substr($apiKey, -8) : '<not set>'],
                ['API URL', $url],
                ['Scoring Model', implode(' / ', $scoringModel)],
                ['Outline Model', implode(' / ', $outlineModel)],
                ['Generation Model', implode(' / ', $generationModel)],
            ]
        );

        $this->newLine();

        if (! $apiKey) {
            $this->error('OpenRouter API key is not set!');
            $this->line('Please add OPENROUTER_API_KEY to your .env file');
            $this->line('Get your API key from: https://openrouter.ai/');

            return self::FAILURE;
        }

        // Test simple text generation
        $this->line('Testing OpenRouter connection with simple prompt...');

        try {
            $response = prism()
                ->text()
                ->using(...$scoringModel)
                ->withPrompt('Say "Hello from OpenRouter!" and nothing else.')
                ->withMaxTokens(50)
                ->generate();

            $this->info('✓ Connection successful!');
            $this->line('Response: '.$response->text);
            $this->newLine();

            // Test structured output
            $this->line('Testing structured output...');

            $structuredResponse = prism()
                ->structured()
                ->using(...$scoringModel)
                ->withPrompt('Provide a test score of 85 with a brief rationale.')
                ->withSchema(new RawSchema('test', [
                    'type' => 'object',
                    'properties' => [
                        'score' => [
                            'type' => 'number',
                            'description' => 'A score from 0-100',
                        ],
                        'rationale' => [
                            'type' => 'string',
                            'description' => 'Brief explanation',
                        ],
                    ],
                    'required' => ['score', 'rationale'],
                ]))
                ->generate();

            $data = $structuredResponse->structured;

            $this->info('✓ Structured output successful!');
            $this->line('Score: '.($data['score'] ?? 'N/A'));
            $this->line('Rationale: '.($data['rationale'] ?? 'N/A'));
            $this->newLine();

            $this->info('✓ All tests passed! OpenRouter is ready for news workflow.');

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error('✗ OpenRouter test failed!');
            $this->error("Error: {$e->getMessage()}");
            $this->newLine();
            $this->line('Troubleshooting:');
            $this->line('1. Verify your OPENROUTER_API_KEY is correct');
            $this->line('2. Check your internet connection');
            $this->line('3. Ensure the model is available: '.$scoringModel[1]);

            return self::FAILURE;
        }
    }
}
