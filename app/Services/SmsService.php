<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\EmergencyAlert;
use Aws\Sns\SnsClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;

final class SmsService
{
    private SnsClient $sns;

    public function __construct()
    {
        $this->sns = new SnsClient([
            'version' => 'latest',
            'region' => config('services.sns.region', config('services.ses.region', 'us-east-1')),
            'credentials' => [
                'key' => config('services.sns.key', config('services.ses.key')),
                'secret' => config('services.sns.secret', config('services.ses.secret')),
            ],
        ]);
    }

    /**
     * Send emergency alert SMS
     */
    public function sendEmergencyAlert(string $phoneNumber, EmergencyAlert $alert): string
    {
        $message = $this->formatEmergencyMessage($alert);

        try {
            $result = $this->sns->publish([
                'PhoneNumber' => $phoneNumber,
                'Message' => $message,
                'MessageAttributes' => [
                    'AWS.SNS.SMS.SMSType' => [
                        'DataType' => 'String',
                        'StringValue' => config('services.sns.sms_type', 'Transactional'),
                    ],
                ],
            ]);

            return $result->get('MessageId');
        } catch (AwsException $e) {
            Log::error('SMS send failed', [
                'phone' => $phoneNumber,
                'alert_id' => $alert->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Send verification code
     */
    public function sendVerificationCode(string $phoneNumber, string $code): string
    {
        $message = "Your verification code is: {$code}";

        try {
            $result = $this->sns->publish([
                'PhoneNumber' => $phoneNumber,
                'Message' => $message,
                'MessageAttributes' => [
                    'AWS.SNS.SMS.SMSType' => [
                        'DataType' => 'String',
                        'StringValue' => config('services.sns.sms_type', 'Transactional'),
                    ],
                ],
            ]);

            return $result->get('MessageId');
        } catch (AwsException $e) {
            Log::error('SMS verification code send failed', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Format emergency message for SMS (160 char limit)
     */
    protected function formatEmergencyMessage(EmergencyAlert $alert): string
    {
        $priority = strtoupper($alert->priority);
        $title = substr($alert->title, 0, 50);
        $message = substr($alert->message, 0, 80);
        $url = $alert->source_url ? ' More: ' . substr($alert->source_url, 0, 20) : '';

        return "[{$priority}] {$title}: {$message}{$url}";
    }
}

