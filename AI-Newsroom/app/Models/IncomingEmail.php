<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class IncomingEmail extends Model
{
    use HasUuids;

    protected $fillable = [
        'mailbox', 'message_id', 'from_address', 'from_name', 'to_address',
        'subject', 'email_date', 'received_at', 'body_text', 'body_html',
        'headers', 'attachments', 'email_type', 'source_id', 'collection_method_id',
        'processing_status', 'processed_at', 'processing_error',
        'is_confirmation', 'confirmation_clicked', 'confirmation_url',
        'items_extracted', 'raw_content_ids', 'is_spam',
    ];

    protected $casts = [
        'headers' => 'array', 'attachments' => 'array', 'raw_content_ids' => 'array',
        'is_confirmation' => 'boolean', 'confirmation_clicked' => 'boolean', 'is_spam' => 'boolean',
        'email_date' => 'datetime', 'received_at' => 'datetime', 'processed_at' => 'datetime',
    ];

    public const TYPE_NEWSLETTER = 'newsletter';
    public const TYPE_ALERT = 'alert';
    public const TYPE_PRESS_RELEASE = 'press_release';
    public const TYPE_MEETING_NOTICE = 'meeting_notice';
    public const TYPE_CONFIRMATION = 'confirmation';
    public const TYPE_UNKNOWN = 'unknown';

    public function source() { return $this->belongsTo(NewsSource::class, 'source_id'); }
    public function rawContent() { return $this->hasMany(RawContent::class, 'incoming_email_id'); }
}
