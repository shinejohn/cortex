<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ReporterResponse extends Model
{
    use HasUuids;

    protected $fillable = [
        'outreach_request_id',
        'raw_email_content',
        'extracted_quotes',
        'sentiment',
        'usable',
        'processed_at',
    ];

    public function outreachRequest(): BelongsTo
    {
        return $this->belongsTo(ReporterOutreachRequest::class, 'outreach_request_id');
    }

    protected function casts(): array
    {
        return [
            'extracted_quotes' => 'array',
            'usable' => 'boolean',
            'processed_at' => 'datetime',
        ];
    }
}
