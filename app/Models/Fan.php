<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Fan extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'performer_id',
        'user_id',
        'name',
        'email',
        'phone',
        'source',
        'tip_count',
        'total_tips_given_cents',
        'last_interaction_at',
        'converted_to_user_at',
        'metadata',
    ];

    public function performer(): BelongsTo
    {
        return $this->belongsTo(Performer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tips(): HasMany
    {
        return $this->hasMany(Tip::class);
    }

    public function isConverted(): bool
    {
        return $this->converted_to_user_at !== null;
    }

    public function scopeConverted($query)
    {
        return $query->whereNotNull('converted_to_user_at');
    }

    public function scopeUnconverted($query)
    {
        return $query->whereNull('converted_to_user_at');
    }

    public function scopeBySource($query, string $source)
    {
        return $query->where('source', $source);
    }

    protected function casts(): array
    {
        return [
            'last_interaction_at' => 'datetime',
            'converted_to_user_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
