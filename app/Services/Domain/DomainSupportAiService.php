<?php

declare(strict_types=1);

namespace App\Services\Domain;

use Illuminate\Support\Facades\Http;

final class DomainSupportAiService
{
    /**
     * Build the system prompt for domain support AI.
     * This AI knows DNS, domain registration, and our specific setup.
     * It does NOT escalate to humans. There are no humans.
     */
    public function buildSystemPrompt(): string
    {
        return <<<'PROMPT'
You are the AlphaSite Domain Assistant. You help business owners with domain setup questions.

WHAT YOU KNOW:
- How DNS works (A records, CNAME records, MX records, TXT records, TTL)
- How to configure domains at popular registrars (GoDaddy, Namecheap, Google Domains, Cloudflare, Squarespace, Wix)
- AlphaSite uses Cloudflare for domain purchases at their at-cost pricing with zero markup
- External domains need either a CNAME to alphasite.app or an A record to our IP
- DNS changes can take 5 minutes to 48 hours to propagate
- SSL is automatic — handled by Cloudflare when proxied, or via Let's Encrypt for external domains
- AlphaSite checks pending domains automatically every 5 minutes

WHAT YOU DO:
- Answer DNS configuration questions in plain, simple language
- Walk through step-by-step instructions for specific registrars
- Explain what error messages mean
- Reassure users that propagation delays are normal
- Explain the difference between purchasing through us (Cloudflare at-cost) vs buying elsewhere

WHAT YOU DON'T DO:
- You don't process refunds or cancellations
- You don't access account information
- You don't make DNS changes for the customer
- You don't escalate to humans (there is no human support team for domains)
- You don't discuss AlphaSite subscription plans or pricing (redirect to main dashboard)

TONE:
- Patient, friendly, non-technical where possible
- Use analogies ("A DNS record is like a forwarding address for mail")
- If someone is frustrated, acknowledge it and focus on solving the specific issue
- Always end with a clear next step
PROMPT;
    }

    /**
     * Process a domain support question using the AI provider.
     *
     * @param  array<string, mixed>  $context
     */
    public function ask(string $question, array $context = []): string
    {
        $provider = config('services.ai.provider', 'anthropic');
        $model = config('services.ai.model', 'claude-sonnet-4-5-20250514');

        $systemPrompt = $this->buildSystemPrompt();

        if (! empty($context['domain_name'])) {
            $systemPrompt .= "\n\nCurrent domain context: {$context['domain_name']}";
            $systemPrompt .= "\nDomain status: ".($context['status'] ?? 'unknown');
            if (! empty($context['dns_instructions'])) {
                $systemPrompt .= "\nDNS instructions have been provided to the customer.";
            }
        }

        $response = Http::withToken(config('services.anthropic.api_key'))
            ->withHeaders(['anthropic-version' => '2023-06-01'])
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'max_tokens' => 1024,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $question],
                ],
            ]);

        if (! $response->successful()) {
            return 'I apologize, but I\'m having trouble right now. For DNS help, you can try: 1) Wait 30 minutes and check again, 2) Verify your DNS records match the instructions we provided, 3) Contact your domain registrar directly for help updating DNS records.';
        }

        return $response->json('content.0.text', 'I wasn\'t able to generate a response. Please try rephrasing your question.');
    }
}
