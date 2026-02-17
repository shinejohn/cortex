<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessFaq;
use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use App\Services\AIService;
use Illuminate\Support\Collection;

final class AIConciergeService
{
    public function __construct(
        private readonly AIService $aiService,
        private readonly SMBCrmService $crmService
    ) {}

    /**
     * Process an incoming chat message from a customer on the AlphaSite business page
     *
     * @return array{response: string, conversation_id: string|null, confidence: float, escalated: bool}
     */
    public function processMessage(
        Business $business,
        string $message,
        ?string $conversationId = null,
        ?array $customerInfo = null
    ): array {
        $customer = $this->identifyOrCreateCustomer($business, $customerInfo);
        $systemPrompt = $this->buildSystemPrompt($business);
        $relevantFaqs = $this->findRelevantFaqs($business, $message);

        $context = $relevantFaqs->isNotEmpty()
            ? "\nRelevant FAQ context:\n".$relevantFaqs->map(fn (BusinessFaq $f) => "Q: {$f->question}\nA: {$f->answer}")->join("\n\n")
            : '';

        $userPrompt = $message.$context;

        $response = $this->aiService->generateWithOpenAI($userPrompt, [
            'system' => $systemPrompt,
            'model' => 'gpt-4',
            'max_tokens' => 500,
        ]);

        if (empty($response)) {
            $response = $this->aiService->generateWithAnthropic($userPrompt, [
                'model' => 'claude-3-sonnet-20240229',
                'max_tokens' => 500,
            ]);
        }

        $confidence = $this->estimateConfidence($message, $response, $relevantFaqs);
        $escalated = $this->shouldEscalate($message, $confidence);

        $this->recordInteraction($business, $message, $response, $confidence, $customer);

        return [
            'response' => $response ?: 'I apologize, but I\'m having trouble responding right now. Please contact the business directly.',
            'conversation_id' => $conversationId,
            'confidence' => $confidence,
            'escalated' => $escalated,
        ];
    }

    private function buildSystemPrompt(Business $business): string
    {
        $industry = $business->industry?->name ?? 'local business';
        $address = $business->address ?? '';
        $city = $business->city ?? '';
        $state = $business->state ?? '';
        $location = mb_trim("{$address}, {$city}, {$state}");

        $hours = $business->opening_hours;
        $formattedHours = is_array($hours)
            ? json_encode($hours, JSON_PRETTY_PRINT)
            : (string) $hours;

        $faqs = $business->activeFaqs()->limit(20)->get();
        $faqBlock = $faqs->map(fn (BusinessFaq $f) => "Q: {$f->question}\nA: {$f->answer}")->join("\n\n");

        return <<<PROMPT
You are an AI concierge for {$business->name}, a {$industry} located at {$location}.

BUSINESS HOURS:
{$formattedHours}

SERVICES:
{$business->description}

FREQUENTLY ASKED QUESTIONS:
{$faqBlock}

INSTRUCTIONS:
- Answer customer questions accurately based on the FAQ database above
- If a question is not covered by the FAQ, provide a helpful general response and note that the customer should contact the business directly for specifics
- For booking/reservation requests, collect: name, date, time, party size, and confirm with the customer
- For complaints, acknowledge the concern empathetically and offer to escalate to the business owner
- Never make up business policies, prices, or availability that aren't in the provided data
- Be warm, professional, and concise
- Always mention the business name naturally in your first response
PROMPT;
    }

    /**
     * @return Collection<int, BusinessFaq>
     */
    private function findRelevantFaqs(Business $business, string $query): Collection
    {
        $faqs = $business->activeFaqs()->get();

        if ($faqs->isEmpty()) {
            return collect();
        }

        $queryLower = mb_strtolower($query);
        $queryWords = array_filter(explode(' ', preg_replace('/[^\w\s]/', ' ', $queryLower)));

        return $faqs->filter(function (BusinessFaq $faq) use ($queryWords) {
            $text = mb_strtolower($faq->question.' '.$faq->answer);
            $matches = array_filter($queryWords, fn (string $w) => mb_strlen($w) > 2 && mb_strpos($text, $w) !== false);

            return count($matches) >= min(1, count($queryWords));
        })->take(5)->values();
    }

    private function estimateConfidence(string $message, string $response, Collection $relevantFaqs): float
    {
        if ($relevantFaqs->isNotEmpty()) {
            return 0.85;
        }

        $uncertaintyPhrases = ['contact the business', 'directly', 'not sure', 'apologize', 'unable to'];
        $hasUncertainty = false;
        foreach ($uncertaintyPhrases as $phrase) {
            if (mb_strpos(mb_strtolower($response), $phrase) !== false) {
                $hasUncertainty = true;
                break;
            }
        }

        return $hasUncertainty ? 0.5 : 0.7;
    }

    private function shouldEscalate(string $message, float $confidence): bool
    {
        $complaintWords = ['complaint', 'angry', 'frustrated', 'disappointed', 'unhappy', 'refund'];
        $messageLower = mb_strtolower($message);
        $isComplaint = false;
        foreach ($complaintWords as $word) {
            if (mb_strpos($messageLower, $word) !== false) {
                $isComplaint = true;
                break;
            }
        }

        return $isComplaint || $confidence < 0.5;
    }

    private function recordInteraction(
        Business $business,
        string $message,
        string $response,
        float $confidence,
        ?SMBCrmCustomer $customer
    ): SMBCrmInteraction {
        return $this->crmService->recordInteraction($business, $customer, 'chat', [
            'channel' => 'alphasite',
            'direction' => 'inbound',
            'content' => $message,
            'handled_by' => 'ai',
            'ai_service' => 'concierge',
            'confidence' => $confidence,
            'outcome' => 'answered',
            'metadata' => ['response_preview' => mb_substr($response, 0, 200)],
        ]);
    }

    private function identifyOrCreateCustomer(Business $business, ?array $customerInfo): ?SMBCrmCustomer
    {
        if (! $customerInfo || empty($customerInfo['customer_email'])) {
            return null;
        }

        $email = $customerInfo['customer_email'];
        $name = $customerInfo['customer_name'] ?? '';

        $parts = explode(' ', mb_trim($name), 2);
        $firstName = $parts[0] ?? null;
        $lastName = $parts[1] ?? null;

        return $this->crmService->createOrUpdateCustomer($business, [
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'status' => 'lead',
            'source' => 'alphasite_chat',
        ]);
    }
}
