<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SalesOpportunity extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id', 'business_name', 'community_id',
        'opportunity_type', 'quality', 'priority_score',
        'trigger_content_id', 'trigger_description', 'article_headline', 'article_url',
        'recommended_action', 'suggested_script', 'talking_points', 'recommended_product',
        'status', 'assigned_to', 'assigned_at', 'first_contact_at', 'next_followup_at',
        'closed_at', 'outcome', 'deal_value', 'notes', 'activity_log',
    ];

    protected $casts = [
        'talking_points' => 'array', 'activity_log' => 'array',
        'assigned_at' => 'datetime', 'first_contact_at' => 'datetime',
        'next_followup_at' => 'datetime', 'closed_at' => 'datetime',
    ];

    public const QUALITY_HOT = 'hot';
    public const QUALITY_WARM = 'warm';
    public const QUALITY_COLD = 'cold';

    public const STATUS_NEW = 'new';
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_CONTACTED = 'contacted';
    public const STATUS_WON = 'won';
    public const STATUS_LOST = 'lost';

    public const TYPE_POSITIVE_COVERAGE = 'positive_coverage';
    public const TYPE_NEW_BUSINESS = 'new_business';
    public const TYPE_EVENT_HOST = 'event_host';

    public function business() { return $this->belongsTo(Business::class); }
    public function triggerContent() { return $this->belongsTo(RawContent::class, 'trigger_content_id'); }
    public function assignedUser() { return $this->belongsTo(User::class, 'assigned_to'); }

    public function logActivity(string $action, array $details = []): void {
        $log = $this->activity_log ?? [];
        $log[] = ['action' => $action, 'details' => $details, 'timestamp' => now()->toIso8601String()];
        $this->update(['activity_log' => $log]);
    }
}
