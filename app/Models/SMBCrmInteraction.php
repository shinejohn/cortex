<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SMBCrmInteraction extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'smb_crm_interactions';

    public $timestamps = false;
    protected $dateFormat = 'U';

    protected $fillable = [
        'business_id',
        'customer_id',
        'interaction_type',
        'channel',
        'direction',
        'subject',
        'content',
        'summary',
        'handled_by',
        'ai_service_used',
        'ai_confidence_score',
        'escalated_reason',
        'outcome',
        'sentiment',
        'duration_seconds',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'ai_confidence_score' => 'decimal:4',
            'metadata' => 'array',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(SMBCrmCustomer::class, 'customer_id');
    }
}
