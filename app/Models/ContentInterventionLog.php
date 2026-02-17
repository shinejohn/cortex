<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class ContentInterventionLog extends Model
{
    use HasFactory, HasUuid;

    public const SIGNAL_COMMENT_VOLUME = 'comment_volume';

    public const SIGNAL_FAILURE_RATE = 'failure_rate';

    public const SIGNAL_COMPLAINTS = 'complaints';

    public const SIGNAL_TRAFFIC_ANOMALY = 'traffic_anomaly';

    public const OUTCOME_PROTECTED = 'content_protected';

    public const OUTCOME_ENHANCED_MONITORING = 'enhanced_monitoring';

    public const OUTCOME_REMOVED = 'removed_from_view';

    protected $fillable = [
        'content_type',
        'content_id',
        'trigger_signal',
        'total_comments',
        'compliant_comments',
        'non_compliant_comments',
        'civil_discourse_ratio',
        'unique_complaints',
        'outcome',
        'outcome_reason',
    ];

    protected function casts(): array
    {
        return [
            'total_comments' => 'integer',
            'compliant_comments' => 'integer',
            'non_compliant_comments' => 'integer',
            'civil_discourse_ratio' => 'decimal:4',
            'unique_complaints' => 'integer',
        ];
    }
}
