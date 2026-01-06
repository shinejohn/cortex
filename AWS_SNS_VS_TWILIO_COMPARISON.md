# AWS SNS SMS vs Twilio: Recommendation for Emergency Alerts

**Date:** December 23, 2025  
**Decision:** Use **AWS SNS SMS** instead of Twilio

---

## Why AWS SNS SMS is Better for This Project

### 1. **Already Using AWS Infrastructure** ✅
- ✅ AWS SES for email (already configured)
- ✅ AWS S3 for storage (already configured)
- ✅ AWS ECS for compute (already deployed)
- ✅ AWS RDS for database (already deployed)
- ✅ AWS credentials already configured (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- ✅ Same billing account, same IAM roles, same security model

**Benefit:** No new vendor, no new billing, no new credentials to manage

### 2. **Simpler Integration** ✅
- ✅ AWS SDK already available (via Laravel's AWS service provider)
- ✅ Same authentication mechanism (IAM credentials)
- ✅ Same error handling patterns
- ✅ Same monitoring/logging (CloudWatch)

**Benefit:** Faster implementation, less code, consistent patterns

### 3. **Cost Efficiency** ✅
- **AWS SNS SMS**: ~$0.00645 per SMS (US)
- **Twilio**: ~$0.0075 per SMS (US)
- **Savings**: ~14% cheaper per message
- **Additional Savings**: No phone number rental fees (Twilio charges $1/month per number)

**Benefit:** Lower operational costs, especially at scale

### 4. **Unified Monitoring** ✅
- ✅ CloudWatch metrics for SMS delivery
- ✅ Same dashboard as email (SES) and other AWS services
- ✅ Unified alerting and logging

**Benefit:** Single pane of glass for all notifications

---

## Trade-offs: What We Lose with AWS SNS

### 1. **Onboarding Time**
- **AWS SNS**: 7-10 days for production SMS access (sandbox available immediately)
- **Twilio**: Instant phone number acquisition

**Mitigation:** 
- Use sandbox for development/testing (immediate)
- Request production access early in project timeline
- Sandbox allows testing with verified numbers

### 2. **Advanced Features**
- **AWS SNS**: Basic SMS only (no MMS, no two-way messaging)
- **Twilio**: MMS, two-way messaging, voice, video

**Impact:** 
- ✅ **Not needed** for emergency alerts (one-way notifications only)
- ✅ **Not needed** for verification codes (one-way only)
- ✅ **Not needed** for this use case

### 3. **Phone Number Selection**
- **AWS SNS**: Numbers assigned automatically (no area code selection)
- **Twilio**: Choose preferred area codes

**Impact:**
- ✅ **Not critical** for emergency alerts (short codes preferred anyway)
- ✅ **Not critical** for verification codes (any number works)

### 4. **Developer Experience**
- **AWS SNS**: More verbose API, less intuitive
- **Twilio**: Cleaner API, better documentation

**Mitigation:**
- Create wrapper service (`SmsService`) to abstract complexity
- Use Laravel's AWS SDK for consistency

---

## Implementation Changes

### Configuration (`config/services.php`)

**Instead of:**
```php
'twilio' => [
    'account_sid' => env('TWILIO_ACCOUNT_SID'),
    'auth_token' => env('TWILIO_AUTH_TOKEN'),
    'from' => env('TWILIO_FROM_NUMBER'),
],
```

**Use:**
```php
'sns' => [
    'key' => env('AWS_ACCESS_KEY_ID'), // Already configured
    'secret' => env('AWS_SECRET_ACCESS_KEY'), // Already configured
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'), // Already configured
    'sms_type' => env('AWS_SNS_SMS_TYPE', 'Transactional'), // Transactional or Promotional
],
```

### Service Implementation

**Instead of:**
```php
use Twilio\Rest\Client;

$twilio = new Client($sid, $token);
$message = $twilio->messages->create($to, [
    'from' => $from,
    'body' => $message,
]);
```

**Use:**
```php
use Aws\Sns\SnsClient;

$sns = new SnsClient([
    'version' => 'latest',
    'region' => config('services.sns.region'),
    'credentials' => [
        'key' => config('services.sns.key'),
        'secret' => config('services.sns.secret'),
    ],
]);

$result = $sns->publish([
    'PhoneNumber' => $phoneNumber,
    'Message' => $message,
    'MessageAttributes' => [
        'AWS.SNS.SMS.SMSType' => [
            'DataType' => 'String',
            'StringValue' => config('services.sns.sms_type'),
        ],
    ],
]);
```

---

## Cost Comparison (Example: 10,000 SMS/month)

### AWS SNS SMS
- **Messages**: 10,000 × $0.00645 = **$64.50**
- **Phone Number**: $0 (included)
- **Total**: **$64.50/month**

### Twilio
- **Messages**: 10,000 × $0.0075 = **$75.00**
- **Phone Number**: $1.00/month
- **Total**: **$76.00/month**

**Savings**: $11.50/month ($138/year)

---

## Recommendation

**Use AWS SNS SMS** because:

1. ✅ **Already using AWS** - No new vendor
2. ✅ **Cheaper** - 14% savings + no phone number fees
3. ✅ **Simpler** - Same credentials, same monitoring
4. ✅ **Sufficient** - Has all features needed for emergency alerts
5. ⚠️ **Trade-off**: 7-10 day onboarding (mitigated by sandbox)

**Action Items:**
1. Request AWS SNS SMS production access early (Day 1 of Phase 3)
2. Use sandbox for development/testing (immediate)
3. Update project plan to use AWS SNS instead of Twilio
4. Create `SmsService` wrapper for AWS SNS
5. Update documentation to reflect AWS SNS

---

## Updated Project Timeline

**Phase 3.4 SMS Integration:**
- **Previous**: 2-3 hours (Twilio setup)
- **Updated**: 1-2 hours (AWS SNS setup - faster, no new vendor)
- **Risk**: Low (AWS credentials already configured)

**Overall Impact:** 
- ✅ Faster implementation
- ✅ Lower costs
- ✅ Better integration
- ⚠️ Need to request SMS access early

