<?php

declare(strict_types=1);

namespace App\Services;

use Aws\Sns\SnsClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

final class NotificationService
{
    private SnsClient $snsClient;
    private string $topicPrefix;

    public function __construct()
    {
        $awsKey = config('services.sns.key', config('services.ses.key'));
        $awsSecret = config('services.sns.secret', config('services.ses.secret'));
        $awsRegion = config('services.sns.region', config('services.ses.region', 'us-east-1'));

        if (empty($awsKey) || empty($awsSecret)) {
            throw new \RuntimeException(
                'AWS SNS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file. ' .
                'For testing, you can use AWS IAM credentials with SNS permissions from https://console.aws.amazon.com/iam/'
            );
        }

        $this->snsClient = new SnsClient([
            'version' => 'latest',
            'region' => $awsRegion,
            'credentials' => [
                'key' => $awsKey,
                'secret' => $awsSecret,
            ],
        ]);

        $this->topicPrefix = config('services.sns.topic_prefix', 'shine-notifications');
    }

    /**
     * Get or create SNS topic for a platform/community combination
     */
    public function getOrCreateTopic(string $platform, string $communityId): string
    {
        $topicName = "{$this->topicPrefix}-{$platform}-{$communityId}";
        $cacheKey = "sns_topic_arn:{$topicName}";

        return Cache::remember($cacheKey, 86400, function () use ($topicName) {
            try {
                $result = $this->snsClient->createTopic([
                    'Name' => $topicName,
                    'Tags' => [
                        ['Key' => 'Platform', 'Value' => $platform],
                        ['Key' => 'Environment', 'Value' => app()->environment()],
                    ],
                ]);

                return $result['TopicArn'];
            } catch (AwsException $e) {
                // Topic might already exist, try to get it
                if (str_contains($e->getMessage(), 'already exists')) {
                    try {
                        $result = $this->snsClient->listTopics();
                        foreach ($result['Topics'] as $topic) {
                            if (str_contains($topic['TopicArn'], $topicName)) {
                                return $topic['TopicArn'];
                            }
                        }
                    } catch (AwsException $listException) {
                        Log::error('SNS Topic List Failed', [
                            'topic' => $topicName,
                            'error' => $listException->getMessage()
                        ]);
                    }
                }

                Log::error('SNS Topic Creation Failed', [
                    'topic' => $topicName,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Subscribe phone number to SMS notifications
     */
    public function subscribePhoneToSMS(string $phoneNumber, string $platform, string $communityId): ?string
    {
        $topicArn = $this->getOrCreateTopic($platform, $communityId);

        try {
            $result = $this->snsClient->subscribe([
                'TopicArn' => $topicArn,
                'Protocol' => 'sms',
                'Endpoint' => $phoneNumber,
                'ReturnSubscriptionArn' => true,
            ]);

            return $result['SubscriptionArn'];
        } catch (AwsException $e) {
            Log::error('SMS Subscription Failed', [
                'phone' => substr($phoneNumber, 0, 6) . '****',
                'platform' => $platform,
                'community' => $communityId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Send SMS directly (for verification codes, urgent alerts)
     */
    public function sendDirectSMS(string $phoneNumber, string $message, ?string $senderId = null): bool
    {
        try {
            $params = [
                'PhoneNumber' => $phoneNumber,
                'Message' => $message,
                'MessageAttributes' => [
                    'AWS.SNS.SMS.SMSType' => [
                        'DataType' => 'String',
                        'StringValue' => config('services.sns.sms_type', 'Transactional'),
                    ],
                ],
            ];

            if ($senderId) {
                $params['MessageAttributes']['AWS.SNS.SMS.SenderID'] = [
                    'DataType' => 'String',
                    'StringValue' => $senderId,
                ];
            }

            $this->snsClient->publish($params);
            return true;
        } catch (AwsException $e) {
            Log::error('Direct SMS Failed', [
                'phone' => substr($phoneNumber, 0, 6) . '****',
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Publish notification to topic (broadcasts to all subscribers)
     */
    public function publishToTopic(
        string $platform,
        string $communityId,
        string $message,
        array $options = []
    ): ?string {
        $topicArn = $this->getOrCreateTopic($platform, $communityId);

        try {
            // Build message structure for multi-protocol delivery
            $messageStructure = [
                'default' => $message,
                'sms' => $this->truncateForSMS($message),
            ];

            // Add HTTPS/Lambda payload if provided
            if (isset($options['payload'])) {
                $messageStructure['https'] = json_encode($options['payload']);
                $messageStructure['lambda'] = json_encode($options['payload']);
            }

            $result = $this->snsClient->publish([
                'TopicArn' => $topicArn,
                'MessageStructure' => 'json',
                'Message' => json_encode($messageStructure),
                'Subject' => $options['subject'] ?? null,
                'MessageAttributes' => [
                    'notification_type' => [
                        'DataType' => 'String',
                        'StringValue' => $options['type'] ?? 'general',
                    ],
                    'platform' => [
                        'DataType' => 'String',
                        'StringValue' => $platform,
                    ],
                ],
            ]);

            return $result['MessageId'];
        } catch (AwsException $e) {
            Log::error('Topic Publish Failed', [
                'platform' => $platform,
                'community' => $communityId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Unsubscribe from topic
     */
    public function unsubscribe(string $subscriptionArn): bool
    {
        try {
            $this->snsClient->unsubscribe([
                'SubscriptionArn' => $subscriptionArn,
            ]);
            return true;
        } catch (AwsException $e) {
            Log::error('Unsubscribe Failed', [
                'subscription_arn' => $subscriptionArn,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Truncate message for SMS (160 chars for single segment)
     */
    protected function truncateForSMS(string $message, int $maxLength = 155): string
    {
        if (strlen($message) <= $maxLength) {
            return $message;
        }
        return substr($message, 0, $maxLength - 3) . '...';
    }
}

