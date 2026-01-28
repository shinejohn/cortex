<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class QuoteRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'leader_id',
        'news_article_draft_id',
        'requested_by',
        'status',
        'contact_method',
        'context',
        'questions',
        'sent_at',
        'responded_at',
        'expires_at',
        'response',
        'approved_for_publication',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
        'expires_at' => 'datetime',
        'approved_for_publication' => 'boolean',
    ];

    public function leader(): BelongsTo
    {
        return $this->belongsTo(CommunityLeader::class, 'leader_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
