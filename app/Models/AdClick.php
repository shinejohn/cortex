<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AdClick extends Model
{
    use HasFactory;
    protected $fillable = [
        'impression_id',
        'creative_id',
        'ip_hash',
        'cost',
        'clicked_at',
    ];

    protected $casts = [
        'cost' => 'decimal:4',
        'clicked_at' => 'datetime',
    ];

    public function impression(): BelongsTo
    {
        return $this->belongsTo(AdImpression::class, 'impression_id');
    }

    public function creative(): BelongsTo
    {
        return $this->belongsTo(AdCreative::class, 'creative_id');
    }
}
