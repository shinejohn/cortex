<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class Share extends Model
{
    use HasUuid;

    protected $fillable = [
        'user_id',
        'shareable_type',
        'shareable_id',
        'channel',
        'tracking_code',
        'click_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shareable(): MorphTo
    {
        return $this->morphTo();
    }
}
