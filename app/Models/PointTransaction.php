<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PointTransaction extends Model
{
    use HasFactory, HasUuid;

    // Const for updation: Disable timestamps if they are manually set, but we usually want them.
    // The migration has timestamps, but created_at is explicit in migration? No, $table->timestamp('created_at').
    // Since we don't have updated_at in migration, we should disable timestamps or set UPDATED_AT to null.
    // Migration: $table->timestamp('created_at');

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'transaction_type',
        'points',
        'source',
        'source_id',
        'business_id',
        'description',
        'created_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    // Boot method to set created_at automatically if not provided?
    // Laravel usually helps, but if timestamps are false, we need to handle it.
    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
            if (empty($model->created_at)) {
                $model->created_at = $model->freshTimestamp();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
