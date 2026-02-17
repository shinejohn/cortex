<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AIConversation extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'ai_conversations';

    protected $fillable = [
        'business_id',
        'customer_id',
        'channel',
        'status',
        'messages',
        'message_count',
        'resolved_by',
        'summary',
        'metadata',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(SMBCrmCustomer::class, 'customer_id');
    }

    protected function casts(): array
    {
        return [
            'messages' => 'array',
            'metadata' => 'array',
        ];
    }
}
