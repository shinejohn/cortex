<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BusinessMention extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id', 'business_name', 'business_name_normalized', 'community_id',
        'raw_content_id', 'article_id', 'published_article_id',
        'mention_type', 'sentiment', 'mention_context', 'mentioned_at',
        'is_primary', 'notified_sales', 'confidence',
    ];

    protected $casts = [
        'mentioned_at' => 'datetime', 'is_primary' => 'boolean', 'notified_sales' => 'boolean',
    ];

    public const TYPE_HOST = 'host';
    public const TYPE_SUBJECT = 'subject';
    public const TYPE_MENTIONED = 'mentioned';

    public const SENTIMENT_POSITIVE = 'positive';
    public const SENTIMENT_NEUTRAL = 'neutral';
    public const SENTIMENT_NEGATIVE = 'negative';

    public function business() { return $this->belongsTo(Business::class); }
    public function rawContent() { return $this->belongsTo(RawContent::class, 'raw_content_id'); }
}
